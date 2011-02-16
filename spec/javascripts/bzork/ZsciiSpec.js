describe('ZSCII', function() {
  beforeEach(function() {
    this.machine = new bzork.Machine(bzork.spec.storyData['zork1']);
    this.zscii = this.machine.zscii;
  });

  it("can decode strings within a single alphabet", function() {
    var s = this.zscii.decodeString([0x65aa, 0x80a5]);
    expect(s).toEqual("the ");
  });

  it("can decode strings within multiple alphabet rows", function() {
    var s = this.zscii.decodeString([0x132d, 0xa805]);
    expect(s).toEqual("The ");
  });

  it("can decode longer words", function() {
    var buf = [
      0x1353, 0x2e97,
      0x6753, 0x1b2a,
      0xc7c5
    ];
    var s = this.zscii.decodeString(buf);
    expect(s).toEqual("Unfortunately");
  });

  it("can decode words with punctuation", function() {
    var buf = [
      0x13d4, 0x68b8, 0xdd40
    ];
    var s = this.zscii.decodeString(buf);
    expect(s).toEqual("You're ");
  });

  it("can decode words with 10-bit ZSCII codes", function() {
    var buf = [0x14c1, 0x936a];
    var s = this.zscii.decodeString(buf);
    expect(s).toEqual("$ve");
  });

  it("can decode words which contain abbreviations", function() {
    var buf = [
      0x0dc1, 0x3553,
      0x32e6, 0x6dd3,
      0xb305
    ];
    var s = this.zscii.decodeString(buf);
    expect(s).toEqual("wall with engravings");
  });
});
