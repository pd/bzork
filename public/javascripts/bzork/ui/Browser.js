bzork.ui.Browser = function(machine) {
  this._machine = machine;
  this.$ = jQuery;
  this.initialized = false;
};

bzork.ui.Browser.prototype = {
  init: function() {
    this.statusLine = this.$('#status-line');
    this.gameWindow = this.$('#game-window');
    this.inputWindow = this.$('#input-window');
  }
};
