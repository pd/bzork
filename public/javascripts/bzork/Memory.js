bzork.Memory = function(bytes) {
  this.dataView = new DataView(bytes);

  var membuf = this.dataView.buffer;

  this.header = new bzork.Memory.Header(new DataView(membuf, 0, 64));
  this.dictionary = new bzork.Memory.Dictionary(
    new DataView(membuf, this.header.getDictionaryAddr()));
  this.objectTable = new bzork.Memory.ObjectTable(
    new DataView(membuf), this.header.getObjectTableAddr(),
    this.header.getZcodeVersion());
  this.globalTable = new bzork.Memory.GlobalTable(new DataView(membuf));
  this.abbrevTable = new bzork.Memory.AbbrevTable(
    new DataView(membuf), this.header.getAbbrevTableAddr(),
    this.header.getZcodeVersion());

  bzork.Zscii.init(this.header.getZcodeVersion(), this.abbrevTable);
};

bzork.Memory.prototype.getUint8 = function(offset) {
  return this.dataView.getUint8(offset);
};

bzork.Memory.prototype.getUint16 = function(offset) {
  return this.dataView.getUint16(offset);
};
