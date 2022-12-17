use super::Key;
use super::KeyboardInput;

const INPUT_BUFFER_LENGTH: usize = 10;

#[derive(Debug)]
pub struct KeyboardSnapshot {
    inputs: [KeyboardInput; INPUT_BUFFER_LENGTH],
    index: usize,
}

impl KeyboardSnapshot {
    pub fn new() -> Self {
        Self {
            inputs: Default::default(),
            index: 0,
        }
    }

    pub fn add_input(&mut self, input: KeyboardInput) {
        self.inputs[self.index] = input;
        self.advance_index();
    }

    pub fn is_key_down(&mut self, key: Key) -> bool {
        self.inputs[self.head()].is_key_down(key)
            && !self.inputs[self.last_frame()].is_key_down(key)
    }

    pub fn is_key_pressed(&mut self, key: Key) -> bool {
        self.inputs[self.head()].is_key_down(key)
    }

    pub fn is_key(&mut self, key: Key) -> bool {
        self.is_key_pressed(key)
    }

    pub fn is_key_up(&mut self, key: Key) -> bool {
        !self.inputs[self.head()].is_key_down(key)
            && self.inputs[self.last_frame()].is_key_down(key)
    }

    fn advance_index(&mut self) {
        self.index = if self.index == INPUT_BUFFER_LENGTH - 1 {
            0
        } else {
            self.index + 1
        }
    }

    fn last_frame(&mut self) -> usize {
        match self.index {
            0 => INPUT_BUFFER_LENGTH - 1,
            1 => INPUT_BUFFER_LENGTH - 2,
            _ => self.index - 2,
        }
    }

    fn head(&mut self) -> usize {
        if self.index == 0 {
            INPUT_BUFFER_LENGTH - 1
        } else {
            self.index - 1
        }
    }
}

#[cfg(test)]
mod keyboard_snapshot {
    use super::*;

    #[test]
    fn add_input() {
        let mut snapshot = KeyboardSnapshot::new();

        for _ in 0..40 {
            snapshot.add_input(KeyboardInput::from(vec![Key::Enter]));
        }
    }

    #[test]
    fn is_key_down() {
        let mut snapshot = KeyboardSnapshot::new();
        assert_eq!(snapshot.is_key_down(Key::KeyW), false, "false on empty");

        snapshot.add_input(KeyboardInput::from(vec![Key::KeyW]));
        assert_eq!(snapshot.is_key_down(Key::KeyW), true, "true on key down");

        snapshot.add_input(KeyboardInput::from(vec![Key::KeyW]));
        assert_eq!(
            snapshot.is_key_down(Key::KeyW),
            false,
            "false while key down"
        );

        snapshot.add_input(Default::default());
        assert_eq!(snapshot.is_key_down(Key::KeyW), false, "false on key up");
    }

    #[test]
    fn is_key_pressed() {
        let mut snapshot = KeyboardSnapshot::new();
        assert_eq!(
            snapshot.is_key_pressed(Key::IntlYen),
            false,
            "false on empty"
        );

        snapshot.add_input(KeyboardInput::from(vec![Key::IntlYen]));
        assert_eq!(
            snapshot.is_key_pressed(Key::IntlYen),
            true,
            "true on key down"
        );

        snapshot.add_input(KeyboardInput::from(vec![Key::IntlYen]));
        assert_eq!(
            snapshot.is_key_pressed(Key::IntlYen),
            true,
            "true while key down"
        );

        snapshot.add_input(Default::default());
        assert_eq!(
            snapshot.is_key_pressed(Key::IntlYen),
            false,
            "false on key up"
        );
    }

    // #[test]
    // fn is_key_pressed() {}

    #[test]
    fn is_key_up() {
        let mut snapshot = KeyboardSnapshot::new();
        assert_eq!(snapshot.is_key_up(Key::Enter), false, "false on empty");

        snapshot.add_input(KeyboardInput::from(vec![Key::Enter]));
        assert_eq!(snapshot.is_key_up(Key::Enter), false, "false on key down");

        snapshot.add_input(KeyboardInput::from(vec![Key::Enter]));
        assert_eq!(
            snapshot.is_key_up(Key::Enter),
            false,
            "false while key down"
        );

        snapshot.add_input(Default::default());
        assert_eq!(snapshot.is_key_up(Key::Enter), true, "true on key up");

        snapshot.add_input(Default::default());
        assert_eq!(snapshot.is_key_up(Key::Enter), false, "false on next frame");
    }
}
