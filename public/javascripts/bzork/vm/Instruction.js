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
