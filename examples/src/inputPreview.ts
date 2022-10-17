import {toBinaryString} from './lib';
import type { Pog } from './types';
import { GameLoop } from './GameLoop';
import { KeyboardSnapshot } from './KeyboardSnapshot';

let pre = createPre();
let binaryPre = createPre();

const gameLoop = new GameLoop(tick);
gameLoop.run.call(gameLoop)

function tick(frame: bigint, snapshot: KeyboardSnapshot) {
	const {inputJson, keyboard, gamepads} = gameLoop;

	inputJson.inputs = inputJson.inputs.map(collapsed)
	pre.innerText = JSON.stringify(
		inputJson,
		// https://github.com/GoogleChromeLabs/jsbi/issues/30
		(k, v) => typeof v === 'bigint' ? v.toString() : v,
		2
	);

	binaryPre.innerText = gamepads.concat(keyboard).map(toBinaryString).join("\n");
}

function collapsed(input: Pog.Input) {
	const gamepad = input as Pog.GamepadInput;
	if (!gamepad.buttons) { return input; }
	return {
		...input,
		buttons: gamepad.buttons.filter(b => !!b.value),
		axes: gamepad.axes.filter(a => !!a.value)
	}
}

function createPre() : HTMLPreElement {
	const element = document.createElement('pre');
	document.body.appendChild(element);
	return element;
}