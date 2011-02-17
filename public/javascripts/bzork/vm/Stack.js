bzork.vm.Stack = function() {
  this.stack = [];
  this.sp = 0;
};

bzork.vm.Stack.prototype = {
  push: function(value) {
    this.stack[this.sp++] = value;
  },

  pop: function() {
    if (this.sp === 0)
      throw "Can not pop empty stack";
    return this.stack[--this.sp];
  },

  size: function() {
    return this.sp;
  },

  isEmpty: function() {
    return this.size() === 0;
  }
};
