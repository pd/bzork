describe("bzork.Memory", function() {
  beforeEach(function() {
    this.arrayBuffer = jDataView.createBuffer(0x01, 0x02, 0x03, 0x04);
    this.memory = new bzork.Memory(this.arrayBuffer);
  });

  it("can read uint8 values from the underlying data", function() {
    expect(this.memory.getUint8(0)).toEqual(0x01);
    expect(this.memory.getUint8(2)).toEqual(0x03);
  });

  it("can read uint16 values from the underlying data", function() {
    expect(this.memory.getUint16(0)).toEqual(0x0102);
    expect(this.memory.getUint16(1)).toEqual(0x0203);
  });

  it("can write uint8 values into the underlying data", function() {
    this.memory.setUint8(0, 0xff);
    expect(this.memory.getUint8(0)).toEqual(0xff);
  });

  it("can write uint16 values into the underlying data", function() {
    this.memory.setUint16(1, 0xbeef);
    expect(this.memory.getUint16(0)).toEqual(0x01be);
    expect(this.memory.getUint16(2)).toEqual(0xef04);
  });
});
