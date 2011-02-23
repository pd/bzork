/**
 * @class Z-Machine abbreviation table.
 *
 * In version 1, no abbreviations are supported. In version 2, 1 abbreviation
 * table of 32 entries is supported. In versions 3+, 3 tables (= 96 entries)
 * are supported.
 */
bzork.AbbrevTable = function(machine, tableAddr) {
  this._machine = machine;
  this._addr = tableAddr;
};

bzork.AbbrevTable.prototype = {
  /** @returns The decoded string value of the abbreviation */
  get: function(i) {
    return this._machine.getZsciiString(this.getAbbrevDataAddr(i));
  },

  /** @returns The number of tables supported in this Z-Code version */
  getTableCount: function() {
    var version = this._machine.getZcodeVersion();
    if (version === 1)
      return 0;
    return version >= 3 ? 3 : 1;
  },

  /** @returns The total number of available abbreviations */
  getAbbrevCount: function() {
    return this.getTableCount() * 32;
  },

  /** @returns The address of the first abbreviation table */
  getTableStartAddr: function() {
    return this._addr;
  },

  /** @returns The address at the end of the abbreviation tables */
  getTableEndAddr: function() {
    return this._addr + (this.getAbbrevCount() * 2) - 1;
  },

  /** @returns The address at which the abbreviation's ZString can be found */
  getAbbrevDataAddr: function(i) {
    if (i < 0 || i >= this.getAbbrevCount())
      throw "Abbreviation " + i + " out of range!";
    return this._machine.getUint16(this.getTableStartAddr() + (i * 2)) * 2;
  },

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
