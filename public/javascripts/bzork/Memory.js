bzork.Memory = function(bytes) {
  this.dataView = new DataView(bytes);
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
