bzork.ui.Browser = function(machine) {
  this._machine = machine;
  this.$ = jQuery;
};

bzork.ui.Browser.prototype = {
  init: function() {
    this.statusLine = new bzork.ui.Browser.StatusLine(this._machine,
                                                      this.$('#status-line'));
    this.gameWindow = new bzork.ui.Browser.GameWindow(this._machine,
                                                      this.$('#game-window'));
  },

  drawStatusLine: function() {
    this.statusLine.draw();
  },

  print: function(string) {
    this.gameWindow.print(string);
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

bzork.ui.Browser.GameWindow = function(machine, elem) {
  this._machine = machine;
  this._elem = elem;
};

bzork.ui.Browser.GameWindow.prototype = {
  print: function(string) {
    string = string.replace("\n", "<br/>");
    this._elem.append(string);
  }
};
