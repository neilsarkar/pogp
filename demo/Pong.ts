import { Hand, Key } from "../ts/src/enums";
import { GamepadSnapshot } from "../ts/src/GamepadSnapshot";
import { KeyboardSnapshot } from "../ts/src/KeyboardSnapshot";
import { MarshalInput } from "../ts/src/MarshalInput";
import { Ball, BoundingBox, GameState } from "./types";
import {clamp} from '../ts/src/lib';

let speed = .75;

export class Pong {
	state: GameState;
	keyboard: KeyboardSnapshot;
	gamepad: GamepadSnapshot;

	constructor() {
		this.state = {
			p0: { x: 0, y: 0, w: 0, h: 0 },
			p1: { x: 0, y: 0, w: 0, h: 0 },
			ball: { x: 0, y: 0, w: 0, h: 0, v: {x: 0, y: 0}},
			p0_score: 0,
			p1_score: 0
		}

		this.keyboard = new KeyboardSnapshot();
		this.gamepad = new GamepadSnapshot();
		this.reset();
	}

	tick(frame: bigint, inputs: ArrayBuffer) {
		// process inputs from pogp input buffer
		this.processInputs(inputs);

		// apply collisions
		this.processCollisions();

		// apply ball velocity
		this.state.ball.x += this.state.ball.v.x;
		this.state.ball.y += this.state.ball.v.y;

		// check win state
		if (this.state.ball.x < 0) {
			this.state.p1_score++;
			this.reset();
		} else if (this.state.ball.x > 100 - this.state.ball.w) {
			this.state.p0_score++;
			this.reset();
		}
	}

	processInputs(inputs: ArrayBuffer) {
		// read input from pogp binary buffer
		const kbInput = MarshalInput.decodeKeyboard(inputs);
		this.keyboard.addInput(kbInput);
		const gamepadInput = MarshalInput.decodeGamepad(inputs);
		this.gamepad.addInput(gamepadInput);

		// p0 moves with up and down arrows
		if (this.keyboard.isKey(Key.ArrowUp)) {
			this.state.p0.y--;
		}
		if (this.keyboard.isKey(Key.ArrowDown)) {
			this.state.p0.y++;
		}

		// p1 moves with W and S of wasd
		if (this.keyboard.isKey(Key.KeyW)) {
			this.state.p1.y--;
		}
		if (this.keyboard.isKey(Key.KeyS)) {
			this.state.p1.y++;
		}

		// p1 can also move with a gamepad connected to the browser
		const axes = this.gamepad.getAxes(Hand.Left);
		if (axes) {
			this.state.p1.x += Number(axes.value[0]) / 10000;
			this.state.p1.y += Number(axes.value[1]) / 10000;
		}
	}

	processCollisions() {
		processCollision(this.state.ball, this.state.p0);
		processCollision(this.state.ball, this.state.p1);

		if (this.state.ball.y < 0 || this.state.ball.y > 100 - this.state.ball.h) {
			this.state.ball.v.y *= -1;
		}

		this.state.p0.y = clamp(this.state.p0.y, 0, 100 - this.state.p0.h);
		this.state.p1.y = clamp(this.state.p1.y, 0, 100 - this.state.p1.h);
	}

	reset() {
		this.state.p0 = {
			x: 0,
			y: 50 - 7.5,
			w: 3,
			h: 15
		},
		this.state.p1 = {
			x: 100 - 3,
			y: 50 - 7.5,
			w: 3,
			h: 15
		},
		this.state.ball = {
			x: 50 - 3,
			y: 50 - 3,
			w: 3,
			h: 3,
			v: {
				x: speed, y: 0
			}
		}
	}
}

function processCollision(ball: Ball, paddle: BoundingBox) {
	if (!isColliding(ball, paddle)) { return; }
	// flip x direction
	ball.v.x = -ball.v.x;
	// top third bounces at a 45 degree angle up, bottom third 45 degree angle down, middle flat
	ball.v.y =
		ball.y + ball.h / 2 < paddle.y + paddle.h / 3 ? -speed :
		ball.y + ball.h / 2 > paddle.y + 2 * paddle.h / 3 ? speed :
		0;
}

function isColliding(box0: BoundingBox, box1: BoundingBox) : boolean {
	return box0.x < box1.x + box1.w &&
		box0.x + box0.w > box1.x &&
		box0.y < box1.y + box1.h &&
		box0.h + box0.y > box1.y;
}
