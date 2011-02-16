bzork.Machine = function(storyBytes) {
  this.memory = new bzork.Memory(storyBytes);
  this.header = new bzork.Header(this);
  this.dictionary = new bzork.Dictionary(this, this.header.getDictionaryAddr());
  this.abbrevTable = new bzork.AbbrevTable(this, this.header.getAbbrevTableAddr());

  this.zscii = new bzork.Zscii(this);
  /*
  this.objectTable = new bzork.ObjectTable(this);
  this.globalTable = new bzork.GlobalTable(this);

  this.zscii = new bzork.Zscii(this);
  */
};

bzork.Machine.prototype.getZcodeVersion = function() {
  return this.header.getZcodeVersion();
};

bzork.Machine.prototype.getAbbrev = function(i) {
  return this.abbrevTable.get(i);
};

bzork.Machine.prototype.getUint8 = function(offset) {
  return this.memory.getUint8(offset);
};

bzork.Machine.prototype.getUint16 = function(offset) {
  return this.memory.getUint16(offset);
};

bzork.Machine.prototype.getZsciiString = function(offset) {
  return this.zscii.getString(offset);
};

bzork.Machine.prototype.getZsciiChar = function(offset) {
  return this.zscii.getChar(offset);
};

bzork.Machine.prototype.decodeZsciiChar = function(c) {
  return this.zscii.decodeChar(c);
};
