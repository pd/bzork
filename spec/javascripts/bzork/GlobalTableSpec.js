describe("bzork.GlobalTable", function() {
  beforeEach(function() {
    this.machine = new bzork.Machine(bzork.spec.storyData['zork1']);
    this.globals = this.machine.globalTable;
  });

  it("should know where it starts", function() {
    expect(this.globals.getStartAddr()).toEqual(0x2271);
  });

  it("should know where it ends", function() {
    expect(this.globals.getEndAddr()).toEqual(0x2451);
  });

  it("throws an error if getting a variable out of bounds", function() {
    var globals = this.globals;

    expect(function() {
      globals.get(15)
    }).toThrow("Global variable 15 out of bounds (16..255)!");

    expect(function() {
      globals.get(256)
    }).toThrow("Global variable 256 out of bounds (16..255)!");
  });

  it("throws an error if setting a variable out of bounds", function() {
    var globals = this.globals;

    expect(function() {
      globals.set(15, 0)
    }).toThrow("Global variable 15 out of bounds (16..255)!");

    expect(function() {
      globals.set(256, 0xff)
    }).toThrow("Global variable 256 out of bounds (16..255)!");
  });

  it("retrieves values of the given variables", function() {
    expect(this.globals.get(16)).toEqual(0);
    expect(this.globals.get(19)).toEqual(0x2e4b);
    expect(this.globals.get(255)).toEqual(0);
  });

  it("sets values of the given variables", function() {
    this.globals.set(16, 0xbeef);
    expect(this.globals.get(16)).toEqual(0xbeef);
    this.globals.set(16, 0);
    expect(this.globals.get(16)).toEqual(0);

    this.globals.set(19, 0xabcd);
    expect(this.globals.get(19)).toEqual(0xabcd);

    this.globals.set(255, 0x2345);
    expect(this.globals.get(255)).toEqual(0x2345);
  });
});
