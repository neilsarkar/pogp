import { ButtonPosition, Hand, InputType } from './enums.js';
import { BinaryWriter } from './BinaryWriter.js';
import type { Pog } from './types'

export function readGamepad(gamepad: Gamepad) : Pog.GamepadInput {
	switch(gamepad.id) {
		case 'Stadia Controller rev. A (STANDARD GAMEPAD Vendor: 18d1 Product: 9400)':
			return stadiaController(gamepad);
	}
}

export function gamepadToBinary(input: Pog.GamepadInput) : Uint8Array {
	const ret = new Uint8Array(buffer, keyboardLength, byteLength(input.buttons.length, input.axes.length))
	ret[0] = input.type;

	ret[1] = input.buttons.length & 0xff; // least significant 8 bits
	ret[2] = (input.buttons.length << 8) & 0xff; // next 8 bits

	ret[3] = input.axes.length & 0xff;
	ret[4] = (input.axes.length << 8) & 0xff; // next 8 bits

	let offset = 5;
	for(var button of input.buttons) {
		ret[offset++] = button.position;

		ret[offset++] = (button.value << 8 * 0) & 0xff;
		ret[offset++] = (button.value << 8 * 1) & 0xff;
		ret[offset++] = (button.value << 8 * 2) & 0xff;
		ret[offset++] = (button.value << 8 * 3) & 0xff;
	}

	for(var axes of input.axes) {
		ret[offset++] = axes.hand;

		for (let i = 0n; i < 8n; i++) {
			ret[offset++] = Number((axes.value[0] << 8n * i) & 0xffn);
		}
		for (let i = 0n; i < 8n; i++) {
			ret[offset++] = Number((axes.value[1] << 8n * i) & 0xffn);
		}
	}

	return ret;
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

export function toBinaryString(buffer: Uint8Array) : string {
	let ret = '';
	buffer.forEach(byte => {
		ret += ret.length == 0 ? '' : ' ';
		let byteString = byte.toString(2);
		while(byteString.length < 8) {
			byteString = '0' + byteString;
		}
		ret += byteString;
	})
	return ret;
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