export enum Hand {
	Null, Left, Right
}

export enum InputType {
	Null, Gamepad, Touch, Mouse, Keyboard, Custom
}

export enum ButtonPosition {
	Null,
	LeftFaceTop, LeftFaceRight, LeftFaceBottom, LeftFaceLeft,
	LeftShoulderFront, LeftShoulderBack, LeftThumbstick,

	RightFaceTop, RightFaceRight, RightFaceBottom, RightFaceLeft,
	RightShoulderFront, RightShoulderBack, RightThumbstick,

	Middle, MiddleLeft, MiddleRight
}

// https://www.w3.org/TR/uievents-code/#key-alphanumeric-writing-system
export enum Key {
	Null,

	ArrowDown,
	ArrowLeft,
	ArrowRight,
	ArrowUp,

	Backspace,
	Tab,
	CapsLock,
	Enter,
	ShiftLeft,
	ShiftRight,
	ControlLeft,
	MetaLeft,
	AltLeft,
	Space,
	AltRight,
	MetaRight,
	ContextMenu,
	ControlRight,

	Backquote,
	Digit1,
	Digit2,
	Digit3,
	Digit4,
	Digit5,
	Digit6,
	Digit7,
	Digit8,
	Digit9,
	Digit0,
	Minus,
	Equal,
	IntlYen,
	KeyQ,
	KeyW,
	KeyE,
	KeyR,
	KeyT,
	KeyY,
	KeyU,
	KeyI,
	KeyO,
	KeyP,
	BracketLeft,
	BracketRight,
	Backslash,
	KeyA,
	KeyS,
	KeyD,
	KeyF,
	KeyG,
	KeyH,
	KeyJ,
	KeyK,
	KeyL,
	Semicolon,
	Quote,
	IntlBackslash,
	KeyZ,
	KeyX,
	KeyC,
	KeyV,
	KeyB,
	KeyN,
	KeyM,
	Comma,
	Period,
	Slash,
	IntlRo,
}