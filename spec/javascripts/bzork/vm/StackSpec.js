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

  it("should resize downwards", function() {
    var stack = new bzork.vm.Stack();
    stack.push(0x0a);
    stack.push(0x1b1c);
    stack.push(0x0d);
    stack.shrinkTo(2);

    expect(stack.peek()).toEqual(0x1b1c);
    expect(stack.size()).toEqual(2);
  });

  it("should not allow itself to be resized to a larger size", function() {
    var stack = new bzork.vm.Stack();
    expect(function() {
      stack.shrinkTo(1);
    }).toThrow("Can not shrink stack upwards");
  });
});
