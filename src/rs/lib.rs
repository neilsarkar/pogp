use wasm_bindgen::prelude::*;

pub mod inputs;

// https://rustwasm.github.io/docs/book/game-of-life/implementing.html
#[wasm_bindgen]
pub struct Inputs {
    buffer: Vec<u8>,
}

#[wasm_bindgen]
#[repr(u8)]
#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub enum Cell {
    Dead = 0,
    Alive = 1,
}

#[wasm_bindgen]
impl Inputs {
    pub fn new() -> Inputs {
        let buffer = (0..10).collect();

        Inputs { buffer }
    }

    pub fn tick(&mut self) {
        if self.buffer[0] == 1 {
            self.buffer[1] = 66;
        } else {
            self.buffer[1] = 0;
        }
    }

    pub fn input_buffer(&self) -> *const u8 {
        return self.buffer.as_ptr();
    }
}
