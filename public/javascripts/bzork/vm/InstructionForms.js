// A few of the accessor methods differ depending on the instruction
// form. Instruction will decorate itself with the proper methods once
// it knows its own form.

(function() {

function get2bitOpType(bits) {
  switch (bits & 0x3) {
  case 0: return bzork.vm.Instruction.OpTypes.LARGE;
  case 1: return bzork.vm.Instruction.OpTypes.SMALL;
  case 2: return bzork.vm.Instruction.OpTypes.VAR;
  case 3: return bzork.vm.Instruction.OpTypes.OMIT;
  }
}

function get1bitOpType(bit) {
  bit = bit & 0x1;
  return (bit & 0x1) === 1 ? bzork.vm.Instruction.OpTypes.VAR :
    bzork.vm.Instruction.OpTypes.SMALL;
}

bzork.vm.LongInstruction = {
  getOpcode: function() { return this.getOpcodeByte() & 0x1f; },
  getOperandCount: function() { return bzork.vm.Instruction.OpCounts.OP2; },
  getOperandTypes: function() {
    var opbyte = this.getOpcodeByte();
    return [get1bitOpType((opbyte & 0x40) >> 6),
            get1bitOpType((opbyte & 0x20) >> 5)];
  },
  _getOperandsAddr: function() { return this._addr + 1; }
};

bzork.vm.ShortInstruction = {
  getOpcode: function() { return this.getOpcodeByte() & 0xf; },
  getOperandCount: function() {
    var opbyte = this.getOpcodeByte();
    if ((opbyte & 0x30) === 0x30)
      return bzork.vm.Instruction.OpCounts.OP0;
    else
      return bzork.vm.Instruction.OpCounts.OP1;
  },
  getOperandTypes: function() {
    var opbyte = this.getOpcodeByte(),
        type   = get2bitOpType((opbyte & 0x30) >> 4);
    return type === bzork.vm.Instruction.OpTypes.OMIT ? [] : [type];
  },
  _getOperandsAddr: function() { return this._addr + 1; }
};

bzork.vm.VarInstruction = {
  getOpcode: function() { return this.getOpcodeByte() & 0x1f; },
  getOperandCount: function() {
    var opbyte = this.getOpcodeByte();
    if (this._is8OP())
      return 8;
    if ((opbyte & 0x20) === 0x20)
      return bzork.vm.Instruction.OpCounts.VAR;
    else
      return bzork.vm.Instruction.OpCounts.OP2;
  },
  getOperandTypes: function() {
    var bitfield, high, low, types = [];

    if (this._is8OP()) {
      bitfield = this._machine.getUint16(this._addr + 1);
      high = 14;
      low = 0;
    } else {
      bitfield = this._machine.getUint8(this._addr + 1);
      high = 6;
      low = this.getOperandCount() === bzork.vm.Instruction.OpCounts.OP2 ? 4 : 0;
    }

    for (var n = high; n >= low; n -= 2) {
      var bits = (bitfield >> n) & 0x3;
      types.push(get2bitOpType(bits));
    }

    return types;
  },
  _getOperandsAddr: function() {
    if (this._is8OP())
      return this._addr + 3;
    return this._addr + 2;
  },
  _is8OP: function() {
    var opcode = this.getOpcode();
    return opcode === 0xc || opcode === 0x1a;
  }
};

bzork.vm.ExtInstruction = {
  getOpcode: function() { return this._machine.getUint8(this._addr + 1); },
  getOperandCount: function() { return bzork.vm.Instruction.OpCounts.VAR; },
  getOperandTypes: function() {
    var bitfield = this._machine.getUint8(this._addr + 2),
        types = [], limit = 0;
    for (var n = 6; n >= limit; n -= 2) {
      var bits = (bitfield >> n) & 0x3;
      types.push(get2bitOpType(bits));
    }
    return types;
  },
  _getOperandsAddr: function() { return this._addr + 3; }
};

}());
