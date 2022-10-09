import {BinaryWriter} from '../dist/BinaryWriter.js';
import assert from 'assert';

describe('BinaryWriter', () => {
	let boolsTable = [
		[[true], 1],
		[[true, true], 3],
		[[true, false, true], 5],
		[[true, true, true, true, true, true, true, true], 255],
		[[false, false, false, false, false, false, false, false, true], 1, 1]
	];

	boolsTable.forEach(([values, expectedDecimal, byteIndex]) => {
		byteIndex = byteIndex || 0;
		it(`should write ${values.join(',')} as ${expectedDecimal} at byte ${byteIndex}`, () => {
			const writer = new BinaryWriter(new Uint8Array(2));
			values.forEach((binaryValue) => {
				writer.writeBool(binaryValue);
			})
			assert.equal(writer.buffer[byteIndex], expectedDecimal)
		})
	})
})