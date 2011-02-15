bzork.Story = function() {
  this.header = new bzork.Story.Header();
};

bzork.Story.prototype.getZcodeVersion = function() {
  return this.header.zcodeVersion;
};

bzork.Story.prototype.getReleaseNumber = function() {
  return this.header.releaseNumber;
};

bzork.Story.prototype.getHighMemAddr = function() {
  return this.header.highMemAddr;
};

bzork.Story.prototype.getStartPC = function() {
  return this.header.startPC;
};

bzork.Story.prototype.getDictionaryAddr = function() {
  return this.header.dictionaryAddr;
};

bzork.Story.prototype.getObjectTableAddr = function() {
  return this.header.objectTableAddr;
};

bzork.Story.prototype.getGlobalTableAddr = function() {
  return this.header.globalTableAddr;
};

bzork.Story.prototype.getStaticMemAddr = function() {
  return this.header.staticMemAddr;
};

bzork.Story.prototype.getAbbrevTableAddr = function() {
  return this.header.abbrevTableAddr;
};

bzork.Story.prototype.getSerial = function() {
  return this.header.serial;
};

bzork.Story.Header = function() {
  this.zcodeVersion = null;
  this.flags1 = null;
  this.releaseNumber = null;
  this.highMemAddr = null;
  this.startPC = null;
  this.dictionaryAddr = null;
  this.objectTableAddr = null;
  this.globalTableAddr = null;
  this.staticMemAddr = null;
  this.flags2 = null;
  this.abbrevTableAddr = null;
  this.fileSize = null;
  this.checksum = null;
  this.serial = null;
};
