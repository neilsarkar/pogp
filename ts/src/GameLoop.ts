import type { Pog } from './types';
import { BrowserInput } from './BrowserInput';

/**
 * Class to run a pogp game loop
 *
 * @example
 * import { GameLoop } from 'pogp';
 *
 * const gameLoop = new GameLoop((frame, now, dt, inputs) => {
 *   console.log(frame, now, dt)
 * 	 console.log()

 */
export class GameLoop {
	// todo: accept GameState as a generic argument
	isApplicationRunning: boolean;
	frame: bigint;
	now: number;
	pauseTime: number;
	tick: Pog.Tick;
	handle: number;

	// inputs
	browserInput : BrowserInput;

	constructor(tick: Pog.Tick, elementSelector: string = null) {
		this.isApplicationRunning = true;
		this.frame = 0n;
		this.now = performance.now();
		this.pauseTime = 0;
		this.tick = tick;
		// todo: expose keyboard input to avoid caller having to parse input buffer manually
		this.browserInput = new BrowserInput(document.querySelector(elementSelector));
		this.handle = -1;

		window.addEventListener('keydown', (ev) => {
			// https://stackoverflow.com/questions/8916620/disable-arrow-key-scrolling-in-users-browser
			if(["Space","ArrowUp","ArrowDown","ArrowLeft","ArrowRight"].indexOf(ev.code) > -1) {
				ev.preventDefault();
			}

			if (ev.shiftKey && ev.code == 'KeyP') {
				this.togglePause();
			}

			// todo: shift + l to log state - need to take state as a generic parameter
			if (ev.altKey && ev.code == 'KeyP') {
				if (this.isApplicationRunning) {
					this.togglePause();
				}
				this.step();
			}
		})
	}

	// todo: show an overlay if the screen is not focused

	run() {
		if (this.isApplicationRunning) {
			this.step();
			this.handle = requestAnimationFrame(this.run.bind(this));
		}
	}

	step() {
		let dt = performance.now() - this.now - this.pauseTime;
		if (!this.isApplicationRunning) {
			this.pauseTime += dt;
			dt = 16.666666666;
		}
		this.now += dt;
		this.tick(this.frame++, this.now, this.browserInput.readInput());
		this.profileFrame(performance.now() - this.pauseTime - this.now);
	}

	togglePause() {
		this.isApplicationRunning = !this.isApplicationRunning;
		if (!this.isApplicationRunning) {
			cancelAnimationFrame(this.handle);
		} else {
			this.pauseTime += performance.now() - this.now;
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