export class BinaryReader {
	buffer: Uint8Array;
	offset: number;
	bitOffset: number;

	constructor(buffer: Uint8Array) {
		this.buffer = buffer || new Uint8Array(length);
		this.offset = 0;
		this.bitOffset = 0;
	}

	readBool() : boolean {
		const ret = !!(this.buffer[this.offset] & 1 << this.bitOffset++);
		if (this.bitOffset == 8) {
			this.bitOffset = 0;
			this.offset++;
		}
		return ret;
	}
}