// Huge map of instructions, keyed by opcount:opcode, that contains
// whether the instruction stores a variable, branches, etc.
bzork.vm.InstructionDefs = {};

(function() {

  function addEntry(name, opcount, stores, branches, stringed, minVersion, maxVersion) {
    var opcode = bzork.vm.Instruction.Opcodes[name];
    if (typeof opcode === "undefined")
      throw "Unknown opcode for instruction " + name;

    var key  = opcount + ":" + opcode;
    var info = {
      name: name, opcount: opcount, opcode: opcode,
      stores: stores, branches: branches, stringed: stringed,
      minVersion: (minVersion || 1), maxVersion: (maxVersion || 6)
    };

    for (var v = info.minVersion; v <= info.maxVersion; v++) {
      var vkey = key + ":" + v;
      if (bzork.vm.InstructionDefs[vkey])
        throw "Adding duplicate entry to instruction DB: " + vkey;
      bzork.vm.InstructionDefs[vkey] = info;
    }
  }

  function addBasic(name, opcount, minVersion, maxVersion) {
    addEntry(name, opcount, false, false, false, minVersion, maxVersion);
  }

  function addStore(name, opcount, minVersion, maxVersion) {
    addEntry(name, opcount, true, false, false, minVersion, maxVersion);
  }

  function addBranch(name, opcount, minVersion, maxVersion) {
    addEntry(name, opcount, false, true, false, minVersion, maxVersion);
  }

  function addBranchAndStore(name, opcount, minVersion, maxVersion) {
    addEntry(name, opcount, true, true, false, minVersion, maxVersion);
  }

  function addStringed(name, opcount, minVersion, maxVersion) {
    addEntry(name, opcount, false, false, true, minVersion, maxVersion);
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
  addBranch('save', OP0, 1, 3);
  addBasic('save', OP0, 4, 4);
  // addIllegal('save', OP0, 5); ??
  addBranch('restore', OP0, 1, 3);
  addBasic('restore', OP0, 4, 4);
  addBasic('restart', OP0);
  addBasic('ret_popped', OP0);
  addBasic('pop', OP0, 1, 4);
  addStore('catch', OP0, 5);
  addBasic('quit', OP0);
  addBasic('new_line', OP0);
  addBasic('show_status', OP0);
  // addIllegal('show_status', OP0, 4);
  addBranch('verify', OP0, 3);
  addBranch('pirate', OP0, 5);

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
  addStore('not', OP1, 1, 4);
  addBasic('call_1n', OP1, 5);

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
  addStore("call", VAROP, 1, 3);
  addStore("call_vs", VAROP, 4);
  addBasic("storew", VAROP);
  addBasic("storeb", VAROP);
  addBasic("put_prop", VAROP);
  addBasic("sread", VAROP, 1, 3);
  addBasic("sread", VAROP, 4, 4);
  addStore("aread", VAROP, 5);
  addBasic("print_char", VAROP);
  addBasic("print_num", VAROP);
  addStore("random", VAROP);
  addBasic("push", VAROP);
  addBasic("pull", VAROP, 1, 5);
  addStore("pull", VAROP, 6);
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
