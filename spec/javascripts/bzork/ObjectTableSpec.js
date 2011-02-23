describe("bzork.ObjectTable", function() {
  describe("for Zork1", function() {
    beforeEach(function() {
      this.machine = new bzork.Machine(bzork.spec.storyData['zork1']);
      this.objects = this.machine.objectTable;
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

      expect(obj1.getParent()).toEqual(247);
      expect(obj1.getSibling()).toEqual(2);
      expect(obj1.getChild()).toEqual(0);

      expect(obj89.getParent()).toEqual(88);
      expect(obj89.getSibling()).toEqual(0);
      expect(obj89.getChild()).toEqual(87);
    });

    it("should retrieve objects with the correct property header addresses", function() {
      expect(this.objects.get(1).getPropertyHeaderAddr()).toEqual(0x0bb8);
      expect(this.objects.get(89).getPropertyHeaderAddr()).toEqual(0x1388);
      expect(this.objects.get(173).getPropertyHeaderAddr()).toEqual(0x1b95);
    });

    it("should retrieve objects with the correct names", function() {
      var obj1 = this.objects.get(1),
          obj67 = this.objects.get(67),
          obj195 = this.objects.get(195);

      expect(obj1.getDescription()).toEqual("pair of hands");
      expect(obj67.getDescription()).toEqual("Maze");
      expect(obj195.getDescription()).toEqual("blue button");
    });

    it("should have undefined descriptions for unnamed objects", function() {
      expect(this.objects.get(249).getDescription()).toEqual(undefined);
    });

    it("should know the defined property numbers for objects", function() {
      var obj1 = this.objects.get(1),
          obj19 = this.objects.get(19),
          obj249 = this.objects.get(249);

      expect(obj1.getPropertyNumbers()).toEqual([18, 16]);
      expect(obj19.getPropertyNumbers()).toEqual([31, 30, 27, 11]);
      expect(obj249.getPropertyNumbers()).toEqual([18, 15, 14, 11, 10, 9, 6, 5, 4, 3, 2]);
    });

    it("should know the defined values for properties", function() {
      var obj1 = this.objects.get(1);
      expect(obj1.getPropertyValue(18)).toEqual([0x46, 0xdc, 0x42, 0xc2, 0x42, 0xb4]);
      expect(obj1.getPropertyValue(16)).toEqual([0x82]);
    });

    it("should use the default value for properties without specified values", function() {
      var obj1 = this.objects.get(1);
      expect(obj1.getPropertyValue(1)).toEqual(0);
    });
  });

  describe("for ZTUU", function() {
    beforeEach(function() {
      this.machine = new bzork.Machine(bzork.spec.storyData['ztuu']);
      this.objects = this.machine.objectTable;
    });

    it("should have a maximum of 64 properties", function() {
      expect(this.objects.getMaxProperties()).toEqual(64);
    });

    it("should have an object size of 14", function() {
      expect(this.objects.getObjectSize()).toEqual(14);
    });

    it("should retrieve objects with the correct property header address", function() {
      expect(this.objects.get(54).getPropertyHeaderAddr()).toEqual(0x1053);
    });

    it("should retrieve objects with the correct tree information", function() {
      var obj = this.objects.get(54);
      expect(obj.getParent()).toEqual(53);
      expect(obj.getSibling()).toEqual(56);
      expect(obj.getChild()).toEqual(55);
    });
  });
});
