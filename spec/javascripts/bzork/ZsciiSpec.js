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
});
