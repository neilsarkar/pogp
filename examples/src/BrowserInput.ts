import { InputType, Key } from "./enums";
import { KeyboardSnapshot } from "./KeyboardSnapshot";
import { Pog } from "./types";

export class BrowserInput {
	keys: boolean[];
	keyboardSnapshot : KeyboardSnapshot;

	constructor() {
		this.keys = [];
		this.keyboardSnapshot = new KeyboardSnapshot();

		window.addEventListener('keydown', (ev) => { this.keys[Key[ev.code]] = true; })
		window.addEventListener('keyup', (ev) => { this.keys[Key[ev.code]] = false; })
		window.addEventListener('blur', () => { this.keys = []; })
	}

	readInput() {
		const keyboardInput = {
			type: InputType.Keyboard,
			keys: this.keys.map((k, i) => !!k ? i : -1).filter(v => v != -1)
		};

		this.keyboardSnapshot.addInput(keyboardInput);
	}
}