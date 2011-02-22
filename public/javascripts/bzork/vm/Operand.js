bzork.vm.Operand = function(machine, type, value) {
  this._machine = machine;
  this._type = type;
  this._value = value;
};

bzork.vm.Operand.prototype = {
  getType: function() {
    return this._type;
  },

  getSize: function() {
    if (this._type === bzork.vm.Instruction.OpTypes.LARGE)
      return 2;
    else if (this._type === bzork.vm.Instruction.OpTypes.OMIT)
      return 0;
    else
      return 1;
  },

  getValue: function() {
    if (this._type === bzork.vm.Instruction.OpTypes.VAR)
      return this._machine.getVariable(this._value);
    return this._value;
  },

  getSignedValue: function() {
    return bzork.Math.toInt16(this.getValue());
  }
};
