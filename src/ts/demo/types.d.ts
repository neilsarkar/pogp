import {Pog} from '../types'

export type GameState = {
	p0: Paddle,
	p1: Paddle,
	p0_score: number,
	p1_score: number,
	ball: Ball
}

export type Paddle = BoundingBox;

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
