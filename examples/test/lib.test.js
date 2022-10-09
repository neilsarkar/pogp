import {toBinaryString } from '../dist/lib.js';
import assert from 'assert';

describe('toBinaryString', () => {
	let table = [
		[[0b00000001], '00000001'],
		[[0b00000001, 0b10000000], '00000001 10000000'],
		[[0b1, 0b0], '00000001 00000000']
	];

	table.forEach(([bytes, str]) => {
		it(`should print ${bytes.join(' ')} as ${str}`, () => {
			var buff = new Uint8Array(bytes.length);
			bytes.forEach((b, i) => {
				buff[i] = b;
			})
			assert.equal(toBinaryString(bytes), str)
		})
	})
})