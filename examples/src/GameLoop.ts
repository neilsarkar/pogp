import {gamepadToBinary, keyboardToBinary, readGamepad, toBinaryString, toHexString} from './lib.js';
import {InputType, Key} from './enums.js';
import type { Pog } from './types';

export class GameLoop {
	isApplicationRunning: boolean;
	frame: bigint;
	tick: Pog.Tick;

	// inputs
	keys : boolean[];
	inputJson : Pog.Inputs;
	gamepads : Uint8Array[];
	keyboard : Uint8Array[];

	constructor(tick: Pog.Tick) {
		this.keys = [];
		this.isApplicationRunning = true;
		this.frame = 0n;
		this.tick = tick;
		this.inputJson = {
			frame: 0n,
			inputs: []
		}

		window.addEventListener('keydown', (ev) => { this.keys[Key[ev.code]] = true; })

		window.addEventListener('keyup', (ev) => { this.keys[Key[ev.code]] = false; })

		window.addEventListener('blur', (ev) => { this.keys = []; })

		window.addEventListener('keydown', (ev) => {
			if (ev.shiftKey && ev.code == 'KeyP') {
				this.isApplicationRunning = !this.isApplicationRunning;
				console.log(`Game is ${(this.isApplicationRunning ? 'Running' : 'Paused')}`);
			}

			if (!this.isApplicationRunning && ev.altKey && ev.code == 'KeyP') {
				this.run();
			}
		})
	}

	run() {
		let startTime = +new Date;
		this.readInputs();

		if (this.isApplicationRunning) {
			this.tick(this.frame++)
			this.profileFrame(+new Date - startTime);
		}

		requestAnimationFrame(this.run.bind(this));
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
		this.inputJson.inputs.push({
			type: InputType.Keyboard,
			keys: this.keys.map((k, i) => !!k ? i : -1).filter(v => v != -1)
		})

		this.gamepads = this.inputJson.inputs
			.filter(input => input.type == InputType.Gamepad)
			.map(input => gamepadToBinary(input as Pog.GamepadInput));

		this.keyboard = this.inputJson.inputs
			.filter(input => input.type == InputType.Keyboard)
			.map(input => keyboardToBinary(input as Pog.KeyboardInput));
	}

	// browser
	// https://rob-blackbourn.github.io/blog/webassembly/wasm/array/arrays/javascript/c/2020/06/07/wasm-arrays.html

	private profileFrame(ms: number) {
		if (ms > 3) {
			console.warn(`frame ${this.frame} took ${ms}ms`)
		}
	}

}