bzork.Memory = function(buffer) {
  var mem = new DataView(buffer),
      membuf = mem.buffer;

  this._memory = mem;

  this.header = new bzork.Memory.Header(new DataView(membuf, 0, 64));
  bzork.Zscii.init(this.header.getZcodeVersion());

  this.dictionary = new bzork.Memory.Dictionary(
    new DataView(membuf, this.header.getDictionaryAddr()));
  this.objectTable = new bzork.Memory.ObjectTable(
    new DataView(membuf), this.header.getObjectTableAddr(),
    this.header.getZcodeVersion());
  this.globalTable = new bzork.Memory.GlobalTable(new DataView(membuf));
  this.abbrevTable = new bzork.Memory.AbbrevTable(
    new DataView(membuf), this.header.getAbbrevTableAddr(),
    this.header.getZcodeVersion());
};
