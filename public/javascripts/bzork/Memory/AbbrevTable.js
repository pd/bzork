// Actually represents either 1 or 3 individual tables, depending on the
// Z-Code version number. The abbreviation data is not inside of the lookup
// tables, so this requires access to the entirety of the DataView.
bzork.Memory.AbbrevTable = function(buffer, tableStartAddr, version) {
  this._memory = buffer;
  this.tableStartAddr = tableStartAddr;
  this.version = version;
};

bzork.Memory.AbbrevTable.prototype.get = function(i) {
  var view = new DataView(this._memory.buffer, this.getAbbrevDataAddr(i));
  var s = bzork.Zscii.toAscii(view);
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
