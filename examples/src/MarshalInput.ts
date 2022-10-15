import { BinaryWriter } from "./BinaryWriter.js";
import { Pog } from "./types";

const MAX_BUTTONS = 20;
const MAX_AXES = 10;
const KEYBOARD_LENGTH = 1 + 4 + 4; // type, long, long

export class MarshalInput {
	static buffer = new ArrayBuffer(
		MarshalInput.byteLength(MAX_BUTTONS, MAX_AXES)
	);

	static encodeGamepad(input: Pog.GamepadInput, writer?: BinaryWriter) : Uint8Array {
		let {buttons, axes} = input;
		buttons = buttons || [];
		axes = axes || [];
		if (!writer) {
			writer = new BinaryWriter(
				new Uint8Array(
					MarshalInput.buffer,
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