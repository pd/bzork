// Actually represents either 1 or 3 individual tables, depending on the
// Z-Code version number.
bzork.AbbrevTable = function(machine, tableAddr) {
  this._machine = machine;
  this._addr = tableAddr;
};

bzork.AbbrevTable.prototype = {
  get: function(i) {
    return this._machine.getZsciiString(this.getAbbrevDataAddr(i));
  },

  getTableCount: function() {
    var version = this._machine.getZcodeVersion();
    if (version === 1)
      return 0;
    return version >= 3 ? 3 : 1;
  },

  // These are not necessarily all used, however.
  getAbbrevCount: function() {
    return this.getTableCount() * 32;
  },

  getTableStartAddr: function() {
    return this._addr;
  },

  getTableEndAddr: function() {
    return this._addr + (this.getAbbrevCount() * 2) - 1;
  },

  getAbbrevDataAddr: function(i) {
    if (i < 0 || i >= this.getAbbrevCount())
      throw _.sprintf("Abbreviation %d out of range!", i);
    return this._machine.getUint16(this.getTableStartAddr() + (i * 2)) * 2;
  },

  // Retrieving the data start and end points requires scanning the entire
  // table and saving the lowest and highest values. Craaaazy.
  getDataStartAddr: function() {
    if (!this._dataBoundsDiscovered)
      this._discoverDataBounds();
    return this.dataStartAddr;
  },

  getDataEndAddr: function() {
    if (!this._dataBoundsDiscovered)
      this._discoverDataBounds();
    return this.dataEndAddr;
  },

  _discoverDataBounds: function() {
    var addr = null;

    for (var i = 0; i < this.getAbbrevCount(); i++) {
      addr = this.getAbbrevDataAddr(i);
      if (!this.dataStartAddr || addr < this.dataStartAddr)
        this.dataStartAddr = addr;
      if (!this.dataEndAddr || addr > this.dataEndAddr)
        this.dataEndAddr = addr;
    }

    // Find the actual end of the final abbreviation
    this.dataEndAddr = this._machine.findZsciiEnd(this.dataEndAddr);
    this._dataBoundsDiscovered = true;
  }
};
