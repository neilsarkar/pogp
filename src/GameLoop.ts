import type { Pog } from './types';
import { BrowserInput } from './BrowserInput';

export class GameLoop {
	isApplicationRunning: boolean;
	frame: bigint;
	tick: Pog.Tick;

	// inputs
	browserInput : BrowserInput;

	constructor(tick: Pog.Tick) {
		this.isApplicationRunning = true;
		this.frame = 0n;
		this.tick = tick;
		this.browserInput = new BrowserInput();

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

	// browser
	// https://rob-blackbourn.github.io/blog/webassembly/wasm/array/arrays/javascript/c/2020/06/07/wasm-arrays.html

	private profileFrame(ms: number) {
		if (ms > 3) {
			console.warn(`frame ${this.frame} took ${ms}ms`)
		}
	}

}