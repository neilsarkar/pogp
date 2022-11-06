# Portable Open Game Protocol 0.1.1

Game development is hard. It shouldn't be.

Making games should feel like playing games.

* People should be able to use languages and tools they're already familiar with.

* Developer experience should prioritize immersion in a flow state.

* Low level problems should have shared solutions.

## Introducing the POG Protocol

The POG Protocol defines language-neutral binary and json representations of [Inputs](#inputs) and [State](#state).

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

https://pogp.games/examples/pong

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
`buttons.length` | 12 | `uint16` | 1 | 2
`axes.length` | 12 | `uint16` | 3 | 2
`buttons` | [[Button](#gamepad-button-binary-schema), [Button](#gamepad-button-binary-schema)] | [Button](#gamepad-button-binary-schema) | 5 | 69 * `buttons.length`
`axes` | [[Axes](#gamepad-axes-binary-schema), [Axes](#gamepad-axes-binary-schema)] | [Axes](#gamepad-axes-binary-schema) | 5 + (69 * `buttons.length`)| 129 * `axes.length`


#### **Gamepad Button Binary Schema**

data | example | type | index | length (bytes)
|-|-|-|-|-|
`position` | 2 | `byte` ([ButtonPosition]()) | 0 | 1
`value` | 100000 | `uint32` | 1 | 4
`label` | `"A"` | `string` | 5 | 64

#### **Gamepad Axes Binary Schema**

data | example | type | index | length (bytes)
|-|-|-|-|-|
`hand` | 1 | `byte` ([Hand](#hand-enum)) | 0 | 1
`x` | 100000 | `int64` | 1 | 64
`y` | 100000 | `int64` | 65 | 64

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
	keys: [
		27,
		65
	]
}
```

data | type | byte index | bit index
-|-|-|-
`Null` | `bool` | 0 | 0
`ArrowDown` | `bool` | 0 | 1
`ArrowLeft` | `bool` | 0 | 2
`ArrowRight` | `bool` | 0 | 3
`ArrowUp` | `bool` | 0 | 4
`Backspace` | `bool` | 0 | 5
`Tab` | `bool` | 0 | 6
`CapsLock` | `bool` | 0 | 7
`Enter` | `bool` | 1 | 0
`ShiftLeft` | `bool` | 1 | 1
`ShiftRight` | `bool` | 1 | 2
`ControlLeft` | `bool` | 1 | 3
`MetaLeft` | `bool` | 1 | 4
`AltLeft` | `bool` | 1 | 5
`Space` | `bool` | 1 | 6
`AltRight` | `bool` | 1 | 7
`MetaRight` | `bool` | 2 | 0
... | `bool` | ... | ...
`IntlRo` | `bool` | 9 | 4

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

#### *Key Enum*

value | name
-|-
0 | `Null`
1 | `ArrowDown`
2 | `ArrowLeft`
3 | `ArrowRight`
4 | `ArrowUp`
5 | `Backspace`
6 | `Tab`
7 | `CapsLock`
8 | `Enter`
9 | `ShiftLeft`
10 | `ShiftRight`
11 | `ControlLeft`
12 | `MetaLeft`
13 | `AltLeft`
14 | `Space`
15 | `AltRight`
16 | `MetaRight`
17 | `ContextMenu`
18 | `ControlRight`
19 | `Backquote`
20 | `Digit1`
21 | `Digit2`
22 | `Digit3`
23 | `Digit4`
24 | `Digit5`
25 | `Digit6`
26 | `Digit7`
27 | `Digit8`
28 | `Digit9`
29 | `Digit0`
30 | `Minus`
31 | `Equal`
32 | `IntlYen`
33 | `KeyQ`
34 | `KeyW`
35 | `KeyE`
36 | `KeyR`
37 | `KeyT`
38 | `KeyY`
39 | `KeyU`
40 | `KeyI`
41 | `KeyO`
42 | `KeyP`
43 | `BracketLeft`
44 | `BracketRight`
45 | `Backslash`
46 | `KeyA`
47 | `KeyS`
48 | `KeyD`
49 | `KeyF`
50 | `KeyG`
51 | `KeyH`
52 | `KeyJ`
53 | `KeyK`
54 | `KeyL`
55 | `Semicolon`
56 | `Quote`
57 | `IntlBackslash`
58 | `KeyZ`
59 | `KeyX`
60 | `KeyC`
61 | `KeyV`
62 | `KeyB`
63 | `KeyN`
64 | `KeyM`
65 | `Comma`
66 | `Period`
67 | `Slash`
68 | `IntlRo`
