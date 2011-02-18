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

    it("should return with 0 if calling packed address 0", function() {
      var cpu = buildCpu('rfalse');
      spyOn(cpu, 'returnWith');
      cpu.callRoutine(0, 0, false, []);
      expect(cpu.returnWith).toHaveBeenCalledWith(0);
    });

    it("should grow the routine stack", function() {
      var cpu = buildCpu('rfalse');
      cpu.callRoutine(1, 0, false, []);
      expect(cpu.routineStack.size()).toEqual(1);
    });

    it("should set the PC to the routine's first instruction", function() {
      var cpu = buildCpu('rfalse');
      cpu.callRoutine(1, 0, false, []);
      expect(cpu.getPC()).toEqual(0x3);

      cpu = buildCpu('ret');
      cpu.callRoutine(2, 0, false, []);
      expect(cpu.getPC()).toEqual(0x9);
    });

    it("should set the routine's originalSP to the current SP", function() {
      var cpu = buildCpu('rfalse');
      cpu.stack.push(0x1); // just for fun
      var routine = cpu.callRoutine(1, 0, false, []);
      expect(routine.getOriginalSP()).toEqual(1);
    });

    it("should set the return addr to the given addr", function() {
      var cpu = buildCpu('rfalse');
      var routine = cpu.callRoutine(1, 0xff93, false, []);
      expect(routine.getReturnAddr()).toEqual(0xff93);
    });

    it("should set the routine's locals to their default values", function() {
      var cpu = buildCpu('ret');
      var routine = cpu.callRoutine(2, 0, false, []);
      expect(routine.getLocal(1)).toEqual(0x000a);
      expect(routine.getLocal(2)).toEqual(0xffff);
    });

    it("should then set the routine's locals to the arguments given", function() {
      var cpu = buildCpu('ret');
      var routine = cpu.callRoutine(2, 0, false, [0xcafe, 0xbabe]);
      expect(routine.getLocal(1)).toEqual(0xcafe);
      expect(routine.getLocal(2)).toEqual(0xbabe);
    });

    it("should tell the routine not to store its result if storeVariable is false", function() {
      var cpu = buildCpu('ret');
      var routine = cpu.callRoutine(2, 0, false, []);
      expect(routine.storesResult()).toEqual(false);
    });

    it("should tell the routine where it should later store its result", function() {
      var cpu = buildCpu('ret');
      var routine = cpu.callRoutine(2, 0, 19, []);
      expect(routine.storesResult()).toEqual(true);
      expect(routine.getStoreVariable()).toEqual(19);
    });

    describe("in z5", function() {
      beforeEach(function() {
        this.machine = new bzork.Machine(bzork.spec.storyData['ztuu']);
        this.cpu = this.machine.cpu;
      });

      it("should unpack routine addresses correctly", function() {
        var routine = this.cpu.callRoutine(0x1228, 0, false, []);
        expect(routine._addr).toEqual(0x48a0);
      });
    });

    describe("in z6", function() {
      beforeEach(function() {
        this.machine = new bzork.Machine(bzork.spec.storyData['z6']);
        this.cpu = this.machine.cpu;
      });

      it("should unpack routine addresses correctly", function() {
        // real address = 0x6d8c; / 4 = 0x1b63; offset = 0xd13
        var routine = this.cpu.callRoutine(0x13d, 0, false, []);
        expect(routine._addr).toEqual(0x6d8c);
      });
    });

    describe("in z8", function() {
      beforeEach(function() {
        this.machine = new bzork.Machine(bzork.spec.storyData['z8']);
        this.cpu = this.machine.cpu;
      });

      it("should unpack routine addresses correctly", function() {
        var routine = this.cpu.callRoutine(0x1fef, 0, false, []);
        expect(routine._addr).toEqual(0xff78);
      });
    });
  });

  describe("returnWith", function() {
    function pushRoutine(cpu, sp, addr, stores) {
      var routine = new StubRoutine(sp, addr, stores);
      cpu.routineStack.push(routine);
      return routine;
    }

    it("should throw if returning without being in a routine", function() {
      var cpu = this.cpu;
      expect(function() {
        cpu.returnWith(0);
      }).toThrow("No current routine to return from");
    });

    it("should restore the original SP", function() {
      // avoid "shrink upwards" exception
      this.cpu.stack.push(0xff);
      this.cpu.stack.push(0x01);

      pushRoutine(this.cpu, 1, 0xbeef, false);
      this.cpu.returnWith(0);
      expect(this.cpu.getSP()).toEqual(1);
    });

    it("should update the PC to be the routine's return address", function() {
      pushRoutine(this.cpu, 0, 0xbeef, false);
      this.cpu.returnWith(0);
      expect(this.cpu.getPC()).toEqual(0xbeef);
    });

    it("should not store the result if the call leading to the routine does not", function() {
      pushRoutine(this.cpu, 0, 0xbeef, false);
      spyOn(this.cpu, 'setVariable');
      this.cpu.returnWith(1);
      expect(this.cpu.setVariable).not.toHaveBeenCalled();
    });

    it("should store the result in the routine's specified store variable", function() {
      pushRoutine(this.cpu, 0, 0xbeef, 17);
      spyOn(this.cpu, 'setVariable');
      this.cpu.returnWith(0xff);
      expect(this.cpu.setVariable).toHaveBeenCalledWith(17, 0xff);
    });
  });

  describe("setVariable", function() {
    it("should ...", function() {
      throw "fail";
    });
  });
});
