import {toBinaryString } from '../src/lib';
import assert from 'assert';

describe('toBinaryString', () => {
	let table : [number[], string][] = [
		[[0b00000001], '00000001'],
		[[0b00000001, 0b10000000], '00000001 10000000'],
		[[0b1, 0b1], '00000001 00000001'],
	];

	table.forEach(([bytes, bitString]) => {
		it(`should print ${bytes.join(' ')} as ${bitString}`, () => {
			var buff = new Uint8Array(bytes.length);
			bytes.forEach((b, i) => {
				buff[i] = b;
			})
			assert.equal(toBinaryString(buff), bitString)
		})
	})
})