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

  addMethod('print', function() {
    this._machine.ui.print(this.getString());
    this.next();
  });

  addMethod('new_line', function() {
    this._machine.ui.print("\n");
    this.next();
  });

  // 1OP
  addMethod('jz', function() {
    var a = this.operands[0].getSignedValue();
    this.branchOrNext(a === 0);
  });

  addMethod('get_sibling', function() {
    var obj = this._machine.getObject(this.operands[0].getValue()),
        sibling = obj.getSibling();
    this.storeResult(sibling);
    this.branchOrNext(sibling !== 0);
  });

  addMethod('get_parent', function() {
    var obj = this._machine.getObject(this.operands[0].getValue());
    this.storeResult(obj.getParent());
    this.next();
  });

  addMethod('get_child', function() {
    var obj = this._machine.getObject(this.operands[0].getValue()),
        child = obj.getChild();
    this.storeResult(child);
    this.branchOrNext(child !== 0);
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
    this._machine.increasePC(this.operands[0].getSignedValue() + 1);
  });

  addMethod('call_1n', function() {
    this._machine.call(this.operands[0].getValue(), this.nextInstructionAddr(),
                       false, []);
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

  addMethod('inc_chk', function() {
    var variable = this.operands[0].getValue(),
        value = this.operands[1].getSignedValue();
    this.branchOrNext(this.incrementVariable(variable) > value);
  });

  addMethod('and', function() {
    var a = this.operands[0].getValue(),
        b = this.operands[1].getValue();
    this.storeResult(a & b);
    this.next();
  });

  addMethod('test_attr', function() {
    var objnum = this.operands[0].getValue(),
        attr = this.operands[1].getValue();
    this.branchOrNext(this._machine.testAttribute(objnum, attr));
  });

  addMethod('store', function() {
    var variable = this.operands[0].getValue(),
        value = this.operands[1].getValue();
    this._machine.setVariable(variable, value);
    this.next();
  });

  addMethod('insert_obj', function() {
    var objnum = this.operands[0].getValue(),
        parentnum = this.operands[1].getValue();
    this._machine.insertObject(objnum, parentnum);
    this.next();
  });

  addMethod('loadw', function() {
    var array = this.operands[0].getValue(),
        wordIndex = this.operands[1].getValue();
    this.storeResult(this._machine.getUint16(array + wordIndex * 2));
    this.next();
  });

  addMethod('loadb', function() {
    var array = this.operands[0].getValue(),
        byteIndex = this.operands[1].getValue();
    this.storeResult(this._machine.getUint8(array + byteIndex));
    this.next();
  });

  addMethod('get_prop', function() {
    var objnum = this.operands[0].getValue(),
        propnum = this.operands[1].getValue();
    this.storeResult(this._machine.getProperty(objnum, propnum));
    this.next();
  });

  addMethod('get_prop_addr', function() {
    var objnum = this.operands[0].getValue(),
        propnum = this.operands[1].getValue();
    this.storeResult(this._machine.getPropertyDataAddr(objnum, propnum));
    this.next();
  });

  addMethod('get_next_prop', function() {
    var objnum = this.operands[0].getValue(),
        propnum = this.operands[1].getValue();
    this.storeResult(this._machine.getNextProperty(objnum, propnum));
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

  addMethod('call_vs', function() { // same as call. what to do.
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

  addMethod('print_char', function() {
    var code = this.operands[0].getValue();
    this._machine.ui.print(this._machine.decodeZsciiChar(code));
    this.next();
  });

  addMethod('print_num', function() {
    var value = this.operands[0].getSignedValue();
    this._machine.ui.print(value.toString());
    this.next();
  });

  addMethod('put_prop', function() {
    var objnum = this.operands[0].getValue(),
        propnum = this.operands[1].getValue(),
        value = this.operands[2].getValue();
    this._machine.setProperty(objnum, propnum, value);
    this.next();
  });

}());
