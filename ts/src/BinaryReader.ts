export class BinaryReader {
	offset: number;
	bitOffset: number;
	dataView: DataView;
	decoder: TextDecoder;

	constructor(buffer: Uint8Array) {
		this.offset = 0;
		this.bitOffset = 0;
		this.dataView = new DataView(buffer.buffer, buffer.byteOffset, buffer.byteLength);
		this.decoder = new TextDecoder()
	}

	readBool() : boolean {
		const ret = !!(this.dataView.getUint8(this.offset) & 1 << this.bitOffset++);
		if (this.bitOffset == 8) {
			this.bitOffset = 0;
			this.offset++;
		}
		return ret;
	}

	readUint8() : number {
		return this.dataView.getUint8(this.offset++)
	}

	readUint16() : number {
		const ret = this.dataView.getUint16(this.offset, true);
		this.offset += 2;
		return ret;
	}

	readUint32() : number {
		const ret = this.dataView.getUint32(this.offset, true);
		this.offset += 4;
		return ret;
	}

	readInt64() : bigint {
		const ret = this.dataView.getBigInt64(this.offset, true);
		this.offset += 8;
		return ret;
	}

	readDouble() : number {
		const ret = this.dataView.getFloat64(this.offset, true);
		this.offset += 8;
		return ret;
	}

	readString() : string {
		const length = this.readUint32();
		const bytes = new Uint8Array(this.dataView.buffer, this.offset, length);
		const str = this.decoder.decode(bytes)
		this.offset += length;
		return str;
	}
}