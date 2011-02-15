describe('ZSCII', function() {
  afterEach(function() {
    bzork.Zscii.setAlphabet(3);
  });

  describe("can set the alphabet using a Z-code version number", function() {
    bzork.Zscii.setAlphabet(1);
    bzork.Zscii.setAlphabet(3);
  });

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
      expect(s).toEqual("the");
    });
  });
});
