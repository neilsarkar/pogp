import {Pog} from '../types'

export type GameState = {
	leftPaddle: BoundingBox,
	rightPaddle: BoundingBox,
	score: number[],
	ball: Ball
}

export type Ball = BoundingBox & {
	v: {
		x: number,
		y: number
	}
}

export type BoundingBox = Pog.Point & {
	w: number,
	h: number
}
