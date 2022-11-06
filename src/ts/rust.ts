import {GameLoop} from './GameLoop';

import {Game, GameState} from '../../pkg/pogp';
// https://github.com/rustwasm/wasm-bindgen/issues/2456
import {memory} from '../../pkg/pogp_bg.wasm'

let rustGame = Game.new();

const p0div = document.querySelector('.left.paddle') as HTMLDivElement;
const p1div = document.querySelector('.right.paddle') as HTMLDivElement;
const balldiv = document.querySelector('.ball') as HTMLDivElement;
const p0score = document.querySelector('.left.score') as HTMLSpanElement;
const p1score = document.querySelector('.right.score') as HTMLSpanElement;

const gameLoop = new GameLoop(tick);
gameLoop.run();

function tick(frame: bigint, inputs: ArrayBuffer) {
	const ptr = rustGame.input_buffer();
	const bytes = new Uint8Array(memory.buffer, ptr, 10);

	let i = 0;
	var byteArray = new Uint8Array(inputs);
	for(var byte of byteArray) {
		bytes[i++] = byte;
	}
	rustGame.tick(frame);
	render(rustGame.state);
}

function render(state: GameState) {
	const {p0, p1, ball} = state;

	const p0Point = worldToScreen(p0.x, p0.y);
	const p1Point = worldToScreen(p1.x, p1.y);

	const p0Dimensions = worldToScreen(p0.w, p0.h);
	const p1Dimensions = worldToScreen(p1.w, p1.h);

	const ballDimensions = worldToScreen(ball.w, ball.h);
	const ballPoint = worldToScreen(ball.x, ball.y);

	p0div.style.width = `${p0Dimensions.x}px`;
	p0div.style.height = `${p0Dimensions.y}px`;
	p0div.style.transform = `translate(${p0Point.x}px, ${p0Point.y}px)`;

	p1div.style.width = `${p1Dimensions.x}px`;
	p1div.style.height = `${p1Dimensions.y}px`;
	p1div.style.transform = `translate(${p1Point.x}px, ${p1Point.y}px)`;

	balldiv.style.width = `${ballDimensions.x}px`;
	balldiv.style.height = `${ballDimensions.x}px`;
	balldiv.style.transform = `translate(${ballPoint.x}px, ${ballPoint.y}px)`;

	p0score.innerText = state.p0_score.toString();
	p1score.innerText = state.p1_score.toString();
}

function worldToScreen(x: number, y: number) : {x: number, y: number}{
	const container = document.querySelector('.board') as HTMLDivElement;
	const vw = container.clientWidth;
	const vh = container.clientHeight;

	return {
		x: (x / 100) * vw,
		y: (y / 100) * vh
	}
}