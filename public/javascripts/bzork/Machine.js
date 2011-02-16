bzork.Machine = function(storyBytes) {
  this.memory = new bzork.Memory(storyBytes);
  this.header = new bzork.Header(this);
  this.dictionary = new bzork.Dictionary(this, this.header.getDictionaryAddr());

  /*
  this.objectTable = new bzork.ObjectTable(this);
  this.globalTable = new bzork.GlobalTable(this);
  this.abbrevTable = new bzork.AbbrevTable(this);

  this.zscii = new bzork.Zscii(this);
  */
};

bzork.Machine.prototype.getZcodeVersion = function() {
  return this.header.getZcodeVersion();
};

bzork.Machine.prototype.getUint8 = function(offset) {
  return this.memory.getUint8(offset);
};

bzork.Machine.prototype.getUint16 = function(offset) {
  return this.memory.getUint16(offset);
};

bzork.Machine.prototype.getZscii = function(offset) {
  return bzork.Zscii.toAscii(this.memory.getDataView(offset));
};
