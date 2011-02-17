bzork.vm.Instruction = function(machine, addr) {
  this._machine = machine;
  this._addr = addr;
  this._stealImplMethods();
};

bzork.vm.Instruction.prototype = {
  run: function() {
    var name = this.getName(),
        method = bzork.vm.InstructionImpl.Methods[name];

    if (typeof method === "undefined")
      throw "Unimplemented instruction: " + name;

    method.apply(this);
  },

  getName: function() {
    return this._getInstructionInfo().name;
  },

  getLength: function() {
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
  },

  getOpcodeByte: function() {
    return this._machine.getUint8(this._addr);
  },

  getForm: function() {
    var opbyte = this.getOpcodeByte();

    if (this._machine.getZcodeVersion() >= 5 && opbyte == 0xbe)
      return bzork.vm.Instruction.Forms.EXT;
    if ((opbyte & 0xc0) === 0xc0)
      return bzork.vm.Instruction.Forms.VAR;
    if ((opbyte & 0x80) === 0x80)
      return bzork.vm.Instruction.Forms.SHORT;
    return bzork.vm.Instruction.Forms.LONG;
  },

  getOperands: function() {
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
  },

  stores: function() {
    return this._getInstructionInfo().stores;
  },

  getStoreVariable: function() {
    if (!this.stores())
      throw "Instruction does not store";
    return this._machine.getUint8(this._getStoreVariableAddr());
  },

  branches: function() {
    return this._getInstructionInfo().branches;
  },

  branchesOn: function() {
    if (!this.branches())
      throw "Instruction does not branch";

    var byte = this._machine.getUint8(this._getBranchOffsetAddr());
    return (byte & 0x80) === 0x80;
  },

  getBranchOffset: function() {
    if (!this.branches())
      throw "Instruction does not branch";

    if (this._getBranchOffsetSize() === 1)
      return this._machine.getUint8(this._getBranchOffsetAddr()) & 0x3f;

    var val = this._machine.getUint16(this._getBranchOffsetAddr()) & 0x3fff;
    return bzork.Math.toSigned14bit(val);
  },

  hasDanglingString: function() {
    return this._getInstructionInfo().stringed;
  },

  getDanglingString: function() {
    if (!this.hasDanglingString())
      throw "Instruction has no embedded string";
    return this._machine.getZsciiString(this._getStringAddr());
  },

  // Ganks a number of methods from bzork.vm.InstructionImpl
  // based on the form of this instruction
  _stealImplMethods: function() {
    var methods = bzork.vm.InstructionImpl.Forms[this.getForm()];
    for (method in methods)
      this[method] = methods[method];
  },

  _getInstructionInfo: function() {
    return bzork.vm.InstructionDB[this._uniqueKey()];
  },

  _uniqueKey: function() {
    var operandCount = this._is8OP && this._is8OP() ? bzork.vm.Instruction.OpCounts.VAR :
      this.getOperandCount();
    return operandCount + ":" + this.getOpcode();
  },

  _getOperand: function(offset, type) {
    if (type === bzork.vm.Instruction.OpTypes.OMIT)
      return undefined;
    if (type === bzork.vm.Instruction.OpTypes.LARGE)
      return this._machine.getUint16(offset);
    else
      return this._machine.getUint8(offset);
  },

  _operandSize: function(type) {
    if (type === bzork.vm.Instruction.OpTypes.LARGE)
      return 2;
    else if (type === bzork.vm.Instruction.OpTypes.OMIT)
      return 0;
    else
      return 1;
  },

  _getAfterOperandsAddr: function() {
    var addr = this._getOperandsAddr(),
        optypes = this.getOperandTypes();
    for (var i = 0; i < optypes.length; i++)
      addr += this._operandSize(optypes[i]);
    return addr;
  },

  _getStoreVariableAddr: function() {
    return this._getAfterOperandsAddr();
  },

  _getBranchOffsetAddr: function() {
    if (this.stores())
      return this._getStoreVariableAddr() + 1;
    else
      return this._getStoreVariableAddr();
  },

  _getBranchOffsetSize: function() {
    var byte = this._machine.getUint8(this._getBranchOffsetAddr());
    if ((byte & 0x40) === 0x40)
      return 1;
    else
      return 2;
  },

  _getStringAddr: function() {
    // neither print nor print_ret store or branch, so this is always safe
    return this._getAfterOperandsAddr();
  }
};

///// Constants

bzork.vm.Instruction.Forms = {
  LONG:  'LONG',
  SHORT: 'SHORT',
  EXT:   'EXT',
  VAR:   'VAR'
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

bzork.vm.Instruction.Opcodes = {
  // 0OP
  rtrue: 0,
  rfalse: 1,
  print: 2,
  print_ret: 3,
  nop: 4,
  save: 5,
  restore: 6,
  restart: 7,
  ret_popped: 8,
  pop: 9,
  quit: 10,
  new_line: 11,
  show_status: 12,
  verify: 13,
  pirate: 15,

  // 1OP
  jz: 0,
  get_sibling: 1,
  get_child: 2,
  get_parent: 3,
  get_prop_len: 4,
  inc: 5,
  dec: 6,
  print_addr: 7,
  call_1s: 8,
  remove_obj: 9,
  print_obj: 10,
  ret: 11,
  jump: 12,
  print_paddr: 13,
  load: 14,
  not: 15,

  // 2OP
  je: 1,
  jl: 2,
  jg: 3,
  dec_chk: 4,
  inc_chk: 5,
  jin: 6,
  test: 7,
  or: 8,
  and: 9,
  test_attr: 10,
  set_attr: 11,
  clear_attr: 12,
  store: 13,
  insert_obj: 14,
  loadw: 15,
  loadb: 16,
  get_prop: 17,
  get_prop_addr: 18,
  get_next_prop: 19,
  add: 20,
  sub: 21,
  mul: 22,
  div: 23,
  mod: 24,
  call_2s: 25,
  call_2n: 26,
  set_colour: 27,
  'throw': 28,

  // VAROP
  call: 0,
  storew: 1,
  storeb: 2,
  put_prop: 3,
  sread: 4,
  print_char: 5,
  print_num: 6,
  random: 7,
  push: 8,
  pull: 9,
  split_window: 10,
  set_window: 11,
  call_vs2: 12,
  erase_window: 13,
  erase_line: 14,
  set_cursor: 15,
  get_cursor: 16,
  set_text_style: 17,
  buffer_mode: 18,
  output_stream: 19,
  input_stream: 20,
  sound_effect: 21,
  read_char: 22,
  scan_table: 23,
  not: 24,
  call_vn: 25,
  call_vn2: 26,
  tokenise: 27,
  encode_text: 28,
  copy_table: 29,
  print_table: 30,
  check_arg_count: 31
};
