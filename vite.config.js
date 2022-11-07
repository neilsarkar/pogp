import { defineConfig } from "vite";
import wasm from 'vite-plugin-wasm';
import topLevelAwait from "vite-plugin-top-level-await"

export default defineConfig({
	plugins: [
		wasm(),
		topLevelAwait()
	],
	// https://github.com/sveltejs/kit/issues/859#issuecomment-1184696144
	optimizeDeps: {
		esbuildOptions: {
			target: 'es2020'
		}
	},
	build: {
		target: 'es2020'
	}
})