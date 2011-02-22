bzork.Zscii = function(machine) {
  this._machine = machine;
  this.alphabet = this.determineAlphabet();
  this.resetState();
};

// The 2 default alphabets
bzork.Zscii.DefaultAlphabets = {
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

bzork.Zscii.prototype = {
  resetState: function() {
    this.shift = null;      // Are we following a shift character?
    this.shiftLock = false; // Is shift locked? (v1&v2 only)
    this.tenBit = false;    // Are we in the middle of reading a 10-bit ZSCII?
    this.abbrev = null;     // Are we about to expand an abbreviation?
  },

  determineAlphabet: function() {
    var version = this._machine.getZcodeVersion();

    // XXX TODO v5+ can have custom alphabets
    if (version === 1)
      return bzork.Zscii.DefaultAlphabets['v1'];
    else
      return bzork.Zscii.DefaultAlphabets['v2'];
  },

  getString: function(offset, view) {
    var words = [], end = this.findZsciiEnd(offset);
    view = view || this._machine;

    for (offset; offset < end; offset += 2)
      words.push( view.getUint16(offset) );

    return this.decodeString(words);
  },

  getChar: function(offset, view) {
    view = view || this._machine;
    var c = view.getUint8(offset);
    return this.decodeChar(c);
  },

  findZsciiEnd: function(offset, view) {
    view = view || this._machine;
    while ((view.getUint16(offset) & 0x8000) === 0)
      offset += 2;
    return offset + 2;
  },

  decodeString: function(words) {
    var zstring = new bzork.Zscii.ZString(this, words);
    return zstring.decode();
  },

  decodeChar: function(c) {
    if (c >= 32 && c <= 126)
      return String.fromCharCode(c);
    else
      throw "unimplemented";
  },

  // Proxy methods for Machine
  getAbbrev: function(i) {
    return this._machine.getAbbrev(i);
  },

  getZcodeVersion: function() {
    return this._machine.getZcodeVersion();
  }
};

// A ZString is a sequence of ZCharTriplets in memory.
// The ZString is terminated when the first bit of a triplet
// is set.
bzork.Zscii.ZString = function(zscii, words) {
  this.zscii = zscii;
  this.triplets = [];
  for (var i = 0; i < words.length; i++)
    this.triplets.push( new bzork.Zscii.ZCharTriplet(zscii, words[i]) );
};

bzork.Zscii.ZString.prototype = {
  decode: function() {
    var result = [];
    for (var i = 0; i < this.triplets.length; i++)
      result.push(this.triplets[i].decode());
    this.zscii.resetState();
    return result.join('');
  }
};

// A ZCharTriplet is a 2-byte word value which contains 3
// 5-bit ZChars. The ZChars can represent either individual
// entries in one of the story's alphabets, a 10-bit ZSCII
// value (which maps closely to ASCII), or an abbreviation.
// A triplet might expand to a number of characters, in practice.
bzork.Zscii.ZCharTriplet = function(zscii, word) {
  this.zscii = zscii;
  this.word = word;
  this.zchars = [
    new bzork.Zscii.ZChar(zscii, (word >> 10) & 0x1f),
    new bzork.Zscii.ZChar(zscii, (word >> 5) & 0x1f),
    new bzork.Zscii.ZChar(zscii, word & 0x1f)
  ];
};

bzork.Zscii.ZCharTriplet.prototype = {
  decode: function() {
    var result = [];
    for (var i = 0; i < this.zchars.length; i++) {
      var c = this.zchars[i].decode();
      if (c)
        result.push(c);
    }
    return result.join('');
  }
};

// A 5-bit "Z Character"
bzork.Zscii.ZChar = function(zscii, bits) {
  this.zscii = zscii;
  this.bits = bits;
};

bzork.Zscii.ZChar.prototype = {
  decode: function() {
    var c = this.bits,
        zscii = this.zscii,
        version = zscii.getZcodeVersion(),
        result;

    if (zscii.tenBit === true) {
      zscii.tenBit = c << 5;
      return;
    } else if (zscii.tenBit !== false) {
      zscii.tenBit |= c;
      result = zscii.decodeChar(zscii.tenBit);
      zscii.resetState();
      return result;
    }

    if (zscii.abbrev) {
      var x = zscii.abbrev;
      zscii.resetState();
      return zscii.getAbbrev(32 * (x - 1) + c);
    }

    switch (c) {
    case 0:
      result = ' ';
      break;
    case 1:
      if (zscii.getZcodeVersion() === 1)
        result = "\n";
      else
        zscii.abbrev = c;
      break;
    case 2:
    case 3:
      if (zscii.getZcodeVersion() >= 3)
        zscii.abbrev = c;
      break;
    case 4:
      zscii.shift = 1;
      break;
    case 5:
      zscii.shift = 2;
      break;
    case 6:
      if (zscii.shift === 2) {
        zscii.tenBit = true;
        break;
      }
    default:
      if (zscii.shift)
        result = zscii.alphabet[zscii.shift][c - 6];
      else
        result = zscii.alphabet[0][c - 6];
      break;
    }

    if (result)
      zscii.resetState();

    return result;
  }
};
