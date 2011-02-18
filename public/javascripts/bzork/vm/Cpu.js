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

  setSP: function(sp) {
    return this.stack.shrinkTo(sp);
  },

  callRoutine: function(packedAddr, returnAddr, storeVariable, args) {
    var routine = new bzork.vm.Routine(this._machine,
                                       this._unpackRoutineAddr(packedAddr));

    routine.setOriginalSP(this.getSP());
    routine.setReturnAddr(returnAddr);
    routine.setStoreVariable(storeVariable);

    var localDefaults = routine.getLocalDefaults();
    for (var i = 1; i <= localDefaults.length; i++)
      routine.setLocal(i, args[i - 1] || localDefaults[i - 1]);

    this.routineStack.push(routine);
    this.pc = routine.getFirstInstructionAddr();

    return routine;
  },

  returnWith: function(value) {
    if (this.routineStack.isEmpty())
      throw "No current routine to return from";

    var routine = this.routineStack.pop();
    this.setSP(routine.getOriginalSP());
    this.setPC(routine.getReturnAddr());

    if (routine.storesResult())
      this.setVariable(routine.getStoreVariable(), value);
  },

  getVariable: function(i) {
    if (i === 0) {
      if (this.getSP() <= this.routineStack.peek().getOriginalSP())
        throw "Stack underflow error";
      return this.stack.pop();
    }

    if (i >= 16)
      return this._machine.getGlobal(i);
    else
      return this.routineStack.peek().getLocal(i);
  },

  setVariable: function(i, val) {
    if (i === 0)
      this.stack.push(val);
    else if (i >= 16)
      this._machine.setGlobal(i, val);
    else
      this.routineStack.peek().setLocal(i, val);
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