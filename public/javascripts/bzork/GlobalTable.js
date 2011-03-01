// Global variables are stored in dynamic memory, and numbered
// from 16 to 255.
bzork.GlobalTable = function(machine, addr) {
  this._machine = machine;
  this._addr = addr;
};

bzork.GlobalTable.prototype = {
  get: function(i) {
    if (i < 16 || i > 255)
      throw _.sprintf("Global variable %d out of bounds (16..255)!", i);
    return this._machine.getUint16(this._getVariableAddr(i));
  },

  set: function(i, val) {
    if (i < 16 || i > 255)
      throw _.sprintf("Global variable %d out of bounds (16..255)!", i);
    this._machine.setUint16(this._getVariableAddr(i), val);
  },

  getStartAddr: function() {
    return this._addr;
  },

  getEndAddr: function() {
    return this._addr + 480;
  },

  _getVariableAddr: function(i) {
    return this._addr + ((i - 16) * 2);
  }
};
