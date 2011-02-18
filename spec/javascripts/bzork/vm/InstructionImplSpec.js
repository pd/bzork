describe("Z-Machine instructions", function() {
  describe("add", function() {
    beforeEach(function() {
      this.machine = new bzork.Machine(bzork.spec.storyData['zork1']);

      // zork1.z3 0x5479
      this.machine.call(0x2a43, this.machine.getPC(), 3, []);
    });

    it("should store the result of adding the two operands", function() {
      var instr = new bzork.vm.Instruction(this.machine, 0x5491);
      instr.run();
      expect(this.machine.getVariable(3)).toEqual(this.machine.getGlobal(0x94) + 0xb4);
    });

    it("should increase the PC to the next instruction", function() {
      var instr = new bzork.vm.Instruction(this.machine, 0x5491);
      instr.run();
      expect(this.machine.getPC()).toEqual(0x5491 + instr.getLength());
    });
  });

  describe("call", function() {
    beforeEach(function() {
      this.machine = new bzork.Machine(bzork.spec.storyData['zork1']);
    });

    it("should call the routine at the packed address in operand 0", function() {
      var instr = new bzork.vm.Instruction(this.machine, this.machine.getStartPC());
      instr.run();

      expect(this.machine.getPC()).toEqual(0x5479);
    });
  });
});