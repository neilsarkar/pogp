use pogp::inputs::{Key, KeyboardSnapshot};
#[cfg(target_family = "wasm")]
use wasm_bindgen::prelude::*;

use crate::pong_config::PongConfig;

pub fn start(state: &mut GameState, config: &PongConfig) {
    reset(state, config);
}

pub fn process_inputs(state: &mut GameState, config: &PongConfig, keyboard: &KeyboardSnapshot) {
    if keyboard.is_key(Key::ArrowDown) {
        state.p0.y += config.paddle_speed;
    }
    if keyboard.is_key(Key::ArrowUp) {
        state.p0.y -= config.paddle_speed;
    }
    if keyboard.is_key(Key::KeyW) {
        state.p1.y -= config.paddle_speed;
    }
    if keyboard.is_key(Key::KeyS) {
        state.p1.y += config.paddle_speed;
    }
}

pub fn fixed_update(state: &mut GameState, config: &PongConfig, dt: f32) {
    // clamp paddles to remain on screen
    state.p0.y = state.p0.y.clamp(0.0, 100.0 - state.p0.h);
    state.p1.y = state.p1.y.clamp(0.0, 100.0 - state.p1.h);

    // bounce ball off top and bottom
    if state.ball.y < 0.0 || state.ball.y > 100.0 - state.ball.h {
        state.ball.v.y *= -1.0;
    }

    //check collision between ball and left paddle
    state.ball.process_collisions(state.p0, config.ball_speed);
    // check collision between ball and right paddle
    state.ball.process_collisions(state.p1, config.ball_speed);

    // apply velocity to ball position
    state.ball.x += state.ball.v.x * dt;
    state.ball.y += state.ball.v.y * dt;
}

pub fn update(state: &mut GameState, config: &PongConfig) {
    // check for win condition
    if state.ball.x < 0.0 {
        state.p1_score += 1;
        reset(state, config);
    } else if state.ball.x + state.ball.w > 100.0 {
        state.p0_score += 1;
        reset(state, config);
    }
}

// for clarity in this toy example, positions are represented as floats
// (0,0) is top left corner, (100, 100) is bottom right
fn reset(state: &mut GameState, config: &PongConfig) {
    state.p0.w = 3.0;
    state.p0.h = 15.0;
    state.p0.x = 0.0;
    state.p0.y = 50.0 - state.p0.h / 2.0;

    state.p1.w = 3.0;
    state.p1.h = 15.0;
    state.p1.x = 100.0 - state.p1.w;
    state.p1.y = 50.0 - state.p1.h / 2.0;

    state.ball.w = 3.0;
    state.ball.h = 3.0;
    state.ball.x = 50.0 - state.ball.w / 2.0;
    state.ball.y = 50.0 - state.ball.h / 2.0;
    state.ball.v = Vector2 {
        x: config.ball_speed,
        y: 0.0,
    };
}

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
