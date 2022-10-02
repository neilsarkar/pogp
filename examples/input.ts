import {readInput} from './lib.js';
import * as Pog from './types';

let inputJson : Pog.Inputs = {
	frame: 0n,
	inputs: []
};

let pre = document.createElement('pre');
document.body.appendChild(pre);

const run = (frame: bigint) => {
	const start = +new Date;

	const gamepads = navigator.getGamepads();
	inputJson.frame = frame;
	for(var gamepad of gamepads) {
		if (!gamepad) { continue; }

		inputJson.inputs = [];
		inputJson.inputs.push(
			readInput(gamepad)
		)
	}

	const collapsedJson = {
		...inputJson,
		inputs: [
			inputJson.inputs.map(input => ({
				...input,
				buttons: input.buttons.filter(b => !!b.value),
				axes: input.axes.filter(a => !!a.value[0] || !!a.value[1])
			}))
		]
	};

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