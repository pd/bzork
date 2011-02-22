bzork.vm.Instruction = function(machine, addr, def, length, options) {
  this._machine = machine;
  this._addr = addr;
  this.instructionDef = def;
  this.length = length;

  _.defaults(this, {
    storeVar: null,
    branchOn: null,
    branchOffset: null,
    string: null
  });

  // Only merge in the options we actually want.
  _.extend(this, _.filterObj(options, [
    'form', 'opcode', 'opcount', 'operands',
    'storeVar', 'branchOn', 'branchOffset', 'string'
  ]));
};

bzork.vm.Instruction.prototype = {
  run: function() {
    var name = this.getName(),
        method = bzork.vm.InstructionImpl[name];

    if (typeof method === "undefined")
      throw "Unimplemented instruction: " + name;

    method.apply(this);
  },

  next: function() {
    this._machine.increasePC(this.length);
  },

  getLength: function() {
    return this.length;
  },

  getName: function() {
    return this.instructionDef.name;
  },

  nextInstructionAddr: function() {
    return this._addr + this.length;
  },

  getStoreVariable: function() {
    if (this.storeVar === null)
      throw "Instruction does not store";
    return this.storeVar;
  },

  branchesOn: function() {
    if (this.branchOn === null)
      throw "Instruction does not branch";
    return this.branchOn;
  },

  getBranchOffset: function() {
    if (this.branchOn === null)
      throw "Instruction does not branch";
    return this.branchOffset;
  },

  getString: function() {
    if (this.string === null)
      throw "Instruction has no embedded string";
    return this.string;
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
  VAR: 3,
  OP8: 4
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

