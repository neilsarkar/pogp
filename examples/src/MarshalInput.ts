import { BinaryReader } from "./BinaryReader";
import { BinaryWriter } from "./BinaryWriter";
import { InputType } from "./enums";
import { toBinaryString } from "./lib";
import { Pog } from "./types";

const MAX_BUTTONS = 20;
const MAX_AXES = 10;
const KEYBOARD_LENGTH = 1 + 4 + 4; // type, long, long

export class MarshalInput {
	static marshalBuffer = new ArrayBuffer(
		MarshalInput.byteLength(MAX_BUTTONS, MAX_AXES)
	);

	static decodeGamepad(buffer: Uint8Array) : Pog.GamepadInput {
		let input : Pog.GamepadInput = {
			type: InputType.Gamepad,
			id: 'unknown',
			axes: [],
			buttons: [],
		}

		var reader = new BinaryReader(buffer);

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

	static encodeGamepad(input: Pog.GamepadInput, writer?: BinaryWriter) : Uint8Array {
		let {buttons, axes} = input;
		buttons = buttons || [];
		axes = axes || [];
		if (!writer) {
			writer = new BinaryWriter(
				new Uint8Array(
					MarshalInput.marshalBuffer,
					KEYBOARD_LENGTH,
					MarshalInput.byteLength(buttons.length, axes.length)
				)
			);
		}

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

	static byteLength(numButtons: number, numAxes: number) : number {
		return 1 + 2 + 2 + 69 * numButtons + 129 * numAxes;
	}
}