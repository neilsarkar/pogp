use wasm_bindgen::prelude::*;

#[wasm_bindgen]
pub fn add(a: i32, b: i32) -> i32 {
  return a + b;
}

#[wasm_bindgen]
pub fn subtract(a: i32, b: i32) -> i32 {
  return a - b;
}

#[wasm_bindgen]
pub fn multiply(a: i32, b: i32) -> i32 {
  return a * b;
}

#[wasm_bindgen]
pub fn divide(a: i32, b: i32) -> i32 {
  return a / b;
}