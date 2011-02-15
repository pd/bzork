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
    var v = this.bits;
    if (v === 0)
      return ' ';
    if (v == 4 || v == 5)
      return '';
    return zsciiAlphabet[0][v - 6];
  };

  // A 2-byte word which consists of 3 5-bit "Z Characters", each
  // of which may be either a character from one of 3 available
  // alphabets or represent an abbreviation. If the first bit is
  // set, the end of the word has been reached.
  var ZCharTriplet = function(word) {
    this.word = word;
    this.zchars = []
    this.zchars[0] = new ZChar((word >> 10) & 0x1f);
    this.zchars[1] = new ZChar((word >> 5) & 0x1f);
    this.zchars[2] = new ZChar(word & 0x1f);
  };

  ZCharTriplet.prototype.toString = function() {
    var result = [];
    for (var i = 0; i < this.zchars.length; i++)
      result.push(this.zchars[i].toString());
    return this.zchars.join('');
  };

  // Given a DataView, reads ZCharTriplets until one has the first
  // bit set marking the end of the word. These can then be converted
  // into ASCII by toString()s all the way down.
  var ZString = function(dataview) {
    this.buffer = dataview;
    this.triplets = [];

    var word, offset = 0;
    do {
      word = this.buffer.getUint16(offset);
      this.triplets.push(new ZCharTriplet(word));
      offset += 2;

      if (word & 0x8000)
        break;
    } while (true);
  };

  ZString.prototype.toString = function() {
    var res = [];
    for (var i = 0; i < this.triplets.length; i++)
      res.push(this.triplets[i].toString());
    return res.join('');
  };

  return {
    ZChar: ZChar,
    ZCharTriplet: ZCharTriplet,
    ZString: ZString,

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

    toAscii: function(buffer) {
      var dv = new DataView(buffer);
      return (new ZString(dv)).toString();
    }
  };
})();
