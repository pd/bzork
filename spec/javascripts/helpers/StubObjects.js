// A fake Machine instance which does little more than answer
// what version it is and access the underlying memory.
var StubMachine = function(version, words) {
  this.version = version;
  buf = bzork.spec.createArrayBuffer(words);
  this.memory  = new bzork.Memory(buf);
  this.zscii   = new bzork.Zscii(this);
};

StubMachine.prototype = {
  getZcodeVersion: function() { return this.version; },
  getStartPC: function() { return 0; },
  getZsciiString: bzork.Machine.prototype.getZsciiString,
  getUint8: bzork.Machine.prototype.getUint8,
  getUint16: bzork.Machine.prototype.getUint16
};

// A fake Routine
var StubRoutine = function(originalSP, returnAddr, stores) {
  this.originalSP = originalSP;
  this.returnAddr = returnAddr;
  this.stores = stores;
};

StubRoutine.prototype = {
  getOriginalSP: function() { return this.originalSP; },
  getReturnAddr: function() { return this.returnAddr; },
  storesResult:  function() { return this.stores !== false; },
  getStoreVariable: function() { return this.stores; }
};
