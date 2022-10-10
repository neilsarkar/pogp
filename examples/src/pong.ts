import {GameLoop} from './GameLoop.js';
import {Key} from './enums.js';

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

function tick(frame: bigint) {
	const {keyboard} = gameLoop;

	console.log(keyboard);

	// left arrow
	if (keyboard[Key.ArrowLeft]) {
		leftPaddle.x--;
	}
	// up arrow
	if (keyboard[38]) {
		leftPaddle.y--;
	}
	// right arrow
	if (keyboard[39]) {
		leftPaddle.x++;
	}
	// down arrow
	if (keyboard[40]) {
		leftPaddle.y++;
	}

	// a
	if (keyboard[65]) {
		rightPaddle.x++;
	}
	// w
	if (keyboard[87]) {
		rightPaddle.y--;
	}
	// d
	if (keyboard[68]) {
		rightPaddle.x++;
	}
	// s
	if (keyboard[83]) {
		rightPaddle.y++;
	}

	if (frame % 60n == 0n) {
		console.log(leftPaddle, rightPaddle);
	}

}