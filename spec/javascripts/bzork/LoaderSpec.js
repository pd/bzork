describe("bzork.Loader", function() {
  var storyFiles = {
    zork1: "contrib/stories/zork1.z3",
    zork2: "contrib/stories/zork2.z3",
    zork3: "contrib/stories/zork3.z3",
    ztuu:  "contrib/stories/ztuu.z5"
  };

  function fetchStoryData(path) {
    var data = '';

    jQuery.ajax({
      url: path,
      async: false,
      success: function(text) { data = text; }
    });

    return data;
  }

  var storyData = {
    zork1: fetchStoryData(storyFiles.zork1)
  };

  beforeEach(function() {
    this.loader = new bzork.Loader(storyData.zork1);
    this.zork1  = this.loader.loadStory();
  });

  describe("for Zork1", function() {
    it("should read the Z-code version", function() {
      expect(this.zork1.getZcodeVersion()).toEqual(3);
    });

    it("should read the release number", function() {
      expect(this.zork1.getReleaseNumber()).toEqual(88);
    });

    it("should read the high memory base address", function() {
      expect(this.zork1.getHighMemAddr()).toEqual(0x4e37);
    });

    it("should read the initial program counter value", function() {
      expect(this.zork1.getStartPC()).toEqual(0x4f05);
    });

    it("should read the dictionary address", function() {
      expect(this.zork1.getDictionaryAddr()).toEqual(0x3b21);
    });

    it("should read the object table address", function() {
      expect(this.zork1.getObjectTableAddr()).toEqual(0x02b0);
    });

    it("should read the globals table address", function() {
      expect(this.zork1.getGlobalTableAddr()).toEqual(0x2271);
    });

    it("should read the abbreviations table address", function() {
      expect(this.zork1.getAbbrevTableAddr()).toEqual(0x1f0);
    });

    it("should read the file size", function() {
      expect(this.zork1.getFileSize()).toEqual(0x14b8c);
    });

    it("should read the checksum", function() {
      expect(this.zork1.getChecksum()).toEqual(0xa129);
    });

    it("should read the story serial", function() {
      expect(this.zork1.getSerial()).toEqual("840726");
    });
  });
});
