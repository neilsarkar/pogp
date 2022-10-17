import { InputType, Key } from "./enums";
import { KeyboardSnapshot } from "./KeyboardSnapshot";
import { MarshalInput, MAX_AXES, MAX_BUTTONS } from "./MarshalInput";
import { Pog } from "./types";

export class BrowserInput {
	buffer: ArrayBuffer;
	keys: boolean[];
	keyboardSnapshot : KeyboardSnapshot;

	constructor() {
		this.keys = [];
		this.buffer = new ArrayBuffer(
			MarshalInput.byteLength(MAX_BUTTONS, MAX_AXES)
		);

		window.addEventListener('keydown', (ev) => { this.keys[Key[ev.code]] = true; })
		window.addEventListener('keyup', (ev) => { this.keys[Key[ev.code]] = false; })
		window.addEventListener('blur', () => { this.keys = []; })
	}

	readInput() : ArrayBuffer {
		const keyboardInput = {
			type: InputType.Keyboard,
			keys: this.keys.map((k, i) => !!k ? i : -1).filter(v => v != -1)
		};

		MarshalInput.encodeKeyboard(this.buffer, keyboardInput);
		return this.buffer;
	}
}