// Implementations of each instruction, keyed by instruction name
bzork.vm.InstructionImpl = {};

(function() {

  function addMethod(opname, fn) {
    if (bzork.vm.InstructionImpl[opname])
      throw "Can not redefine implementation of instruction " + opname;
    bzork.vm.InstructionImpl[opname] = fn;
  }

  // 0OP
  addMethod('rtrue', function() {
    this.returnFromRoutine(1);
  });

  addMethod('rfalse', function() {
    this.returnFromRoutine(0);
  });

  // 2OP
  addMethod('add', function() {
    var a = this.getSignedOperand(0),
        b = this.getSignedOperand(1);
    this._machine.setVariable(this.getStoreVariable(), a + b);
    this.next();
  });

  // VAROP
  addMethod('call', function() {
    var operands = this.getOperands(),
        routineAddr = operands[0];

    // This might be completely wrong. I'm having trouble grokking the spec.
    if (routineAddr === 0)
      this.returnFromRoutine(0);

    var args = [];
    for (var i = 1; i < operands.length; i++)
      args.push(operands[i]);

    this._machine.call(routineAddr, this._addr + this.getLength(),
                       this.getStoreVariable(), args);
  });

}());
