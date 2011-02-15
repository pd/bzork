describe("bzork.Machine", function() {
  it("should set the current alphabet based on the Z-code version number", function() {
    spyOn(bzork.Zscii, 'setAlphabet');
    new bzork.Machine(bzork.spec.storyData['zork1']);
    expect(bzork.Zscii.setAlphabet).toHaveBeenCalledWith(3);
  });
});
