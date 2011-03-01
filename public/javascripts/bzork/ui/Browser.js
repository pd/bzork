bzork.ui.Browser = function(machine) {
  this._machine = machine;
  this.$ = jQuery;
};

bzork.ui.Browser.prototype = {
  init: function() {
    this.statusLine = new bzork.ui.Browser.StatusLine(this._machine,
                                                      this.$('#status-line'));
  },

  drawStatusLine: function() {
    this.statusLine.draw();
  }
};

bzork.ui.Browser.StatusLine = function(machine, elem) {
  this._machine = machine;
  this._elem = elem;
};

bzork.ui.Browser.StatusLine.prototype = {
  draw: function() {
    this._elem.find('span.title').text(this._machine.getStatusLineText());
    this._elem.find('span.score').text(this._machine.getStatusScoreText());
  }
};
