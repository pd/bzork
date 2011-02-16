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

bzork.vm.Instruction.prototype.getOpcodeByte = function() {
  return this._machine.getUint8(this._addr);
};

bzork.vm.Instruction.prototype.getForm = function() {
  var opbyte = this.getOpcodeByte();

  if ((opbyte & 0xc0) !== 0)
    return bzork.vm.Instruction.Forms.VAR;
  else if ((opbyte & 0x80) !== 0)
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
    if ((opbyte & 0x30) !== 0)
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
    return this._map2bitOperandType(opbyte & 0x30);
  case bzork.vm.Instruction.Forms.LONG:
    return [this._map1bitOperandType(opbyte & 0x40),
            this._map1bitOperandType(opbyte & 0x20)];
  case bzork.vm.Instruction.Forms.VAR:
    var bitfield = this._machine.getUint8(this._addr + 1),
        types = [];
    for (var n = 6; n >= 0; n -= 2) {
      var bits = (bitfield >> n) & 0x3;
      types.push(this._map2bitOperandType(bits));
    }
    return types;
  }
};

bzork.vm.Instruction.prototype.getOperands = function() {
  var offset = 0,
      form = this.getForm(),
      optypes = this.getOperandTypes(),
      operands = [];

  if (form === bzork.vm.Instruction.Forms.VAR ||
      form === bzork.vm.Instruction.Forms.EXT)
    offset += 1; // could be +=2 for "double variable" VARs, see 4.4.3.1

  switch (this.getOperandCount()) {
  case bzork.vm.Instruction.OpCounts.OP0:
    return [];
  case bzork.vm.Instruction.OpCounts.OP1:
    return [this._getOperand(offset, optypes[0])];
  case bzork.vm.Instruction.OpCounts.OP2:
  case bzork.vm.Instruction.OpCounts.VAR:
    for (var i = 0; i < optypes.length; i++) {
      operands.push( this._getOperand(offset, optypes[i]) );
      offset += this._operandSize(optypes[i]);
    }
    return operands;
  }
};

bzork.vm.Instruction.prototype._getOperand = function(offset, type) {
  if (type === bzork.vm.Instruction.OpTypes.OMIT)
    return undefined;

  var form = this.getForm();

  // offset is from the beginning of the operand values,
  // but we need the full offset into memory
  offset += this._addr; // beginning of instruction
  if (form === bzork.vm.Instruction.Forms.VAR ||
      form === bzork.vm.Instruction.Forms.EXT)
    offset += 1; // operand types bit field

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
  case 1: return bzork.vm.Instruction.OpTypes.SHORT;
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
    return bzork.vm.Instruction.OpTypes.SHORT;
};
