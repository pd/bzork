bzork.Loader = function(data) {
  this.blob = data;
  this.dataView = new jDataView(this.blob);
  this.header = new bzork.Loader.Header(new jDataView(this.blob, 0, 64));
};

bzork.Loader.prototype.loadStory = function() {
  this.header.load();
  var story = new bzork.Story();
  story.zcodeVersion = this.header.zcodeVersion;
  story.releaseNumber = this.header.releaseNumber;
  story.serial = this.header.serial;
  return story;
};

bzork.Loader.Header = function(dataView) {
  this.dataView = dataView;
};

bzork.Loader.Header.prototype.load = function() {
  this.zcodeVersion = this.dataView.getUint8(0);
  this.releaseNumber = this.dataView.getUint16(2);

  this.serial = '';
  for (var i = 0; i < 6; i++) {
    var c = this.dataView.getUint8(16 + i);
    this.serial += String.fromCharCode(c);
  };
};
