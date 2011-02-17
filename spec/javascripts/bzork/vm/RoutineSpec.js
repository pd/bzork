describe("bzork.vm.Routine", function() {
  describe("for Zork1", function() {
    beforeEach(function() {
      this.machine = new bzork.Machine(bzork.spec.storyData['zork1']);

      // numbers taken from txd
      this.r001 = new bzork.vm.Routine(this.machine, 0x4e38);
      this.r285 = new bzork.vm.Routine(this.machine, 0xa3e0);
    });

    it("should know the number of locals used", function() {
      expect(this.r001.getNumLocals()).toEqual(1);
      expect(this.r285.getNumLocals()).toEqual(3);
    });

    it("should know the default values of locals", function() {
      expect(this.r001.getLocalValues()).toEqual([0]);
      expect(this.r285.getLocalValues()).toEqual([0xc2, 0, 0]);
    });

    it("should know the address of its first instruction", function() {
      expect(this.r001.getFirstInstructionAddr()).toEqual(0x4e3b);
      expect(this.r285.getFirstInstructionAddr()).toEqual(0xa3e7);
    });
  });

  describe("for ZTUU", function() {
    beforeEach(function() {
      this.machine = new bzork.Machine(bzork.spec.storyData['ztuu']);
      this.r003 = new bzork.vm.Routine(this.machine, 0x48a8);
    });

    it("should know the number of locals used", function() {
      expect(this.r003.getNumLocals()).toEqual(4);
    });

    it("should always use 0 as the default value of locals", function() {
      expect(this.r003.getLocalValues()).toEqual([0, 0, 0, 0]);
    });

    it("should know the address of its first instruction", function() {
      expect(this.r003.getFirstInstructionAddr()).toEqual(0x48a9);
    });
  });
});
