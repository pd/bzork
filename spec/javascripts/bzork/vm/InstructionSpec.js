describe("bzork.vm.Instruction", function() {
  function stubMachine(words, version) {
    var machine = new StubMachine(version || 3, words);
    return machine;
  }

  // These may be padded with an extra byte where necessary
  TestInstructions = {
    'call':     [0xe003, 0x2a39, 0x8010, 0xffff, 0x00e1], // var, 3 large
    'rfalse':   [0xb100], // short, 0OP
    'ret':      [0xab05], // short, 1OP
    'je':       [0x4188, 0x2b40], // long, 2OP var/small, branch on false
    'jet':      [0x4188, 0x2bc0], // long, 2OP var/small, branch on true
    'je2':      [0x4188, 0x2b30, 0xff00], // hand-crafted for 2-byte branch offset, prolly invalid
    'inc_chk':  [0x0502, 0x00d4], // long, 2OP small/small
    'print':    [0xb211, 0xaa46, 0x3416, 0x459c, 0xa500], // short, 0OP + string
    'mul':      [0xd62f, 0x03e8, 0x0200], // var, 2OP large/var
    'save':     {v:5, w:[0xbe00, 0xffff]}, // ext, 3OP
    'call_vs2': {v:5, w:[0xecaa, 0xab01, 0x0304, 0x0506, 0x0708, 0x0900]} // var, 8OP
  };

  function buildInstruction(name) {
    var words = TestInstructions[name];
    if (typeof words === "undefined")
      throw "Unknown test instruction name " + name;

    if (words['v'])
      return new bzork.vm.Instruction(stubMachine(words.w, words.v), 0);
    return new bzork.vm.Instruction(stubMachine(words), 0);
  }

  it("should know its name", function() {
    expect(buildInstruction('call').getName()).toEqual('call');
    expect(buildInstruction('rfalse').getName()).toEqual('rfalse');
    expect(buildInstruction('je2').getName()).toEqual('je');
    expect(buildInstruction('inc_chk').getName()).toEqual('inc_chk');
  });

  it("should know its length", function() {
    expect(buildInstruction('call').getLength()).toEqual(9);
    expect(buildInstruction('rfalse').getLength()).toEqual(1);
    expect(buildInstruction('ret').getLength()).toEqual(2);
    expect(buildInstruction('je').getLength()).toEqual(4);
    expect(buildInstruction('je2').getLength()).toEqual(5);
    expect(buildInstruction('inc_chk').getLength()).toEqual(4);
    expect(buildInstruction('print').getLength()).toEqual(9);
    expect(buildInstruction('mul').getLength()).toEqual(6);
  });

  describe("getForm", function() {
    it("recognizes short form instructions", function() {
      var instr = buildInstruction('rfalse');
      expect(instr.getForm()).toEqual(bzork.vm.Instruction.Forms.SHORT);
    });

    it("recognizes variable form instructions", function() {
      var instr = buildInstruction('call');
      expect(instr.getForm()).toEqual(bzork.vm.Instruction.Forms.VAR);
    });

    it("recognizes long form instructions", function() {
      var instr = buildInstruction('je');
      expect(instr.getForm()).toEqual(bzork.vm.Instruction.Forms.LONG);
    });

    it("recognizes extended form instructions", function() {
      var instr = buildInstruction('save');
      expect(instr.getForm()).toEqual(bzork.vm.Instruction.Forms.EXT);
    });
  });

  describe("getOpcode", function() {
    it("extracts the opcode of short form instructions", function() {
      var rfalse = buildInstruction('rfalse'),
          ret = buildInstruction('ret');
      expect(rfalse.getOpcode()).toEqual(0x1);
      expect(ret.getOpcode()).toEqual(0xb);
    });

    it("extracts the opcode of long form instructions", function() {
      var je = buildInstruction('je');
      expect(je.getOpcode()).toEqual(1);
    });

    it("extracts the opcode of var form instructions", function() {
      var call = buildInstruction('call');
      expect(call.getOpcode()).toEqual(0);
    });

    it("recognizes the opcode of extended form instructions", function() {
      var save = buildInstruction('save');
      expect(save.getOpcode()).toEqual(0);
    });
  });

  describe("getOperandCount", function() {
    it("knows long forms are always 2OP", function() {
      var instr = buildInstruction('je');
      expect(instr.getOperandCount()).toEqual(bzork.vm.Instruction.OpCounts.OP2);
    });

    it("recognizes 0OP short forms", function() {
      var instr = buildInstruction('rfalse');
      expect(instr.getOperandCount()).toEqual(bzork.vm.Instruction.OpCounts.OP0);
    });

    it("recognizes 1OP short forms", function() {
      var instr = buildInstruction('ret');
      expect(instr.getOperandCount()).toEqual(bzork.vm.Instruction.OpCounts.OP1);
    });

    it("recognizes VAROP variable forms", function() {
      var instr = buildInstruction('call');
      expect(instr.getOperandCount()).toEqual(bzork.vm.Instruction.OpCounts.VAR);
    });

    it("recognizes 2OP variable forms", function() {
      var instr = buildInstruction('mul');
      expect(instr.getOperandCount()).toEqual(bzork.vm.Instruction.OpCounts.OP2);
    });

    it("recognizes 8OP variable forms", function() {
      var instr = buildInstruction('call_vs2');
      window.instr = instr
      expect(instr.getOperandCount()).toEqual(8);
    });

    it("knows extended forms are always VAROP", function() {
      var instr = buildInstruction('save');
      expect(instr.getOperandCount()).toEqual(bzork.vm.Instruction.OpCounts.VAR);
    });
  });

  describe("getOperandTypes", function() {
    it("knows 0OP forms have no operands", function() {
      var instr = buildInstruction('rfalse');
      expect(instr.getOperandTypes()).toEqual([]);
    });

    it("recognizes short forms with a variable operand", function() {
      var instr = buildInstruction('ret');
      expect(instr.getOperandTypes()).toEqual([bzork.vm.Instruction.OpTypes.VAR]);
    });

    it("recognizes long forms with a variable then a small constant operand", function() {
      var instr = buildInstruction('je');
      expect(instr.getOperandTypes()).toEqual([bzork.vm.Instruction.OpTypes.VAR,
                                               bzork.vm.Instruction.OpTypes.SMALL]);
    });

    xit("recognizes long forms with a small constant then variable operand", function() {
      // TODO find one
    });

    it("recognizes long forms with 2 small constant operands", function() {
      var instr = buildInstruction('inc_chk');
      expect(instr.getOperandTypes()).toEqual([bzork.vm.Instruction.OpTypes.SMALL,
                                               bzork.vm.Instruction.OpTypes.SMALL]);
    });

    xit("recognizes long forms with 2 variable operands", function() {
      // TODO find one
    });

    it("recognizes var forms with 3 large operands", function() {
      var instr = buildInstruction('call');
      expect(instr.getOperandTypes()).toEqual([bzork.vm.Instruction.OpTypes.LARGE,
                                               bzork.vm.Instruction.OpTypes.LARGE,
                                               bzork.vm.Instruction.OpTypes.LARGE,
                                               bzork.vm.Instruction.OpTypes.OMIT]);
    });

    it("recognizes 2OP var forms with long/var operands", function() {
      var instr = buildInstruction('mul');
      expect(instr.getOperandTypes()).toEqual([bzork.vm.Instruction.OpTypes.LARGE,
                                               bzork.vm.Instruction.OpTypes.VAR]);
    });

    it("recognizes 8OP var forms", function() {
      var instr = buildInstruction('call_vs2'),
          optypes = instr.getOperandTypes();

      for (var i = 0; i < 7; i++)
        expect(instr.getOperandTypes()[i]).toEqual(bzork.vm.Instruction.OpTypes.VAR);
      expect(instr.getOperandTypes()[7]).toEqual(bzork.vm.Instruction.OpTypes.OMIT);
    });

    it("recognizes ext forms", function() {
      var instr = buildInstruction('save');
      for (var i = 0; i < 4; i++)
        expect(instr.getOperandTypes()[i]).toEqual(bzork.vm.Instruction.OpTypes.OMIT);
    });
  });

  describe("getOperands", function() {
    it("knows 0OP forms have no operands", function() {
      var instr = buildInstruction('rfalse');
      expect(instr.getOperands()).toEqual([]);
    });

    it("extracts the operands for 1OP short forms", function() {
      var instr = buildInstruction('ret');
      expect(instr.getOperands()).toEqual([5]);
    });

    it("extracts the operands for var/small long forms", function() {
      var instr = buildInstruction('je');
      expect(instr.getOperands()).toEqual([0x88, 0x2b]);
    });

    it("extracts the operands for small/small long forms", function() {
      var instr = buildInstruction('inc_chk');
      expect(instr.getOperands()).toEqual([2, 0]);
    });

    it("extracts the operands for 2OP var forms", function() {
      var instr = buildInstruction('mul');
      expect(instr.getOperands()).toEqual([0x03e8, 2]);
    });

    it("extracts the operands for VAROP var forms", function() {
      var instr = buildInstruction('call');
      expect(instr.getOperands()).toEqual([0x2a39, 0x8010, 0xffff]);
    });

    it("extracts the operands for 8OP var forms", function() {
      var instr = buildInstruction('call_vs2');
      expect(instr.getOperands()).toEqual([0x01, 0x03, 0x04, 0x05, 0x06, 0x07, 0x08]);
    });

    it("extracts the operands for ext forms", function() {
      var instr = buildInstruction('save');
      expect(instr.getOperands()).toEqual([]);
    });
  });

  describe("stores", function() {
    it("returns true if the instruction stores", function() {
      var instr = buildInstruction('call');
      expect(instr.stores()).toEqual(true);

      instr = buildInstruction('call_vs2');
      expect(instr.stores()).toEqual(true);
    });

    it("returns false if the instruction does not store", function() {
      var instr = buildInstruction('rfalse');
      expect(instr.stores()).toEqual(false);
    });
  });

  describe("getStoreVariable", function() {
    it("throws if the instruction does not store", function() {
      var instr = buildInstruction('rfalse');
      expect(function() {
        instr.getStoreVariable()
      }).toThrow("Instruction does not store");
    });

    it("returns the store variable number", function() {
      var instr = buildInstruction('call');
      expect(instr.getStoreVariable()).toEqual(0);
    });
  });

  describe("branches", function() {
    it("returns true if the instruction branches", function() {
      var instr = buildInstruction('je');
      expect(instr.branches()).toEqual(true);
    });

    it("returns false if the instruction does not branch", function() {
      var instr = buildInstruction('rfalse');
      expect(instr.branches()).toEqual(false);
    });
  });

  describe("branchesOn", function() {
    it("throws if the instruction does not branch", function() {
      var instr = buildInstruction('rfalse');
      expect(function() {
        instr.branchesOn()
      }).toThrow("Instruction does not branch");
    });

    it("returns true if the instruction branches on true", function() {
      var instr = buildInstruction('jet');
      expect(instr.branchesOn()).toEqual(true);
    });

    it("returns false if the instruction branches on false", function() {
      var instr = buildInstruction('je');
      expect(instr.branchesOn()).toEqual(false);
    });
  });

  describe("getBranchOffset", function() {
    it("throws if the instruction does not branch", function() {
      var instr = buildInstruction('rfalse');
      expect(function() {
        instr.getBranchOffset()
      }).toThrow("Instruction does not branch");
    });

    it("returns 1-byte branch offset values", function() {
      var instr = buildInstruction('je');
      expect(instr.getBranchOffset()).toEqual(0);
    });

    it("returns 2-byte branch offset values", function() {
      var instr = buildInstruction('je2');
      expect(instr.getBranchOffset()).toEqual(-3841); // hand-crafted, ignore funky value
    });
  });

  describe("hasDanglingString", function() {
    it("recognizes instructions which have a ZString following them", function() {
      var instr = buildInstruction('print');
      expect(instr.hasDanglingString()).toEqual(true);
    });

    it("returns false for other instructions", function() {
      var instr = buildInstruction('je');
      expect(instr.hasDanglingString()).toEqual(false);
    });
  });

  describe("getDanglingString", function() {
    it("throws if the instruction does not have a dangling string", function() {
      var instr = buildInstruction('je');
      expect(function() {
        instr.getDanglingString()
      }).toThrow("Instruction has no embedded string");
    });

    it("returns the decoded dangling string", function() {
      var instr = buildInstruction('print');
      expect(instr.getDanglingString()).toEqual("Hello.\n");
    });
  });

  describe("getSignedOperand", function() {
    it("returns the signed value of operand n", function() {
      var instr = buildInstruction('je');
      expect(instr.getSignedOperand(1)).toEqual(0x2b);
    });

    it("returns the signed value of the variable named by operand n for VAR types", function() {
      var instr = buildInstruction('je'),
          machine = instr._machine;

      spyOn(machine, 'getVariable').andReturn(0xffff);
      expect(instr.getSignedOperand(0)).toEqual(-1);
      expect(machine.getVariable).toHaveBeenCalledWith(0x88);
    });
  });

  // Mock-less specs

  describe("next", function() {
    beforeEach(function() {
      this.machine = new bzork.Machine(bzork.spec.storyData['zork1']);
      this.instr   = new bzork.vm.Instruction(this.machine, this.machine.getStartPC());
    });

    it("should increase the machine's PC by this instruction's length", function() {
      var origPC = this.machine.cpu.getPC();
      this.instr.next();
      expect(this.machine.cpu.getPC()).toEqual(origPC + this.instr.getLength());
    });
  });
});
