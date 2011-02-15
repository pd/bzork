bzork.spec = (function() {
  var fetchStory = function(path) {
    var buffer = null;

    jQuery.ajax({
      url: path,
      async: false,
      dataType: "binary",
      success: function(buf) { buffer = buf; }
    });

    return buffer;
  };

  var storyFiles = {
    zork1: "contrib/stories/zork1.z3"
  };

  var storyData = {
    zork1: fetchStory(storyFiles.zork1)
  };

  return {
    storyFiles: storyFiles,
    storyData: storyData,
    fetchStory: fetchStory
  };
})();

beforeEach(function() {
});

// Sick of typing the same things over&over into chrome's JS console
if (typeof console !== "undefined") {
  function z1m() { return new bzork.Memory(bzork.spec.storyData['zork1']); }
}
