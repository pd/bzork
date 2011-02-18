// Z-Machine mathematical operations on signed, but all data is
// stored unsigned. These eliminate the need for lots of ugly
// casts throughout the code.
bzork.Math = (function() {
  return {
    toUint16: function(word) {
      if (word >= 0)
        return word;
      else
        return 0xffff + (word + 1);
    },

    toInt16: function(word) {
      if (word > 0x7fff)
        return -(0xffff - (word - 1));
      else
        return word;
    },

    toInt14: function(word) {
      word = word & 0x3fff;
      if (word > 0x1fff) // max signed (=13bit) value
        return -(0x3fff - (word - 1)); // max unsigned (=14bit) value
      else
        return word;
    }
  };
}());
