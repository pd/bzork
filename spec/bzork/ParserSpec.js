describe("bzork.Parser", function() {
  var gameFiles = {
    zork1: "contrib/games/zork1.z3",
    zork2: "contrib/games/zork2.z3",
    zork3: "contrib/games/zork3.z3",
    ztuu:  "contrib/games/ztuu.z5"
  };

  function fetchGameData(path) {
    var data = '';

    // this is actually totally borked, only works in FF, and is
    // just flat out silly. i'm actually getting an error response.
    // i will deal with making this more reasonable at some point
    // when the headache is worth it.
    jQuery.ajax({
      url: path + ".base64",
      async: false,
      complete: function(xhr, status) { data = xhr.responseText; }
    });

    return Base64.decode(data);
  }

  var gameData = {
    zork1: fetchGameData(gameFiles.zork1)
  };

  beforeEach(function() {
    this.parser = new bzork.Parser();
    this.zork1  = parser.loadGame(gameData.zork1);
  });

  it("should detect the Z-code version", function() {
    expect(this.zork1.zcodeVersion).toEqual(3);
  });

  it("should detect the release number", function() {
    expect(this.zork1.releaseNumber).toEqual(88);
  });

  it("should detect the game serial", function() {
    expect(this.zork1.serial).toEqual("840726");
  });
});
