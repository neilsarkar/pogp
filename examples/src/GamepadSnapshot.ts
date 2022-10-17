import { ButtonPosition, Hand } from "./enums";
import { Pog } from "./types";

export const BUFFER_LENGTH = 10;

export class GamepadSnapshot {
	inputs: Pog.GamepadInput[];

	constructor() {
		this.inputs = [];
	}

	addInput(input: Pog.GamepadInput) : void {
		// maintains a BUFFER_LENGTH lifo queue
		this.inputs.unshift(input);
		this.inputs = this.inputs.slice(0, BUFFER_LENGTH);
	}

	getAxes(hand: Hand) : Pog.Axes {
		return this.inputs[0].axes.find(a => a.hand == hand)
	}

	isButtonDown(position: ButtonPosition) : boolean {
		return this.isButton(position) && !this.isButton(position, 1);
	}

	isButtonUp(position: ButtonPosition): boolean {
		return !this.isButton(position, 0) && this.isButton(position, 1);
	}

	isKeyPressed(position: ButtonPosition): boolean {
		return this.isButton(position, 0);
	}

	isButton(position: ButtonPosition, pastFrame: number = 0) : boolean {
		if (this.inputs.length <= pastFrame) { return false; }
		const button = this.inputs[pastFrame].buttons.find(b => b.position == position);
		return button && button.value > 0;
	}
}