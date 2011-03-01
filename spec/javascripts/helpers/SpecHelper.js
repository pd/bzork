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

  var storyBytes = {
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

    getStory: function(name) {
      // Create a fresh copy of the story data every time
      var data = storyBytes[name],
          orig = new DataView(data),
          abuf = new ArrayBuffer(data.byteLength),
          copy = new DataView(abuf);

      // Deal with this if it ever arises but we're okay for now
      if ((data.byteLength % 4) !== 0)
        throw "Story " + name + " has length that won't work for uint32";

      for (var i = 0; i < data.byteLength; i += 4)
        copy.setUint32(i, orig.getUint32(i));

      return copy.buffer;
    },

    storyFiles: storyFiles,
    fetchStory: fetchStory
  };
})();

// Sick of typing the same things over&over into chrome's JS console
if (typeof console !== "undefined") {
  function z1m() { return new bzork.Machine(bzork.spec.getStory('zork1')); }
  function ztm() { return new bzork.Machine(bzork.spec.getStory('ztuu')); }

  function z1i(addr) {
    var m = z1m();
    return m.readInstruction(addr || m.getStartPC());
  }
}
