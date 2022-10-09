export class BinaryWriter {
	buffer: Uint8Array;
	offset: number; // this is the current offset in bits (not bytes)

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
}
