import {GameLoop} from './GameLoop';
import {Hand, Key} from './enums';
import {KeyboardSnapshot} from './KeyboardSnapshot';
import { MarshalInput } from './MarshalInput';
import { GamepadSnapshot } from './GamepadSnapshot';
import {clamp} from './lib';
import { Pog } from './types';
import {Hello} from '../pkg/hellowasm';
// https://github.com/rustwasm/wasm-bindgen/issues/2456
import {memory} from '../pkg/hellowasm_bg.wasm'

let uni = Hello.new();
const ptr = uni.cells();
const bytes = new Uint8Array(memory.buffer, ptr, 10);
bytes[0] = 66;
uni.double();
for(let i = 0; i < 10; i++) {
	console.log(bytes[i]);
}

type GameState = {
	leftPaddle: BoundingBox,
	rightPaddle: BoundingBox,
	score: number[],
	ball: Ball
}

type Ball = BoundingBox & {
	v: {
		x: number,
		y: number
	}
}

type BoundingBox = Pog.Point & {
	w: number,
	h: number
}

let state: GameState = {
	leftPaddle: { x: 0, y: 0, w: 0, h: 0 },
	rightPaddle: { x: 0, y: 0, w: 0, h: 0 },
	ball: { x: 0, y: 0, w: 0, h: 0, v: {x: 0, y: 0}},
	score: [0,0]
};

const speed = .3;

const keyboard = new KeyboardSnapshot();
const gamepad = new GamepadSnapshot();

const p0div = document.querySelector('.left.paddle') as HTMLDivElement;
const p1div = document.querySelector('.right.paddle') as HTMLDivElement;
const balldiv = document.querySelector('.ball') as HTMLDivElement;

reset();
const gameLoop = new GameLoop(tick);
gameLoop.run();

function tick(frame: bigint, inputs: ArrayBuffer) {
	const kbInput = MarshalInput.decodeKeyboard(inputs);
	keyboard.addInput(kbInput);

	const gamepadInput = MarshalInput.decodeGamepad(inputs);
	gamepad.addInput(gamepadInput);

	logic(keyboard, gamepad);
	render(state);
}

function logic(keyboard: KeyboardSnapshot, gamepad: GamepadSnapshot) {
	if (keyboard.isKey(Key.ArrowLeft)) {
		state.leftPaddle.x--;
	}
	if (keyboard.isKey(Key.ArrowRight)) {
		state.leftPaddle.x++;
	}
	if (keyboard.isKey(Key.ArrowUp)) {
		state.leftPaddle.y--;
	}
	if (keyboard.isKey(Key.ArrowDown)) {
		state.leftPaddle.y++;
	}

	if (keyboard.isKey(Key.KeyA)) {
		state.rightPaddle.x--;
	}
	if (keyboard.isKey(Key.KeyD)) {
		state.rightPaddle.x++;
	}
	if (keyboard.isKey(Key.KeyW)) {
		state.rightPaddle.y--;
	}
	if (keyboard.isKey(Key.KeyS)) {
		state.rightPaddle.y++;
	}

	const axes = gamepad.getAxes(Hand.Left);
	if (axes) {
		state.rightPaddle.x += Number(axes.value[0]) / 10000;
		state.rightPaddle.y += Number(axes.value[1]) / 10000;
	}

	if (isColliding(state.ball, state.leftPaddle)) {
		state.ball.v.x = Math.abs(state.ball.v.x);
		state.ball.x = Math.max(state.leftPaddle.x + state.ball.w, state.ball.x);
		state.ball.v.y =
			state.ball.y < state.leftPaddle.y + state.leftPaddle.h / 3 ? -speed :
			state.ball.y > state.leftPaddle.y + 2 * state.leftPaddle.h / 3 ? speed :
			0;
	} else if (isColliding(state.ball, state.rightPaddle)) {
		state.ball.v.x = -Math.abs(state.ball.v.x);
		state.ball.x = Math.min(state.rightPaddle.x - state.ball.w, state.ball.x);
		state.ball.v.y =
			state.ball.y < state.rightPaddle.y + state.rightPaddle.h / 3 ? -speed :
			state.ball.y > state.rightPaddle.y + 2 * state.rightPaddle.h / 3 ? speed :
			0;
	}

	state.ball.x += state.ball.v.x;
	state.ball.y += state.ball.v.y;

	if (state.ball.y < 0 || state.ball.y > 100 - state.ball.h) {
		state.ball.v.y *= -1;
	}
	if (state.ball.x < 0) {
		state.score[1]++;
		reset();
		window.alert(state.score.join('-'));
	} else if (state.ball.x > 100 - state.ball.w) {
		state.score[0]++;
		reset();
		window.alert(state.score.join('-'));
	}

	state.ball.y = clamp(state.ball.y, 0, 100 - state.ball.h);

	state.leftPaddle.x = clamp(state.leftPaddle.x, 0, 100 - state.leftPaddle.w);
	state.leftPaddle.y = clamp(state.leftPaddle.y, 0, 100 - state.leftPaddle.h);
	state.rightPaddle.x = clamp(state.rightPaddle.x, 0, 100 - state.rightPaddle.w);
	state.rightPaddle.y = clamp(state.rightPaddle.y, 0, 100 - state.rightPaddle.h);
}

function reset() {
	state.leftPaddle = {
		x: 0,
		y: 50 - 7.5,
		w: 3,
		h: 15
	},
	state.rightPaddle = {
		x: 100 - 3,
		y: 50 - 7.5,
		w: 3,
		h: 15
	},
	state.ball = {
		x: 50 - 3,
		y: 50 - 3,
		w: 3,
		h: 3,
		v: {
			x: speed, y: 0
		}
	}
}

function isColliding(box0: BoundingBox, box1: BoundingBox) : boolean {
	return box0.x < box1.x + box1.w &&
		box0.x + box0.w > box1.x &&
		box0.y < box1.y + box1.h &&
		box0.h + box0.y > box1.y;
}

function render(state: GameState) {
	const {leftPaddle, rightPaddle, ball} = state;

	const p0Point = worldToScreen(leftPaddle.x, leftPaddle.y);
	const p1Point = worldToScreen(rightPaddle.x, rightPaddle.y);

	const p0Dimensions = worldToScreen(leftPaddle.w, leftPaddle.h);
	const p1Dimensions = worldToScreen(rightPaddle.w, rightPaddle.h);

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