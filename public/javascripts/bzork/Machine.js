bzork.Machine = function(storyBytes) {
  this.memory = new bzork.Memory(storyBytes);
  this.header = new bzork.Header(this);
  this.dictionary = new bzork.Dictionary(this, this.header.getDictionaryAddr());
  this.abbrevTable = new bzork.AbbrevTable(this, this.header.getAbbrevTableAddr());
  this.objectTable = new bzork.ObjectTable(this, this.header.getObjectTableAddr());
  this.globalTable = new bzork.GlobalTable(this, this.header.getGlobalTableAddr());
  this.zscii = new bzork.Zscii(this);
};

bzork.Machine.prototype = {
  getStartPC: function() {
    return this.header.getStartPC();
  },

  getZcodeVersion: function() {
    return this.header.getZcodeVersion();
  },

  getAbbrev: function(i) {
    return this.abbrevTable.get(i);
  },

  getUint8: function(offset) {
    return this.memory.getUint8(offset);
  },

  getUint16: function(offset) {
    return this.memory.getUint16(offset);
  },

  setUint8: function(offset, value) {
    this.memory.setUint8(offset, value);
  },

  setUint16: function(offset, value) {
    this.memory.setUint16(offset, value);
  },

  getZsciiString: function(offset) {
    return this.zscii.getString(offset);
  },

  getZsciiChar: function(offset) {
    return this.zscii.getChar(offset);
  },

  decodeZsciiChar: function(c) {
    return this.zscii.decodeChar(c);
  }
};
