(function() {
function mzDataView(buffer, byteOffset, byteLength){
	this.buffer=buffer;
	this.byteOffset=byteOffset||0;
	this.byteLength=byteLength||buffer.byteLength;

        var arr = Uint8Array(buffer);
        if (arr.slice)
	  this.bytes=arr.slice(byteOffset||0,(byteOffset||0)+byteLength||buffer.byteLength);
        else
          this.bytes=arr.subarray(byteOffset||0,(byteOffset||0)+byteLength||buffer.byteLength);
}

mzDataView.prototype={
	getInt8:function(byteOffset){
		if(byteOffset>this.bytes.length){throw new Error("INDEX_SIZE_ERR")}
		var rawByte=this.bytes[byteOffset];
		if(rawByte>=128){
			return rawByte-256;
		} else{return rawByte};
	},
	getUint8:function(byteOffset){
		if(byteOffset>this.bytes.length){throw new Error("INDEX_SIZE_ERR")}
		return this.bytes[byteOffset];
	},
	getInt16:function(byteOffset,littleEndian){
		if(byteOffset+1>this.bytes.length){throw new Error("INDEX_SIZE_ERR")}
		if(littleEndian){
			var rawShort=(this.bytes[byteOffset])+(this.bytes[byteOffset+1]<<8);
		} else{
			var rawShort=(this.bytes[byteOffset]<<8)+(this.bytes[byteOffset+1]);
		}
		if(rawShort>0x7fff){
			return rawShort-0x10000;
		} else{return rawShort;}
	},
	getUint16:function(byteOffset,littleEndian){
		if(byteOffset+1>this.bytes.length){throw new Error("INDEX_SIZE_ERR")}
		if(littleEndian){
			var rawShort=(this.bytes[byteOffset])+(this.bytes[byteOffset+1]<<8);
		} else{
			var rawShort=(this.bytes[byteOffset]<<8)+(this.bytes[byteOffset+1]);
		}
		return rawShort;
	},
	getInt32:function(byteOffset,littleEndian){
		if(byteOffset+3>this.bytes.length){throw new Error("INDEX_SIZE_ERR")}
		if(littleEndian){
			var rawInt=(this.bytes[byteOffset])+(this.bytes[byteOffset+1]<<8)+(this.bytes[byteOffset+2]<<16)+(this.bytes[byteOffset+3]<<24);
		} else{
			var rawInt=(this.bytes[byteOffset]<<24)+(this.bytes[byteOffset+1]<<16)+(this.bytes[byteOffset+2]<<8)+(this.bytes[byteOffset+3]);
		}
		return rawInt;
	},
	getUint32:function(byteOffset,littleEndian){
		if(byteOffset+3>this.bytes.length){throw new Error("INDEX_SIZE_ERR")}
		if(littleEndian){
			var rawInt=(this.bytes[byteOffset])+(this.bytes[byteOffset+1]<<8)+(this.bytes[byteOffset+2]<<16)+(this.bytes[byteOffset+3]<<24);
		} else{
			var rawInt=(this.bytes[byteOffset]<<24)+(this.bytes[byteOffset+1]<<16)+(this.bytes[byteOffset+2]<<8)+(this.bytes[byteOffset+3]);
		}
		if(rawInt<0){
			return 0x800000000+rawInt;
		} else{return rawInt}
	},
	//I'm not sure about these floating point ones
	getFloat32:function(byteOffset,littleEndian){
		if(byteOffset+3>this.bytes.length){throw new Error("INDEX_SIZE_ERR")}
		return Float32Array(Int32Array([this.getInt32(byteOffset,littleEndian)]).buffer)[0]
	},
	getFloat64:function(byteOffset,littleEndian){
		if(byteOffset+7>this.bytes.length){throw new Error("INDEX_SIZE_ERR")}
		return Float64Array(Int32Array([this.getInt32(byteOffset,littleEndian),this.getInt32(byteOffset+4,littleEndian)]).buffer)[0]
	},
	
	//Begin setter functions
	setInt8:function(byteOffset,value,littleEndian){
		if(byteOffset>this.bytes.length){throw new Error("INDEX_SIZE_ERR")}
		this.bytes[byteOffset]=value;
	},
	setUint8:function(byteOffset,value,littleEndian){
		if(byteOffset>this.bytes.length){throw new Error("INDEX_SIZE_ERR")}
		this.bytes[byteOffset]=value;
	},
	setInt16:function(byteOffset,value,littleEndian){
		if(byteOffset+1>this.bytes.length){throw new Error("INDEX_SIZE_ERR")}
		if(littleEndian){
			this.bytes[byteOffset]=value;
			this.bytes[byteOffset+1]=value>>>8;
		} else{
			this.bytes[byteOffset]=value>>>8;
			this.bytes[byteOffset+1]=value;
		}
	},
	setUint16:function(byteOffset,value,littleEndian){
		if(byteOffset+1>this.bytes.length){throw new Error("INDEX_SIZE_ERR")}
		if(littleEndian){
			this.bytes[byteOffset+1]=value>>>8;
			this.bytes[byteOffset]=value;
		} else{
			this.bytes[byteOffset+1]=value;
			this.bytes[byteOffset]=value>>>8;
		}
	},
	setInt32:function(byteOffset,value,littleEndian){
		if(byteOffset+3>this.bytes.length){throw new Error("INDEX_SIZE_ERR")}
		if(littleEndian){
			this.bytes[byteOffset+3]=value>>>24;
			this.bytes[byteOffset+2]=value>>>16;
			this.bytes[byteOffset+1]=value>>>8;
			this.bytes[byteOffset]=value;
		} else{
			this.bytes[byteOffset]=value>>>24;
			this.bytes[byteOffset+1]=value>>>16;
			this.bytes[byteOffset+2]=value>>>8;
			this.bytes[byteOffset+3]=value;
		}
	},
	setUint32:function(byteOffset,value,littleEndian){
		if(byteOffset+3>this.bytes.length){throw new Error("INDEX_SIZE_ERR")}
		if(littleEndian){
			this.bytes[byteOffset]=value;
			this.bytes[byteOffset+1]=value>>>8;
			this.bytes[byteOffset+2]=value>>>16;
			this.bytes[byteOffset+3]=value>>>24;
		} else{
			this.bytes[byteOffset]=value>>>24;
			this.bytes[byteOffset+1]=value>>>16;
			this.bytes[byteOffset+2]=value>>>8;
			this.bytes[byteOffset+3]=value;
		}
	},
	setFloat32:function(byteOffset,value,littleEndian){
		if(byteOffset+3>this.bytes.length){throw new Error("INDEX_SIZE_ERR")}
		this.setInt32(byteOffset,Int32Array(Float32Array([value]).buffer)[0],littleEndian)
	},
	setFloat64:function(byteOffset,value,littleEndian){
		if(byteOffset+7>this.bytes.length){throw new Error("INDEX_SIZE_ERR")}
		var words=Int32Array(Float64Array[value]);
		this.setInt32(byteOffset+1,words[1],littleEndian);
		this.setInt32(byteOffset,words[0],littleEndian);
	}
}

if (typeof DataView === "undefined")
  window.DataView = mzDataView;

}());
