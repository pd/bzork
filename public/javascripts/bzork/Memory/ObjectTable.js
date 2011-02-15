// Contains both a property defaults table and the object tree.
// Objects are numbered from 1, as object 0 is a NULL object used as
// the first parent in the tree.
bzork.Memory.ObjectTable = function(buffer, tableStartAddr, version) {
  this._memory = buffer;
  this.tableStartAddr = tableStartAddr;
  this.version = version;
};

bzork.Memory.ObjectTable.prototype.get = function(i) {
  if (!this._boundsDiscovered)
    this._discoverBounds();

  if (i < 1 || i > this.getObjectCount())
    throw "Object " + i + " out of bounds!";

  var object = new bzork.Memory.Object(i),
      addr = this.getObjectAddr(i);

  object.attributes = null;

  // borked for v4+
  object.parent = this._memory.getUint8(addr + 4);
  object.sibling = this._memory.getUint8(addr + 5);
  object.child = this._memory.getUint8(addr + 6);
  object.propertyAddr = this._memory.getUint16(addr + 7);

  if (this.objectHasDescription(object)) {
    var view = new DataView(this._memory.buffer, object.propertyAddr + 1);
    object.description = bzork.Zscii.toAscii(view);
  }

  return object;
};

bzork.Memory.ObjectTable.prototype.objectHasDescription = function(object) {
  return this._memory.getUint8(object.propertyAddr) !== 0;
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
  return this.tableStartAddr;
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
      dataAddr = this._memory.getUint16(objAddr);
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
