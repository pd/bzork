// Actually represents either 1 or 3 individual tables, depending on the
// Z-Code version number.
bzork.AbbrevTable = function(machine, tableAddr) {
  this._machine = machine;
  this._addr = tableAddr;
};

bzork.AbbrevTable.prototype.get = function(i) {
  return this._machine.getZsciiString(this.getAbbrevDataAddr(i));
};

bzork.AbbrevTable.prototype.getTableCount = function() {
  var version = this._machine.getZcodeVersion();
  if (version === 1)
    return 0;
  return version >= 3 ? 3 : 1;
};

// These are not necessarily all used, however.
bzork.AbbrevTable.prototype.getAbbrevCount = function() {
  return this.getTableCount() * 32;
};

bzork.AbbrevTable.prototype.getTableStartAddr = function() {
  return this._addr;
};

bzork.AbbrevTable.prototype.getTableEndAddr = function() {
  return this._addr + (this.getAbbrevCount() * 2) - 1;
};

bzork.AbbrevTable.prototype.getAbbrevDataAddr = function(i) {
  if (i < 0 || i >= this.getAbbrevCount())
    throw "Abbreviation " + i + " out of range!";
  return this._machine.getUint16(this.getTableStartAddr() + (i * 2)) * 2;
};

// Retrieving the data start and end points requires scanning the entire
// table and saving the lowest and highest values. Craaaazy.
bzork.AbbrevTable.prototype.getDataStartAddr = function() {
  if (!this._dataBoundsDiscovered)
    this._discoverDataBounds();
  return this.dataStartAddr;
};

bzork.AbbrevTable.prototype.getDataEndAddr = function() {
  if (!this._dataBoundsDiscovered)
    this._discoverDataBounds();
  return this.dataEndAddr;
};

bzork.AbbrevTable.prototype._discoverDataBounds = function() {
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
    word = this._machine.getUint16(this.dataEndAddr + offset);
    if (word & 0x8000) {
      this.dataEndAddr = this.dataEndAddr + offset + 1;
      break;
    }
    offset += 2;
  } while (true);

  this._dataBoundsDiscovered = true;
};
