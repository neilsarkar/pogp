use super::key::Key;

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
        Self { keys: keys }
    }
}

#[cfg(test)]
mod keyboard_input {
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
        let _input = KeyboardInput::from(vec![Key::Digit2]);
        assert_eq!(_input.keys.len(), 1);
        assert_eq!(_input.is_key_down(Key::Digit2), true, "builds from vec");
    }
}
