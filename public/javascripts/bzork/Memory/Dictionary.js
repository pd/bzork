bzork.Memory.Dictionary = function(buffer) {
  this._memory = buffer;
  this._cache = {};
};

bzork.Memory.Dictionary.prototype.get = function(i) {
  if (this._cache[i])
    return this._cache[i];

  var view = new DataView(this._memory.buffer, this.getEntryOffset(i));
  var s = this._cache[i] = bzork.Zscii.toAscii(view);
  return s;
};

bzork.Memory.Dictionary.prototype.getWordSeparatorCount = function() {
  return this._memory.getUint8(0);
};

bzork.Memory.Dictionary.prototype.getWordSeparators = function() {
  var count = this.getWordSeparatorCount(),
      separators = new Array(count);
  for (var i = 0; i < count; i++)
    separators[i] = bzork.Zscii.toAsciiFromZsciiCode(this._memory.getUint8(i + 1));
  return separators;
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

bzork.Memory.Dictionary.prototype.getEntryOffset = function(i) {
  if (i < 0 || i >= this.getWordCount())
    throw "Word " + i + " out of bounds!";
  return this.getFirstEntryAddr() + (this.getWordSize() * i);
};

bzork.Memory.Dictionary.prototype.getEndAddr = function() {
  return this.getFirstEntryAddr() + (this.getWordSize() * this.getWordCount()) - 1;
};
