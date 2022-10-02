import {gamepadToBinary, keyboardToBinary, readGamepad} from './lib.js';
import {InputType, Key} from './enums.js';
import type { Pog } from './types';

let inputJson : Pog.Inputs = {
	frame: 0n,
	inputs: []
};

let pre = document.createElement('pre');
document.body.appendChild(pre);

let binaryPre = document.createElement('pre');
document.body.appendChild(binaryPre);

let keys : boolean[] = [];

window.addEventListener('keydown', (ev) => {
	keys[Key[ev.code]] = true;
})

window.addEventListener('keyup', (ev) => {
	keys[Key[ev.code]] = false;
})

window.addEventListener('blur', (ev) => {
	keys = [];
})

const run = (frame: bigint) => {
	const gamepads = navigator.getGamepads();
	inputJson.frame = frame;
	inputJson.inputs = [];
	for(var gamepad of gamepads) {
		if (!gamepad) { continue; }

		inputJson.inputs.push(
			readGamepad(gamepad)
		)
	}

	inputJson.inputs.push({
		type: InputType.Keyboard,
		keys: keys.map((k, i) => !!k ? i : -1).filter(v => v != -1)
	})

	const collapsedJson = {
		...inputJson,
		inputs: [
			inputJson.inputs.map(collapsed)
		]
	};

	function collapsed(input: Pog.Input) {
		const gamepad = input as Pog.GamepadInput;
		if (!gamepad.buttons) { return input; }
		return {
			...input,
			buttons: gamepad.buttons.filter(b => !!b.value),
			axes: gamepad.axes.filter(a => !!a.value)
		}
	}

	pre.innerText = JSON.stringify(
		collapsedJson,
		// https://github.com/GoogleChromeLabs/jsbi/issues/30
		(k, v) => typeof v === 'bigint' ? v.toString() : v,
		2
	);

	const gamepadsBinary = inputJson.inputs
		.filter(input => input.type == InputType.Gamepad)
		.map(input => gamepadToBinary(input as Pog.GamepadInput));

	const keyboardBinary = inputJson.inputs
		.filter(input => input.type == InputType.Keyboard)
		.map(input => keyboardToBinary(input as Pog.KeyboardInput));

	binaryPre.innerText = gamepadsBinary.concat(keyboardBinary)
		.map(uint8Array => uint8Array.toString()).join("\n")
}

// browser
// https://rob-blackbourn.github.io/blog/webassembly/wasm/array/arrays/javascript/c/2020/06/07/wasm-arrays.html

let isApplicationRunning = true;

let frame : bigint = 0n;

const wrapper = () => {
	const start = +new Date;

	if (isApplicationRunning) {
		run(frame++)
	}

	const ms = +new Date - start;
	if (ms > 3) {
		console.warn(`frame ${frame} took ${ms}ms`)
	}

	requestAnimationFrame(wrapper);
}

window.addEventListener('keydown', (ev) => {
	if (ev.shiftKey && ev.code == 'KeyP') {
		isApplicationRunning = !isApplicationRunning;
		console.log(`Game is ${(isApplicationRunning ? 'Running' : 'Paused')}`);
	}

	if (!isApplicationRunning && ev.altKey && ev.code == 'KeyP') {
		run(frame++);
	}
})

wrapper();