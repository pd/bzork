describe("bzork.vm.Stack", function() {
  it("should start at size 0", function() {
    var stack = new bzork.vm.Stack();
    expect(stack.size()).toEqual(0);
  });

  it("should know if it's empty", function() {
    var stack = new bzork.vm.Stack();
    expect(stack.isEmpty()).toEqual(true);

    stack.push(0xff);
    expect(stack.isEmpty()).toEqual(false);
  });

  it("should grow when values are pushed on", function() {
    var stack = new bzork.vm.Stack();
    stack.push(0xff);
    expect(stack.size()).toEqual(1);
    stack.push(0x01);
    expect(stack.size()).toEqual(2);
  });

  it("should shrink when values are popped off", function() {
    var stack = new bzork.vm.Stack();
    stack.push(0xff);
    stack.push(0x01);

    expect(stack.pop()).toEqual(0x01);
    expect(stack.size()).toEqual(1);
    expect(stack.pop()).toEqual(0xff);
    expect(stack.size()).toEqual(0);
  });

  it("should throw an error if popping an empty stack", function() {
    expect(function() {
      new bzork.vm.Stack().pop()
    }).toThrow("Can not pop empty stack");
  });

  it("should allow peeking at the top value", function() {
    var stack = new bzork.vm.Stack();
    stack.push(0xff);
    stack.push(0x01);
    expect(stack.peek()).toEqual(0x01);
  });
});
