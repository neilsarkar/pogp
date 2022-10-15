import {MarshalInput} from '../dist/MarshalInput.js';
import {toHexString} from '../dist/lib.js';
import {InputType, ButtonPosition, Hand} from '../dist/enums.js';
import assert from 'assert';

describe('MarshalInput', function() {
	describe('.encodeGamepad', function() {
		it('encodes a valid gamePad to binary', function() {
			const input = {
				id: 'NES Controller',
				type: InputType.Gamepad,
				axes: null,
				buttons: [
					{
						position: ButtonPosition.LeftFaceTop,
						value: 0,
					},
					{
						position: ButtonPosition.LeftFaceRight,
						value: 10000,
					},
					{
						position: ButtonPosition.LeftFaceBottom,
						value: 0,
					},
					{
						position: ButtonPosition.LeftFaceLeft,
						value: 0
					},
					{
						label: 'A',
						position: ButtonPosition.RightFaceRight,
						value: 10000
					},
					{
						label: 'B',
						position: ButtonPosition.RightFaceLeft,
						value: 10000
					}
				]
			}

			const buffer = MarshalInput.encodeGamepad(input);

			assert.equal(toHexString(buffer), '0x0106000000010000000002102700000300000000040000000009102700000b10270000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000');
		})
	})

	describe('.decodeGamepad', function() {
		const table = [
			{
				id: 'null axes and buttons',
				axes: null,
				buttons: null
			},
			{
				id: 'one button',
				axes: null,
				buttons: [
					{ position: ButtonPosition.Middle, label: 'nice', value: 9500 },
				]
			},
			{
				id: 'one axis',
				axes: [
					{
						hand: Hand.left,
						value: [50n, 50n]
					}
				]
			},
		]

		table.forEach(input => {
			it(`processes ${input.id}`, () => {
				const buffer = MarshalInput.encodeGamepad(input);
				const decodedInput = MarshalInput.decodeGamepad(buffer);

				assert.deepStrictEqual(decodedInput, input);
			})
		})
	})
})