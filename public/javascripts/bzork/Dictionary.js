bzork.Dictionary = function(machine, addr) {
  this._machine = machine;
  this._addr = addr;
};

bzork.Dictionary.prototype.get = function(i) {
  return this._machine.getZsciiString(this.getEntryOffset(i));
};

bzork.Dictionary.prototype.getWordSeparatorCount = function() {
  return this.getUint8(0);
};

bzork.Dictionary.prototype.getWordSeparators = function() {
  var count = this.getWordSeparatorCount(),
      separators = new Array(count);
  for (var i = 0; i < count; i++)
    separators[i] = this._machine.decodeZsciiChar(this.getUint8(i + 1));
  return separators;
};

bzork.Dictionary.prototype.getWordSize = function() {
  return this.getUint8(this.getWordSeparatorCount() + 1);
};

bzork.Dictionary.prototype.getWordCount = function() {
  return this.getUint16(this.getWordSeparatorCount() + 2);
};

bzork.Dictionary.prototype.getFirstEntryAddr = function() {
  return this._addr + 1 + this.getWordSeparatorCount() + 1 + 2;
};

bzork.Dictionary.prototype.getEntryOffset = function(i) {
  if (i < 0 || i >= this.getWordCount())
    throw "Word " + i + " out of bounds!";
  return this.getFirstEntryAddr() + (this.getWordSize() * i);
};

bzork.Dictionary.prototype.getEndAddr = function() {
  return this.getFirstEntryAddr() + (this.getWordSize() * this.getWordCount()) - 1;
};

bzork.Dictionary.prototype.getUint8 = function(offset) {
  return this._machine.getUint8(this._addr + offset);
};

bzork.Dictionary.prototype.getUint16 = function(offset) {
  return this._machine.getUint16(this._addr + offset);
};
