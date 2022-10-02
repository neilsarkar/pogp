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