bzork.vm.InstructionInfo = function(name, stores, branches, prints, version) {
  if (!version)
    version = 1;

  this.name     = name;
  this.stores   = stores;
  this.branches = branches;
  this.prints   = prints;
  this.version  = version;
};

bzork.vm.InstructionInfo.DB = {};

// Load all of the opcodes in the standard into the DB
// Gah. Once I've got this functioning I'll probably just
// dump it as JSON and plop that into this file instead.
(function() {

  function addEntry(name, opcount, opcode, stores, branches, prints, version) {
    var info = new bzork.vm.InstructionInfo(name, stores, branches, prints, version);
    var key  = opcount + ":" + opcode;
    if (bzork.vm.InstructionInfo.DB[key])
      throw "Adding duplicate entry to instruction DB: " + key;
    bzork.vm.InstructionInfo.DB[key] = info;
  }

  function addBasic(name, opcount, opcode, version) {
    addEntry(name, opcount, opcode, false, false, false, version);
  }

  function addStore(name, opcount, opcode, version) {
    addEntry(name, opcount, opcode, true, false, false, version);
  }

  function addBranch(name, opcount, opcode, version) {
    addEntry(name, opcount, opcode, false, true, false, version);
  }

  function addBranchAndStore(name, opcount, opcode, version) {
    addEntry(name, opcount, opcode, true, true, false, version);
  }

  function addPrint(name, opcount, opcode, version) {
    addEntry(name, opcount, opcode, false, false, true, version);
  }

  var OP0 = bzork.vm.Instruction.OpCounts.OP0,
      OP1 = bzork.vm.Instruction.OpCounts.OP1,
      OP2 = bzork.vm.Instruction.OpCounts.OP2,
      VAROP = bzork.vm.Instruction.OpCounts.VAR;

  // 0OP
  addBasic('rtrue', OP0, 0);
  addBasic('rfalse', OP0, 1);
  addPrint('print', OP0, 2);
  addPrint('print_ret', OP0, 3);
  addBasic('nop', OP0, 4);
  addBranch('save', OP0, 5);
  addBranch('restore', OP0, 6);
  addBasic('restart', OP0, 7);
  addBasic('ret_popped', OP0, 8);
  addBasic('pop', OP0, 9);
  addBasic('quit', OP0, 10);
  addBasic('new_line', OP0, 11);
  addBasic('show_status', OP0, 12);
  addBranch('verify', OP0, 13);
  addBranch('pirate', OP0, 15);

  // 1OP
  addBranch('jz', OP1, 0);
  addBranchAndStore('get_sibling', OP1, 1);
  addBranchAndStore('get_child', OP1, 2);
  addStore('get_parent', OP1, 3);
  addStore('get_prop_len', OP1, 4);
  addBasic('inc', OP1, 5);
  addBasic('dec', OP1, 6);
  addBasic('print_addr', OP1, 7);
  addStore('call_1s', OP1, 8, 4);
  addBasic('remove_obj', OP1, 9);
  addBasic('print_obj', OP1, 10);
  addBasic('ret', OP1, 11);
  addBasic('jump', OP1, 12);
  addBasic('print_paddr', OP1, 13);
  addStore('load', OP1, 14);
  addStore('not', OP1, 15);

  // 2OP
  addBranch("je", OP2, 1);
  addBranch("jl", OP2, 2);
  addBranch("jg", OP2, 3);
  addBranch("dec_chk", OP2, 4);
  addBranch("inc_chk", OP2, 5);
  addBranch("jin", OP2, 6);
  addBranch("test", OP2, 7);
  addStore("or", OP2, 8);
  addStore("and", OP2, 9);
  addBranch("test_attr", OP2, 10);
  addBasic("set_attr", OP2, 11);
  addBasic("clear_attr", OP2, 12);
  addBasic("store", OP2, 13);
  addBasic("insert_obj", OP2, 14);
  addStore("loadw", OP2, 15);
  addStore("loadb", OP2, 16);
  addStore("get_prop", OP2, 17);
  addStore("get_prop_addr", OP2, 18);
  addStore("get_next_prop", OP2, 19);
  addStore("add", OP2, 20);
  addStore("sub", OP2, 21);
  addStore("mul", OP2, 22);
  addStore("div", OP2, 23);
  addStore("mod", OP2, 24);
  addStore("call_2s", OP2, 25, 4);
  addBasic("call_2n", OP2, 26, 5);
  addBasic("set_colour", OP2, 27, 5);
  addBasic("throw", OP2, 28, 5);

  // VAROP
  addStore("call", VAROP, 0);
  addBasic("storew", VAROP, 1);
  addBasic("storeb", VAROP, 2);
  addBasic("put_prop", VAROP, 3);
  addBasic("sread", VAROP, 4);
  addBasic("print_char", VAROP, 5);
  addBasic("print_num", VAROP, 6);
  addStore("random", VAROP, 7);
  addBasic("push", VAROP, 8);
  addBasic("pull", VAROP, 9);
  addBasic("split_window", VAROP, 10, 3)
  addBasic("set_window", VAROP, 11, 3);
  addStore("call_vs2", VAROP, 12, 4);
  addBasic("erase_window", VAROP, 13, 4);
  addBasic("erase_line", VAROP, 14, 4);
  addBasic("set_cursor", VAROP, 15, 4);
  addBasic("get_cursor", VAROP, 16, 4);
  addBasic("set_text_style", VAROP, 17, 4);
  addBasic("buffer_mode", VAROP, 18, 4);
  addBasic("output_stream", VAROP, 19, 3);
  addBasic("input_stream", VAROP, 20, 3);
  addBasic("sound_effect", VAROP, 21, 3);
  addStore("read_char", VAROP, 22, 4);
  addBranchAndStore("scan_table", VAROP, 23, 4);
  addStore("not", VAROP, 24, 5);
  addBasic("call_vn", VAROP, 25, 5);
  addBasic("call_vn2", VAROP, 26, 5);
  addBasic("tokenise", VAROP, 27, 5);
  addBasic("encode_text", VAROP, 28, 5);
  addBasic("copy_table", VAROP, 29, 5);
  addBasic("print_table", VAROP, 30, 5);
  addBranch("check_arg_count", VAROP, 31, 5);

})();
