bzork.ObjectTable = function(machine, tableAddr) {
  this._machine = machine;
  this._addr = tableAddr;
};

bzork.ObjectTable.prototype = {
  get: function(i) {
    if (!this._boundsDiscovered)
      this._discoverBounds();

    if (i < 1 || i > this.getObjectCount())
      throw "Object " + i + " out of bounds!";

    return new bzork.Object(this._machine, this, i, this.getObjectAddr(i));
  },

  getObjectSize: function() {
    if (this.getZcodeVersion() <= 3)
      return 9;
    else
      return 14;
  },

  getMaxProperties: function() {
    if (this.getZcodeVersion() <= 3)
      return 32;
    else
      return 64;
  },

  getPropertyAddrOffset: function() {
    if (this.getZcodeVersion() <= 3)
      return 7;
    else
      return 12;
  },

  getStartAddr: function() {
    return this._addr;
  },

  getEndAddr: function() {
    if (!this._boundsDiscovered)
      this._discoverBounds();
    return this.tableEndAddr;
  },

  getObjectCount: function() {
    if (!this._boundsDiscovered)
      this._discoverBounds();
    return this.objectCount;
  },

  getObjectAddr: function(i) {
    var offset = this.getStartAddr();
    offset += (this.getMaxProperties() - 1) * 2;
    offset += (i - 1) * this.getObjectSize();
    return offset;
  },

  getDefaultPropertyValue: function(i) {
    return this._machine.getUint8(this.getStartAddr() + i);
  },

  getZcodeVersion: function() {
    return this._machine.getZcodeVersion();
  },

  _discoverBounds: function() {
    var tableStart = this.getStartAddr(),
        tableEnd, dataStart, dataEnd,
        objectCount = 0;

    var objAddr, dataAddr;

    do {
      objectCount++;
      objAddr = this.getObjectAddr(objectCount);

      // Read the address of the property data to calculate their
      // bounds, too. Similar to bounds discovery for abbrevs.
      if (!dataStart || objAddr < dataStart) {
        objAddr += this.getPropertyAddrOffset();
        dataAddr = this._machine.getUint16(objAddr);
        objAddr += 2;

        if (!dataStart || dataAddr < dataStart)
          dataStart = dataAddr;
        if (!dataEnd || dataAddr > dataEnd)
          dataEnd = dataStart;
      }
    } while (objAddr < dataStart);

    tableEnd = objAddr - 1;

    this.objectCount = objectCount;
    this.tableEndAddr = tableEnd;
    this.dataStartAddr = dataStart;
    this.dataEndAddr = dataEnd; // XXX TODO wrong but fk it for now

    this._boundsDiscovered = true;
  }
};
