import { ButtonPosition, Hand, InputType } from './enums';
import { BinaryWriter } from './BinaryWriter';
import type { Pog } from './types'

export function readGamepad(gamepad: Gamepad) : Pog.GamepadInput {
	switch(gamepad.id) {
		case 'Stadia Controller rev. A (STANDARD GAMEPAD Vendor: 18d1 Product: 9400)':
			return stadiaController(gamepad);
	}
}

export function gamepadToBinary(input: Pog.GamepadInput, writer?: BinaryWriter) : Uint8Array {
	if (!writer) {
		writer = new BinaryWriter(new Uint8Array(buffer, keyboardLength, byteLength(input.buttons.length, input.axes.length)));
	}

	writer.writeUInt8(input.type);

	writer.writeUInt16(input.buttons.length);
	writer.writeUInt16(input.axes.length);

	for (var button of input.buttons) {
		writer.writeByte(button.position);
		writer.writeUInt32(button.value);
	}

	for(var axes of input.axes) {
		writer.writeByte(axes.hand);

		writer.writeInt64(axes.value[0])
		writer.writeInt64(axes.value[1])
	}

	return writer.buffer;
}

const keyboardLength = 1 + 4 + 4;

export function keyboardToBinary(input: Pog.KeyboardInput, writer?: BinaryWriter) : Uint8Array {
	if (!writer) { writer = new BinaryWriter(null, keyboardLength)}

	writer.buffer.fill(0, 0, keyboardLength);
	for(let i = 0; i < 255; i++) {
		const isPressed = !!input.keys.find(k => k == i);
		writer.writeBool(isPressed);
	}
	return writer.buffer;
}

export function toHexString(buffer: Uint8Array) : string {
	let ret = '0x';
	buffer.forEach(byte => {
		let byteString = byte.toString(16);
		if (byteString.length < 2) { byteString = '0'+byteString; }
		ret += byteString;
	})
	return ret;
}

export function toBinaryString(buffer: Uint8Array) : string {
	return Array.from(buffer).map(byte => {
		// https://stackoverflow.com/questions/1267283/how-can-i-pad-a-value-with-leading-zeros
		return ('00000000' + byte.toString(2)).slice(-8)
	}).join(' ')
}

const maxButtons = 20;
const maxAxes = 10;
const buffer = new ArrayBuffer(
	byteLength(maxButtons, maxAxes)
);

function byteLength(numButtons: number, numAxes: number) : number {
	return 1 + 2 + 2 + 8192 + 69 * numButtons + 129 * numAxes;
}

function stadiaController(gamepad: Gamepad) : Pog.GamepadInput {
	const defaultAxesMapping = [
		{
			hand: Hand.Left,
			value: [0,1],
		},
		{
			hand: Hand.Right,
			value: [2,3],
		}
	];

	const defaultButtonMapping = [
		{ label: 'A', position: ButtonPosition.RightFaceBottom },
		{ label: 'B', position: ButtonPosition.RightFaceRight },
		{ label: 'X', position: ButtonPosition.RightFaceLeft },
		{ label: 'Y', position: ButtonPosition.RightFaceTop },

		{ label: 'L1', position: ButtonPosition.LeftShoulderFront },
		{ label: 'R1', position: ButtonPosition.RightShoulderFront },
		{ label: 'L2', position: ButtonPosition.LeftShoulderBack },
		{ label: 'R2', position: ButtonPosition.RightShoulderBack },

		{ position: ButtonPosition.MiddleLeft },
		{ position: ButtonPosition.MiddleRight },
		{ position: ButtonPosition.LeftThumbstick },
		{ position: ButtonPosition.RightThumbstick },

		{ position: ButtonPosition.LeftFaceTop },
		{ position: ButtonPosition.LeftFaceBottom },
		{ position: ButtonPosition.LeftFaceLeft },
		{ position: ButtonPosition.LeftFaceRight },

		{ label: 'S', position: ButtonPosition.Middle }
	];

	return {
		id: gamepad.id,
		type: InputType.Gamepad,
		productId: '9400',
		vendorId: '18d1',
		axes: defaultAxesMapping.map((mapping) => ({
			...mapping,
			value: [
				BigInt(percentAsInt(gamepad.axes[mapping.value[0]])),
				BigInt(percentAsInt(gamepad.axes[mapping.value[1]]))
			]
		})),
		buttons: gamepad.buttons.filter(
			(_, i) => i < defaultButtonMapping.length
		).map((button, i) => ({
			label: defaultButtonMapping[i].label,
			position: defaultButtonMapping[i].position,
			value: percentAsInt(button.value)
		})),
	};
}

function percentAsInt(float: number) : number {
	return Math.trunc(float * 10000);
}

export function clamp(value: number, min: number, max: number) {
	return Math.min(Math.max(value, min), max);
}