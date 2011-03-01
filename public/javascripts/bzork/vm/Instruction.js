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
    'storeVar', 'branchOn', 'branchOffset', 'branchDataEndAddr', 'string'
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

  branch: function() {
    if (this.branchOffset === 0)
      this.returnFromRoutine(0);
    else if (this.branchOffset === 1)
      this.returnFromRoutine(1);
    else
      this._machine.setPC(this.getBranchDestination());
  },

  branchOrNext: function(cmp) {
    if (this.branchOn === cmp)
      this.branch();
    else
      this.next();
  },

  returnFromRoutine: function(value) {
    this._machine.returnWith(value);
  },

  incrementVariable: function(i, amount) {
    amount = amount || 1;
    var value = bzork.Util.toInt16(this._machine.getVariable(i));
    this._machine.setVariable(i, bzork.Util.toUint16(value + amount));
    return value + amount;
  },

  decrementVariable: function(i) {
    return this.incrementVariable(i, -1);
  },

  getOperandValue: function(i) {
    return this.operands[i].getValue();
  },

  getSignedOperandValue: function(i) {
    return this.operands[i].getSignedValue();
  },

  getObjectFromOperand: function(i) {
    return this._machine.getObject( this.getOperandValue(i) );
  },

  getLength: function() {
    return this.length;
  },

  getName: function() {
    return this.instructionDef.name;
  },

  getForm: function() {
    return this.form;
  },

  getOpcode: function() {
    return this.opcode;
  },

  getOperandCount: function() {
    return this.opcount;
  },

  getOperands: function() {
    return this.operands;
  },

  getOperandTypes: function() {
    return _.map(this.operands, function(op) { return op.getType() });
  },

  nextInstructionAddr: function() {
    return this._addr + this.length;
  },

  stores: function() {
    return this.storeVar !== null;
  },

  getStoreVariable: function() {
    if (!this.stores())
      throw "Instruction does not store";
    return this.storeVar;
  },

  storeResult: function(value) {
    if (!this.stores())
      throw "Instruction should not be trying to store";
    this._machine.setVariable(this.getStoreVariable(), value);
  },

  branches: function() {
    return this.branchOn !== null;
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

  getBranchDestination: function() {
    if (this.branchOn === null)
      throw "Instruction does not branch";
    return this.branchDataEndAddr + this.branchOffset - 2;
  },

  hasString: function() {
    return this.string !== null;
  },

  getString: function() {
    if (this.string === null)
      throw "Instruction has no embedded string";
    return this.string;
  },

  toString: function() {
    var s = this.getName(),
        ops = _.map(this.operands, function(op) { return op.toString() });
    s += ' ' + _.compact(ops).join(' ');

    if (this.stores())
      s += ' -> ' + bzork.Util.variableName(this.getStoreVariable());

    if (this.branches()) {
      var offset = this.getBranchOffset(),
          branchTo;
      if (offset === 0)
        branchTo = 'rfalse';
      else if (offset === 1)
        branchTo = 'rtrue';
      else
        branchTo = '0x' + this.getBranchDestination().toString(16);
      s += " => " + branchTo + " (on " + this.branchesOn() + ")";
    }

    if (this.hasString())
      s += ' "' + this.getString() + '"';

    return s;
  }
};

///// Constants

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
  VAR: 4,
  OP8: 8
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
  'catch': 9,
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
  call_1n: 15,

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
  call_vs: 0,
  storew: 1,
  storeb: 2,
  put_prop: 3,
  sread: 4,
  aread: 4,
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

