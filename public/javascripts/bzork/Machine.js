bzork.Machine = function(storyBytes) {
  this.memory = new bzork.Memory(storyBytes);
  this.header = new bzork.Header(this);
  this.zscii = new bzork.Zscii(this);

  this.dictionary = new bzork.Dictionary(this, this.header.getDictionaryAddr());
  this.abbrevTable = new bzork.AbbrevTable(this, this.header.getAbbrevTableAddr());
  this.objectTable = new bzork.ObjectTable(this, this.header.getObjectTableAddr());
  this.globalTable = new bzork.GlobalTable(this, this.header.getGlobalTableAddr());

  this.cpu = new bzork.vm.Cpu(this);
  this.instructionReader = new bzork.vm.InstructionReader(this);
};

bzork.Machine.prototype = {
  run: function() {
    while (!this.shouldHalt()) { // die early like morrison
      var instr = this.readInstruction(this.getPC());
      instr.run();
    }
  },

  shouldHalt: function() {
    return false;
  },

  // CPU proxy methods
  call: function(packedAddr, returnAddr, storeVariable, args) {
    return this.cpu.callRoutine(packedAddr, returnAddr, storeVariable, args);
  },

  returnWith: function(value) {
    this.cpu.returnWith(value);
  },

  getPC: function() {
    return this.cpu.getPC();
  },

  setPC: function(pc) {
    this.cpu.setPC(pc);
  },

  increasePC: function(length) {
    this.setPC(this.getPC() + length);
  },

  getVariable: function(i) {
    return this.cpu.getVariable(i);
  },

  setVariable: function(i, val) {
    this.cpu.setVariable(i, val);
  },

  readInstruction: function(addr) {
    return this.instructionReader.readInstruction(addr);
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

  getGlobal: function(i) {
    return this.globalTable.get(i);
  },

  setGlobal: function(i, val) {
    this.globalTable.set(i, val);
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
  findZsciiEnd: function(offset, view) {
    return this.zscii.findZsciiEnd(offset, view);
  },

  getZsciiString: function(offset, view) {
    return this.zscii.getString(offset, view);
  },

  getZsciiChar: function(offset, view) {
    return this.zscii.getChar(offset, view);
  },

  decodeZsciiChar: function(c) {
    return this.zscii.decodeChar(c);
  }
};
