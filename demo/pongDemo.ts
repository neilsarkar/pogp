import {GameLoop} from '../ts/src/GameLoop';
import {Pong as TsPong} from './Pong';
import {Game as RustPong} from './pkg/pogp_demo';

import { render } from './htmlRender';
// https://github.com/rustwasm/wasm-bindgen/issues/2456
import {memory} from './pkg/pogp_demo_bg.wasm'

const pong = new TsPong();
let rustPong = RustPong.new();

const button = document.querySelector('button') as HTMLButtonElement;

let runtime = 'rs';
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

		let bytes: Uint8Array;
		try {
			bytes = new Uint8Array(memory.buffer, ptr, 10);
		} catch(e) {
			console.error(e);
			window.location.reload();
		}

		let i = 0;
		var byteArray = new Uint8Array(inputs);
		for(var byte of byteArray) {
			bytes[i++] = byte;
		}
		rustPong.tick(frame);
		render(rustPong.state);
	}
}