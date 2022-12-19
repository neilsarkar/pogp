use super::{InputType, Key};

#[derive(Debug, Default)]
pub struct KeyboardInput {
    keys: Vec<Key>,
}

impl KeyboardInput {
    pub fn new() -> Self {
        Self { keys: Vec::new() }
    }

    pub fn set_key(&mut self, key: Key) {
        if self.is_key_down(key) {
            return;
        }
        self.keys.push(key);
    }

    pub fn is_key_down(&self, key: Key) -> bool {
        return self.keys.contains(&key);
    }
}

impl From<Vec<Key>> for KeyboardInput {
    fn from(keys: Vec<Key>) -> Self {
        Self { keys }
    }
}

impl From<[u8; 10]> for KeyboardInput {
    fn from(buffer: [u8; 10]) -> Self {
        KeyboardInput::from(&buffer as &[u8])
    }
}

impl From<&[u8]> for KeyboardInput {
    fn from(buffer: &[u8]) -> Self {
        if buffer[0] != InputType::Keyboard as u8 {
            panic!(
                "Expected first byte to be {}, but it was {}",
                InputType::Keyboard as u8,
                buffer[0]
            );
        }
        let mut keys = Vec::new();
        let mut byte_index = 0;
        let mut bit_index = 0;
        let mut current_enum: u8 = 0;

        while byte_index < buffer.len() - 1 {
            if buffer[byte_index + 1] & (1 << bit_index) > 0 {
                keys.push(Key::from(current_enum));
            }

            bit_index += 1;
            current_enum += 1;
            if bit_index == 8 {
                byte_index += 1;
                bit_index = 0;
            }
        }
        Self { keys }
    }
}

#[cfg(test)]
mod keyboard_input {
    use crate::inputs::InputType;

    use super::*;

    #[test]
    fn new() {
        let input = KeyboardInput::new();
        assert_eq!(input.keys.len(), 0);
    }

    #[test]
    fn is_key_down() {
        let mut input = KeyboardInput::new();
        input.set_key(Key::KeyA);
        assert_eq!(input.keys.len(), 1);
        assert_eq!(input.is_key_down(Key::KeyA), true);
    }

    #[test]
    fn set_key() {
        let mut input = KeyboardInput::new();
        input.set_key(Key::KeyB);
        assert_eq!(input.keys.len(), 1);
        input.set_key(Key::KeyB);
        assert_eq!(input.keys.len(), 1, "set key only sets once");
    }

    #[test]
    fn from_vec() {
        let input = KeyboardInput::from(vec![Key::Digit2]);
        assert_eq!(input.keys.len(), 1);
        assert_eq!(input.is_key_down(Key::Digit2), true, "builds from vec");
    }

    #[test]
    fn from_u8array() {
        let mut buffer: [u8; 10] = [0; 10];
        buffer[0] = InputType::Keyboard as u8;
        buffer[1] |= 1 << 1;
        buffer[1] |= 1 << 2;
        buffer[4] |= 1 << 6;
        let input = KeyboardInput::from(buffer);
        assert_eq!(input.keys.len(), 3);
        assert_eq!(input.keys[0], Key::ArrowDown);
        assert_eq!(input.keys[1], Key::ArrowLeft);
        assert_eq!(input.keys[2], Key::Minus);
    }

    #[test]
    #[should_panic(expected = "first byte to be 4, but it was 3")]
    fn from_u8array_bad_input_type() {
        let mut buffer: [u8; 10] = [0; 10];
        buffer[0] = InputType::Mouse as u8;
        let _nope = KeyboardInput::from(buffer);
    }

    #[test]
    fn from_slice_ref() {
        let buffer: &mut [u8] = &mut [0; 20];
        buffer[0] = InputType::Keyboard as u8;
        buffer[1] |= 1 << 1;
        buffer[1] |= 1 << 2;
        buffer[4] |= 1 << 6;

        let input = KeyboardInput::from(buffer as &[u8]);
        assert_eq!(input.keys.len(), 3);
        assert_eq!(input.keys[0], Key::ArrowDown);
        assert_eq!(input.keys[1], Key::ArrowLeft);
        assert_eq!(input.keys[2], Key::Minus);
    }
}
