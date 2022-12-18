mod pong_config;
use pogp::inputs::{Key, KeyboardInput, KeyboardSnapshot};
use pong::{GameState, Vector2};
use pong_config::PongConfig;

pub mod pong;

// FFI methods
#[no_mangle]
pub unsafe extern "C" fn pogp_start(baton_ptr: *mut *const Game, state_ptr: *mut *const GameState) {
    let game = Game::new();
    *state_ptr = Box::into_raw(Box::new(game.state));
    *baton_ptr = Box::into_raw(Box::new(game));
}

#[no_mangle]
pub unsafe extern "C" fn pogp_tick(
    baton_ptr: *mut Game,
    frame: u64,
    input_bytes: *const u8,
    len: usize,
) -> *const GameState {
    let slice = std::slice::from_raw_parts(input_bytes, len);
    let game = &mut *baton_ptr;
    game.unity_tick(slice, frame);
    Box::into_raw(Box::new(game.state))
}

// TODO: get time measurement on wasm or c
cfg_if::cfg_if! {
    if #[cfg(target_family = "wasm")] {
        use wasm_bindgen::prelude::*;
        extern crate web_sys;
        mod utils;
        #[allow(unused_macros)]
        macro_rules! log {
            ( $( $t:tt )* ) => {
                web_sys::console::log_1(&format!( $( $t )* ).into());
            }
        }
    } else {
        use std::time::Instant;

        macro_rules! log {
            ( $s:expr ) => {
                println!($s);
            }
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
    config: PongConfig,
    is_paused: bool,

    #[cfg(not(target_family = "wasm"))]
    now: Instant,
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
            #[cfg(not(target_family = "wasm"))]
            now: Instant::now(),
        };
        game.reset();
        game
    }

    pub fn tick(&mut self, _frame: u64) {
        // apply inputs from binary pogp input buffer to move paddles
        let keyboard_input = KeyboardInput::from(self.input_buffer);
        self.apply_inputs(keyboard_input);

        self.shared_tick(_frame);
    }

    pub fn unity_tick(&mut self, input_buffer: &[u8], _frame: u64) {
        if self.is_paused {
            return;
        }

        let keyboard_input = KeyboardInput::from(input_buffer);
        self.apply_inputs(keyboard_input);

        self.shared_tick(_frame);
    }

    fn shared_tick(&mut self, _frame: u64) {
        cfg_if::cfg_if! {
            if #[cfg(target_family = "wasm")] {
                self.accumulator += 16;
                let dt = 1.0;
            } else {
                let now = Instant::now();
                let millis = now.duration_since(self.now).as_millis();
                let dt: f32 = (millis as f32) / 20.0;
                self.accumulator += millis;
                self.now = now;
                println!("millis = {}, dt = {}", millis, dt);
            }
        }

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

    fn apply_inputs(&mut self, keyboard_input: KeyboardInput) {
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
