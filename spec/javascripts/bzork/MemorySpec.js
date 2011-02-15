describe("bzork.Memory", function() {
});

describe("bzork.Memory.Header", function() {
  describe("for Zork1", function() {
    beforeEach(function() {
      this.header = new bzork.Memory(bzork.spec.storyData['zork1']).header;
    });

    it("should have Z-code version 3", function() {
      expect(this.header.getZcodeVersion()).toEqual(3);
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
      expect(seps).toEqual([".", ",", '"']);
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
  });
});
