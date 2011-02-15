bzork.Zscii = (function() {
  // The 2 default alphabets
  var ZsciiAlphabets = {
    v1: [
      "abcdefghijklmnopqrstuvwxyz",
      "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
      " 0123456789.,!?_#'\"/\\<-:()"
    ],
    v2: [
      "abcdefghijklmnopqrstuvwxyz",
      "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
      " \n0123456789.,!?_#'\"/\\-:()"
    ]
  };

  // A reference to the alphabet currently in use
  var zsciiAlphabet = null;

  // A single 5-bit "Z Character"
  var ZChar = function(bits) {
    this.bits = bits;
  };

  ZChar.prototype.toString = function() {
    return String.fromCharCode(this.bits); // XXX TODO
  };

  // A 2-byte word which consists of 3 5-bit "Z Characters", each
  // of which may be either a character from one of 3 available
  // alphabets or represent an abbreviation. The first bit is
  // always discarded.
  var ZCharSeq = function(word) {
    this.word = word;
    this.zchars = [];
    this.zchars[0] = new ZChar((word >> 10) & 0x1f);
    this.zchars[1] = new ZChar((word >> 5) & 0x1f);
    this.zchars[2] = new ZChar(word & 0x1f);
  };

  ZCharSeq.prototype.toString = function() {
    var result = [];
    for (var i = 0; i < zchars.length; i++)
      result.push(zchars[i].toString());
    zchars.join('');
  };

  return {
    setAlphabet: function(versionOrAlphabet) {
      if (typeof versionOrAlphabet == "number") {
        zsciiAlphabet = versionOrAlphabet == 1 ? ZsciiAlphabets['v1'] : ZsciiAlphabets['v2'];
        return;
      }

      var alphabet = versionOrAlphabet;
      if (typeof alphabet != "object" || alphabet.length != 3 ||
          alphabet[0].length != 26 || alphabet[1].length != 26 || alphabet[2].length != 26)
        throw "Alphabets must be 3 26 character strings";

      ZsciiAlphabet = alphabet;
    },

    toAsciiChar: function(bits) {
      return (new ZChar(bits)).toString();
    },

    toAscii: function(words) {
      if (bytes.length % 2 != 0)
        throw "Uhh?"; // TODO
    },

    fromAscii: function() {
    }
  };
})();
