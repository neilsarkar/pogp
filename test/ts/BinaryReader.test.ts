import {BinaryReader} from '../../src/ts/BinaryReader';
import {BinaryWriter} from '../../src/ts/BinaryWriter';
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
			const writer = new BinaryWriter(null, 8);
			writer.writeInt64(n);

			const reader = new BinaryReader(writer.buffer);
			assert.equal(reader.readInt64(), n)
		})
	})
})
