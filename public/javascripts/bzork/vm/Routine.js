bzork.vm.Routine = function(machine, addr) {
  this._machine = machine;
  this._addr = addr;
};

bzork.vm.Routine.prototype = {
  getNumLocals: function() {
    return this._machine.getUint8(this._addr);
  },

  getLocalValues: function() {
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

