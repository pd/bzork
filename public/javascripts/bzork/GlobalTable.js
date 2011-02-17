// Global variables are stored in dynamic memory, and numbered
// from 16 to 255.
bzork.GlobalTable = function(machine, addr) {
  this._machine = machine;
  this._addr = addr;
};

bzork.GlobalTable.prototype.get = function(i) {
  if (i < 16 || i > 255)
    throw "Global variable " + i + " out of bounds (16..255)!";
  return this._machine.getUint16(this._getVariableAddr(i));
};

bzork.GlobalTable.prototype.set = function(i, val) {
  if (i < 16 || i > 255)
    throw "Global variable " + i + " out of bounds (16..255)!";
  this._machine.setUint16(this._getVariableAddr(i), val);
};

bzork.GlobalTable.prototype.getStartAddr = function() {
  return this._addr;
};

bzork.GlobalTable.prototype.getEndAddr = function() {
  return this._addr + 480;
};

bzork.GlobalTable.prototype._getVariableAddr = function(i) {
  return this._addr + ((i - 16) * 2);
};
