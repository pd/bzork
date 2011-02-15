bzork.Memory.Object = function(id, buffer, addr, version) {
  this.id = id;
  this._memory = buffer;
  this._addr = addr;
  this._version = version;

  if (this._version <= 3) {
    this._attributesSize = 4;
    this._idSize = 1;
  } else {
    this._attributesSize = 6;
    this._idSize = 2;
  }
};

bzork.Memory.Object.prototype.getParent = function() {
  return this._getId(0);
};

bzork.Memory.Object.prototype.getSibling = function() {
  return this._getId(1);
};

bzork.Memory.Object.prototype.getChild = function() {
  return this._getId(2);
};

bzork.Memory.Object.prototype.getPropertyAddr = function() {
  return this._memory.getUint16(this._addr + this._attributesSize + this._idSize * 3);
};

bzork.Memory.Object.prototype.hasDescription = function() {
  return this._memory.getUint8(this.getPropertyAddr()) !== 0;
};

bzork.Memory.Object.prototype.getDescription = function() {
  if (!this.hasDescription())
    return;

  var view = new DataView(this._memory.buffer, this.getPropertyAddr() + 1);
  return bzork.Zscii.toAscii(view);
};

bzork.Memory.Object.prototype._getId = function(i) {
  var fn = this._idSize == 1 ? 'getUint8' : 'getUint16';
  return this._memory[fn](this._addr + this._attributesSize + (i * this._idSize));
};
