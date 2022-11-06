import type { Pog } from './types';
import { BrowserInput } from './BrowserInput';

export class GameLoop {
	isApplicationRunning: boolean;
	frame: bigint;
	tick: Pog.Tick;
	handle: number;

	// inputs
	browserInput : BrowserInput;

	constructor(tick: Pog.Tick) {
		this.isApplicationRunning = true;
		this.frame = 0n;
		this.tick = tick;
		this.browserInput = new BrowserInput();
		this.handle = -1;

		window.addEventListener('keydown', (ev) => {
			if (ev.shiftKey && ev.code == 'KeyP') {
				this.togglePause();
			}

			if (!this.isApplicationRunning && ev.altKey && ev.code == 'KeyP') {
				this.step();
			}
		})
	}

	run() {
		if (this.isApplicationRunning) {
			this.step();
			this.handle = requestAnimationFrame(this.run.bind(this));
		}
	}

	step() {
		let startTime = performance.now();
		this.tick(this.frame++, this.browserInput.readInput());
		this.profileFrame(performance.now() - startTime);
	}

	togglePause() {
		this.isApplicationRunning = !this.isApplicationRunning;
		if (!this.isApplicationRunning) {
			cancelAnimationFrame(this.handle);
		} else {
			this.run();
		}
		console.log(`Game is ${(this.isApplicationRunning ? 'Running' : 'Paused')}`);
	}

	// browser
	// https://rob-blackbourn.github.io/blog/webassembly/wasm/array/arrays/javascript/c/2020/06/07/wasm-arrays.html

	private profileFrame(ms: number) {
		if (ms > 3) {
			console.warn(`frame ${this.frame} took ${ms}ms`)
		}
	}

}