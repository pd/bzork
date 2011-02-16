describe("bzork.vm.Instruction", function() {
  function stubMachine(words) {
    var machine = new StubMachine(3, words);
    return machine;
  }

  // Returns a stub machine with the Zork 1 main routine in memory
  function zork1PCMachine() {
    return stubMachine([0xe003, 0x2a39, 0x8010, 0xffff, 0x00e1]);
  }

  it("recognizes short form instructions", function() {
    var machine = stubMachine([0xb100]);
    var instr   = new bzork.vm.Instruction(machine, 0);

    expect(instr.getForm()).toEqual(bzork.vm.Instruction.Forms.SHORT);
  });

  it("recognizes variable form instructions", function() {
    var machine = zork1PCMachine();
    var instr   = new bzork.vm.Instruction(machine, 0);

    expect(instr.getForm()).toEqual(bzork.vm.Instruction.Forms.VAR);
  });
});
