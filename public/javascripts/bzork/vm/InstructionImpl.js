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
    var a = this.getSignedOperandValue(0);
    this.branchOrNext(a === 0);
  });

  addMethod('get_sibling', function() {
    var obj = this.getObjectFromOperand(0),
        sibling = obj.getSibling();
    this.storeResult(sibling);
    this.branchOrNext(sibling !== 0);
  });

  addMethod('get_parent', function() {
    var obj = this.getObjectFromOperand(0);
    this.storeResult(obj.getParent());
    this.next();
  });

  addMethod('get_child', function() {
    var obj = this.getObjectFromOperand(0);
        child = obj.getChild();
    this.storeResult(child);
    this.branchOrNext(child !== 0);
  });

  addMethod('inc', function() {
    this.incrementVariable(this.getOperandValue(0));
    this.next();
  });

  addMethod('dec', function() {
    this.decrementVariable(this.getOperandValue(0));
    this.next();
  });

  addMethod('print_obj', function() {
    var obj = this.getObjectFromOperand(0);
    this._machine.ui.print(obj.getDescription());
    this.next();
  });

  addMethod('ret', function() {
    this.returnFromRoutine(this.getOperandValue(0));
  });

  addMethod('jump', function() {
    this._machine.increasePC(this.getSignedOperandValue(0) + 1);
  });

  addMethod('call_1n', function() {
    this._machine.call(this.getOperandValue(0), this.nextInstructionAddr(),
                       false, []);
  });

  // 2OP
  addMethod('je', function() {
    var values = this.getSignedOperandValues(),
        foundEq = false;

    if (values.length < 2)
      throw "Insufficient operands supplied to 'je' at 0x" + this._addr.toString(16);

    for (var i = 0; i < values.length - 1; i++)
      foundEq = values[i] === values[i+1];

    this.branchOrNext(foundEq);
  });

  addMethod('dec_chk', function() {
    var variable = this.getOperandValue(0),
        value = this.getSignedOperandValue(1);
    this.branchOrNext(this.decrementVariable(variable) < value);
  });

  addMethod('inc_chk', function() {
    var variable = this.getOperandValue(0),
        value = this.getSignedOperandValue(1);
    this.branchOrNext(this.incrementVariable(variable) > value);
  });

  addMethod('jin', function() {
    var obj1 = this.getObjectFromOperand(0),
        obj2 = this.getObjectFromOperand(1);

    this.branchOrNext(obj1.getParent() === obj2.id);
  });

  addMethod('and', function() {
    var a = this.getOperandValue(0),
        b = this.getOperandValue(1);
    this.storeResult(a & b);
    this.next();
  });

  addMethod('test_attr', function() {
    var objnum = this.getOperandValue(0),
        attr = this.getOperandValue(1);
    this.branchOrNext(this._machine.testAttribute(objnum, attr));
  });

  addMethod('set_attr', function() {
    var objnum = this.getOperandValue(0),
        attr = this.getOperandValue(1);
    this._machine.setAttribute(objnum, attr);
    this.next();
  });

  addMethod('store', function() {
    var variable = this.getOperandValue(0),
        value = this.getOperandValue(1);
    this._machine.setVariable(variable, value);
    this.next();
  });

  addMethod('insert_obj', function() {
    var objnum = this.getOperandValue(0),
        parentnum = this.getOperandValue(1);
    this._machine.insertObject(objnum, parentnum);
    this.next();
  });

  addMethod('loadw', function() {
    var array = this.getOperandValue(0),
        wordIndex = this.getOperandValue(1);
    this.storeResult(this._machine.getUint16(array + wordIndex * 2));
    this.next();
  });

  addMethod('loadb', function() {
    var array = this.getOperandValue(0),
        byteIndex = this.getOperandValue(1);
    this.storeResult(this._machine.getUint8(array + byteIndex));
    this.next();
  });

  addMethod('get_prop', function() {
    var objnum = this.getOperandValue(0),
        propnum = this.getOperandValue(1);
    this.storeResult(this._machine.getProperty(objnum, propnum));
    this.next();
  });

  addMethod('get_prop_addr', function() {
    var objnum = this.getOperandValue(0),
        propnum = this.getOperandValue(1);
    this.storeResult(this._machine.getPropertyDataAddr(objnum, propnum));
    this.next();
  });

  addMethod('get_next_prop', function() {
    var objnum = this.getOperandValue(0),
        propnum = this.getOperandValue(1);
    this.storeResult(this._machine.getNextProperty(objnum, propnum));
    this.next();
  });

  addMethod('add', function() {
    var a = this.getSignedOperandValue(0),
        b = this.getSignedOperandValue(1);
    this._machine.setVariable(this.getStoreVariable(), a + b);
    this.next();
  });

  addMethod('sub', function() {
    var a = this.getSignedOperandValue(0),
        b = this.getSignedOperandValue(1);
    this._machine.setVariable(this.getStoreVariable(), a - b);
    this.next();
  });

  // VAROP
  addMethod('call', function() {
    var operands = this.operands, args = [];
    for (var i = 1; i < operands.length; i++)
      args.push(this.getOperandValue(i));

    this._machine.call(this.getOperandValue(0), this.nextInstructionAddr(),
                       this.getStoreVariable(), args);
  });

  addMethod('call_vs', function() { // same as call. what to do.
    var operands = this.operands, args = [];
    for (var i = 1; i < operands.length; i++)
      args.push(this.getOperandValue(i));

    this._machine.call(this.getOperandValue(0), this.nextInstructionAddr(),
                       this.getStoreVariable(), args);
  });

  addMethod('storew', function() {
    var array = this.getOperandValue(0),
        wordIndex = this.getOperandValue(1),
        value = this.getOperandValue(2);
    this._machine.setUint16(array + wordIndex * 2, value);
    this.next();
  });

  addMethod('print_char', function() {
    var code = this.getOperandValue(0);
    this._machine.ui.print(this._machine.decodeZsciiChar(code));
    this.next();
  });

  addMethod('print_num', function() {
    var value = this.getSignedOperandValue(0);
    this._machine.ui.print(value.toString());
    this.next();
  });

  addMethod('push', function() {
    this._machine.pushStack(this.getOperandValue(0));
    this.next();
  });

  addMethod('pull', function() {
    var variable = this.getOperandValue(0),
        value = this._machine.pullStack();
    this._machine.setVariable(variable, value);
    this.next();
  });

  addMethod('put_prop', function() {
    var objnum = this.getOperandValue(0),
        propnum = this.getOperandValue(1),
        value = this.getOperandValue(2);
    this._machine.setProperty(objnum, propnum, value);
    this.next();
  });

}());
