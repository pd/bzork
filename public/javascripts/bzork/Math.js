// Z-Machine mathematical operations on signed, but all data is
// stored unsigned. These eliminate the need for lots of ugly
// casts throughout the code.
bzork.Math = (function() {
  return {
    toSigned14bit: function(word) {
      if (word > 0x1fff) // max signed (=13bit) value
        return -(0x3fff - word - 1); // max unsigned (=14bit) value
      else
        return word;
    }
  };
}());
