use pogp::inputs::KeyboardInput;
#[cfg(target_family = "wasm")]
use wasm_bindgen::prelude::*;

#[cfg_attr(target_family = "wasm", wasm_bindgen)]
#[cfg_attr(not(target_family = "wasm"), repr(C))]
#[derive(Default, Copy, Clone)]
pub struct GameState {
    pub p0: Paddle,
    pub p1: Paddle,
    pub ball: Ball,
    pub p0_score: i32,
    pub p1_score: i32,
}

#[cfg_attr(target_family = "wasm", wasm_bindgen)]
#[cfg_attr(not(target_family = "wasm"), repr(C))]
#[derive(Default, Copy, Clone)]
pub struct Paddle {
    pub x: f32,
    pub y: f32,
    pub w: f32,
    pub h: f32,
}

#[cfg_attr(target_family = "wasm", wasm_bindgen)]
#[cfg_attr(not(target_family = "wasm"), repr(C))]
#[derive(Default, Copy, Clone)]
pub struct Ball {
    pub x: f32,
    pub y: f32,
    pub w: f32,
    pub h: f32,
    pub v: Vector2,
}

#[cfg_attr(target_family = "wasm", wasm_bindgen)]
#[cfg_attr(not(target_family = "wasm"), repr(C))]
#[derive(Default, Copy, Clone)]
pub struct Vector2 {
    pub x: f32,
    pub y: f32,
}

impl Ball {
    pub fn process_collisions(&mut self, paddle: Paddle, speed: f32) {
        // if we're not colliding, do nothing
        if !self.is_colliding(&paddle) {
            return;
        }
        // reverse x direction
        self.v.x = -self.v.x;

        // if we hit the top third of the paddle, send ball at a 45 degree angle up
        self.v.y = if (self.y + self.h / 2.0) < paddle.y + paddle.h / 3.0 {
            -speed
        // if we hit the bottom third of the paddle, send ball at a 45 degree angle down
        } else if (self.y + self.h / 2.0) > paddle.y + 2.0 * paddle.h / 3.0 {
            speed
        // if we hit the middle of the paddle, send ball directly across
        } else {
            0.0
        };
    }
}

trait BoundingBox {
    fn dimensions(&self) -> (f32, f32, f32, f32);
    fn is_colliding(&self, other: &impl BoundingBox) -> bool;
}

impl BoundingBox for Paddle {
    fn dimensions(&self) -> (f32, f32, f32, f32) {
        (self.x, self.y, self.w, self.h)
    }

    fn is_colliding(&self, other: &impl BoundingBox) -> bool {
        let (x, y, w, h) = other.dimensions();
        self.x < x + w && self.x + self.w > x && self.y < y + h && self.h + self.y > y
    }
}

impl BoundingBox for Ball {
    fn dimensions(&self) -> (f32, f32, f32, f32) {
        (self.x, self.y, self.w, self.h)
    }

    fn is_colliding(&self, other: &impl BoundingBox) -> bool {
        let (x, y, w, h) = other.dimensions();
        self.x < x + w && self.x + self.w > x && self.y < y + h && self.h + self.y > y
    }
}
