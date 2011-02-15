bzork.Zscii = (function() {
  var ZChar = function(bits) {
    this.bits = bits;
  };

  ZChar.prototype.toString = function() {
    return String.fromCharCode(this.bits); // XXX TODO
  };

  // A 2-byte word which consists of 3 5-bit "Z Characters", each
  // of which may be either a character from one of 3 available
  // alphabets or represent an abbreviation.
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
