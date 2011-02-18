bzork.Header = function(machine) {
  this._machine = machine;
};

bzork.Header.prototype = {
  getZcodeVersion: function() {
    return this._machine.getUint8(0x0);
  },

  getReleaseNumber: function() {
    return this._machine.getUint16(0x2);
  },

  getHighMemAddr: function() {
    return this._machine.getUint16(0x4);
  },

  getStartPC: function() {
    return this._machine.getUint16(0x6);
  },

  getDictionaryAddr: function() {
    return this._machine.getUint16(0x8);
  },

  getObjectTableAddr: function() {
    return this._machine.getUint16(0xa);
  },

  getGlobalTableAddr: function() {
    return this._machine.getUint16(0xc);
  },

  getStaticMemAddr: function() {
    return this._machine.getUint16(0xe);
  },

  getAbbrevTableAddr: function() {
    return this._machine.getUint16(0x18);
  },

  getFileSize: function() {
    var size = this._machine.getUint16(0x1a),
        zver = this.getZcodeVersion();

    if (zver <= 3)
      return size * 2;
    else if (zver <= 5)
      return size * 4;
    else
      return size * 8;
  },

  getChecksum: function() {
    return this._machine.getUint16(0x1c);
  },

  getSerial: function() {
    var serial = [];
    for (var i = 0; i < 6; i++)
      serial.push( String.fromCharCode(this._machine.getUint8(0x12 + i)) );
    return serial.join('');
  },

  getRoutineOffset: function() {
    return this._machine.getUint16(0x28);
  },

  getStringOffset: function() {
    return this._machine.getUint16(0x2a);
  }
};
