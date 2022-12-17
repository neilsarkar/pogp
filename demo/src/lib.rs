use pogp::inputs::{Key, KeyboardInput, KeyboardSnapshot};

// TODO: get time measurement on wasm or c
// use std::time::Instant;

#[cfg(target_family = "wasm")]
use wasm_bindgen::prelude::*;
#[cfg(target_family = "wasm")]
extern crate web_sys;
#[cfg(target_family = "wasm")]
mod utils;
// A macro to provide `println!(..)`-style syntax for `console.log` logging.
#[cfg(target_family = "wasm")]
#[allow(unused_macros)]
macro_rules! log {
    ( $( $t:tt )* ) => {
        web_sys::console::log_1(&format!( $( $t )* ).into());
    }
}

struct GameConfig {
    ball_speed: f32,
    paddle_speed: f32,
}
impl Default for GameConfig {
    fn default() -> Self {
        Self {
            ball_speed: 1.6,
            paddle_speed: 1.0,
        }
    }
}

// https://rustwasm.github.io/docs/book/game-of-life/implementing.html
// https://serde.rs/#data-formats

#[cfg_attr(target_family = "wasm", wasm_bindgen)]
pub struct Game {
    input_buffer: [u8; 10],
    keyboard: KeyboardSnapshot,
    pub state: GameState,
    config: GameConfig,
    is_paused: bool,

    // now: Instant,
    // https://gafferongames.com/post/fix_your_timestep/
    accumulator: u128,
}

#[cfg_attr(target_family = "wasm", wasm_bindgen)]
impl Game {
    pub fn new() -> Game {
        #[cfg(target_family = "wasm")]
        utils::set_panic_hook();

        let mut game = Self {
            input_buffer: [0; 10],
            keyboard: KeyboardSnapshot::new(),
            state: Default::default(),
            config: Default::default(),
            is_paused: false,
            accumulator: 0,
            // now: Instant::now(),
        };
        game.reset();
        game
    }

    // TODO: accept input buffer here or output input buffer to unity
    // pub fn tick(&mut self, input_buffer: &[u8], _frame: u64) {
    pub fn tick(&mut self, _frame: u64) {
        // TODO: move to derivable
        if self.is_paused {
            return;
        }
        // let now = Instant::now();
        // let millis = now.duration_since(self.now).as_millis();
        // let dt: f32 = (millis as f32) / 20.0;
        // self.accumulator += millis;
        // self.now = now;
        self.accumulator += 16;

        // apply inputs from binary pogp input buffer to move paddles
        self.apply_inputs();

        // TODO: make this work for both with timing
        // let dt = 0.01666;
        let dt = 1.0;

        while self.accumulator >= 16 {
            // check collisions between ball and paddles
            self.process_collisions();

            // apply velocity to ball position
            self.state.ball.x += self.state.ball.v.x * dt;
            self.state.ball.y += self.state.ball.v.y * dt;
            self.accumulator -= 16;
        }

        // check for win condition
        if self.state.ball.x < 0.0 {
            self.state.p1_score += 1;
            self.reset();
        } else if self.state.ball.x + self.state.ball.w > 100.0 {
            self.state.p0_score += 1;
            self.reset();
        }
    }

    // fn apply_inputs(&mut self, input_buffer: &[u8]) {
    fn apply_inputs(&mut self) {
        let keyboard_input = KeyboardInput::from(self.input_buffer);
        self.keyboard.add_input(keyboard_input);

        if self.keyboard.is_key(Key::ArrowDown) {
            self.state.p0.y += self.config.paddle_speed;
        }
        if self.keyboard.is_key(Key::ArrowUp) {
            self.state.p0.y -= self.config.paddle_speed;
        }
        if self.keyboard.is_key(Key::KeyW) {
            self.state.p1.y -= self.config.paddle_speed;
        }
        if self.keyboard.is_key(Key::KeyS) {
            self.state.p1.y += self.config.paddle_speed;
        }
    }

    fn process_collisions(&mut self) {
        // clamp paddles to remain on screen
        self.state.p0.y = self.state.p0.y.clamp(0.0, 100.0 - self.state.p0.h);
        self.state.p1.y = self.state.p1.y.clamp(0.0, 100.0 - self.state.p1.h);

        // bounce ball off top and bottom
        if self.state.ball.y < 0.0 || self.state.ball.y > 100.0 - self.state.ball.h {
            self.state.ball.v.y *= -1.0;
        }

        //check collision between ball and left paddle
        self.state
            .ball
            .process_collisions(self.state.p0, self.config.ball_speed);
        // check collision between ball and right paddle
        self.state
            .ball
            .process_collisions(self.state.p1, self.config.ball_speed);
    }

    // for clarity in this toy example, positions are represented as floats
    // (0,0) is top left corner, (100, 100) is bottom right
    fn reset(&mut self) {
        self.state.p0.w = 3.0;
        self.state.p0.h = 15.0;
        self.state.p0.x = 0.0;
        self.state.p0.y = 50.0 - self.state.p0.h / 2.0;

        self.state.p1.w = 3.0;
        self.state.p1.h = 15.0;
        self.state.p1.x = 100.0 - self.state.p1.w;
        self.state.p1.y = 50.0 - self.state.p1.h / 2.0;

        self.state.ball.w = 3.0;
        self.state.ball.h = 3.0;
        self.state.ball.x = 50.0 - self.state.ball.w / 2.0;
        self.state.ball.y = 50.0 - self.state.ball.h / 2.0;
        self.state.ball.v = Vector2 {
            x: self.config.ball_speed,
            y: 0.0,
        };
    }

    pub fn input_buffer(&self) -> *const u8 {
        return self.input_buffer.as_ptr();
    }
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
