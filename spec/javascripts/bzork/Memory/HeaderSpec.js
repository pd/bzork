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
