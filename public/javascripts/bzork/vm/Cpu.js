bzork.vm.Cpu = function(machine) {
  this._machine = machine;
  this.pc = machine.getStartPC();
  this.stack = new bzork.vm.Stack();
  this.routineStack = new bzork.vm.Stack();
};

bzork.vm.Cpu.prototype = {
  getPC: function() {
    return this.pc;
  },

  setPC: function(pc) {
    this.pc = pc;
  },

  getSP: function() {
    return this.stack.size();
  },

  callRoutine: function(packedAddr, returnAddr, args) {
    var routine = new bzork.vm.Routine(this._machine,
                                       this._unpackRoutineAddr(packedAddr));

    routine.setOriginalSP(this.getSP());
    routine.setReturnAddr(returnAddr);

    this.routineStack.push(routine);
    this.pc = routine.getFirstInstructionAddr();
    console.log("moved pc =", this.pc);
  },

  returnWith: function(value) {
    if (this.routineStack.isEmpty())
      throw "No current routine to return from";

    var routine = this.routineStack.pop();
    this.setSP(routine.getOriginalSP());
    this.setPC(routine.getReturnAddr());

    if (routine.returnsVariable())
      this.setVariable(routine.getReturnVariable(), value);
  },

  _unpackRoutineAddr: function(addr) {
    var zver = this._machine.getZcodeVersion();
    if (zver <= 3)
      return addr * 2;
    if (zver <= 5)
      return addr * 4;
    if (zver <= 7)
      return addr * 4 + 8 * this._machine.getRoutineOffset();
    if (zver === 8)
      return addr * 8;
  }
};
