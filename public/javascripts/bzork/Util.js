bzork.Util = {
  variableName: function(i) {
    if (i === 0)
      return 'sp';
    else if (i < 16)
      return 'local' + i;
    else
      return 'g' + i;
  }
};
