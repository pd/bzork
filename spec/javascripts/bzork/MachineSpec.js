describe("bzork.Machine", function() {
  it("should init the ZSCII interpreter with the Z-code version number", function() {
    spyOn(bzork.Zscii, 'init').andCallThrough();
    new bzork.Machine(bzork.spec.storyData['zork1']);
    expect(bzork.Zscii.init).toHaveBeenCalled();
  });
});

