describe("bzork.vm.Instruction", function() {
  function stubMachine(words) {
    var machine = new StubMachine(3, words);
    return machine;
  }

  TestInstructions = {
    'call':    [0xe003, 0x2a39, 0x8010, 0xffff, 0x00e1], // zork 1 PC
    'rfalse':  [0xb100],
    'ret':     [0xab05],
    'je':      [0x4188, 0x2b40]
  };

  function buildInstruction(name) {
    var words = TestInstructions[name];
    if (typeof words === "undefined")
      throw "Unknown test instruction name " + name;
    return new bzork.vm.Instruction(stubMachine(words), 0);
  }

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

    xit("recognizes extended form instructions", function() {
      // TODO need to look at ztuu.z5
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

    xit("recognizes the opcode of extended form instructions", function() {
      // TODO .z5
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

    xit("recognizes 2OP variable forms", function() {
      // TODO find one
      var instr = buildInstruction('no idea what one is yet');
      expect(instr.getOperandCount()).toEqual(bzork.vm.Instruction.OpCounts.OP2);
    });

    xit("knows extended forms are always VAROP", function() {
      // TODO ztuu.z5
    });
  });

  describe("getOperandTypes", function() {
    it("knows 0OP forms have no operands", function() {
      var instr = buildInstruction('rfalse');
      expect(instr.getOperandTypes()).toEqual([]);
    });

    it("recognizes long forms with a variable then a small constant operand", function() {
      var instr = buildInstruction('je');
      expect(instr.getOperandTypes()).toEqual([bzork.vm.Instruction.OpTypes.VAR,
                                               bzork.vm.Instruction.OpTypes.SMALL]);
    });

    xit("recognizes long forms with a small constant then variable operand", function() {
      // TODO find one
    });

    xit("recognizes long forms with 2 small constant operands", function() {
      // TODO find one
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

    xit("recognizes other var forms ...", function() {
      // TODO find some
    });
  });

  describe("getOperands", function() {
    it("knows 0OP forms have no operands", function() {
      var instr = buildInstruction('rfalse');
      expect(instr.getOperands()).toEqual([]);
    });
  });
});
