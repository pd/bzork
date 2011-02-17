bzork.vm.Instruction = function(machine, addr) {
  this._machine = machine;
  this._addr = addr;
};

bzork.vm.Instruction.Forms = {
  LONG:  0,
  SHORT: 1,
  EXT:   2,
  VAR:   3
};

bzork.vm.Instruction.OpCounts = {
  OP0: 0,
  OP1: 1,
  OP2: 2,
  VAR: 3
};

bzork.vm.Instruction.OpTypes = {
  LARGE: 0,
  SMALL: 1,
  VAR:   2,
  OMIT:  3
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
  } else if (this.branches())
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
  else if ((opbyte & 0x80) === 0x80)
    return bzork.vm.Instruction.Forms.SHORT;
  else if (this._machine.getZcodeVersion() >= 5 && opbyte == 0xbe)
    return bzork.vm.Instruction.Forms.EXT;
  else
    return bzork.vm.Instruction.Forms.LONG;
};

bzork.vm.Instruction.prototype.getOpcode = function() {
  var opbyte = this.getOpcodeByte();

  switch (this.getForm()) {
  case bzork.vm.Instruction.Forms.LONG:
    return opbyte & 0x1f;
  case bzork.vm.Instruction.Forms.SHORT:
    return opbyte & 0xf;
  case bzork.vm.Instruction.Forms.VAR:
    return opbyte & 0x1f;
  case bzork.vm.Instruction.Forms.EXT:
    return this._machine.getUint8(this._addr + 1); // ugh
  }
};

bzork.vm.Instruction.prototype.getOperandCount = function() {
  var opbyte = this.getOpcodeByte();

  switch (this.getForm()) {
  case bzork.vm.Instruction.Forms.LONG:
    return bzork.vm.Instruction.OpCounts.OP2;
  case bzork.vm.Instruction.Forms.SHORT:
    if ((opbyte & 0x30) === 0x30)
      return bzork.vm.Instruction.OpCounts.OP0;
    else
      return bzork.vm.Instruction.OpCounts.OP1;
  case bzork.vm.Instruction.Forms.VAR:
    if ((opbyte & 0x20) !== 0)
      return bzork.vm.Instruction.OpCounts.VAR;
    else
      return bzork.vm.Instruction.OpCounts.OP2;
  case bzork.vm.Instruction.Forms.EXT:
    return bzork.vm.Instruction.OpCounts.VAR;
  default:
    throw "Impossible!";
  }
};

bzork.vm.Instruction.prototype.getOperandTypes = function() {
  var opbyte = this.getOpcodeByte();

  switch (this.getForm()) {
  case bzork.vm.Instruction.Forms.SHORT:
    var type = this._map2bitOperandType((opbyte & 0x30) >> 4);
    return type === bzork.vm.Instruction.OpTypes.OMIT ? [] : [type];
  case bzork.vm.Instruction.Forms.LONG:
    return [this._map1bitOperandType((opbyte & 0x40) >> 6),
            this._map1bitOperandType((opbyte & 0x20) >> 5)];
  case bzork.vm.Instruction.Forms.VAR:
    var bitfield = this._machine.getUint8(this._addr + 1),
        types = [],
        limit = this.getOperandCount() === bzork.vm.Instruction.OpCounts.OP2 ? 4 : 0;
    for (var n = 6; n >= limit; n -= 2) {
      var bits = (bitfield >> n) & 0x3;
      types.push(this._map2bitOperandType(bits));
    }
    return types;
  }
};

bzork.vm.Instruction.prototype.getOperands = function() {
  var offset = this._getOperandsAddr(),
      form = this.getForm(),
      optypes = this.getOperandTypes(),
      operands = [];

  switch (this.getOperandCount()) {
  case bzork.vm.Instruction.OpCounts.OP0:
    return [];
  case bzork.vm.Instruction.OpCounts.OP1:
    return [this._getOperand(offset, optypes[0])];
  case bzork.vm.Instruction.OpCounts.OP2:
  case bzork.vm.Instruction.OpCounts.VAR:
    for (var i = 0; i < optypes.length; i++) {
      var op = this._getOperand(offset, optypes[i]);
      if (typeof op === "undefined")
        break;
      operands.push(op);
      offset += this._operandSize(optypes[i]);
    }
    return operands;
  }
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

  var offset = this._machine.getUint8(this._getBranchOffsetAddr());
  if (this._getBranchOffsetSize() === 1)
    return this._machine.getUint8(this._getBranchOffsetAddr());
  else
    return this._machine.getUint16(this._getBranchOffsetAddr());
}

bzork.vm.Instruction.prototype.hasDanglingString = function() {
  return this._getInstructionInfo().stringed;
};

bzork.vm.Instruction.prototype.getDanglingString = function() {
  if (!this.hasDanglingString())
    throw "Instruction has no embedded string";
  return this._machine.getZsciiString(this._getStringAddr());
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

bzork.vm.Instruction.prototype._map2bitOperandType = function(bits) {
  switch (bits) {
  case 0: return bzork.vm.Instruction.OpTypes.LARGE;
  case 1: return bzork.vm.Instruction.OpTypes.SMALL;
  case 2: return bzork.vm.Instruction.OpTypes.VAR;
  case 3: return bzork.vm.Instruction.OpTypes.OMIT;
  default: throw "Invalid operand type value " + bits;
  }
};

bzork.vm.Instruction.prototype._map1bitOperandType = function(bit) {
  bit = bit & 0x1;
  if (bit === 1)
    return bzork.vm.Instruction.OpTypes.VAR;
  else if (bit === 0)
    return bzork.vm.Instruction.OpTypes.SMALL;
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
