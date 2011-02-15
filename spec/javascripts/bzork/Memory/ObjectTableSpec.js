describe("bzork.Memory.ObjectTable", function() {
  describe("for Zork1", function() {
    beforeEach(function() {
      this.objects = new bzork.Memory(bzork.spec.storyData['zork1']).objectTable;
    });

    it("should have a maximum of 32 properties", function() {
      expect(this.objects.getMaxProperties()).toEqual(32);
    });

    it("should have an object size of 9", function() {
      expect(this.objects.getObjectSize()).toEqual(9);
    });

    it("should know its start address", function() {
      expect(this.objects.getStartAddr()).toEqual(0x02b0);
    });

    it("should know its end address", function() {
      expect(this.objects.getEndAddr()).toEqual(0x0bb7);
    });

    it("should know the number of objects stored", function() {
      expect(this.objects.getObjectCount()).toEqual(250);
    });
  });

  describe("for ZTUU", function() {
    beforeEach(function() {
      this.objects = new bzork.Memory(bzork.spec.storyData['ztuu']).objectTable;
    });

    it("should have a maximum of 64 properties", function() {
      expect(this.objects.getMaxProperties()).toEqual(64);
    });

    it("should have an object size of 14", function() {
      expect(this.objects.getObjectSize()).toEqual(14);
    });
  });
});
