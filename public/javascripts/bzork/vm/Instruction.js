bzork.vm.Instruction = function(machine, addr) {
  this._machine = machine;
  this._addr = addr;
  this._stealImplMethods();
};

bzork.vm.Instruction.Forms = {
  LONG:  'LONG',
  SHORT: 'SHORT',
  EXT:   'EXT',
  VAR:   'VAR'
};

bzork.vm.Instruction.OpCounts = {
  OP0: 'OP0',
  OP1: 'OP1',
  OP2: 'OP2',
  VAR: 'VAR'
};

bzork.vm.Instruction.OpTypes = {
  LARGE: 'LARGE',
  SMALL: 'SMALL',
  VAR:   'VAR',
  OMIT:  'OMIT'
};

bzork.vm.Instruction.prototype.uniqueKey = function() {
  return this.getOperandCount() + ":" + this.getOpcode();
};

bzork.vm.Instruction.prototype.getLength = function() {
  if (this.hasDanglingString()) {
    var i = 0, word;
    do {
      word = this._machine.getUint16(this._getStringAddr() + i);
      i += 2;
    } while ((word & 0x8000) === 0);
    return this._getStringAddr() + i;
  }

  if (this.branches())
    return this._getBranchOffsetAddr() + this._getBranchOffsetSize();
  else if (this.stores())
    return this._getStoreVariableAddr() + 1;
  else
    return this._getAfterOperandsAddr();
};

bzork.vm.Instruction.prototype.getOpcodeByte = function() {
  return this._machine.getUint8(this._addr);
};

bzork.vm.Instruction.prototype.getForm = function() {
  var opbyte = this.getOpcodeByte();

  if ((opbyte & 0xc0) === 0xc0)
    return bzork.vm.Instruction.Forms.VAR;
  if ((opbyte & 0x80) === 0x80)
    return bzork.vm.Instruction.Forms.SHORT;
  if (this._machine.getZcodeVersion() >= 5 && opbyte == 0xbe)
    return bzork.vm.Instruction.Forms.EXT;
  return bzork.vm.Instruction.Forms.LONG;
};

bzork.vm.Instruction.prototype.getOperands = function() {
  var offset = this._getOperandsAddr(),
      optypes = this.getOperandTypes(),
      operands = [];

  if (optypes.length === 0)
    return [];

  for (var i = 0; i < optypes.length; i++) {
    var op = this._getOperand(offset, optypes[i]);
    if (typeof op === "undefined")
      break;
    operands.push(op);
    offset += this._operandSize(optypes[i]);
  }

  return operands;
};

bzork.vm.Instruction.prototype.stores = function() {
  return this._getInstructionInfo().stores;
};

bzork.vm.Instruction.prototype.getStoreVariable = function() {
  if (!this.stores())
    throw "Instruction does not store";
  return this._machine.getUint8(this._getStoreVariableAddr());
};

bzork.vm.Instruction.prototype.branches = function() {
  return this._getInstructionInfo().branches;
};

bzork.vm.Instruction.prototype.branchesOn = function() {
  if (!this.branches())
    throw "Instruction does not branch";

  var byte = this._machine.getUint8(this._getBranchOffsetAddr());
  return (byte & 0x80) === 0x80;
};

bzork.vm.Instruction.prototype.getBranchOffset = function() {
  if (!this.branches())
    throw "Instruction does not branch";

  if (this._getBranchOffsetSize() === 1)
    return this._machine.getUint8(this._getBranchOffsetAddr()) & 0x3f;

  var val = this._machine.getUint16(this._getBranchOffsetAddr()) & 0x3fff;
  return bzork.Math.toSigned14bit(val);
}

bzork.vm.Instruction.prototype.hasDanglingString = function() {
  return this._getInstructionInfo().stringed;
};

bzork.vm.Instruction.prototype.getDanglingString = function() {
  if (!this.hasDanglingString())
    throw "Instruction has no embedded string";
  return this._machine.getZsciiString(this._getStringAddr());
};

// Ganks a number of methods from bzork.vm.InstructionImpl
// based on the form of this instruction
bzork.vm.Instruction.prototype._stealImplMethods = function() {
  var methods = bzork.vm.InstructionImpl.Forms[this.getForm()];
  for (method in methods)
    this[method] = methods[method];
};

bzork.vm.Instruction.prototype._getInstructionInfo = function() {
  return bzork.vm.InstructionInfo.DB[this.uniqueKey()];
};

bzork.vm.Instruction.prototype._getOperand = function(offset, type) {
  if (type === bzork.vm.Instruction.OpTypes.OMIT)
    return undefined;
  if (type === bzork.vm.Instruction.OpTypes.LARGE)
    return this._machine.getUint16(offset);
  else
    return this._machine.getUint8(offset);
};

bzork.vm.Instruction.prototype._operandSize = function(type) {
  if (type === bzork.vm.Instruction.OpTypes.LARGE)
    return 2;
  else if (type === bzork.vm.Instruction.OpTypes.OMIT)
    return 0;
  else
    return 1;
};

bzork.vm.Instruction.prototype._getOperandsAddr = function() {
  var addr = this._addr + 1; // skip opcode

  var form = this.getForm();
  if (form === bzork.vm.Instruction.Forms.EXT)
    addr += 1; // 2 byte opcode for extended forms
  if (form === bzork.vm.Instruction.Forms.VAR || form === bzork.vm.Instruction.Forms.EXT)
    addr += 1; // operand types bitfield

  return addr;
};

bzork.vm.Instruction.prototype._getAfterOperandsAddr = function() {
  var addr = this._getOperandsAddr(),
      optypes = this.getOperandTypes();
  for (var i = 0; i < optypes.length; i++)
    addr += this._operandSize(optypes[i]);
  return addr;
};

bzork.vm.Instruction.prototype._getStoreVariableAddr = function() {
  return this._getAfterOperandsAddr();
};

bzork.vm.Instruction.prototype._getBranchOffsetAddr = function() {
  if (this.stores())
    return this._getStoreVariableAddr() + 1;
  else
    return this._getStoreVariableAddr();
};

bzork.vm.Instruction.prototype._getBranchOffsetSize = function() {
  var byte = this._machine.getUint8(this._getBranchOffsetAddr());
  if ((byte & 0x40) === 0x40)
    return 1;
  else
    return 2;
};

bzork.vm.Instruction.prototype._getStringAddr = function() {
  // neither print nor print_ret store or branch, so this is always safe
  return this._getAfterOperandsAddr();
};
