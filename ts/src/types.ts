import { InputType, ButtonPosition, Hand, Key } from "./enums"

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

	export type MouseInput = {
		/** InputType, always InputType.Mouse */
		type: InputType,
		/** x coordinate in px */
		x: number,
		/** y coordinate in px */
		y: number,
		/** is mouse being clicked this frame */
		isDown: boolean
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
		(frame: bigint, now: number, inputs: ArrayBuffer): void;
	}

	export type Point = {
		x: number,
		y: number
	}

	export type Box = Point & {
		w: number,
		h: number
	}
}