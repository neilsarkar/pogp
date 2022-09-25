# Portable Open Game Protocol 0.1.0

I am a 15 year veteran software engineer who has spent 4 years developing a game in Unity.

I have been shocked and disappointed at the developer experience, and I believe that making games should feel like playing games - the flow state should be prioritized in development.

A vanilla Unity project allows a developer to get into a flow state with a sub 5 second compile time and instant changes in monobehaviors.

However as a project grows and the developer gets locked into the unity ecosystem, the compile time grows and they find they have to replace everything.

This leads to crunch and people hating their lives and resenting the projects they once loved.

Goals:

* Maintain creative flow state throughout development lifecycle

* Open source sharing of low level best practices for all major distribution platforms

* Developer experience on par with modern web development

* Write native code for each platform

* Networked by default

A game can be thought of as a state machine that consists of the following loop:

```
while(true) {
	inputs = readInputs();
	state = runLogic(inputs, state);
	render(state)
}
```

Currently every game engine provides a single language solution that handles each line of this.

I believe that if there is an open standard for representing inputs and game state, then each step here can be optimized independently.

If serialization and deserialization of inputs and state to a binary format can take under 2ms, then either game logic or rendering can easily be rewritten in native code for distribution platforms.

A team can begin prototyping a project in whatever language they're most comfortable in.

The protocol consists of a portable, language-agnostic representation of inputs and state.

### Design Decisions

Binary representations are little-endian as most modern architectures use this encoding.

0,0 represents the top left corner of the screen. This is the standard on the web and in unity.

The protocol does not use floating point numbers to encourage determinism across architectures.

## Inputs

Inputs contain the state of the input at the current frame.

It is the implemnentation's responsibility to expose states like `down`, `up` and `pressed` as well as events like `OnTouchMove`

**Gamepad (a.k.a. Controller)**

Based on the open standard

https://developer.mozilla.org/en-US/docs/Web/API/Gamepad

```js
{
	type: "controller",
	manufacturer: "Microsoft",
	console: "Xbox One",
	hardwareId: "",
	// these will be defined in an open standard
	id: "xboxone",
	buttons: [
		{
			name: 'A',
			pressed: true,
			value: 100
		},
		{
			name: 'B',
			pressed: true,
			value: 50
		},
		{
			name: 'X',
			pressed: false
		},
		{
			name: 'Y',
			pressed: false
		}
	],
	axes: [
		{
			name: 'left',
			// these values are a BigInt in javascript and a 64 bit number in other languages
			value: [
				// x-axis idle
				0,
				// y-axis up
				2147483647
			]
		},
		{
			name: 'right',
			value: [
				// x-axis left
				-2147483647,
				// y-axis down
				-2147483647
			]
		}
	],
}
```

**Touch**

```js
{
	type: "touch",
	resolution: [0,0],
	fingers: [
		// there will always be at least one element
		{
			position: [0,0],
			pressure: 0
		}
	]
}
```

**Mouse**

```js
{
	type: "mouse",
	resolution: [1920, 1080],
	position: [100, 100],
	buttons: [
		{
			id: 'left',
			down: true
		},
		{
			id :'right',
			down: false
		},
	],
	wheels: [
		{
			id: 'scroll',
			delta: [0,20,0]
		}
	]
}
```

**Keyboard**

Keyboard keys are represented using the w3 standard, supporting standard 101, Korean, Brazilian and Japanese keyboards.

https://www.w3.org/2002/09/tests/keys.html

https://www.w3.org/TR/uievents-code/#keyboard-mac

```js
{
	type: "keyboard",
	layout: 101,
	keys: [
		27,
		65
	]
}
```

```
0-8: unsigned byte of layout
8-128: bits for each key
```

**Custom**

```js
{
	type: "custom",
	id: 'my-flightstick',
	fields: [
		{
			id: 'whammybar',
			values: [420,69]
		},
		{
			id: 'something',
			values: [0]
		}
	]
}
```

## State

Game state represents the state of the game. This is going to be custom for each game.

`int` is short for `int32`

```js
{
	// this is the pog protocol major version
	pog: 0,
	// this is the pog protocol minor version
	pogMinorVersion: 1

	// these are the members of the state.
	fields: {
		// primitives
		timeLeft: 'int',

		// objects defined below
		player: 'player',
		level: 'level',

		// arrays of primitives or objects
		enemy: ['enemy'],

		// dictionaries of primitives or objects
		levelClearTimes: {
			int: 'int'
		},
		levelsById: {
			int: 'level'
		}
	},

	// these are objects defined by the game
	objects: [
		player: {
			position: 'vector2',
			score: 'int',
			jump: 'bool',
			myIntList: ['int'],
		}
		enemy: {
			position: 'vector2',
			health: 'int',
		},
		level: {
			id: 'int',
			tiles: ['tile']
		},
		tile: {
			position: 'vector2',
			type: 'int'
		}
	],
}
```

The json state will exist in both the logic and the renderer, so object structures are not shared, only the values of

```
Binary encoding:

0-32: pog major version
32-64: pog minor version

* fields are done alphabetically

* vectors and fixed length structs are inline

* arrays, lists and dictionaries are represented as an integer of their total length

* array, list and dictionary reading happens after reading the primitives in the state

* strings are utf16 encoded
```

tic tac toe example:

```json
{
	// 0 is not taken, 1 is X 2 is O
	board: [
		0, 0, 0,
		0, 2, 0
		1, 0, 0
	]
}
```

```
// fields
uinxt 9  // length of array

// arrays, lists and dictionaries
ubyte 0 // top left
ubyte 0 // top middle
ubyte 0 // top right
ubyte 0 // middle left
ubyte 2 // middle middle
ubyte 1 // bottom left
ubyte 0 // bottom middle
ubyte 0 // bottom right
```

pong example:
```
{
	isGameOver: false,
	player1: {
		position: [0, 100],
		score: 1
	}
	player2: {
		position: [100,-100],
		score: 0
	},
	ball: {
		position: [50, 50]
	}
}
```

Client libraries:

```
(json schema) => file of native object

(binary data, json schema) => native object

(native object, json schema) => binary data
```

e.g. csharp

```
public static string StateFile(string json, string path) {
	// outputs a .cs file to path that has the structure of the json file
}

```