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
 * })
 */
export class GameLoop {
	// todo: accept GameState as a generic argument
	isApplicationRunning: boolean;
	frame: bigint;
	now: number;
	pauseTime: number;
	tick: Pog.Tick;
	handle: number;
	isProfiling: boolean;

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

		let isBlurred = false;
		document.addEventListener('visibilitychange', (ev) => {
			if (document.hidden) {
				this.pause();
				isBlurred = true;
			} else {
				if (isBlurred) {
					this.unpause();
				}
				isBlurred = false;
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
		let dt = performance.now() - this.pauseTime - this.now;
		if (!this.isApplicationRunning) {
			this.pauseTime += dt;
			dt = 16.666666666;
		}
		this.now += dt;
		this.tick(this.frame++, this.now, this.browserInput.readInput());
		if (this.isApplicationRunning) {
			this.profileFrame(dt);
		}
	}

	togglePause() {
		if (this.isApplicationRunning) {
			this.pause();
		} else {
			this.unpause();
		}
	}

	pause() {
		this.isApplicationRunning = false;
		cancelAnimationFrame(this.handle);
	}

	unpause() {
		this.isApplicationRunning = true;
		this.pauseTime = performance.now() - this.now;
		this.run()
	}

	// browser
	// https://rob-blackbourn.github.io/blog/webassembly/wasm/array/arrays/javascript/c/2020/06/07/wasm-arrays.html

	private profileFrame(ms: number) {
		if (this.isProfiling && ms > 16) {
			console.warn(`frame ${this.frame} took ${ms}ms`)
		}
	}

}