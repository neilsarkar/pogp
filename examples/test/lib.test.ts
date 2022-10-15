import {toBinaryString } from '../src/lib';
import assert from 'assert';

describe('toBinaryString', () => {
	let table = [
		{
			bytes: [0b00000001],
			output: '00000001'
		},
		{
			bytes: [0b00000001, 0b10000000],
			output: '00000001 10000000',
		},
		{
			bytes: [0b1, 0b1],
			output: '00000001 00000001'
		}
	];

	table.forEach(({bytes, output}) => {
		it(`should print ${bytes.join(' ')} as ${output}`, () => {
			var buff = new Uint8Array(bytes.length);
			bytes.forEach((b, i) => {
				buff[i] = b;
			})
			assert.equal(toBinaryString(buff), output)
		})
	})
})