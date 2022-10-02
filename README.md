# Portable Open Game Protocol 0.1.0

Game development is hard. It shouldn't be.

Making games should feel like playing games.

* People should be able to use the languages and tools they're already familiar with.

* Developer experience should prioritize immersion in a flow state.

* Low level problems should have shared solutions.

## Introducing the POG Protocol

The POG Protocol defines language-agnostic binary and json representations of [Inputs](#inputs) and [State](#state).

This allows us to implement the classic game loop as three independent pieces, each written in any language, framework or engine:
```
while(true) {
	inputs = readInputs();
	state = runLogic(inputs, state);
	render(state);
}
```

## Interactive Examples

https://pogp.games/examples/input

https://pogp.games/examples/state

## Inputs

Inputs contain the state of the input at the current frame.

Whenever possible, representations are based on open standards.

Interactive example: https://pogp.games/examples/input

[Gamepad (a.k.a. Controller) Input](#gamepad-input)

[Touch Input](#touch-input)

[Mouse Input](#mouse-input)

[Keyboard Input](#keyboard-input)

### **Gamepad Input**

Gamepad input represents what's commonly called a "Controller".

We extend the open standard https://developer.mozilla.org/en-US/docs/Web/API/Gamepad with a standard for generic positional identifiers.

[JSON Schema](#gamepad-json-schema) | [JSON Example](#gamepad-json-example)

[Binary Schema](#gamepad-binary-schema) | [Binary Example](#gamepad-binary-example)

#### **Gamepad JSON Schema**

*type*

* This will be an [Input Type](#input-type-enum) set to `gamepad`

*id*

* The [Gamepad.id](https://developer.mozilla.org/en-US/docs/Web/API/Gamepad/id) of the gamepad

*vendorId*

* The [vendor id](https://gist.github.com/nondebug/aec93dff7f0f1969f4cc2291b24a3171) of the gamepad.

*productId*

* The [product id](https://gist.github.com/nondebug/aec93dff7f0f1969f4cc2291b24a3171) of the gamepad.

*vendorName*

* A human readable name for the vendor, e.g. `Nintendo`, `Microsoft`, `Sony` etc

*productName*

* A human readable name for the product, e.g. `Left joy-con`, `Xbox Series S`, `Dualshock 5`

*buttons*

* An array of [Button](#gamepad-button-binary-schema) states
	* *label*
		* the text printed on the button, e.g. `Triangle`, `A`, `ZR`
	* *value*
		* int representing the percentage depressed with four digits of precision
	* *touched*
		* boolean representing whether button is touched
	* *position*
		* string enum representing [button position](#button-position-enum) , e.g. `left-face-top`, `right-shoulder-front`

*axes*

* An array of `Axes` states
	* *hand*
		* string enum representing hand intended to be used with joystick: `left` | `right` | `unknown`
	* *value*
		* an array of two signed longs representing the `x` and `y` position of the thumbstick

#### **Gamepad JSON Example**

```js
{
	type: 'Gamepad',
	id: 'Stadia Controller rev. A (STANDARD GAMEPAD Vendor: 18d1 Product: 9400)'
	vendorName: "Google",
	productName: "Stadia",

	buttons: [
		{
			label: 'A',
			position: 'right-face-bottom',
			value: 100000 // 100%
		},
		{
			label: 'B',
			position: 'right-face-right',
			value: 500600 // 50.06%
		},
		{
			label: 'X',
			position: 'right-face-left',
			touched: true,
			value: 0
		},
		{
			label: 'Y',
			position: 'right-face-top',
			value: 0
		},
		{
			label: 'L1',
			position: 'left-shoulder-front',
			value: 0
		},
		{
			label: 'L2',
			position: 'left-shoulder-back',
			value: 0
		},
		// ...
	],
	axes: [
		{
			hand: 'left',
			value: [
				0n, // x-axis idle
				2147483647n // y-axis max up
			]
		},
		{
			hand: 'right',
			value: [
				-2147483647, // x-axis full left
				-2147483647  // y-axis full down
			]
		}
	],
}
```

#### **Gamepad Binary Schema**

data | example | type | index | length (bytes)
|-|-|-|-|-|
`type` | 1 | `byte` ([Input Type](#input-type-enum))| 0 | 1
`buttons.length` | 12 | `ushort` | 1 | 2
`axes.length` | 12 | `ushort` | 3 | 2
`buttons` | [[Button](#gamepad-button-binary-schema), [Button](#gamepad-button-binary-schema)] | [Button](#gamepad-button-binary-schema) | 5 | 69 * `buttons.length`
`axes` | [[Axes](#gamepad-axes-binary-schema), [Axes](#gamepad-axes-binary-schema)] | [Axes](#gamepad-axes-binary-schema) | 5 + (69 * `buttons.length`)| 129 * `axes.length`
`id` | `"Stadia Controller rev. A (STANDARD GAMEPAD Vendor: 18d1 Product: 9400)"` | `string` | 1 | 8192


#### **Gamepad Button Binary Schema**

data | example | type | index | length (bytes)
|-|-|-|-|-|
`position` | 2 | `byte` ([ButtonPosition]()) | 0 | 1
`value` | 100000 | `int` | 1 | 4
`label` | `"A"` | `string` | 5 | 64

#### **Gamepad Axes Binary Schema**

data | example | type | index | length (bytes)
|-|-|-|-|-|
`hand` | 1 | `byte` ([Hand](#hand-enum)) | 0 | 1
`x` | 100000 | `long` | 1 | 64
`y` | 100000 | `long` | 65 | 64

### **Touch Input**

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

### **Mouse Input**

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

### **Keyboard Input**

Keyboard keys are represented using the w3 standard, supporting standard 101, Korean, Brazilian and Japanese keyboards.

https://www.toptal.com/developers/keycode

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

The json state will exist in both the logic and the renderer, so object structures are not shared, only the values

data | example | type | index | length (bytes)
|-|-|-|-|-|
`pog major version` | 0 | `int` | 0 | 4
`pog minor version` | 1 | `int` | 4 | 4

```
* fields are done alphabetically

* vectors and fixed length structs are inline

* arrays, lists and dictionaries are represented as an integer of their total length

* array, list and dictionary reading happens after reading the primitives in the state

* strings are utf32 encoded
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
uint 9  // length of array

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

#### *Button Position Enum*

value | name | example (xbox one)
-|-|-
0 | `null`
1 | `left-face-top` | dpad up
2 | `left-face-right` | dpad right
3 | `left-face-bottom` | dpad down
4 | `left-face-left` | dpad left
5 | `left-shoulder-front` | LB
6 | `left-shoulder-back` | LT
7 | `left-thumbstick` | L3
8 | `right-face-top` | Y
9 | `right-face-right` | B
10 | `right-face-bottom` | A
11 | `right-face-left` | X
12 | `right-shoulder-front` | RB
13 | `right-shoulder-back` | RT
14 | `right-thumbstick` | R3
15 | `middle` | Xbox Button
16 | `middle-left` | View Button
17 | `middle-right` | Menu Button

#### *Input Type Enum*

| value | name |
|-|-|
0 | `null`
1 | `gamepad`
2 | `touch`
3 | `mouse`
4 | `keyboard`
5 | `custom`

#### *Hand Enum*

value | name
-|-
0 | `null`
1 | `left`
2 | `right`