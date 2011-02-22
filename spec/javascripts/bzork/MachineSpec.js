describe("bzork.Machine", function() {
  it("should do as much as is currently expected of it", function() {
    var machine = new bzork.Machine(bzork.spec.storyData['zork1']);
    expect(function() {
      machine.run()
    }).toThrow("Unimplemented instruction: put_prop");
  });
});

