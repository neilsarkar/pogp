import * as Pog from './types';
import * as PogEnum from './PogEnum.js';

export function readInput(gamepad: Gamepad) : Pog.Input {
	switch(gamepad.id) {
		case 'Stadia Controller rev. A (STANDARD GAMEPAD Vendor: 18d1 Product: 9400)':
			return stadiaController(gamepad);
	}
}

function stadiaController(gamepad: Gamepad) : Pog.Input {
	const defaultAxesMapping = [
		{
			hand: PogEnum.Hand.Left,
			value: [0,1],
		},
		{
			hand: PogEnum.Hand.Right,
			value: [2,3],
		}
	];

	const defaultButtonMapping = [
		{ label: 'A', position: PogEnum.ButtonPosition.RightFaceBottom },
		{ label: 'B', position: PogEnum.ButtonPosition.RightFaceRight },
		{ label: 'X', position: PogEnum.ButtonPosition.RightFaceLeft },
		{ label: 'Y', position: PogEnum.ButtonPosition.RightFaceTop },

		{ label: 'L1', position: PogEnum.ButtonPosition.LeftShoulderFront },
		{ label: 'R1', position: PogEnum.ButtonPosition.RightShoulderFront },
		{ label: 'L2', position: PogEnum.ButtonPosition.LeftShoulderBack },
		{ label: 'R2', position: PogEnum.ButtonPosition.RightShoulderBack },

		{ position: PogEnum.ButtonPosition.MiddleLeft },
		{ position: PogEnum.ButtonPosition.MiddleRight },
		{ position: PogEnum.ButtonPosition.LeftThumbstick },
		{ position: PogEnum.ButtonPosition.RightThumbstick },

		{ position: PogEnum.ButtonPosition.LeftFaceTop },
		{ position: PogEnum.ButtonPosition.LeftFaceBottom },
		{ position: PogEnum.ButtonPosition.LeftFaceLeft },
		{ position: PogEnum.ButtonPosition.LeftFaceRight },

		{ label: 'S', position: PogEnum.ButtonPosition.Middle }
	];

	return {
		id: gamepad.id,
		type: PogEnum.InputType.Gamepad,
		productId: '9400',
		vendorId: '18d1',
		axes: defaultAxesMapping.map((mapping) => ({
			...mapping,
			value: [
				BigInt(percentAsInt(gamepad.axes[mapping.value[0]])),
				BigInt(percentAsInt(gamepad.axes[mapping.value[1]]))
			]
		})),
		buttons: gamepad.buttons.filter(
			(_, i) => i < defaultButtonMapping.length
		).map((button, i) => ({
			label: defaultButtonMapping[i].label,
			position: defaultButtonMapping[i].position,
			value: percentAsInt(button.value)
		})),
	};
}

function percentAsInt(float: number) : number {
	return Math.trunc(float * 10000);
}