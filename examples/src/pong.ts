import {GameLoop} from './GameLoop';
import {Key} from './enums';
import { KeyboardSnapshot } from './KeyboardSnapshot';

const leftPaddle = {
	x: -100,
	y: 0
}

const rightPaddle = {
	x: 100,
	y: 0
}

const gameLoop = new GameLoop(tick);
gameLoop.run();

function tick(frame: bigint, keyboard: KeyboardSnapshot ) {
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

	if (frame % 60n == 0n) {
		console.log(leftPaddle, rightPaddle);
	}
}