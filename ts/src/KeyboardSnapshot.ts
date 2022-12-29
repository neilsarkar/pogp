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

	// todo: accept an array of keys
	/** isKeyDown returns true only for the frame that the key is first pressed down */
	isKeyDown(key: Key): boolean {
		return this.isKey(key, 0) && !this.isKey(key, 1);
	}

	/** isKeyUp returns true only for the frame that the key is released */
	isKeyUp(key: Key): boolean {
		return !this.isKey(key, 0) && this.isKey(key, 1);
	}

	/** isKeyPressed returns true for every frame the key is being pressed down, including the first frame and excluding the frame it is released */
	isKeyPressed(key: Key): boolean {
		return this.isKey(key, 0);
	}

	/** isKey returns true for every frame the key is being pressed down, including the first frame and excluding the frame it is released */
	isKey(key: Key, pastFrame: number = 0): boolean {
		if (this.inputs.length <= pastFrame) { return false; }
		return this.inputs[pastFrame].keys.indexOf(key) != -1
	}
}