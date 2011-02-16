bzork.Header = function(machine) {
  this._machine = machine;
};

bzork.Header.prototype.getZcodeVersion = function() {
  return this._machine.getUint8(0x0);
};

bzork.Header.prototype.getReleaseNumber = function() {
  return this._machine.getUint16(0x2);
};

bzork.Header.prototype.getHighMemAddr = function() {
  return this._machine.getUint16(0x4);
};

bzork.Header.prototype.getStartPC = function() {
  return this._machine.getUint16(0x6);
};

bzork.Header.prototype.getDictionaryAddr = function() {
  return this._machine.getUint16(0x8);
};

bzork.Header.prototype.getObjectTableAddr = function() {
  return this._machine.getUint16(0xa);
};

bzork.Header.prototype.getGlobalTableAddr = function() {
  return this._machine.getUint16(0xc);
};

bzork.Header.prototype.getStaticMemAddr = function() {
  return this._machine.getUint16(0xe);
};

bzork.Header.prototype.getAbbrevTableAddr = function() {
  return this._machine.getUint16(0x18);
};

bzork.Header.prototype.getFileSize = function() {
  var size = this._machine.getUint16(0x1a),
      zver = this.getZcodeVersion();

  if (zver <= 3)
    return size * 2;
  else if (zver <= 5)
    return size * 4;
  else
    return size * 8;
};

bzork.Header.prototype.getChecksum = function() {
  return this._machine.getUint16(0x1c);
};

bzork.Header.prototype.getSerial = function() {
  var serial = [];
  for (var i = 0; i < 6; i++)
    serial.push( String.fromCharCode(this._machine.getUint8(0x12 + i)) );
  return serial.join('');
};
