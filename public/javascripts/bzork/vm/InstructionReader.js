bzork.vm.InstructionReader = function(machine) {
  this._machine = machine;
};

bzork.vm.InstructionReader.prototype = {
  readInstruction: function(addr) {
    return this.readInstructionFrom(this._machine, addr);
  },

  readInstructionFrom: function(view, addr) {
    var opbyte = view.getUint8(addr),
        options = {},
        curaddr;

    options.form = this.findForm(opbyte);
    options.opcode = this.findOpcode(options.form, opbyte, view, addr);
    options.opcount = this.findOperandCount(options.form, opbyte, options.opcode);
    options.optypes = this.findOperandTypes(options.form, opbyte, options.opcount, view, addr);

    curaddr = this.findOperandsAddr(addr, options.form, options.opcount);
    options.operands = [];
    for (var i = 0; i < options.optypes.length; i++) {
      var operand = this.readOperand(view, curaddr, options.optypes[i]);
      options.operands.push(operand);
      curaddr += operand.getSize();
    }

    var instructionDef = this.getInstructionDef(options.opcount, options.opcode);
    if (typeof instructionDef === "undefined") {
      var msg = "Undefined instruction: " + options.opcount + ":" + options.opcode;
      msg += " @ 0x" + addr.toString(16);
      throw msg;
    }

    if (instructionDef.stores)
      options.storeVar = view.getUint8(curaddr++);

    if (instructionDef.branches) {
      var branch = view.getUint8(curaddr);

      options.branchOn = (branch & 0x80) === 0x80;
      if ((branch & 0x40) === 0x40) {
        options.branchOffset = bzork.Util.toInt14(branch & 0x3f);
        curaddr++;
      } else {
        options.branchOffset = bzork.Util.toInt14(view.getUint16(curaddr) & 0x3fff);
        curaddr += 2;
      }

      options.branchDataEndAddr = curaddr;
    }

    if (instructionDef.stringed) {
      options.string = this._machine.getZsciiString(curaddr, view);
      curaddr = this._machine.findZsciiEnd(curaddr, view);
    }

    var length = curaddr - addr;
    return new bzork.vm.Instruction(this._machine, addr, instructionDef, length, options);
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
      return opbyte & 0x1f;
    case bzork.vm.Instruction.Forms.EXT:
      return view.getUint8(addr + 1);
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
      case bzork.vm.Instruction.OpCounts.VAR:
        return this._bitfieldOperandTypes(bitfield, 4);
      case bzork.vm.Instruction.OpCounts.OP8:
        return this._bitfieldOperandTypes(bitfield, 4).
          concat(this._bitfieldOperandTypes(view.getUint8(addr + 2), 4));
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
    var key;

    if (opcount === bzork.vm.Instruction.OpCounts.OP8)
      opcount = bzork.vm.Instruction.OpCounts.VAR;

    key = opcount + ":" + opcode + ":" + this._machine.getZcodeVersion();
    return bzork.vm.InstructionDefs[key];
  },

  readOperand: function(view, addr, type) {
    var value;

    if (type === bzork.vm.Instruction.OpTypes.OMIT)
      value = null;
    else if (type === bzork.vm.Instruction.OpTypes.LARGE)
      value = view.getUint16(addr);
    else
      value = view.getUint8(addr);

    return new bzork.vm.Operand(this._machine, type, value);
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
