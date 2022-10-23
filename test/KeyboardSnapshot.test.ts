import { InputType, Key } from "../src/enums";
import { KeyboardSnapshot } from "../src/KeyboardSnapshot"

describe('KeyboardSnapshot', function() {
	describe('.isKeyDown', function() {
		it('registers on first frame key is down', () => {
			const snapshot = new KeyboardSnapshot();
			snapshot.addInput({
				type: InputType.Keyboard,
				keys: [Key.KeyW]
			});

			expect(snapshot.isKeyDown(Key.KeyW)).toEqual(true);
		})

		it('is false on next frame', () => {
			const snapshot = new KeyboardSnapshot();
			snapshot.addInput({
				type: InputType.Keyboard,
				keys: [Key.KeyW]
			})
			snapshot.addInput({
				type: InputType.Keyboard,
				keys: [Key.KeyW]
			})

			expect(snapshot.isKeyDown(Key.KeyW)).toEqual(false);
		})
	})

	describe('.isKeyPressed', function() {
		it('is true while key is down', () => {
			const snapshot = new KeyboardSnapshot();

			expect(snapshot.isKeyPressed(Key.IntlYen)).toEqual(false);

			snapshot.addInput({type: InputType.Keyboard, keys: [Key.IntlYen]})
			expect(snapshot.isKeyPressed(Key.IntlYen)).toEqual(true);

			snapshot.addInput({type: InputType.Keyboard, keys: [Key.IntlYen]})
			expect(snapshot.isKeyPressed(Key.IntlYen)).toEqual(true);

			snapshot.addInput({type: InputType.Keyboard, keys: []})
			expect(snapshot.isKeyPressed(Key.IntlYen)).toEqual(false);
		})
	})

	describe('.isKeyUp', function() {
		it('registers on first frame key is released', () => {
			const snapshot = new KeyboardSnapshot();

			// false when key down
			snapshot.addInput({type: InputType.Keyboard, keys: [Key.Enter]})
			expect(snapshot.isKeyUp(Key.Enter)).toEqual(false);

			// false while key pressed
			snapshot.addInput({type: InputType.Keyboard, keys: [Key.Enter]})
			expect(snapshot.isKeyUp(Key.Enter)).toEqual(false);

			// true on frame of release
			snapshot.addInput({type: InputType.Keyboard, keys: []})
			expect(snapshot.isKeyUp(Key.Enter)).toEqual(true);

			// false on next frame
			snapshot.addInput({type: InputType.Keyboard, keys: []})
			expect(snapshot.isKeyUp(Key.Enter)).toEqual(false);
		})
	})
})
