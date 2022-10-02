import {Hand, InputType, ButtonPosition} from './PogEnum';

export type Inputs = {
	frame: bigint,
	inputs: Input[]
}

export type Input = {
	type: InputType,
	id: string,
	buttons: Button[],
	axes: Axes[],
	vendorId?: string,
	productId?: string,
	vendorName?: string,
	productName?: string,
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