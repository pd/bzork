// Represents a routine about to be called, its local variables,
// and the CPU state that will need to be restored when this
// routine returns.
bzork.vm.Routine = function(machine, addr) {
  this._machine = machine;
  this._addr = addr;

  this.originalSP = undefined;
  this.returnAddr = undefined;
  this.locals = [];
};

bzork.vm.Routine.prototype = {
  getOriginalSP: function() {
    return this.originalSP;
  },

  setOriginalSP: function(sp) {
    this.originalSP = sp;
  },

  getReturnAddr: function() {
    return this.returnAddr;
  },

  setReturnAddr: function(addr) {
    this.returnAddr = addr;
  },

  getStoreVariable: function() {
    if (!this.storesResult())
      throw "Can not access storeVariable on routine which does not store";
    return this.storeVariable;
  },

  // Set to false to indicate this routine should not store its result
  setStoreVariable: function(i) {
    this.storeVariable = i;
  },

  storesResult: function() {
    return this.storeVariable !== false;
  },

  // Locals are indexed from 1, local 0 is the stack.
  getLocal: function(i) {
    return this.locals[i - 1];
  },

  setLocal: function(i, val) {
    this.locals[i - 1] = val;
  },

  getNumLocals: function() {
    return this._machine.getUint8(this._addr);
  },

  getLocalDefaults: function() {
    var max = this.getNumLocals(),
        vals = [];

    if (this._machine.getZcodeVersion() >= 5)
      for (var i = 0; i < max; i++)
        vals.push(0);
    else
      for (var i = 0; i < max; i++)
        vals.push(this._machine.getUint16(this._addr + 1 + (i * 2)));

    return vals;
  },

  getFirstInstructionAddr: function() {
    if (this._machine.getZcodeVersion() >= 5)
      return this._addr + 1;
    else
      return this._addr + 1 + (this.getNumLocals() * 2);
  }
};

