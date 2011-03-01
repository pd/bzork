bzork.ObjectTable = function(machine, tableAddr) {
  this._machine = machine;
  this._addr = tableAddr;
};

bzork.ObjectTable.prototype = {
  get: function(i) {
    if (!this._boundsDiscovered)
      this._discoverBounds();

    if (i < 1 || i > this.getObjectCount())
      throw _.sprintf("Object %d out of bounds!", i);;

    return new bzork.Object(this._machine, this, i, this.getObjectAddr(i));
  },

  insertObject: function(objnum, parentnum) {
    var obj = this.get(objnum),
        parent = this.get(parentnum),
        origParentNum = obj.getParent();

    if (origParentNum !== 0) {
      var origParent = this.get(origParentNum),
          childnum = origParent.getChild();
      if (childnum === objnum) {
        origParent.setChild(obj.getSibling());
      } else if (childnum !== 0) {
        var curobj = this.get(childnum);
        while (curobj.getSibling() !== objnum && curobj.getSibling() !== 0)
          curobj = this.get(curobj.getSibling());
        curobj.setSibling(obj.getSibling());
      }
    }

    obj.setSibling(parent.getChild());
    obj.setParent(parentnum);
    parent.setChild(objnum);
  },

  getProperty: function(obj, prop) {
    var obj = this.get(obj);
    return obj.getPropertyValue(prop);
  },

  setProperty: function(obj, prop, val) {
    var obj = this.get(obj);
    obj.setPropertyValue(prop, val);
  },

  getPropertyDataAddr: function(obj, prop) {
    var obj = this.get(obj);
    return obj.getDataAddr(prop);
  },

  getNextProperty: function(obj, prop) {
    var obj = this.get(obj);
    return obj.getNextPropertyNumber(prop);
  },

  testAttribute: function(obj, attr) {
    var obj = this.get(obj);
    return obj.testAttribute(attr);
  },

  setAttribute: function(obj, attr) {
    var obj = this.get(obj);
    return obj.setAttribute(attr);
  },

  getObjectSize: function() {
    if (this.getZcodeVersion() <= 3)
      return 9;
    else
      return 14;
  },

  getMaxProperties: function() {
    if (this.getZcodeVersion() <= 3)
      return 32;
    else
      return 64;
  },

  getPropertyAddrOffset: function() {
    if (this.getZcodeVersion() <= 3)
      return 7;
    else
      return 12;
  },

  getStartAddr: function() {
    return this._addr;
  },

  getEndAddr: function() {
    if (!this._boundsDiscovered)
      this._discoverBounds();
    return this.tableEndAddr;
  },

  getObjectCount: function() {
    if (!this._boundsDiscovered)
      this._discoverBounds();
    return this.objectCount;
  },

  getObjectAddr: function(i) {
    var offset = this.getStartAddr();
    offset += (this.getMaxProperties() - 1) * 2;
    offset += (i - 1) * this.getObjectSize();
    return offset;
  },

  getDefaultPropertyValue: function(i) {
    return this._machine.getUint8(this.getStartAddr() + i);
  },

  getZcodeVersion: function() {
    return this._machine.getZcodeVersion();
  },

  _discoverBounds: function() {
    var tableStart = this.getStartAddr(),
        tableEnd, dataStart, dataEnd,
        objectCount = 0;

    var objAddr, dataAddr;

    do {
      objectCount++;
      objAddr = this.getObjectAddr(objectCount);

      // Read the address of the property data to calculate their
      // bounds, too. Similar to bounds discovery for abbrevs.
      if (!dataStart || objAddr < dataStart) {
        objAddr += this.getPropertyAddrOffset();
        dataAddr = this._machine.getUint16(objAddr);
        objAddr += 2;

        if (!dataStart || dataAddr < dataStart)
          dataStart = dataAddr;
        if (!dataEnd || dataAddr > dataEnd)
          dataEnd = dataStart;
      }
    } while (objAddr < dataStart);

    tableEnd = objAddr - 1;

    this.objectCount = objectCount;
    this.tableEndAddr = tableEnd;
    this.dataStartAddr = dataStart;
    this.dataEndAddr = dataEnd; // XXX TODO wrong but fk it for now

    this._boundsDiscovered = true;
  }
};
