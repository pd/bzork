describe("bzork.vm.Cpu", function() {
  beforeEach(function() {
    this.machine = new bzork.Machine(bzork.spec.storyData['zork1']);
    this.cpu = new bzork.vm.Cpu(this.machine);
  });

  it("should start with an empty stack", function() {
    expect(this.cpu.getSP()).toEqual(0);
  });

  it("should start with an empty routine stack", function() {
    expect(this.cpu.routineStack.isEmpty()).toEqual(true);
  });

  it("should initialize its program counter to the story's startPC", function() {
    expect(this.cpu.getPC()).toEqual(this.machine.getStartPC());
  });

  it("should be able to set its PC", function() {
    this.cpu.setPC(0x0102);
    expect(this.cpu.getPC()).toEqual(0x0102);
  });

  describe("callRoutine", function() {
    Routines = {
      // 2 bytes in, 0 locals, 1 instruction
      'rfalse': [0x0000, 0x00b1],
      // 4 bytes in, 2 locals (0x0a, 0xffff), 1 instruction
      'ret': [0x0102, 0x0304, 0x0200, 0x0aff, 0xffab, 0x0500]
    };

    function buildCpu(name) {
      var words = Routines[name];
      return new bzork.vm.Cpu(new StubMachine(3, words));
    }

    it("should grow the routine stack", function() {
      var cpu = buildCpu('rfalse');
      cpu.callRoutine(1, 0, []);
      expect(cpu.routineStack.size()).toEqual(1);
    });

    it("should set the PC to the routine's first instruction", function() {
      var cpu = buildCpu('rfalse');
      cpu.callRoutine(1, 0, []);
      expect(cpu.getPC()).toEqual(0x3);

      cpu = buildCpu('ret');
      cpu.callRoutine(2, 0, []);
      expect(cpu.getPC()).toEqual(0x9);
    });

    it("should set the routine's originalSP to the current SP", function() {
      var cpu = buildCpu('rfalse');
      cpu.stack.push(0x1); // just for fun
      var routine = cpu.callRoutine(1, 0, []);
      expect(routine.getOriginalSP()).toEqual(1);
    });

    it("should set the return addr to the given addr", function() {
      var cpu = buildCpu('rfalse');
      var routine = cpu.callRoutine(1, 0xff93, []);
      expect(routine.getReturnAddr()).toEqual(0xff93);
    });

    it("should set the routine's locals to their default values", function() {
      var cpu = buildCpu('ret');
      var routine = cpu.callRoutine(2, 0, []);
      expect(routine.getLocal(1)).toEqual(0x000a);
      expect(routine.getLocal(2)).toEqual(0xffff);
    });

    it("should then set the routine's locals to the arguments given", function() {
      var cpu = buildCpu('ret');
      var routine = cpu.callRoutine(2, 0, [0xcafe, 0xbabe]);
      expect(routine.getLocal(1)).toEqual(0xcafe);
      expect(routine.getLocal(2)).toEqual(0xbabe);
    });
  });
});
