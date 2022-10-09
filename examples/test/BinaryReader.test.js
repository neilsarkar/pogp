import {BinaryReader} from '../dist/BinaryReader.js';
import {BinaryWriter} from '../dist/BinaryWriter.js';
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
})
