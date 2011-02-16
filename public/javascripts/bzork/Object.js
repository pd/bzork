bzork.Object = function(machine, id, addr) {
  this.id = id;
  this._machine = machine;
  this._addr = addr;

  var version = this._machine.getZcodeVersion();
  if (version <= 3) {
    this._attributesSize = 4;
    this._idSize = 1;
  } else {
    this._attributesSize = 6;
    this._idSize = 2;
  }
};

bzork.Object.prototype.getParent = function() {
  return this._getId(0);
};

bzork.Object.prototype.getSibling = function() {
  return this._getId(1);
};

bzork.Object.prototype.getChild = function() {
  return this._getId(2);
};

bzork.Object.prototype.getPropertyAddr = function() {
  return this._machine.getUint16(this._addr + this._attributesSize + this._idSize * 3);
};

bzork.Object.prototype.hasDescription = function() {
  return this._machine.getUint8(this.getPropertyAddr()) !== 0;
};

bzork.Object.prototype.getDescription = function() {
  if (!this.hasDescription())
    return;
  return this._machine.getZsciiString(this.getPropertyAddr() + 1);
};

bzork.Object.prototype._getId = function(i) {
  var fn = this._idSize == 1 ? 'getUint8' : 'getUint16';
  return this._machine[fn](this._addr + this._attributesSize + (i * this._idSize));
};
