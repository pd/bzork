bzork.Machine = function(storyBytes) {
  this.memory = new bzork.Memory(storyBytes);
  this.header = new bzork.Header(this);
  this.zscii = new bzork.Zscii(this);

  this.dictionary = new bzork.Dictionary(this, this.header.getDictionaryAddr());
  this.abbrevTable = new bzork.AbbrevTable(this, this.header.getAbbrevTableAddr());
  this.objectTable = new bzork.ObjectTable(this, this.header.getObjectTableAddr());
  this.globalTable = new bzork.GlobalTable(this, this.header.getGlobalTableAddr());

  this.cpu = new bzork.vm.Cpu(this);
};

bzork.Machine.prototype = {
  run: function() {
    var steps = 0;
    while (!this.shouldHalt() && steps <= 10) { // die early like morrison
      var instr = new bzork.vm.Instruction(this, this.cpu.getPC());
      instr.run();
    }
  },

  shouldHalt: function() {
    return false;
  },

  // CPU proxy methods
  call: function(packedAddr, returnAddr, args) {
    return this.cpu.callRoutine(packedAddr, returnAddr, args);
  },

  // Header proxy methods
  getStartPC: function() {
    return this.header.getStartPC();
  },

  getZcodeVersion: function() {
    return this.header.getZcodeVersion();
  },

  getRoutineOffset: function() {
    return this.header.getRoutineOffset(); // TODO find a .z6 to impl this with
  },

  // Table proxy methods
  getAbbrev: function(i) {
    return this.abbrevTable.get(i);
  },

  // Memory proxy methods
  getUint8: function(offset) {
    return this.memory.getUint8(offset);
  },

  getUint16: function(offset) {
    return this.memory.getUint16(offset);
  },

  setUint8: function(offset, value) {
    this.memory.setUint8(offset, value);
  },

  setUint16: function(offset, value) {
    this.memory.setUint16(offset, value);
  },

  // ZSCII proxy methods
  getZsciiString: function(offset) {
    return this.zscii.getString(offset);
  },

  getZsciiChar: function(offset) {
    return this.zscii.getChar(offset);
  },

  decodeZsciiChar: function(c) {
    return this.zscii.decodeChar(c);
  }
};
