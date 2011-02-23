bzork.Util = {
  variableName: function(i) {
    if (i === false)
      return '-';
    else if (i === 0)
      return 'sp';
    else if (i < 16)
      return 'local' + i;
    else
      return 'g' + i;
  },

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
