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

  this.useUI(bzork.ui.Dummy);
};

bzork.Machine.prototype = {
  run: function(debug) {
    var instrs = 0, caughtEx = undefined;

    if (debug)
      bzork.Debug.enable();

    try {
      while (!this.shouldHalt()) { // die early like morrison
        var instr = this.readInstruction(this.getPC());
        bzork.Debug.log("0x%s: %s", this.getPC().toString(16), instr.toString());
        instr.run();
        instrs++;
      }
    } catch (ex) {
      caughtEx = ex;
    } finally {
      bzork.Debug.log("%d instructions executed", instrs);
      if (caughtEx) {
        bzork.Debug.log("Died on exception: %o", caughtEx);
        throw caughtEx;
      }
      bzork.Debug.disable();
    }
  },

  shouldHalt: function() {
    return false;
  },

  useUI: function(obj) {
    this.ui = new obj(this);
    this.ui.init();
  },

  // Convenience methods for commonly retrieved data
  getStatusLineText: function() {
    var obj = this.getObject( this.getGlobal(16) );
    return obj.getDescription();
  },

  getStatusScoreText: function() {
    // if (this.isTimeGame()) ... TODO
    return this.getScore() + "/" + this.getTurns();
  },

  getScore: function() {
    return bzork.Util.toInt16(this.getGlobal(17));
  },

  getTurns: function() {
    return this.getGlobal(18);
  },

  getTime: function() {
    return this.getGlobal(17) + ":" + this.getGlobal(18);
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

  pushStack: function(value) {
    this.cpu.stack.push(value);
  },

  pullStack: function() {
    return this.cpu.stack.pop();
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
  getObject: function(i) {
    return this.objectTable.get(i);
  },

  insertObject: function(objnum, parentnum) {
    this.objectTable.insertObject(objnum, parentnum);
  },

  getAbbrev: function(i) {
    return this.abbrevTable.get(i);
  },

  getGlobal: function(i) {
    return this.globalTable.get(i);
  },

  setGlobal: function(i, val) {
    this.globalTable.set(i, val);
  },

  getProperty: function(obj, prop) {
    return this.objectTable.getProperty(obj, prop);
  },

  setProperty: function(obj, prop, val) {
    this.objectTable.setProperty(obj, prop, val);
  },

  getPropertyDataAddr: function(obj, prop) {
    return this.objectTable.getPropertyDataAddr(obj, prop);
  },

  getNextProperty: function(obj, prop) {
    return this.objectTable.getNextProperty(obj, prop);
  },

  testAttribute: function(obj, attr) {
    return this.objectTable.testAttribute(obj, attr);
  },

  setAttribute: function(obj, attr) {
    this.objectTable.setAttribute(obj, attr);
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
