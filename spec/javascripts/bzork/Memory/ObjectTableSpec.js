describe("bzork.Memory.ObjectTable", function() {
  describe("for Zork1", function() {
    beforeEach(function() {
      this.objects = new bzork.Memory(bzork.spec.storyData['zork1']).objectTable;
    });

    it("should know its start address", function() {
      expect(this.objects.getStartAddr()).toEqual(0x02b0);
    });

    it("should know its end address", function() {
      expect(this.objects.getEndAddr()).toEqual(0x0bb7);
    });

    it("should know the start address of the object tree", function() {
      expect(this.objects.getTreeStartAddr()).toEqual(0xffff);
    });

    it("should know the number of objects stored", function() {
      expect(this.objects.getObjectCount()).toEqual(250);
    });
  });
});
