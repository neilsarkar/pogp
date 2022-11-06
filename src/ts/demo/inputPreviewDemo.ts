import {toBinaryString} from '../lib';
import type { Pog } from '../types';
import { GameLoop } from '../GameLoop';
import { KeyboardSnapshot } from '../KeyboardSnapshot';
import { GamepadSnapshot } from '../GamepadSnapshot';
import { KEYBOARD_LENGTH, MarshalInput } from '../MarshalInput';

let pre = createPre();
let binaryPre = createPre();

const inputJson : Pog.Inputs = {
	frame: 0n,
	inputs: []
}

const keyboard = new KeyboardSnapshot();
const gamepad = new GamepadSnapshot();

const gameLoop = new GameLoop(tick);
gameLoop.run.call(gameLoop)

function tick(frame: bigint, inputs: ArrayBuffer) {
	const kbInput = MarshalInput.decodeKeyboard(inputs);
	keyboard.addInput(kbInput);

	const gamepadInput = MarshalInput.decodeGamepad(inputs);
	gamepad.addInput(gamepadInput);

	inputJson.frame = frame;
	inputJson.inputs = [gamepadInput].map(collapsed);
	inputJson.inputs.push(kbInput)

	pre.innerText = JSON.stringify(
		inputJson,
		// https://github.com/GoogleChromeLabs/jsbi/issues/30
		(k, v) => typeof v === 'bigint' ? v.toString() : v,
		2
	);

	const keyboardBinary = new Uint8Array(inputs, 0, KEYBOARD_LENGTH);
	const gamepadBinary = new Uint8Array(inputs, KEYBOARD_LENGTH);

	binaryPre.innerText = toBinaryString(keyboardBinary) + "\n" + toBinaryString(gamepadBinary);
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