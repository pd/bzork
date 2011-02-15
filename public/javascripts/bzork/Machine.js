bzork.Machine = function(buffer) {
  this.memory = new bzork.Memory(buffer);
  this.pc = this.memory.header.getStartPC();
  this.stack = new bzork.Stack();
};

bzork.Stack = function() {
  //...
};
