bzork.Memory = function(buffer) {
  var mem = new DataView(buffer),
      membuf = mem.buffer;

  this._memory = mem;

  this.header = new bzork.Memory.Header(new DataView(membuf, 0, 64));
  bzork.Zscii.init(this.header.getZcodeVersion());

  this.dictionary = new bzork.Memory.Dictionary(
    new DataView(membuf, this.header.getDictionaryAddr()));
  this.objectTable = new bzork.Memory.ObjectTable(
    new DataView(membuf, this.header.getObjectTableAddr()));
  this.globalTable = new bzork.Memory.GlobalTable(
    new DataView(membuf, this.header.getGlobalTableAddr()));
  this.abbrevTable = new bzork.Memory.AbbrevTable(
    new DataView(membuf), this.header.getAbbrevTableAddr(),
    this.header.getZcodeVersion());
};

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

bzork.Memory.Dictionary.prototype.getEndAddr = function() {
  return this.getFirstEntryAddr() + (this.getWordSize() * this.getWordCount()) - 1;
};

bzork.Memory.ObjectTable = function(buffer) {
  this._memory = buffer;
};

bzork.Memory.GlobalTable = function(buffer) {
  this._memory = buffer;
};

// Actually represents either 1 or 3 individual tables, depending on the
// Z-Code version number. The abbreviation data is not inside of the lookup
// tables, so this requires access to the entirety of the DataView.
bzork.Memory.AbbrevTable = function(buffer, tableStartAddr, version) {
  this._memory = buffer;
  this.tableStartAddr = tableStartAddr;
  this.version = version;

  this._cache = {};
};

bzork.Memory.AbbrevTable.prototype.get = function(i) {
  if (this._cache[i])
    return this._cache[i];

  var view = new DataView(this._memory.buffer, this.getAbbrevDataAddr(i));
  var s = this._cache[i] = bzork.Zscii.toAscii(view);
  return s;
};

bzork.Memory.AbbrevTable.prototype.getTableCount = function() {
  if (this.version == 1)
    return 0;
  return this.version >= 3 ? 3 : 1;
};

// These are not necessarily all used, however.
bzork.Memory.AbbrevTable.prototype.getAbbrevCount = function() {
  return this.getTableCount() * 32;
};

bzork.Memory.AbbrevTable.prototype.getTableStartAddr = function() {
  return this.tableStartAddr;
};

bzork.Memory.AbbrevTable.prototype.getTableEndAddr = function() {
  return this.tableStartAddr + (this.getAbbrevCount() * 2) - 1;
};

bzork.Memory.AbbrevTable.prototype.getAbbrevDataAddr = function(i) {
  if (i < 0 || i >= this.getAbbrevCount())
    throw "Abbreviation " + i + " out of range!";
  return this._memory.getUint16(this.getTableStartAddr() + (i * 2)) * 2;
};

// Retrieving the data start and end points requires scanning the entire
// table and saving the lowest and highest values. Craaaazy.
bzork.Memory.AbbrevTable.prototype.getDataStartAddr = function() {
  if (!this._dataBoundsDiscovered)
    this._discoverDataBounds();
  return this.dataStartAddr;
};

bzork.Memory.AbbrevTable.prototype.getDataEndAddr = function() {
  if (!this._dataBoundsDiscovered)
    this._discoverDataBounds();
  return this.dataEndAddr;
};

bzork.Memory.AbbrevTable.prototype._discoverDataBounds = function() {
  var addr = null;

  for (i = 0; i < this.getAbbrevCount(); i++) {
    addr = this.getAbbrevDataAddr(i);
    if (!this.dataStartAddr || addr < this.dataStartAddr)
      this.dataStartAddr = addr;
    if (!this.dataEndAddr || addr > this.dataEndAddr)
      this.dataEndAddr = addr;
  }

  // Find the actual end of the final abbreviation
  var word, offset = 0;
  do {
    word = this._memory.getUint16(this.dataEndAddr + offset);
    if (word & 0x8000) {
      this.dataEndAddr = this.dataEndAddr + offset + 1;
      break;
    }
    offset += 2;
  } while (true);

  this._dataBoundsDiscovered = true;
};
