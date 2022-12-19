export class BinaryWriter {
	buffer: Uint8Array;
	offset: number; 	 // this is the current offset in bytes
	bitOffset: number; // current offset in bits within the given byte for bools

	constructor(buffer?: Uint8Array | null, length?: number) {
		this.buffer = buffer || new Uint8Array(length);
		this.offset = 0;
		this.bitOffset = 0;
	}

	writeBool(value: boolean) {
		this.buffer[this.offset] |= (value ? 1 : 0) << this.bitOffset++;
		if (this.bitOffset == 8) {
			this.offset++;
			this.bitOffset = 0;
		}
	}

	writeUInt8(value: number) {
		if (256 <= value || value < 0) { throw new Error(`OverflowException: Tried to write byte ${value}, must be 0-255`); }
		this.checkOffsets(1)

		this.buffer[this.offset++] = value;
	}

	writeUInt16(value: number) {
		if (65536 <= value || value < 0) { throw new Error(`OverflowException: Tried to write ushort ${value}, must be 0-65535`); }
		this.checkOffsets(2);

		this.buffer[this.offset++] = value & 0xff;
		this.buffer[this.offset++] = (value >> 8) & 0xff;
	}

	writeUInt32(value: number) {
		if (0xffffffff < value || value < 0) { throw new Error(`OverflowException: Tried to write uint ${value}, must be 0-4294967295`)}
		this.checkOffsets(4);

		this.buffer[this.offset++] = (value >> 8 * 0) & 0xff;
		this.buffer[this.offset++] = (value >> 8 * 1) & 0xff;
		this.buffer[this.offset++] = (value >> 8 * 2) & 0xff;
		this.buffer[this.offset++] = (value >> 8 * 3) & 0xff;
	}

	writeInt64(value: bigint) {
		if (0x7FFFFFFFFFFFFFFF < value || value < -0x7FFFFFFFFFFFFFFF) { throw new Error(`OverflowException: Tried to write int64 ${value}, must be -9223372036854775807 to 9223372036854775807`)}
		this.checkOffsets(8);

		this.buffer[this.offset++] = Number((value >> 8n * 0n) & 0xffn);
		this.buffer[this.offset++] = Number((value >> 8n * 1n) & 0xffn);
		this.buffer[this.offset++] = Number((value >> 8n * 2n) & 0xffn);
		this.buffer[this.offset++] = Number((value >> 8n * 3n) & 0xffn);
		this.buffer[this.offset++] = Number((value >> 8n * 4n) & 0xffn);
		this.buffer[this.offset++] = Number((value >> 8n * 5n) & 0xffn);
		this.buffer[this.offset++] = Number((value >> 8n * 6n) & 0xffn);
		this.buffer[this.offset++] = Number((value >> 8n * 7n) & 0xffn);
	}

	writeByte(value: number) {
		this.writeUInt8(value);
	}

	private checkOffsets(byteLength: number) {
		// if we were encoding bools into the current byte, move to the next byte
		if (this.bitOffset > 0) { this.offset++; this.bitOffset = 0;}
		// check that the buffer has the capacity to write the number we want to write
		if (this.offset + byteLength > this.buffer.length) { throw new Error(`Tried to write ${length} bytes but we only have ${this.buffer.length - this.offset} left.`); }
	}
}
