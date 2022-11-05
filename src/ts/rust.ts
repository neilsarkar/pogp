import {GameLoop} from './GameLoop';
import {Hand, Key} from './enums';
import {KeyboardSnapshot} from './KeyboardSnapshot';
import { MarshalInput } from './MarshalInput';
import {Inputs} from '../../pkg/pogp';
// https://github.com/rustwasm/wasm-bindgen/issues/2456
import {memory} from '../../pkg/pogp_bg.wasm'

const keyboard = new KeyboardSnapshot();

let rustInputs = Inputs.new();
const ptr = rustInputs.input_buffer();
const bytes = new Uint8Array(memory.buffer, ptr, 10);
bytes[0] = 1;

const gameLoop = new GameLoop(tick);
gameLoop.run();

function tick(frame: bigint, inputs: ArrayBuffer) {
	const kbInput = MarshalInput.decodeKeyboard(inputs);
	keyboard.addInput(kbInput);
	if (keyboard.isKeyPressed(Key.KeyG)) {
		bytes[0] = 1;
	} else {
		bytes[0] = 0;
	}

	rustInputs.tick();

	for(let i = 0; i < 10; i++) {
		console.log(bytes[i]);
	}


	console.log('frame', frame);
}