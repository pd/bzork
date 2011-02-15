describe("bzork.Memory.Header", function() {
  describe("for Zork1", function() {
    beforeEach(function() {
      this.header = new bzork.Memory(bzork.spec.storyData['zork1']).header;
    });

    it("should have Z-code version 3", function() {
      expect(this.header.getZcodeVersion()).toEqual(3);
    });

    it("should know the release number", function() {
      expect(this.header.getReleaseNumber()).toEqual(88);
    });

    it("should know the high memory base address", function() {
      expect(this.header.getHighMemAddr()).toEqual(0x4e37);
    });

    it("should know the first instruction's address", function() {
      expect(this.header.getStartPC()).toEqual(0x4f05);
    });

    it("should know the dictionary address", function() {
      expect(this.header.getDictionaryAddr()).toEqual(0x3b21);
    });

    it("should know the object table address", function() {
      expect(this.header.getObjectTableAddr()).toEqual(0x02b0);
    });

    it("should know the global variable address", function() {
      expect(this.header.getGlobalTableAddr()).toEqual(0x2271);
    });

    it("should know the static memory base address", function() {
      expect(this.header.getStaticMemAddr()).toEqual(0x2e53);
    });

    it("should know the abbreviations tables address", function() {
      expect(this.header.getAbbrevTableAddr()).toEqual(0x01f0);
    });

    it("should know the file size", function() {
      expect(this.header.getFileSize()).toEqual(0x14b8c);
    });

    it("should know the checksum", function() {
      expect(this.header.getChecksum()).toEqual(0xa129);
    });

    it("should know the story's serial", function() {
      expect(this.header.getSerial()).toEqual("840726");
    });
  });
});

describe("bzork.Memory.Dictionary", function() {
  describe("for Zork1", function() {
    beforeEach(function() {
      this.dict = new bzork.Memory(bzork.spec.storyData['zork1']).dictionary;
    });

    it("should know the word separator count", function() {
      expect(this.dict.getWordSeparatorCount()).toEqual(3);
    });

    it("should know the word separators", function() {
      var seps = this.dict.getWordSeparators();
      expect(seps).toEqual([",", ".", '"']);
    });

    it("should know the word size", function() {
      expect(this.dict.getWordSize()).toEqual(7);
    });

    it("should know the word count", function() {
      expect(this.dict.getWordCount()).toEqual(697);
    });

    it("should know its end address", function() {
      expect(this.dict.getEndAddr()).toEqual(0x4e36);
    });

    it("should throw an error when retrieving a word out of bounds", function() {
      var dict = this.dict;
      expect(function() { dict.get(-1) }).toThrow("Word -1 out of bounds!");
      expect(function() { dict.get(697) }).toThrow("Word 697 out of bounds!");
    });

    it("should contain the correct strings", function() {
      expect(this.dict.get(0)).toEqual("$ve");
      expect(this.dict.get(1)).toEqual(".");
      expect(this.dict.get(2)).toEqual(",");
      expect(this.dict.get(11)).toEqual("air-p");
      expect(this.dict.get(15)).toEqual("ancien");
      expect(this.dict.get(240)).toEqual("frotz");
      expect(this.dict.get(271)).toEqual("grue");
      expect(this.dict.get(695)).toEqual("zorkmi");
      expect(this.dict.get(696)).toEqual("zzmgck");
    });
  });
});

describe("bzork.Memory.AbbrevTable", function() {
  describe("for Zork1", function() {
    beforeEach(function() {
      this.abbrev = new bzork.Memory(bzork.spec.storyData['zork1']).abbrevTable;
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
