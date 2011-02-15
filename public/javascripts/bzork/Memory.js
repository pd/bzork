bzork.Memory = function(buffer) {
  var mem = new DataView(buffer),
      membuf = mem.buffer;

  this._memory = mem;
  this.header = new bzork.Memory.Header(new DataView(membuf, 0, 64));
  this.dictionary = new bzork.Memory.Dictionary(
    new DataView(membuf, this.header.getDictionaryAddr()));
  this.objectTable = new bzork.Memory.ObjectTable(
    new DataView(membuf, this.header.getObjectTableAddr()));
  this.globalTable = new bzork.Memory.GlobalTable(
    new DataView(membuf, this.header.getGlobalTableAddr()));
};

bzork.Memory.Header = function(buffer) {
  this._memory = buffer;
};

bzork.Memory.Header.prototype.getZcodeVersion = function() {
  return this._memory.getUint8(0);
};

bzork.Memory.Header.prototype.getStartPC = function() {
  return this._memory.getUint16(0x6);
};

bzork.Memory.Header.prototype.getDictionaryAddr = function() {
  return this._memory.getUint16(0x8);
};

bzork.Memory.Header.prototype.getObjectTableAddr = function() {
  return this._memory.getUint16(0xa);
};

bzork.Memory.Header.prototype.getGlobalTableAddr = function() {
  return this._memory.getUint16(0xc);
};

bzork.Memory.Dictionary = function(buffer) {
  this._memory = buffer;
};

bzork.Memory.Dictionary.prototype.getWordSeparatorCount = function() {
  return this._memory.getUint8(0);
};

bzork.Memory.Dictionary.prototype.getWordSeparators = function() {
  var count = this.getWordSeparatorCount(),
      separators = new Array(count);
  for (var i = 0; i < count; i++)
    separators[i] = this._memory.getUint8(i + 1);
  return separators; // bzork.ZSCII.toASCII
};

bzork.Memory.Dictionary.prototype.getWordSize = function() {
  return this._memory.getUint8(this.getWordSeparatorCount() + 1);
};

bzork.Memory.Dictionary.prototype.getWordCount = function() {
  return this._memory.getUint16(this.getWordSeparatorCount() + 2);
};

bzork.Memory.Dictionary.prototype.getFirstEntryAddr = function() {
  return this._memory.byteOffset + 1 + this.getWordSeparatorCount() + 1 + 2;
};

bzork.Memory.Dictionary.prototype.getEndAddr = function() {
  return this.getFirstEntryAddr() + (this.getWordSize() * this.getWordCount()) - 1;
};

bzork.Memory.ObjectTable = function(buffer) {
  this._memory = buffer;
};

bzork.Memory.GlobalTable = function(buffer) {
  this._memory = buffer;
};

bzork.Memory.AbbrevTable = function(buffer) {
  this._memory = buffer;
};
