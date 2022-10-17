import { InputType, ButtonPosition, Hand, Key } from "./enums"
import { KeyboardSnapshot } from "./KeyboardSnapshot";

export declare namespace Pog {
	export type Inputs = {
		frame: bigint,
		inputs: Input[]
	}

	export type Input = GamepadInput | KeyboardInput;

	export type GamepadInput = {
		type: InputType,
		id: string,
		buttons: Button[],
		axes: Axes[],
		vendorId?: string,
		productId?: string,
		vendorName?: string,
		productName?: string,
	}

	export type KeyboardInput = {
		type: InputType,
		keys: Key[]
	}

	export type Button = {
		value: number,
		label?: string,
		touched?: boolean,
		position?: ButtonPosition
	}

	export type Axes = {
		value: bigint[],
		hand?: Hand,
	}

	export interface Tick {
		(frame: bigint, keyboard: KeyboardSnapshot): void;
	}
}
