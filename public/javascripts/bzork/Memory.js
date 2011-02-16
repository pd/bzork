bzork.Memory = function(arrayBuffer) {
  this.dataView = new DataView(arrayBuffer);
};

bzork.Memory.prototype.getUint8 = function(offset) {
  return this.dataView.getUint8(offset);
};

bzork.Memory.prototype.getUint16 = function(offset) {
  return this.dataView.getUint16(offset);
};
