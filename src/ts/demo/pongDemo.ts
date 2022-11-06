import {GameLoop} from '../GameLoop';
import {Pong as TsPong} from './Pong';
import {Game as RustPong} from '../../../pkg/pogp';

import { render } from './htmlRender';
// https://github.com/rustwasm/wasm-bindgen/issues/2456
import {memory} from '../../../pkg/pogp_bg.wasm'

const pong = new TsPong();
const rustPong = RustPong.new();

const button = document.querySelector('button') as HTMLButtonElement;

let runtime = 'ts';
button.addEventListener('click', () => {
	runtime = runtime == 'ts' ? 'rs' : 'ts';
	console.log('clicked', runtime);
})

const gameLoop = new GameLoop(tick);
gameLoop.run();

function tick(frame: bigint, inputs: ArrayBuffer) {
	if (runtime == 'ts') {
		pong.tick(frame, inputs);
		render(pong.state);
	} else {
		const ptr = rustPong.input_buffer();
		const bytes = new Uint8Array(memory.buffer, ptr, 10);

		let i = 0;
		var byteArray = new Uint8Array(inputs);
		for(var byte of byteArray) {
			bytes[i++] = byte;
		}
		rustPong.tick(frame);
		render(rustPong.state);
	}
}