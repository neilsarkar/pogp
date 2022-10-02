import {readGamepad} from './lib.js';
import {InputType, Key} from './enums.js';
import type { Pog } from './types';

let inputJson : Pog.Inputs = {
	frame: 0n,
	inputs: []
};

let pre = document.createElement('pre');
document.body.appendChild(pre);

let keys : boolean[] = [];

window.addEventListener('keydown', (ev) => {
	keys[Key[ev.code]] = true;
})

window.addEventListener('keyup', (ev) => {
	keys[Key[ev.code]] = false;
})

const run = (frame: bigint) => {
	const start = +new Date;

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

	const ms = +new Date - start;

	if (ms > 3) {
		console.warn(`frame ${frame} took ${ms}ms`)
	}
}

// browser
// https://rob-blackbourn.github.io/blog/webassembly/wasm/array/arrays/javascript/c/2020/06/07/wasm-arrays.html

let isApplicationRunning = true;

let frame : bigint = 0n;

const wrapper = () => {
	if (isApplicationRunning) {
		run(frame++)
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