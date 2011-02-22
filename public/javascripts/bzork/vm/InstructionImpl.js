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

  // 1OP
  addMethod('jz', function() {
    var a = this.operands[0].getSignedValue();
    this.branchOrNext(a === 0);
  });

  addMethod('inc', function() {
    this.incrementVariable(this.operands[0].getValue());
    this.next();
  });

  addMethod('dec', function() {
    this.decrementVariable(this.operands[0].getValue());
    this.next();
  });

  addMethod('ret', function() {
    this.returnFromRoutine(this.operands[0].getValue());
  });

  addMethod('jump', function() {
    this._machine.increasePC(this.operands[0].getSignedValue());
  });

  // 2OP
  addMethod('je', function() {
    var a = this.operands[0].getSignedValue(),
        b = this.operands[1].getSignedValue();
    this.branchOrNext(a === b);
  });

  addMethod('dec_chk', function() {
    var variable = this.operands[0].getValue(),
        value = this.operands[1].getSignedValue();
    this.branchOrNext(this.decrementVariable(variable) < value);
  });

  addMethod('loadw', function() {
    var array = this.operands[0].getValue(),
        wordIndex = this.operands[1].getValue();
    this._machine.setVariable(this.getStoreVariable(),
                              this._machine.getUint16(array + wordIndex * 2));
    this.next();
  });

  addMethod('add', function() {
    var a = this.operands[0].getSignedValue(),
        b = this.operands[1].getSignedValue();
    this._machine.setVariable(this.getStoreVariable(), a + b);
    this.next();
  });

  addMethod('sub', function() {
    var a = this.operands[0].getSignedValue(),
        b = this.operands[1].getSignedValue();
    this._machine.setVariable(this.getStoreVariable(), a - b);
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

  addMethod('storew', function() {
    var array = this.operands[0].getValue(),
        wordIndex = this.operands[1].getValue(),
        value = this.operands[2].getValue();
    this._machine.setUint16(array + wordIndex * 2, value);
    this.next();
  });

}());
