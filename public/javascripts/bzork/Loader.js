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

  story.header.zcodeVersion = dv.getUint8(0);
  story.header.releaseNumber = dv.getUint16(2);
  story.header.highMemAddr = dv.getUint16(4);
  story.header.startPC = dv.getUint16(6);
  story.header.dictionaryAddr = dv.getUint16(8);
  story.header.objectTableAddr = dv.getUint16(10);
  story.header.globalTableAddr = dv.getUint16(12);
  story.header.staticMemAddr = dv.getUint16(14);
  story.header.abbrevTableAddr = dv.getUint16(24);

  story.header.serial = '';
  for (var i = 0; i < 6; i++)
    story.header.serial += String.fromCharCode( dv.getUint8(18 + i) );
};
