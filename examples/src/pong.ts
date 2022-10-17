import {GameLoop} from './GameLoop';
import {Hand, Key} from './enums';
import {KeyboardSnapshot} from './KeyboardSnapshot';
import { MarshalInput } from './MarshalInput';
import { GamepadSnapshot } from './GamepadSnapshot';

let leftPaddle = {
	div: document.querySelector('.left.paddle') as HTMLDivElement,
	x: -100,
	y: 0
};

let rightPaddle = {
	div: document.querySelector('.right.paddle') as HTMLDivElement,
	x: 100,
	y: 0
};

const keyboard = new KeyboardSnapshot();
const gamepad = new GamepadSnapshot();

const gameLoop = new GameLoop(tick);
gameLoop.run();

function tick(frame: bigint, inputs: ArrayBuffer) {
	const kbInput = MarshalInput.decodeKeyboard(inputs);
	keyboard.addInput(kbInput);

	const gamepadInput = MarshalInput.decodeGamepad(inputs);
	gamepad.addInput(gamepadInput);

	if (keyboard.isKey(Key.ArrowLeft)) {
		leftPaddle.x--;
	}
	if (keyboard.isKey(Key.ArrowRight)) {
		leftPaddle.x++;
	}
	if (keyboard.isKey(Key.ArrowUp)) {
		leftPaddle.y--;
	}
	if (keyboard.isKey(Key.ArrowDown)) {
		leftPaddle.y++;
	}

	if (keyboard.isKey(Key.KeyA)) {
		rightPaddle.x--;
	}
	if (keyboard.isKey(Key.KeyD)) {
		rightPaddle.x++;
	}
	if (keyboard.isKey(Key.KeyW)) {
		rightPaddle.y--;
	}
	if (keyboard.isKey(Key.KeyS)) {
		rightPaddle.y++;
	}

	const axes = gamepad.getAxes(Hand.Left);
	if (axes) {
		rightPaddle.x += Number(axes.value[0]);
		rightPaddle.y += Number(axes.value[1]);
	}

	render()
}

function render() {
	leftPaddle.div.style.transform = `translate(${leftPaddle.x}px, ${leftPaddle.y}px)`;
	rightPaddle.div.style.transform = `translate(${rightPaddle.x}px, ${rightPaddle.y}px)`;
}