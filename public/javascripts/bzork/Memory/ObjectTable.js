// Contains both a property defaults table and the object tree.
// Objects are numbered from 1, as object 0 is a NULL object used as
// the first parent in the tree.
bzork.Memory.ObjectTable = function(buffer) {
  this._memory = buffer;
};

bzork.Memory.ObjectTable.prototype.getStartAddr = function() {
  return this._memory.byteOffset;
};

bzork.Memory.ObjectTable.prototype.getEndAddr = function() {
  return 0xdeadbeef;
};

bzork.Memory.ObjectTable.prototype.getObjectCount = function() {
  return -1;
};
