import {BinaryWriter} from '../src/BinaryWriter';
import assert from 'assert';
import {describe, expect, it} from 'vitest';
import {toBinaryString} from '../src/lib'

describe('BinaryWriter', () => {
	describe('writeBool', function() {
		let table: [boolean[], number, number?][] = [
			[[true], 1],
			[[true, true], 3],
			[[true, false, true], 5],
			[[true, true, true, true, true, true, true, true], 255],
			[[false, false, false, false, false, false, false, false, true], 1, 1],
		];

		table.forEach(([bools, base10, byteIndex]) => {
			byteIndex = byteIndex || 0;
			it(`should write ${bools.join(',')} as ${base10} at byte ${byteIndex}`, () => {
				const writer = new BinaryWriter(null, 2);
				bools.forEach((binaryValue) => {
					writer.writeBool(binaryValue);
				})
				assert.equal(writer.buffer[byteIndex!], base10)
			})
		})

		it('plays nicely with other functions that affect offset', function() {
			const writer = new BinaryWriter(null, 3);
			writer.writeBool(true);
			writer.writeBool(true);
			writer.writeByte(66);
			writer.writeBool(true);
			writer.writeBool(false);
			writer.writeBool(true);
			assert.equal(writer.buffer[0], 0b00000011);
			assert.equal(writer.buffer[1], 66);
			assert.equal(writer.buffer[2], 0b00000101);
		})
	})

	describe('writeUInt8', function() {
		let table = [
			[1, 0x01],
			[64, 0x40],
			[255, 0xff]
		]

		table.forEach(([byte, hex]) => {
			it(`should write ${byte} as 0x${hex.toString(16)}`, function() {
				const writer = new BinaryWriter(null, 1);
				writer.writeUInt8(byte)
				assert.equal(writer.buffer[0], hex);
			})
		})

		it('should throw an exception if number is higher than max value', function() {
			const writer = new BinaryWriter(null, 1);
			assert.throws(() => writer.writeUInt8(256), {
				message: 'OverflowException: Tried to write byte 256, must be 0-255'
			})
		})
	})

	describe('writeUInt16', function() {
		let table : [number, string][] = [
			[1, '0x0001'],
			[255, '0x00ff'],
			[256, '0x0100'],
			[500, '0x01f4'],
		]
		table.forEach(([short, hex]) => {
			it(`should write ${short} as ${hex}`, () => {
				const arrayBuffer = new ArrayBuffer(2);
				const writer = new BinaryWriter(new Uint8Array(arrayBuffer));
				const uint16 = new Uint16Array(arrayBuffer);
				writer.writeUInt16(short)

				assert.equal(uint16[0], short)
			})
		})

		it('should throw an exception if number is higher than max value', function() {
			const writer = new BinaryWriter(new Uint8Array(2));
			assert.throws(() => writer.writeUInt16(65536), {
				message: 'OverflowException: Tried to write ushort 65536, must be 0-65535'
			})
		})
	})

	describe('writeUInt32', function() {
		let table = [
			[0],
			[1],
			[255],
			[256],
			[500],
			[0xFFFFFFFF]
		];

		table.forEach(([uint]) => {
			it(`should write ${uint}`, () => {
				const arrayBuffer = new ArrayBuffer(4);
				const writer = new BinaryWriter(new Uint8Array(arrayBuffer));
				const uint32 = new Uint32Array(arrayBuffer);
				writer.writeUInt32(uint)

				assert.equal(uint32[0], uint)
			})
		})

		it('catches overflow exceptions', function() {
			const writer = new BinaryWriter(new Uint8Array(4));
			assert.throws(() => writer.writeUInt32(0x1ffffffff), {
				message: 'OverflowException: Tried to write uint 8589934591, must be 0-4294967295'
			})
		})
	})

	describe('writeInt64', function() {
		let table = [
			-1n,
			0n,
			1n,
			4294967296n,
			-4294967296n,
			0x00FFFFFFFFFFFFFFn,
			0x7FFFFFFFFFFFFFFFn,
			-0x7FFFFFFFFFFFFFFFn
		];

		table.forEach((int64) => {
			it(`should write ${int64}`, () => {
				const arrayBuffer = new ArrayBuffer(8);
				const writer = new BinaryWriter(new Uint8Array(arrayBuffer));
				const int64Array = new BigInt64Array(arrayBuffer);
				writer.writeInt64(int64)

				assert.equal(int64Array[0].toString(), int64.toString())
			})
		})
	})

	describe('writeString', function() {
		let table = [
			'a',
			'asjdch/sdcsaDCMKASJMCKJNO@I#23490',
			'❤️',
			'🕳️🌱👨‍👩‍👧‍👦✌🏽',
			'𒀐', // 4 byte character
			'😀œ´®†¥¨ˆøπ¬˚∆˙©ƒ∂ßåΩ≈ç√∫˜µ≤ユーザーコードa' // https://stackoverflow.com/questions/63905684/how-can-a-3-byte-wide-utf-8-character-only-use-a-single-utf-16-code-unit
		];

		table.forEach((str) => {
			it(`should write ${str}`, () => {
				const encoder = new TextEncoder()
				const encodedString = encoder.encode(str)

				const arrayBuffer = new ArrayBuffer(4 + encodedString.length);
				const uint8Buffer = new Uint8Array(arrayBuffer)
				const writer = new BinaryWriter(uint8Buffer);
				writer.writeString(str)
				const serializedLength = (new Uint32Array(arrayBuffer, 0, 1))[0]
				expect(serializedLength).toEqual(encodedString.length);

				const decoder = new TextDecoder();
				const stringBuffer = new Uint8Array(arrayBuffer, 4, serializedLength)
				const decodedString = decoder.decode(stringBuffer)
				expect(decodedString).toEqual(str);
			})
		})
	})
})