import {readGamepad} from './lib';
import {InputType} from './enums';
import type { Pog } from './types';
import { BrowserInput } from './BrowserInput';
import { MarshalInput } from './MarshalInput';

export class GameLoop {
	isApplicationRunning: boolean;
	frame: bigint;
	tick: Pog.Tick;

	// inputs
	inputJson : Pog.Inputs;
	gamepads : Uint8Array[];
	keyboard : Uint8Array[];
	browserInput : BrowserInput;

	constructor(tick: Pog.Tick) {
		this.isApplicationRunning = true;
		this.frame = 0n;
		this.tick = tick;
		this.browserInput = new BrowserInput();

		this.inputJson = {
			frame: 0n,
			inputs: []
		}

		window.addEventListener('keydown', (ev) => {
			if (ev.shiftKey && ev.code == 'KeyP') {
				this.togglePause();
			}

			if (!this.isApplicationRunning && ev.altKey && ev.code == 'KeyP') {
				this.run();
			}
		})
	}

	run() {
		let startTime = +new Date;
		if (this.isApplicationRunning) {
			this.tick(this.frame++, this.browserInput.readInput());
			this.profileFrame(+new Date - startTime);
		}

		requestAnimationFrame(this.run.bind(this));
	}

	togglePause() {
		this.isApplicationRunning = !this.isApplicationRunning;
		console.log(`Game is ${(this.isApplicationRunning ? 'Running' : 'Paused')}`);
	}

	private readInputs() {
		const gamepads = navigator.getGamepads();
		this.inputJson.frame = this.frame;
		this.inputJson.inputs = [];
		for(var gamepad of gamepads) {
			if (!gamepad) { continue; }

			this.inputJson.inputs.push(
				readGamepad(gamepad)
			)
		}

		this.gamepads = this.inputJson.inputs
			.filter(input => input.type == InputType.Gamepad)
			.map(input => MarshalInput.encodeGamepad(input as Pog.GamepadInput));
	}

	// browser
	// https://rob-blackbourn.github.io/blog/webassembly/wasm/array/arrays/javascript/c/2020/06/07/wasm-arrays.html

	private profileFrame(ms: number) {
		if (ms > 3) {
			console.warn(`frame ${this.frame} took ${ms}ms`)
		}
	}

}