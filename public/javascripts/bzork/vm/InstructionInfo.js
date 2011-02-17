bzork.vm.InstructionInfo = function(name, stores, branches, stringed, version) {
  if (!version)
    version = 1;

  this.name     = name;
  this.stores   = stores;
  this.branches = branches;
  this.stringed = stringed;
  this.version  = version;
};

bzork.vm.InstructionInfo.Opcodes = {
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

bzork.vm.InstructionInfo.DB = {};

// Load all of the opcodes in the standard into the DB
// Gah. Once I've got this functioning I'll probably just
// dump it as JSON and plop that into this file instead.
(function() {

  function addEntry(name, opcount, stores, branches, stringed, version) {
    var opcode = bzork.vm.InstructionInfo.Opcodes[name];
    var key  = opcount + ":" + opcode;
    var info = new bzork.vm.InstructionInfo(name, stores, branches, stringed, version);

    if (bzork.vm.InstructionInfo.DB[key])
      throw "Adding duplicate entry to instruction DB: " + key;

    bzork.vm.InstructionInfo.DB[key] = info;
  }

  function addBasic(name, opcount, version) {
    addEntry(name, opcount, false, false, false, version);
  }

  function addStore(name, opcount, version) {
    addEntry(name, opcount, true, false, false, version);
  }

  function addBranch(name, opcount, version) {
    addEntry(name, opcount, false, true, false, version);
  }

  function addBranchAndStore(name, opcount, version) {
    addEntry(name, opcount, true, true, false, version);
  }

  function addStringed(name, opcount, version) {
    addEntry(name, opcount, false, false, true, version);
  }

  var OP0 = bzork.vm.Instruction.OpCounts.OP0,
      OP1 = bzork.vm.Instruction.OpCounts.OP1,
      OP2 = bzork.vm.Instruction.OpCounts.OP2,
      VAROP = bzork.vm.Instruction.OpCounts.VAR;

  // 0OP
  addBasic('rtrue', OP0);
  addBasic('rfalse', OP0);
  addStringed('print', OP0);
  addStringed('print_ret', OP0);
  addBasic('nop', OP0);
  addBranch('save', OP0);
  addBranch('restore', OP0);
  addBasic('restart', OP0);
  addBasic('ret_popped', OP0);
  addBasic('pop', OP0);
  addBasic('quit', OP0);
  addBasic('new_line', OP0);
  addBasic('show_status', OP0);
  addBranch('verify', OP0);
  addBranch('pirate', OP0);

  // 1OP
  addBranch('jz', OP1);
  addBranchAndStore('get_sibling', OP1);
  addBranchAndStore('get_child', OP1);
  addStore('get_parent', OP1);
  addStore('get_prop_len', OP1);
  addBasic('inc', OP1);
  addBasic('dec', OP1);
  addBasic('print_addr', OP1);
  addStore('call_1s', OP1, 4);
  addBasic('remove_obj', OP1);
  addBasic('print_obj', OP1);
  addBasic('ret', OP1);
  addBasic('jump', OP1);
  addBasic('print_paddr', OP1);
  addStore('load', OP1);
  addStore('not', OP1);

  // 2OP
  addBranch("je", OP2);
  addBranch("jl", OP2);
  addBranch("jg", OP2);
  addBranch("dec_chk", OP2);
  addBranch("inc_chk", OP2);
  addBranch("jin", OP2);
  addBranch("test", OP2);
  addStore("or", OP2);
  addStore("and", OP2);
  addBranch("test_attr", OP2);
  addBasic("set_attr", OP2);
  addBasic("clear_attr", OP2);
  addBasic("store", OP2);
  addBasic("insert_obj", OP2);
  addStore("loadw", OP2);
  addStore("loadb", OP2);
  addStore("get_prop", OP2);
  addStore("get_prop_addr", OP2);
  addStore("get_next_prop", OP2);
  addStore("add", OP2);
  addStore("sub", OP2);
  addStore("mul", OP2);
  addStore("div", OP2);
  addStore("mod", OP2);
  addStore("call_2s", OP2, 4);
  addBasic("call_2n", OP2, 5);
  addBasic("set_colour", OP2, 5);
  addBasic("throw", OP2, 5);

  // VAROP
  addStore("call", VAROP);
  addBasic("storew", VAROP);
  addBasic("storeb", VAROP);
  addBasic("put_prop", VAROP);
  addBasic("sread", VAROP);
  addBasic("print_char", VAROP);
  addBasic("print_num", VAROP);
  addStore("random", VAROP);
  addBasic("push", VAROP);
  addBasic("pull", VAROP);
  addBasic("split_window", VAROP, 3)
  addBasic("set_window", VAROP, 3);
  addStore("call_vs2", VAROP, 4);
  addBasic("erase_window", VAROP, 4);
  addBasic("erase_line", VAROP, 4);
  addBasic("set_cursor", VAROP, 4);
  addBasic("get_cursor", VAROP, 4);
  addBasic("set_text_style", VAROP, 4);
  addBasic("buffer_mode", VAROP, 4);
  addBasic("output_stream", VAROP, 3);
  addBasic("input_stream", VAROP, 3);
  addBasic("sound_effect", VAROP, 3);
  addStore("read_char", VAROP, 4);
  addBranchAndStore("scan_table", VAROP, 4);
  addStore("not", VAROP, 5);
  addBasic("call_vn", VAROP, 5);
  addBasic("call_vn2", VAROP, 5);
  addBasic("tokenise", VAROP, 5);
  addBasic("encode_text", VAROP, 5);
  addBasic("copy_table", VAROP, 5);
  addBasic("print_table", VAROP, 5);
  addBranch("check_arg_count", VAROP, 5);

})();
