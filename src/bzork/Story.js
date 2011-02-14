bzork.Story = function() {
  this.header = new bzork.Story.Header();
};

bzork.Story.prototype.getZcodeVersion = function() {
  return this.header.zcodeVersion;
};

bzork.Story.prototype.getReleaseNumber = function() {
  return this.header.releaseNumber;
};

bzork.Story.prototype.getSerial = function() {
  return this.header.serial;
};

bzork.Story.Header = function() {
  this.zcodeVersion = null;
  this.releaseNumber = null;
  this.serial = null;
};
