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

  // There is an annoying special case condition of the main routine
  // (for which there is no routineStack entry in v<5) should still be
  // able to push onto/pop from the stack
  getOriginalSP: function() {
    if (this.routineStack.size() > 0)
      return this.routineStack.peek().getOriginalSP();
    else
      return 0;
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

    bzork.Debug.groupCollapsed("R%s (store: %s, returnAddr: %s)",
                               routine._addr.toString(16),
                               bzork.Util.variableName(storeVariable),
                               returnAddr.toString(16));

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

    bzork.Debug.log("%c[wrote 0x%s to %s, returning to 0x%s]",
                    'font-style:italic;font-weight:bold',
                    value.toString(16), bzork.Util.variableName(routine.getStoreVariable()),
                    this.getPC().toString(16));
    bzork.Debug.groupEnd();
  },

  getVariable: function(i) {
    if (i === 0) {
      if (this.getSP() <= this.getOriginalSP())
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
