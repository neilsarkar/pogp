import { Key } from "./enums";
import { Pog } from "./types";

export const BUFFER_LENGTH = 10;

export class KeyboardSnapshot {
	inputs: Pog.KeyboardInput[];

	constructor() {
		this.inputs = [];
	}

	addInput(input: Pog.KeyboardInput) : void {
		// maintains a BUFFER_LENGTH lifo queue
		this.inputs.unshift(input);
		this.inputs = this.inputs.slice(0, BUFFER_LENGTH);
	}

	isKeyDown(key: Key): boolean {
		return this.isKey(key, 0) && !this.isKey(key, 1);
	}

	isKeyUp(key: Key): boolean {
		return !this.isKey(key, 0) && this.isKey(key, 1);
	}

	isKeyPressed(key: Key): boolean {
		return this.isKey(key, 0);
	}

	isKey(key: Key, pastFrame: number = 0): boolean {
		if (this.inputs.length <= pastFrame) { return false; }
		return this.inputs[pastFrame].keys.indexOf(key) != -1
	}
}