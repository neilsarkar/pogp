import {GameLoop} from './GameLoop';
import {Hand, Key} from './enums';
import {KeyboardSnapshot} from './KeyboardSnapshot';
import { MarshalInput } from './MarshalInput';
import { GamepadSnapshot } from './GamepadSnapshot';
import {clamp} from './lib';
import { Pog } from './types';

type GameState = {
	leftPaddle: Pog.Point,
	rightPaddle: Pog.Point,
}

let state = {
	leftPaddle: {
		x: 0,
		y: 50
	},
	rightPaddle: {
		x: 95,
		y: 50
	}
}

const keyboard = new KeyboardSnapshot();
const gamepad = new GamepadSnapshot();

const p0div = document.querySelector('.left.paddle') as HTMLDivElement;
const p1div = document.querySelector('.right.paddle') as HTMLDivElement;

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
		state.rightPaddle.x += Number(axes.value[0]);
		state.rightPaddle.y += Number(axes.value[1]);
	}

	state.leftPaddle.x = clamp(state.leftPaddle.x, 0, 95);
	state.leftPaddle.y = clamp(state.leftPaddle.y, 0, 95);
	state.rightPaddle.x = clamp(state.rightPaddle.x, 0, 95);
	state.rightPaddle.y = clamp(state.rightPaddle.y, 0, 95);
}

function render(state) {
	const p0Point = worldToScreen(state.leftPaddle.x, state.leftPaddle.y);
	const p1Point = worldToScreen(state.rightPaddle.x, state.rightPaddle.y);

	p0div.style.transform = `translate(${p0Point.x}px, ${p0Point.y}px)`;
	p1div.style.transform = `translate(${p1Point.x}px, ${p1Point.y}px)`;
}

function worldToScreen(x: number, y: number) : {x: number, y: number}{
	const vw = window.innerWidth;
	const vh = window.innerHeight;

	return {
		x: (x / 100) * vw,
		y: (y / 100) * vh
	}
}