bzork.Loader = function(data) {
  this.blob = data;
  this.dataView = new jDataView(this.blob);
};

bzork.Loader.prototype.loadStory = function() {
  var story = new bzork.Story();
  this.loadHeader(story);
  return story;
};

_globalDv=null;
bzork.Loader.prototype.loadHeader = function(story) {
  var dv = this.dataView;
  _globalDv=dv;

  story.header.zcodeVersion = dv.getUint8(0x0);
  story.header.releaseNumber = dv.getUint16(0x2);
  story.header.highMemAddr = dv.getUint16(0x4);
  story.header.startPC = dv.getUint16(0x6);
  story.header.dictionaryAddr = dv.getUint16(0x8);
  story.header.objectTableAddr = dv.getUint16(0xa);
  story.header.globalTableAddr = dv.getUint16(0xc);
  story.header.staticMemAddr = dv.getUint16(0xe);
  story.header.abbrevTableAddr = dv.getUint16(0x18);

  story.header.serial = '';
  for (var i = 0; i < 6; i++)
    story.header.serial += String.fromCharCode( dv.getUint8(0x12 + i) );
};
