bzork.Memory = function(bytes) {
  this.dataView = new DataView(bytes);
  var membuf = this.dataView.buffer;

  this.header = new bzork.Memory.Header(new DataView(membuf, 0, 64));
  this.objectTable = new bzork.Memory.ObjectTable(
    new DataView(membuf), this.header.getObjectTableAddr(),
    this.header.getZcodeVersion());
  this.globalTable = new bzork.Memory.GlobalTable(new DataView(membuf));
};

bzork.Memory.prototype.getUint8 = function(offset) {
  return this.dataView.getUint8(offset);
};

bzork.Memory.prototype.getUint16 = function(offset) {
  return this.dataView.getUint16(offset);
};

bzork.Memory.prototype.getDataView = function(offset, length) {
  if (typeof length === "undefined")
    return new DataView(this.dataView.buffer, offset);
  else
    return new DataView(this.dataView.buffer, offset, length);
};
