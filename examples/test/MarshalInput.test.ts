import {MarshalInput, MAX_AXES, MAX_BUTTONS} from '../src/MarshalInput';
import {toBinaryString, toHexString} from '../src/lib';
import {InputType, ButtonPosition, Hand, Key} from '../src/enums';
import assert from 'assert';
import { Pog } from '../src/types';



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
		const table : Pog.GamepadInput[] = [
			{
				type: InputType.Gamepad,
				id: 'null axes and buttons',
				axes: null,
				buttons: null
			},
			{
				type: InputType.Gamepad,
				id: 'one button',
				axes: null,
				buttons: [
					{ position: ButtonPosition.Middle, value: 9500 },
				]
			},
			{
				type: InputType.Gamepad,
				id: 'one axis',
				axes: [
					{
						hand: Hand.Left,
						value: [50n, 50n]
					}
				],
				buttons: null,
			},
		]

		table.forEach(input => {
			it(`processes ${input.id}`, () => {
				const buffer = MarshalInput.encodeGamepad(input);
				const decodedInput = MarshalInput.decodeGamepad(buffer);

				if (input.buttons === null) { input.buttons = []; }
				if (input.axes === null) { input.axes = []; }

				expect(decodedInput.type).toEqual(input.type);

				expect(decodedInput.buttons).toEqual(input.buttons);
				expect(decodedInput.axes).toEqual(input.axes);
			})
		})
	})

	describe('.decodeKeyboard', function() {
		const table: Pog.KeyboardInput[] = [
			{
				type: InputType.Keyboard,
				keys: [],
			},
			{
				type: InputType.Keyboard,
				keys: [Key.ArrowDown]
			},
			{
				type: InputType.Keyboard,
				keys: [Key.ArrowDown, Key.ArrowLeft],
			},
			{
				type: InputType.Keyboard,
				keys: [Key.Backspace, Key.ControlLeft, Key.AltLeft]
			},
			{
				type: InputType.Keyboard,
				keys: [Key.IntlRo]
			}
		];

		table.forEach(input => {
			it(`processes keys: ${input.keys.join(',')}`, () => {
				const arrayBuffer = new ArrayBuffer(MarshalInput.byteLength(MAX_BUTTONS, MAX_AXES));

				MarshalInput.encodeKeyboard(arrayBuffer, input);
				const decodedInput = MarshalInput.decodeKeyboard(arrayBuffer);

				expect(decodedInput).toEqual(input);
			})
		});
	})
})