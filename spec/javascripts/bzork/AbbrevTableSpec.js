describe("bzork.abbrevTable", function() {
  it("should know Z-code version 1 has no abbreviations", function() {
    var machine = new StubMachine(1, [0xabcd, 0xef01]);
    var abbrev  = new bzork.AbbrevTable(machine, 0);
    expect(abbrev.getTableCount()).toEqual(0);
  });

  describe("for Zork1", function() {
    beforeEach(function() {
      this.machine = new bzork.Machine(bzork.spec.storyData['zork1']);
      this.abbrev  = this.machine.abbrevTable;
    });

    it("should know the number of tables available", function() {
      expect(this.abbrev.getTableCount()).toEqual(3);
    });

    it("should know the number of abbreviations available", function() {
      expect(this.abbrev.getAbbrevCount()).toEqual(96);
    });

    it("should know the start address of the tables", function() {
      expect(this.abbrev.getTableStartAddr()).toEqual(0x01f0);
    });

    it("should know the end address of the tables", function() {
      expect(this.abbrev.getTableEndAddr()).toEqual(0x02af);
    });

    it("should know the start address of the data", function() {
      expect(this.abbrev.getDataStartAddr()).toEqual(0x40);
    });

    it("should know the end address of the data", function() {
      expect(this.abbrev.getDataEndAddr()).toEqual(0x01ef);
    });

    it("should be able to retrieve the data address of abbreviations", function() {
      expect(this.abbrev.getAbbrevDataAddr(0)).toEqual(0x40);
      expect(this.abbrev.getAbbrevDataAddr(1)).toEqual(0x44);
      expect(this.abbrev.getAbbrevDataAddr(23)).toEqual(0x9a);
    });

    it("should throw an error when retrieving an abbreviation out of bounds", function() {
      var abbrev = this.abbrev;

      expect(function() { abbrev.get(-1); }).toThrow("Abbreviation -1 out of range!");
      expect(function() { abbrev.get(96); }).toThrow("Abbreviation 96 out of range!");
    });

    it("should retrieve the correct strings for the abbreviations", function() {
      expect(this.abbrev.get(0)).toEqual("the ");
      expect(this.abbrev.get(1)).toEqual("The ");
      expect(this.abbrev.get(21)).toEqual("through ");
      expect(this.abbrev.get(27)).toEqual("Cyclops ");
      expect(this.abbrev.get(49)).toEqual("staircase ");
      expect(this.abbrev.get(87)).toEqual("Fortunately");
      expect(this.abbrev.get(93)).toEqual("troll's ");
    });
  });
});
