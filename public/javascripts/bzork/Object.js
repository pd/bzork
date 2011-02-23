bzork.Object = function(machine, objectTable, id, addr) {
  this.id = id;
  this._machine = machine;
  this._objectTable = objectTable;
  this._addr = addr;

  var version = this._machine.getZcodeVersion();
  if (version <= 3) {
    this._attributesSize = 4;
    this._idSize = 1;
  } else {
    this._attributesSize = 6;
    this._idSize = 2;
  }
};

bzork.Object.prototype = {
  getParent: function() {
    return this._getRelative(0);
  },

  getSibling: function() {
    return this._getRelative(1);
  },

  getChild: function() {
    return this._getRelative(2);
  },

  getPropertyHeaderAddr: function() {
    return this._machine.getUint16(this._addr + this._attributesSize + this._idSize * 3);
  },

  getPropertyTableAddr: function() {
    if (this.hasDescription())
      return this._machine.findZsciiEnd(this.getPropertyHeaderAddr() + 1);
    else
      return this.getPropertyHeaderAddr() + 1;
  },

  getPropertyNumbers: function() {
    if (!this.properties)
      this.properties = this._getProperties();
    return _.map(this.properties, function(prop) { return prop.getNumber(); });
  },

  getProperty: function(i) {
    if (!this.properties)
      this.properties = this._getProperties();

    var property = _.detect(this.properties, function(prop) {
      return prop.getNumber() === i;
    });

    return property;
  },

  getPropertyValue: function(i) {
    var prop = this.getProperty(i);
    if (prop)
      return prop.getValue();
    else
      return this.getDefaultPropertyValue(i);
  },

  hasDescription: function() {
    return this._machine.getUint8(this.getPropertyHeaderAddr()) !== 0;
  },

  getDescription: function() {
    if (!this.hasDescription())
      return;
    return this._machine.getZsciiString(this.getPropertyHeaderAddr() + 1);
  },

  getDefaultPropertyValue: function(i) {
    return this._objectTable.getDefaultPropertyValue(i);
  },

  _getRelative: function(i) {
    var fn = this._idSize == 1 ? 'getUint8' : 'getUint16';
    return this._machine[fn](this._addr + this._attributesSize + (i * this._idSize));
  },

  _getProperties: function() {
    var properties = [],
        offset = this.getPropertyTableAddr(),
        sizebyte;
    while ((sizebyte = this._machine.getUint8(offset)) !== 0) {
      var property = new bzork.Object.Property(this._machine, offset);
      properties.push(property);
      offset = property.nextPropertyAddr();
    }
    return properties;
  }
};

bzork.Object.Property = function(machine, addr) {
  this._machine = machine;
  this._addr = addr;
};

bzork.Object.Property.prototype = {
  getNumber: function() {
    return this._getSizeByte() - 32 * (this.getLength() - 1);
  },

  getLength: function() {
    return Math.floor(this._getSizeByte() / 32) + 1;
  },

  getValue: function() {
    var len = this.getLength(), bytes = [];
    for (var i = 0; i < len; i++)
      bytes.push( this._machine.getUint8(this.getDataAddr() + i) );
    return bytes;
  },

  getDataAddr: function() {
    return this._addr + 1;
  },

  nextPropertyAddr: function() {
    return this._addr + 1 + this.getLength();
  },

  _getSizeByte: function() {
    return this._machine.getUint8(this._addr);
  }
};
