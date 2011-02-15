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
