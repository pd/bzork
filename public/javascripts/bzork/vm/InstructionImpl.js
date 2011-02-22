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
    var a = this.operands[0].getSignedValue(),
        b = this.operands[1].getSignedValue();
    this._machine.setVariable(this.getStoreVariable(), a + b);
    this.next();
  });

  // VAROP
  addMethod('call', function() {
    var operands = this.operands, args = [];
    for (var i = 1; i < operands.length; i++)
      args.push(operands[i].getValue());

    this._machine.call(operands[0].getValue(), this.nextInstructionAddr(),
                       this.getStoreVariable(), args);
  });

}());
