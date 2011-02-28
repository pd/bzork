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

  getAttributesAddr: function() {
    return this._addr;
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

  getPropertyDataAddr: function(i) {
    var prop = this.getProperty(i);
    if (prop)
      return prop.getDataAddr();
    else
      return 0;
  },

  getPropertyValue: function(i) {
    var prop = this.getProperty(i);
    if (prop)
      return prop.getValue();
    else
      return this.getDefaultPropertyValue(i);
  },

  setPropertyValue: function(i, val) {
    var prop = this.getProperty(i);
    if (prop)
      prop.setValue(val);
    else
      throw "Unavailable property " + i + " for object " + this.id;
  },

  getNextPropertyNumber: function(i) {
    var prop = this.getProperty(i);
    if (!prop)
      throw "Unavailable property " + i + " for object " + this.id;

    var addr = prop.nextPropertyAddr();
    if (this._machine.getUint8(addr) === 0)
      return 0;

    return new bzork.Object.Property(this._machine, addr).getNumber();
  },

  getAttributes: function() {
    var attrs = [], bytes = [];

    for (var i = 0; i < this._attributesSize; i++)
      bytes.push(this._machine.getUint8(this.getAttributesAddr() + i));

    var attr = 0;
    _(bytes).each(function(byte) {
      for (var i = 0; i < 8; i++) {
        if (((byte >> (7 - i)) & 0x1) == 0x1)
          attrs.push(attr);
        attr++;
      }
    });

    return attrs;
  },

  testAttribute: function(attr) {
    if (attr < 0 || attr >= this._attributesSize * 8)
      throw "Attribute " + attr + " out of bounds!";
    return _.contains(this.getAttributes(), attr);
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
    if (this._getVersion() < 4)
      return this._getSizeByte() - 32 * (this.getLength() - 1);
    else
      return this._getSizeByte() & 0x3f;
  },

  getLength: function() {
    if (this._getVersion() < 4)
      return Math.floor(this._getSizeByte() / 32) + 1;

    var byte1 = this._getSizeByte(),
        byte2 = this._getSizeByte(1);

    if (this._sizeByteCount() === 2) {
      var size = byte2 & 0x3f;
      return size === 0 ? 64 : size; // See Sec. 12.4.2.1.1
    } else if ((byte1 & 0x40) === 0x0) // bit 6 unset
      return 1;
    else if ((byte1 & 0x40) === 0x40) // bit 6 set
      return 2;
    else
      throw "Unknown property data length of property " + this.getNumber() + " at " + this._addr;
  },

  // Object 1 of zork1.z3 has a length of 8. I have no idea what to do
  // with that. AFAICT, everything that operates on property values
  // assumes that it is working with words. TODO XXX
  getValue: function() {
    var len = this.getLength();
    if (len === 1)
      return this._machine.getUint8(this.getDataAddr());
    else
      return this._machine.getUint16(this.getDataAddr());
  },

  setValue: function(val) {
    var len = this.getLength();
    if (len === 1)
      this._machine.setUint8(this.getDataAddr(), val & 0xff);
    else
      this._machine.setUint16(this.getDataAddr(), val & 0xffff);
  },

  getDataAddr: function() {
    return this._addr + this._sizeByteCount();
  },

  nextPropertyAddr: function() {
    return this._addr + this._sizeByteCount() + this.getLength();
  },

  _getSizeByte: function(offset) {
    if (typeof offset === "undefined")
      offset = 0;
    return this._machine.getUint8(this._addr + offset);
  },

  _sizeByteCount: function() {
    if (this._getVersion() < 4)
      return 1;
    else
      return ((this._getSizeByte() & 0x80) === 0x80) ? 2 : 1;
  },

  _getVersion: function() {
    return this._machine.getZcodeVersion();
  }
};
