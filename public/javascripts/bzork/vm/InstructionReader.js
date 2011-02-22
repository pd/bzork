bzork.vm.InstructionReader = function(machine) {
  this._machine = machine;
};

bzork.vm.InstructionReader.prototype = {
  readInstruction: function(addr) {
    return this.readInstructionFrom(this._machine, addr);
  },

  readInstructionFrom: function(view, addr) {
    var opbyte = view.getUint8(addr),
        form = this.findForm(opbyte),
        opcode = this.findOpcode(form, opbyte, view, addr),
        opcount = this.findOperandCount(form, opbyte, opcode),
        optypes = this.findOperandTypes(form, opbyte, opcount, view, addr),
        operands = [];

    var curaddr = this.findOperandsAddr(addr, form, opcount);
    for (var i = 0; i < opcount; i++) {
      if (optypes[i] === bzork.vm.Instruction.OpTypes.OMIT)
        break;

      var value;

      if (optypes[i] === bzork.vm.Instruction.OpTypes.LARGE)
        value = view.getUint16(curaddr);
      else
        value = view.getUint8(curaddr);

      var operand = new bzork.vm.Operand(this._machine, optypes[i], value);
      operands.push(operand);
      curaddr += operand.getSize();
    }

    var instructionDef = this.getInstructionDef(opcount, opcode);
    var options = { form: form, opcode: opcode, opcount: opcount, operands: operands };

    if (instructionDef.stores)
      options.storeVar = view.getUint8(curaddr++);

    if (instructionDef.branches) {
      var branch = view.getUint8(curaddr);

      options.branchOn = (branch & 0x80) === 0x80;
      if ((branch & 0x40) === 0x40) {
        options.branchOffset = bzork.Math.toInt14(branch & 0x3f);
        curaddr++;
      } else {
        options.branchOffset = bzork.Math.toInt14(view.getUint16(curaddr) & 0x3fff);
        curaddr += 2;
      }
    }

    if (instructionDef.stringed) {
      options.zstring = this._machine.getZsciiString(curaddr, view);
      curaddr = this._machine.findZsciiEnd(curaddr, view);
    }

    var length = curaddr - addr;
    return new bzork.vm.ZInstruction(this._machine, addr, instructionDef, length, options);
  },

  findForm: function(opbyte) {
    if (this._machine.getZcodeVersion() >= 5 && opbyte === 0xbe)
      return bzork.vm.Instruction.Forms.EXT;
    if ((opbyte & 0xc0) === 0xc0)
      return bzork.vm.Instruction.Forms.VAR;
    if ((opbyte & 0x80) === 0x80)
      return bzork.vm.Instruction.Forms.SHORT;
    return bzork.vm.Instruction.Forms.LONG;
  },

  findOpcode: function(form, opbyte, view, addr) {
    switch (form) {
    case bzork.vm.Instruction.Forms.SHORT:
      return opbyte & 0xf;
    case bzork.vm.Instruction.Forms.VAR:
    case bzork.vm.Instruction.Forms.LONG:
      return opbyte &0x1f;
    case bzork.vm.Instruction.Forms.EXT:
      return view.readUint8(addr + 1);
    }
  },

  findOperandCount: function(form, opbyte, opcode) {
    switch (form) {
    case bzork.vm.Instruction.Forms.SHORT:
      if ((opbyte & 0x30) === 0x30)
        return bzork.vm.Instruction.OpCounts.OP0;
      else
        return bzork.vm.Instruction.OpCounts.OP1;
    case bzork.vm.Instruction.Forms.LONG:
      return bzork.vm.Instruction.OpCounts.OP2;
    case bzork.vm.Instruction.Forms.EXT:
      return bzork.vm.Instruction.OpCounts.VAR;
    case bzork.vm.Instruction.Forms.VAR:
      if (opcode === 0xc || opcode === 0x1a)
        return bzork.vm.Instruction.OpCounts.OP8;
      else if ((opbyte & 0x20) === 0x20)
        return bzork.vm.Instruction.OpCounts.VAR;
      else
        return bzork.vm.Instruction.OpCounts.OP2;
    }
  },

  findOperandTypes: function(form, opbyte, opcount, view, addr) {
    switch (form) {
    case bzork.vm.Instruction.Forms.SHORT:
      var type = this._get2bitOpType((opbyte & 0x30) >> 4);
      return type === bzork.vm.Instruction.OpTypes.OMIT ? [] : [type];

    case bzork.vm.Instruction.Forms.LONG:
      return [this._get1bitOpType((opbyte & 0x40) >> 6),
              this._get1bitOpType((opbyte & 0x20) >> 5)];

    case bzork.vm.Instruction.Forms.VAR:
      var bitfield = view.getUint8(addr + 1);
      switch (opcount) {
      case bzork.vm.Instruction.OpCounts.OP2:
        return this._bitfieldOperandTypes(bitfield, 2);
      case bzork.vm.Instruction.OpCounts.VAR:
        return this._bitfieldOperandTypes(bitfield, 4);
      case bzork.vm.Instruction.OpCounts.OP8:
        return this._bitfieldOperandTypes(view.getUint8(addr + 2), 4) +
          this._bitfieldOperandTypes(bitfield, 4);
      }

    case bzork.vm.Instruction.Forms.EXT:
      var bitfield = view.getUint8(addr + 2);
      return this._bitfieldOperandTypes(bitfield, 4);
    }
  },

  findOperandsAddr: function(addr, form, opcount) {
    switch (form) {
    case bzork.vm.Instruction.Forms.LONG:
    case bzork.vm.Instruction.Forms.SHORT:
      return addr + 1;
    case bzork.vm.Instruction.Forms.EXT:
      return addr + 3;
    case bzork.vm.Instruction.Forms.VAR:
      return addr + (opcount === bzork.vm.Instruction.OpCounts.OP8 ? 3 : 2);
    }
  },

  getInstructionDef: function(opcount, opcode) {
    if (opcount === bzork.vm.Instruction.OpCounts.OP8)
      opcount = bzork.vm.Instruction.OpCounts.VAR;
    return bzork.vm.InstructionDB[opcount + ":" + opcode];
  },

  _bitfieldOperandTypes: function(bitfield, count) {
    var types = [];
    for (var i = 0; i < count; i++) {
      var bits = (bitfield >> (6 - i * 2)) & 0x3;
      types.push(this._get2bitOpType(bits));
    }
    return types;
  },

  _get1bitOpType: function(bit) {
    bit = bit & 0x1;
    return (bit & 0x1) === 1 ? bzork.vm.Instruction.OpTypes.VAR :
      bzork.vm.Instruction.OpTypes.SMALL;
  },

  _get2bitOpType: function(bits) {
    switch (bits & 0x3) {
    case 0: return bzork.vm.Instruction.OpTypes.LARGE;
    case 1: return bzork.vm.Instruction.OpTypes.SMALL;
    case 2: return bzork.vm.Instruction.OpTypes.VAR;
    case 3: return bzork.vm.Instruction.OpTypes.OMIT;
    }
  }

};
