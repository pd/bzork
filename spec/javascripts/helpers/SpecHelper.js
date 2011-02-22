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
    zork1: "contrib/stories/zork1.z3",
    ztuu:  "contrib/stories/ztuu.z5",
    z6:    "contrib/stories/advent.z6",
    z8:    "contrib/stories/anchor.z8"
  };

  var storyData = {
    zork1: fetchStory(storyFiles.zork1),
    ztuu:  fetchStory(storyFiles.ztuu),
    z6:    fetchStory(storyFiles.z6),
    z8:    fetchStory(storyFiles.z8)
  };

  return {
    createArrayBuffer: function(_) {
      var bytes = [],
          words = arguments[0];

      if (arguments.length > 1 || typeof words !== "object")
        words = arguments;

      for (var i = 0; i < words.length; i++) {
        bytes.push( (words[i] >> 8) & 0xff );
        bytes.push( words[i] & 0xff );
      }

      return jDataView.createBuffer.apply(this, bytes);
    },
    storyFiles: storyFiles,
    storyData: storyData,
    fetchStory: fetchStory
  };
})();

// Sick of typing the same things over&over into chrome's JS console
if (typeof console !== "undefined") {
  function z1m() { return new bzork.Machine(bzork.spec.storyData['zork1']); }
  function ztm() { return new bzork.Machine(bzork.spec.storyData['ztuu']); }

  function z1i(addr) {
    var m = z1m();
    return m.readInstruction(addr || m.getStartPC());
  }
}
