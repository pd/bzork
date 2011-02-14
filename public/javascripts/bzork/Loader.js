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

  story.header.zcodeVersion = dv.getUint8();
  dv.seek(2); // skip flags for now
  story.header.releaseNumber = dv.getUint16();
  story.header.highMemAddr = dv.getUint16();
  story.header.startPC = dv.getUint16();
  story.header.dictionaryAddr = dv.getUint16();
  story.header.objectTableAddr = dv.getUint16();
  story.header.globalTableAddr = dv.getUint16();

  story.header.serial = '';
  for (var i = 0; i < 6; i++)
    story.header.serial += String.fromCharCode( dv.getUint8(16 + i) );
};
