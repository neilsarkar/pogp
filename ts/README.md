# POG Protocol Typescript ESM Package 0.0.18

This library provides ESM Typescript functionality for the [POG Protocol](https://github.com/neilsarkar/pogp)

## Getting Started

First, add the pogp library to your esm project using `yarn` or `npm`

```ts
yarn add pogp
```

You can then register a function to run on every frame:

```ts
import {GameLoop} from 'pogp';

const gameLoop = new GameLoop(tick);
gameLoop.run();

function tick(frame: bigint, inputs: ArrayBuffer) {
	console.log(frame);
}
```

Opening this in the browser will log the frame number for every frame.

Now let's render a box to the screen

```ts
import {GameLoop} from 'pogp';

const gameLoop = new GameLoop(tick);
gameLoop.run();

const state : GameState = {
	box: { x: 45, y: 45, w: 10, h: 10 }
}

function tick(frame: bigint, inputs: ArrayBuffer) {
	console.log(state.box.x);
}

type GameState {
	box: Box
}

type Box {
	x: number,
	y: number,
	w: number,
	h: number
}
```