// Contains both a property defaults table and the object tree.
// Objects are numbered from 1, as object 0 is a NULL object used as
// the first parent in the tree.
bzork.Memory.ObjectTable = function(buffer, version) {
  this._memory = buffer;
  this.version = version;
};

bzork.Memory.ObjectTable.prototype.getObjectSize = function() {
  if (this.version <= 3)
    return 9;
  else
    return 14;
};

bzork.Memory.ObjectTable.prototype.getMaxProperties = function() {
  if (this.version <= 3)
    return 32;
  else
    return 64;
};

bzork.Memory.ObjectTable.prototype.getPropertyAddrOffset = function() {
  if (this.version <= 3)
    return 7;
  else
    return 12;
};

bzork.Memory.ObjectTable.prototype.getStartAddr = function() {
  return this._memory.byteOffset;
};

bzork.Memory.ObjectTable.prototype.getEndAddr = function() {
  if (!this._boundsDiscovered)
    this._discoverBounds();
  return this.tableEndAddr;
};

bzork.Memory.ObjectTable.prototype.getObjectCount = function() {
  if (!this._boundsDiscovered)
    this._discoverBounds();
  return this.objectCount;
};

bzork.Memory.ObjectTable.prototype.getObjectAddr = function(i) {
  var offset = this.getStartAddr();
  offset += (this.getMaxProperties() - 1) * 2;
  offset += (i - 1) * this.getObjectSize();
  return offset;
};

bzork.Memory.ObjectTable.prototype._discoverBounds = function() {
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
      dataAddr = this._memory.getUint16(objAddr - this.getStartAddr()); // ugh
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
};
