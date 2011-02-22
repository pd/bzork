bzork.vm.Operand = function(machine, type, value) {
  this._machine = machine;
  this._type = type;
  this.value = value;
};

bzork.vm.Operand.prototype = {
  getSize: function() {
    if (this._type === bzork.vm.Instruction.OpTypes.LARGE)
      return 2;
    else if (this._type === bzork.vm.Instruction.OpTypes.OMIT)
      return 0;
    else
      return 1;
  }
};
