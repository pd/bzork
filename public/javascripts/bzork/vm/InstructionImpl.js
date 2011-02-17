bzork.vm.InstructionImpl = {
  Methods: {}   // Implementations of run() for each instruction,
                // keyed by instruction name
};

(function() {

  function addMethod(opname, fn) {
    if (bzork.vm.InstructionImpl.Methods[opname])
      throw "Can not redefine implementation of instruction " + opname;
    bzork.vm.InstructionImpl.Methods[opname] = fn;
  }

  // 0OP
  addMethod('rtrue', function() {
    this.returnFromRoutine(true);
  });

  addMethod('rfalse', function() {
    this.returnFromRoutine(false);
  });

}());
