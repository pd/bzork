describe("bzork.Util", function() {
  it("toUint16", function() {
    expect(bzork.Util.toUint16(0)).toEqual(0);
    expect(bzork.Util.toUint16(-1)).toEqual(0xffff);
    expect(bzork.Util.toUint16(-2)).toEqual(0xfffe);
    expect(bzork.Util.toUint16(32767)).toEqual(32767);
    expect(bzork.Util.toUint16(-32768)).toEqual(32768);
  });

  it("toInt16", function() {
    expect(bzork.Util.toInt16(0)).toEqual(0);
    expect(bzork.Util.toInt16(1)).toEqual(1);
    expect(bzork.Util.toInt16(32767)).toEqual(32767);
    expect(bzork.Util.toInt16(32768)).toEqual(-32768);
    expect(bzork.Util.toInt16(0xffff)).toEqual(-1);
  });

  it("toInt14", function() {
    expect(bzork.Util.toInt14(0)).toEqual(0);
    expect(bzork.Util.toInt14(0x1fff)).toEqual(0x1fff);
    expect(bzork.Util.toInt14(0x2000)).toEqual(-8192);
  });
});
