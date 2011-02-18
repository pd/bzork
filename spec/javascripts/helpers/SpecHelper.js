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
    ztuu:  "contrib/stories/ztuu.z5"
  };

  var storyData = {
    zork1: fetchStory(storyFiles.zork1),
    ztuu:  fetchStory(storyFiles.ztuu)
  };

  return {
    storyFiles: storyFiles,
    storyData: storyData,
    fetchStory: fetchStory
  };
})();

// A fake Machine instance which does little more than answer
// what version it is and access the underlying memory.
var StubMachine = function(version, words) {
  this.version = version;
  buf = createArrayBuffer(words);
  this.memory  = new bzork.Memory(buf);
  this.zscii   = new bzork.Zscii(this);
};

StubMachine.prototype.getZcodeVersion = function() { return this.version; }
StubMachine.prototype.getStartPC = function() { return 0; }
StubMachine.prototype.getZsciiString = bzork.Machine.prototype.getZsciiString;
StubMachine.prototype.getUint8 = bzork.Machine.prototype.getUint8;
StubMachine.prototype.getUint16 = bzork.Machine.prototype.getUint16;

// Handy wrapper around jDataView.createBuffer(), just so I
// can specify things in words rather than bytes.
function createArrayBuffer(_) {
  var bytes = [],
      words = arguments[0];

  if (arguments.length > 1 || typeof words !== "object")
    words = arguments;

  for (var i = 0; i < words.length; i++) {
    bytes.push( (words[i] >> 8) & 0xff );
    bytes.push( words[i] & 0xff );
  }

  return jDataView.createBuffer.apply(this, bytes);
}

// Sick of typing the same things over&over into chrome's JS console
if (typeof console !== "undefined") {
  function z1m() { return new bzork.Machine(bzork.spec.storyData['zork1']); }
  function ztm() { return new bzork.Machine(bzork.spec.storyData['ztuu']); }

  function z1i(addr) {
    var m = z1m();
    if (addr)
      return new bzork.vm.Instruction(m, addr);
    else
      return new bzork.vm.Instruction(m, m.getStartPC());
  }
}
