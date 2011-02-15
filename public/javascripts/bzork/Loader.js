bzork.Loader = function(buffer) {
  this.dataView = new DataView(buffer);
};

bzork.Loader.prototype.loadStory = function() {
  var story = new bzork.Story();
  this.loadHeader(story);
  return story;
};

bzork.Loader.prototype.loadHeader = function(story) {
  var dv = this.dataView;

  story.header.zcodeVersion = dv.getUint8(0x0);
  story.header.releaseNumber = dv.getUint16(0x2);
  story.header.highMemAddr = dv.getUint16(0x4);
  story.header.startPC = dv.getUint16(0x6);
  story.header.dictionaryAddr = dv.getUint16(0x8);
  story.header.objectTableAddr = dv.getUint16(0xa);
  story.header.globalTableAddr = dv.getUint16(0xc);
  story.header.staticMemAddr = dv.getUint16(0xe);
  story.header.abbrevTableAddr = dv.getUint16(0x18);

  var size = dv.getUint16(0x1a);
  if (story.header.zcodeVersion <= 3)
    story.header.fileSize = size * 2;
  else if (story.header.zcodeVersion <= 5)
    story.header.fileSize = size * 4;
  else
    story.header.fileSize = size * 8;

  story.header.checksum = dv.getUint16(0x1c);

  story.header.serial = '';
  for (var i = 0; i < 6; i++)
    story.header.serial += String.fromCharCode( dv.getUint8(0x12 + i) );
};
