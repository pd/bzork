bzork.Loader = function(data) {
  this.blob = data;
  this.dataView = new jDataView(this.blob);
};

bzork.Loader.prototype.loadStory = function() {
  var story = new bzork.Story();
  this.loadHeader(story);
  return story;
};

bzork.Loader.prototype.loadHeader = function(story) {
  var dv = this.dataView;
  dv.seek(0);
  story.header.zcodeVersion = dv.getUint8(0);
  story.header.releaseNumber = dv.getUint16(2);
  story.header.serial = '';
  for (var i = 0; i < 6; i++)
    story.header.serial += String.fromCharCode( dv.getUint8(16 + i) );
};
