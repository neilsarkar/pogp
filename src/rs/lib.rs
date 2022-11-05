use wasm_bindgen::prelude::*;

pub mod inputs;

// https://rustwasm.github.io/docs/book/game-of-life/implementing.html
#[wasm_bindgen]
pub struct Hello {
    cells: Vec<u8>,
}

#[wasm_bindgen]
#[repr(u8)]
#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub enum Cell {
    Dead = 0,
    Alive = 1,
}

#[wasm_bindgen]
impl Hello {
    pub fn new() -> Hello {
        let cells = (0..10).collect();

        Hello { cells }
    }

    pub fn double(&mut self) {
        let mut i = 0;
        while i < 10 {
            self.cells[i] = self.cells[i] * 2;
            i = i + 1;
        }
    }

    pub fn cells(&self) -> *const u8 {
        return self.cells.as_ptr();
    }
}
