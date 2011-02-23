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
  }
};
