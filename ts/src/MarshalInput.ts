import { BinaryReader } from "./BinaryReader";
import { BinaryWriter } from "./BinaryWriter";
import { InputType } from "./enums";
import { Pog } from "./types";

export const MAX_BUTTONS = 20;
export const MAX_AXES = 10;
export const KEYBOARD_LENGTH = 1 + 8 + 8; // type, long, long (16*8 = 128 key bools)
export const KEYBOARD_KEY_COUNT = 128;

export class MarshalInput {
	static decodeGamepad(buffer: ArrayBuffer) : Pog.GamepadInput {
		let input : Pog.GamepadInput = {
			type: InputType.Gamepad,
			id: 'unknown',
			axes: [],
			buttons: [],
		}

		var reader = new BinaryReader(new Uint8Array(
			buffer,
			KEYBOARD_LENGTH
		));

		input.type = reader.readUint8();
		const buttonLength = reader.readUint16();
		const axesLength = reader.readUint16();

		for(var i = 0; i < buttonLength; i++) {
			const position = reader.readUint8();
			const value = reader.readUint32();
			input.buttons.push({position, value})
		}

		for (var i = 0; i < axesLength; i++) {
			const hand = reader.readUint8();
			const x = reader.readInt64();
			const y = reader.readInt64();
			input.axes.push({
				hand,
				value: [x, y]
			})
		}
		return input;
	}

	static encodeGamepad(buffer: ArrayBuffer, input: Pog.GamepadInput) : Uint8Array {
		let {buttons, axes} = input;
		buttons = buttons || [];
		axes = axes || [];
		const writer = new BinaryWriter(
			new Uint8Array(
				buffer,
				KEYBOARD_LENGTH,
				MarshalInput.byteLength(buttons.length, axes.length)
			)
		);

		writer.writeUInt8(input.type);

		writer.writeUInt16(buttons.length);
		writer.writeUInt16(axes.length);

		for (var button of buttons) {
			writer.writeByte(button.position);
			writer.writeUInt32(button.value);
		}

		for(var axis of axes) {
			writer.writeByte(axis.hand);

			writer.writeInt64(axis.value[0]);
			writer.writeInt64(axis.value[1]);
		}

		return writer.buffer;
	}

	static encodeKeyboard(buffer: ArrayBuffer, input: Pog.KeyboardInput) : Uint8Array {
		const {keys} = input;
		const writer = new BinaryWriter(
			new Uint8Array(
				buffer,
				0,
				KEYBOARD_LENGTH
			)
		)

		writer.buffer.fill(0, 0, KEYBOARD_LENGTH);
		writer.writeUInt8(input.type);

		for(let i = 0; i < KEYBOARD_KEY_COUNT; i++) {
			const isPressed = !!keys.find(k => k == i);
			writer.writeBool(isPressed);
		}
		return writer.buffer;
	}

	static decodeKeyboard(buffer: ArrayBuffer) : Pog.KeyboardInput {
		const reader = new BinaryReader(
			new Uint8Array(buffer, 0, KEYBOARD_LENGTH)
		);

		let input : Pog.KeyboardInput = {
			type: reader.readUint8(),
			keys: []
		}

		for(let i = 0; i < KEYBOARD_KEY_COUNT; i++) {
			if (reader.readBool()) {
				input.keys.push(i)
			}
		}
		return input;
	}

	static byteLength(numButtons: number, numAxes: number) : number {
		return 1 + 2 + 2 + 69 * numButtons + 129 * numAxes;
	}
}