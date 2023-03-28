import {BinaryReader} from '../src/BinaryReader';
import {BinaryWriter} from '../src/BinaryWriter';
import {describe, it} from 'vitest';
import assert from 'assert';

describe('BinaryReader', function() {
	describe('readBool', function() {
		let table = [
			[false],
			[true],
			[true, false, false, false, false, false, true, false],
			[false, false, false, false, false, false, false, false, true]
		];

		table.forEach((values) => {
			it(`reads ${values.join(',')}`, () => {
				const writer = new BinaryWriter(null, 2);
				values.forEach(bool => {
					writer.writeBool(bool);
				})

				const reader = new BinaryReader(writer.buffer);
				values.forEach((bool, index) => {
					assert.equal(reader.readBool(), bool, `${bool} not found at ${index}. buffer: ${writer.buffer}`);
				})
			})
		})
	})

	describe('readUint8', function() {
		let table = [0, 1, 255];

		table.forEach((n) => {
			it(`reads ${n}`, () => {
				const writer = new BinaryWriter(null, 20);
				writer.writeUInt8(n);

				const reader = new BinaryReader(writer.buffer);
				assert.equal(reader.readUint8(), n)
			})
		})
	})

	describe('readUint16', function() {
		let table = [
			0, 1, 10, 255, 256, 65535
		];

		table.forEach((n) => {
			it(`reads ${n}`, () => {
				const writer = new BinaryWriter(null, 2);
				writer.writeUInt16(n);

				const reader = new BinaryReader(writer.buffer);
				assert.equal(reader.readUint16(), n)
			})
		})
	})

	describe('readInt64', function() {
		let table = [
			-0x7FFFFFFFFFFFFFFFn, -65536n,
			0n, 1n, 10n, 255n, 256n, 65535n, 65536n, 0x7FFFFFFFFFFFFFFFn
		];

		table.forEach((n) => {
			it(`reads ${n}`, () => {
				const writer = new BinaryWriter(null, 8);
				writer.writeInt64(n);

				const reader = new BinaryReader(writer.buffer);
				assert.equal(reader.readInt64(), n)
			})
		})
	})

	describe('readString', function() {
		let table = [
			'a',
			'asjdch/sdcsaDCMKASJMCKJNO@I#23490',
			'❤️',
			'🕳️🌱👨‍👩‍👧‍👦✌🏽',
			'𒀐', // 4 byte character
			'😀œ´®†¥¨ˆøπ¬˚∆˙©ƒ∂ßåΩ≈ç√∫˜µ≤ユーザーコードa' // https://stackoverflow.com/questions/63905684/how-can-a-3-byte-wide-utf-8-character-only-use-a-single-utf-16-code-unit
		];

		table.forEach((str) => {
			it(`reads ${str}`, () => {
				const writer = new BinaryWriter(null, 100);
				writer.writeString(str);

				const reader = new BinaryReader(writer.buffer);
				assert.equal(reader.readString(), str)
			})
		})
	})
})
