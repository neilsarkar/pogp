import { ButtonPosition, InputType } from "../src/enums";
import { GamepadSnapshot } from "../src/GamepadSnapshot";
import { Pog } from "../src/types";
import {describe, expect, it} from 'vitest';

describe('GamepadSnapshot', function() {
	describe('.isButtonDown', function() {
		it('registers on first frame button is down', function() {
			const snapshot = new GamepadSnapshot();
			const input : Pog.GamepadInput = {
				type: InputType.Gamepad,
				id: 'nope',
				buttons: [
					{
						value: 10000,
						position: ButtonPosition.RightFaceBottom
					}
				],
				axes: []
			}

			snapshot.addInput(input)

			expect(snapshot.isButtonDown(ButtonPosition.RightFaceBottom)).toEqual(true);
		})
	})
})