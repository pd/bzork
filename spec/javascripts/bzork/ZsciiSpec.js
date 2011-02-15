describe('ZSCII', function() {
  var _initZscii = function() { bzork.Zscii.init(3, null); };
  beforeEach(_initZscii);
  afterEach(_initZscii);

  describe("can set a custom alphabet", function() {
    bzork.Zscii.setAlphabet([
      "zyxwvutsrqponmlkjihgfedcba",
      "ZYXWVUTSRQPONMLKJIHGFEDCBA",
      "12345678901234567890123456"
    ]);
  });

  describe("rejects invalid custom alphabets", function() {
    expect(function() {
      bzork.Zscii.setAlphabet([]);
    }).toThrow("Alphabets must be 3 26 character strings");

    expect(function() {
      bzork.Zscii.setAlphabet("abcdefghijklmnopqrstuvwxyz");
    }).toThrow("Alphabets must be 3 26 character strings");

    expect(function() {
      bzork.Zscii.setAlphabet([
        "zyxwvutsrqponmlkjihgfedcba",
        "ZYXWVUTSRQPONMLKJIHGFEDCBA",
        "1234567890123456789012345"
      ]);
    }).toThrow("Alphabets must be 3 26 character strings");
  });

  describe("Z-character triplets", function() {
    it("can be parsed when all characters are in a single alphabet row", function() {
      var s = bzork.Zscii.toAscii(jDataView.createBuffer(0x65, 0xaa, 0x80, 0xa5));
      expect(s).toEqual("the ");
    });

    it("can be parsed across multiple alphabet rows", function() {
      var s = bzork.Zscii.toAscii(jDataView.createBuffer(0x13, 0x2d, 0xa8, 0x05));
      expect(s).toEqual("The ");
    });

    it("can parse longer words", function() {
      var buf = jDataView.createBuffer(
        0x13, 0x53, 0x2e, 0x97,
        0x67, 0x53, 0x1b, 0x2a,
        0xc7, 0xc5
      );
      var s = bzork.Zscii.toAscii(buf);
      expect(s).toEqual("Unfortunately");
    });

    it("can parse words with punctuation", function() {
      var buf = jDataView.createBuffer(
        0x13, 0xd4, 0x68, 0xb8, 0xdd, 0x40
      );
      var s = bzork.Zscii.toAscii(buf);
      expect(s).toEqual("You're ");
    });

    it("can parse words with 10-bit ZSCII codes", function() {
      var buf = jDataView.createBuffer(0x14, 0xc1, 0x93, 0x6a);
      var s = bzork.Zscii.toAscii(buf);
      expect(s).toEqual("$ve");
    });

    it("can parse words which contain abbreviations", function() {
      // need an abbreviations table
      new bzork.Memory(bzork.spec.storyData['zork1']);

      var buf = jDataView.createBuffer(
        0x0d, 0xc1, 0x35, 0x53,
        0x32, 0xe6, 0x6d, 0xd3,
        0xb3, 0x05
      );
      var s = bzork.Zscii.toAscii(buf);
      expect(s).toEqual("wall with engravings");
    });
  });
});
