bzork.Zscii = (function() {
  // The 2 default alphabets
  var DefaultAlphabets = {
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

  // Globalish ZSCII interpreter state. Meh.
  var zsciiState = {
    zcodeVersion: null,  // Everything changes by Z-Code version
    alphabet: null,      // Current alphabet table
    shift: null,         // Are we following a shift character?
    shiftLock: false,    // Is shift locked? (v1&v2 only)
    abbrev: null         // Are we about to expand an abbreviation?
  };

  // A single 5-bit "Z Character"
  var ZChar = function(bits) {
    this.bits = bits;
  };

  ZChar.prototype.toString = function() {
    var v = this.bits,
        result;

    switch (v) {
    case 0:
      result = ' ';
      break;
    case 1:
      if (zsciiState.zcodeVersion === 1)
        result = "\n";
      if (zsciiState.zcodeVersion >= 2)
        zsciiState.abbrev = v;
      break;
    case 2:
    case 3:
      // TODO handle shift for v1
      if (zsciiState.zcodeVersion >= 3)
        zsciiState.abbrev = v;
      break;
    case 4:
    case 5:
      zsciiState.shift = v;
      break;
    default:
      if (zsciiState.shift)
        // TODO handle v1
        result = zsciiState.alphabet[zsciiState.shift == 4 ? 1 : 2][v - 6];
      else
        result = zsciiState.alphabet[0][v - 6];
    }

    if (result)
      bzork.Zscii.reset();

    return result;
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
    for (var i = 0; i < this.zchars.length; i++) {
      var c = this.zchars[i].toString();
      if (c)
        result.push(c);
    }
    return result.join('');
  };

  ZCharTriplet.prototype.isTerminal = function() {
    return (this.word & 0x8000) !== 0;
  };

  // Given a DataView, reads ZCharTriplets until one has the first
  // bit set marking the end of the word. These can then be converted
  // into ASCII by toString()s all the way down.
  var ZString = function(dataview) {
    this.buffer = dataview;
    this.triplets = [];

    var word, zct, offset = 0;
    do {
      word = this.buffer.getUint16(offset);
      zct = new ZCharTriplet(word);
      this.triplets.push(zct);
      offset += 2;

      if (zct.isTerminal())
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
    /// XXX DEBUG TODO RM
    ZChar: ZChar,
    ZCharTriplet: ZCharTriplet,
    ZString: ZString,

    init: function(version) {
      zsciiState.zcodeVersion = version;
      if (version === 1)
        zsciiState.alphabet = DefaultAlphabets['v1'];
      else
        zsciiState.alphabet = DefaultAlphabets['v2'];
      this.reset();
    },

    reset: function() {
      zsciiState.abbrev = null;
      zsciiState.shift = null;
      zsciiState.shiftLock = false;
    },

    setAlphabet: function(alphabet) {
      var alphabet = alphabet;
      if (typeof alphabet != "object" || alphabet.length != 3 ||
          alphabet[0].length != 26 || alphabet[1].length != 26 || alphabet[2].length != 26)
        throw "Alphabets must be 3 26 character strings";
      zsciiState.alphabet = alphabet;
    },

    // Sometimes we need to bypass the alphabet entirely and simply convert the
    // 10-bit (in practice 8-bit) ZSCII code value to its matching ASCII. Sec. 3.8.
    toAsciiFromZsciiCode: function(bits) {
      if (bits >= 32 && bits <= 126)
        return String.fromCharCode(bits);
      else
        throw "unimplemented";
    },

    toAsciiChar: function(bits) {
      return (new ZChar(bits)).toString();
    },

    toAscii: function(buffer) {
      var view = buffer['getUint16'] ? buffer : new DataView(buffer);
      return (new ZString(view)).toString();
    }
  };
})();
