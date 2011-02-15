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

    it("should throw an error when retrieving objects out of bounds", function() {
      var obj = this.objects;

      expect(function() { obj.get(0) }).toThrow("Object 0 out of bounds!");
      expect(function() { obj.get(251) }).toThrow("Object 251 out of bounds!");
      expect(function() { obj.get(250) }).not.toThrow();
    });

    it("should retrieve objects with the correct tree information", function() {
      var obj1 = this.objects.get(1),
          obj89 = this.objects.get(89);

      expect(obj1.parent).toEqual(247);
      expect(obj1.sibling).toEqual(2);
      expect(obj1.child).toEqual(0);

      expect(obj89.parent).toEqual(88);
      expect(obj89.sibling).toEqual(0);
      expect(obj89.child).toEqual(87);
    });

    it("should retrieve objects with the correct property addresses", function() {
      expect(this.objects.get(1).propertyAddr).toEqual(0x0bb8);
      expect(this.objects.get(89).propertyAddr).toEqual(0x1388);
      expect(this.objects.get(173).propertyAddr).toEqual(0x1b95);
    });

    it("should retrieve objects with the correct names", function() {
      var obj1 = this.objects.get(1),
          obj67 = this.objects.get(67),
          obj195 = this.objects.get(195);

      expect(obj1.description).toEqual("pair of hands");
      expect(obj67.description).toEqual("Maze");
      expect(obj195.description).toEqual("blue button");
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
