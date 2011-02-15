bzork.Memory.Header = function(buffer) {
  this._memory = buffer;
};

bzork.Memory.Header.prototype.getZcodeVersion = function() {
  return this._memory.getUint8(0x0);
};

bzork.Memory.Header.prototype.getReleaseNumber = function() {
  return this._memory.getUint16(0x2);
};

bzork.Memory.Header.prototype.getHighMemAddr = function() {
  return this._memory.getUint16(0x4);
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

bzork.Memory.Header.prototype.getStaticMemAddr = function() {
  return this._memory.getUint16(0xe);
};

bzork.Memory.Header.prototype.getAbbrevTableAddr = function() {
  return this._memory.getUint16(0x18);
};

bzork.Memory.Header.prototype.getFileSize = function() {
  var size = this._memory.getUint16(0x1a),
      zver = this.getZcodeVersion();

  if (zver <= 3)
    return size * 2;
  else if (zver <= 5)
    return size * 4;
  else
    return size * 8;
};

bzork.Memory.Header.prototype.getChecksum = function() {
  return this._memory.getUint16(0x1c);
};

bzork.Memory.Header.prototype.getSerial = function() {
  var serial = [];
  for (var i = 0; i < 6; i++)
    serial.push( String.fromCharCode(this._memory.getUint8(0x12 + i)) );
  return serial.join('');
};
