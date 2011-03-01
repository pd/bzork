describe("bzork.Machine", function() {
  it("should run zork1 as far as currently expected", function() {
    var machine = new bzork.Machine(bzork.spec.getStory('zork1'));
    expect(function() {
      machine.run('debug-mode');
    }).not.toThrow();
  });

  it("should run ZTUU as far as currently expected", function() {
    var machine = new bzork.Machine(bzork.spec.getStory('ztuu'));
    expect(function() {
      machine.run();
    }).not.toThrow();
  });
});

