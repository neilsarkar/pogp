export class BinaryWriter {
	buffer: Uint8Array;
	offset: number; // this is the current offset in bits (not bytes)

	get bytePosition() {
		return Math.floor(this.offset / 8)
	}

	constructor(buffer: Uint8Array, length?: number) {
		this.buffer = buffer || new Uint8Array(length);
		this.offset = 0;
	}

	writeBool(value: boolean) {
		let bytePosition = Math.floor(this.offset / 8); // 0 = 0, 7 = 0, 8 = 1, 16 = 2
		let bitPosition = this.offset % 8; // 0 = 0, 7 = 7, 8 = 0
		if (value) { this.buffer[bytePosition] |= 1 << bitPosition; }
		this.offset++;
	}

	writeByte(value: number) {
		if (256 <= value || value < 0) { throw new Error(`OverflowException: Tried to write byte ${value}, must be 0-255`); }
		this.buffer[this.offset++] = value;
	}

	writeUInt16(value: number) {
		if (65536 <= value || value < 0) { throw new Error(`OverflowException: Tried to write ushort ${value}, must be 0-65535`); }
		this.buffer[this.offset++] = value & 0xff;
		this.buffer[this.offset++] = (value >> 8) & 0xff;
	}

	writeUInt32(value: number) {
		if (0xffffffff < value || value < 0) { throw new Error(`OverflowException: Tried to write uint ${value}, must be 0-4294967295`)}
		this.buffer[this.offset++] = (value >> 8 * 0) & 0xff;
		this.buffer[this.offset++] = (value >> 8 * 1) & 0xff;
		this.buffer[this.offset++] = (value >> 8 * 2) & 0xff;
		this.buffer[this.offset++] = (value >> 8 * 3) & 0xff;
	}

	writeInt64(value: bigint) {
		if (0x7FFFFFFFFFFFFFFF < value || value < -0x7FFFFFFFFFFFFFFF) { throw new Error(`OverflowException: Tried to write int64 ${value}, must be -9223372036854775807 to 9223372036854775807`)}
		this.buffer[this.offset++] = Number((value >> 8n * 0n) & 0xffn);
		this.buffer[this.offset++] = Number((value >> 8n * 1n) & 0xffn);
		this.buffer[this.offset++] = Number((value >> 8n * 2n) & 0xffn);
		this.buffer[this.offset++] = Number((value >> 8n * 3n) & 0xffn);
		this.buffer[this.offset++] = Number((value >> 8n * 4n) & 0xffn);
		this.buffer[this.offset++] = Number((value >> 8n * 5n) & 0xffn);
		this.buffer[this.offset++] = Number((value >> 8n * 6n) & 0xffn);
		this.buffer[this.offset++] = Number((value >> 8n * 7n) & 0xffn);
	}

	writeShort(value: number) {
		this.writeUInt16(value);
	}
}
