describe("bzork.Loader", function() {
  var storyFiles = {
    zork1: "contrib/stories/zork1.z3",
    zork2: "contrib/stories/zork2.z3",
    zork3: "contrib/stories/zork3.z3",
    ztuu:  "contrib/stories/ztuu.z5"
  };

  function fetchStoryData(path) {
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

  var storyData = {
    zork1: fetchStoryData(storyFiles.zork1)
  };

  beforeEach(function() {
    this.loader = new bzork.Loader();
    this.zork1  = this.loader.loadStory(storyData.zork1);
  });

  it("should detect the Z-code version", function() {
    expect(this.zork1.zcodeVersion).toEqual(3);
  });

  it("should detect the release number", function() {
    expect(this.zork1.releaseNumber).toEqual(88);
  });

  it("should detect the story serial", function() {
    expect(this.zork1.serial).toEqual("840726");
  });
});