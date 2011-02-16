bzork.Memory = function(arrayBuffer) {
  this.dataView = new DataView(arrayBuffer);
};

bzork.Memory.prototype.getUint8 = function(offset) {
  return this.dataView.getUint8(offset);
};

bzork.Memory.prototype.getUint16 = function(offset) {
  return this.dataView.getUint16(offset);
};

bzork.Memory.prototype.setUint8 = function(offset, value) {
  this.dataView.setUint8(offset, value);
};

bzork.Memory.prototype.setUint16 = function(offset, value) {
  this.dataView.setUint16(offset, value);
};
