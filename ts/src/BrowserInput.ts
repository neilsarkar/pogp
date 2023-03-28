import { ButtonPosition, Hand, InputType, Key } from "./enums.js";
import { KeyboardSnapshot } from "./KeyboardSnapshot.js";
import { MarshalInput, MAX_AXES, MAX_BUTTONS } from "./MarshalInput.js";
import { Pog } from "./types";

export class BrowserInput {
	buffer: ArrayBuffer;
	keys: boolean[];
	keyboardSnapshot : KeyboardSnapshot;
	mouse: Pog.MouseInput;

	constructor(element: Element) {
		this.keys = [];
		this.buffer = new ArrayBuffer(
			MarshalInput.byteLength(MAX_BUTTONS, MAX_AXES)
		);

		window.addEventListener('keydown', (ev) => { this.keys[Key[ev.code]] = true; })
		window.addEventListener('keyup', (ev) => { this.keys[Key[ev.code]] = false; })
		window.addEventListener('blur', () => { this.keys = []; this.mouse.isDown = false })

		listenSelectAll(this);

		this.mouse = {
			x: 0, y: 0, isDown: false, type: InputType.Mouse
		}
		if (!element) {
			throw new Error(`Tried to create BrowserInput but element is null`)
		}

		element.addEventListener('mousedown', (ev) => {
			this.mouse.isDown = true;
		})

		element.addEventListener('mouseup', (ev) => {
			this.mouse.isDown = false;
		})

		element.addEventListener('mousemove', (ev) => {
			this.mouse.x = (ev as MouseEvent).x;
			this.mouse.y = (ev as MouseEvent).y;
		})
	}

	readInput() : ArrayBuffer {
		const keyboardInput = {
			type: InputType.Keyboard,
			keys: this.keys.map((k, i) => !!k ? i : -1).filter(v => v != -1)
		};

		MarshalInput.encodeKeyboard(this.buffer, keyboardInput);

		MarshalInput.encodeMouse(this.buffer, this.mouse);

		const gamepads = navigator.getGamepads();
		for(var gamepad of gamepads) {
			if (!gamepad) { continue; }

			const gamepadInput = readGamepad(gamepad);
			MarshalInput.encodeGamepad(this.buffer, gamepadInput);
		}

		return this.buffer;
	}
}

function listenSelectAll(browserInput: BrowserInput) {
	// ctrl+a leaves the a key pressed when selecting all
	// https://dev.to/chromiumdev/detecting-select-all-on-the-web-2alo
	const startExtent = document.createElement('div');
	const endExtent = document.createElement('div');
	startExtent.classList.add('pogp-extent');
	endExtent.classList.add('pogp-extent');
	const style = document.createElement('style');
	document.head.appendChild(style);
	style.innerHTML = '.pogp-extent { position: fixed; opacity: 0; user-select: auto; } .pogp-extent::after { content: \'\\200b\'; }';
	document.body.prepend(startExtent);
	document.body.appendChild(endExtent);
	document.addEventListener('selectionchange', () => {
		const isExtent = (node) => {
			return node instanceof Element && node.classList.contains('pogp-extent');
		};

		// check the selection extends over two extent nodes (top and bottom)
		const s = window.getSelection();
		if (!isExtent(s.anchorNode) || !isExtent(s.focusNode)) {
			return;
		}
		browserInput.keys = []; browserInput.mouse.isDown = false;
	})
}

function readGamepad(gamepad: Gamepad) : Pog.GamepadInput {
	switch(gamepad.id) {
		case 'Stadia Controller rev. A (STANDARD GAMEPAD Vendor: 18d1 Product: 9400)':
			return stadiaController(gamepad);
		default:
			return genericController(gamepad);
	}
}


function stadiaController(gamepad: Gamepad) : Pog.GamepadInput {
	return {
		...genericController(gamepad),
		productId: '9400',
		vendorId: '18d1'
	}
}

function genericController(gamepad: Gamepad) : Pog.GamepadInput {
	const defaultAxesMapping = [
		{
			hand: Hand.Left,
			value: [0,1],
		},
		{
			hand: Hand.Right,
			value: [2,3],
		}
	];

	const defaultButtonMapping = [
		{ label: 'A', position: ButtonPosition.RightFaceBottom },
		{ label: 'B', position: ButtonPosition.RightFaceRight },
		{ label: 'X', position: ButtonPosition.RightFaceLeft },
		{ label: 'Y', position: ButtonPosition.RightFaceTop },

		{ label: 'L1', position: ButtonPosition.LeftShoulderFront },
		{ label: 'R1', position: ButtonPosition.RightShoulderFront },
		{ label: 'L2', position: ButtonPosition.LeftShoulderBack },
		{ label: 'R2', position: ButtonPosition.RightShoulderBack },

		{ position: ButtonPosition.MiddleLeft },
		{ position: ButtonPosition.MiddleRight },
		{ position: ButtonPosition.LeftThumbstick },
		{ position: ButtonPosition.RightThumbstick },

		{ position: ButtonPosition.LeftFaceTop },
		{ position: ButtonPosition.LeftFaceBottom },
		{ position: ButtonPosition.LeftFaceLeft },
		{ position: ButtonPosition.LeftFaceRight },

		{ label: 'S', position: ButtonPosition.Middle }
	];

	return {
		id: gamepad.id,
		type: InputType.Gamepad,
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