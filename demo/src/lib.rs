mod pong_config;
use pogp::inputs::{KeyboardInput, KeyboardSnapshot};
use pong::GameState;
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

cfg_if::cfg_if! {
    if #[cfg(target_family = "wasm")] {
        use wasm_bindgen::prelude::*;
        extern crate web_sys;
        mod utils;
        #[allow(unused_macros)]
        // TODO: expose log macro to callers
        macro_rules! log {
            ( $( $t:tt )* ) => {
                web_sys::console::log_1(&format!( $( $t )* ).into());
            }
        }
    } else {
        use std::time::Instant;

        #[allow(unused_macros)]
        // TODO: allow formatting c logs
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
            accumulator: 0,
            #[cfg(not(target_family = "wasm"))]
            now: Instant::now(),
        };
        pong::start(&mut game.state, &game.config);
        game
    }

    pub fn tick(&mut self, _frame: u64) {
        // apply inputs from binary pogp input buffer to move paddles
        let keyboard_input = KeyboardInput::from(self.input_buffer);
        self.apply_inputs(keyboard_input);

        self.shared_tick(_frame);
    }

    pub fn unity_tick(&mut self, input_buffer: &[u8], _frame: u64) {
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
            }
        }

        while self.accumulator >= 16 {
            pong::fixed_update(&mut self.state, &self.config, dt);
            self.accumulator -= 16;
        }

        pong::update(&mut self.state, &self.config);
    }

    fn apply_inputs(&mut self, keyboard_input: KeyboardInput) {
        self.keyboard.add_input(keyboard_input);

        pong::process_inputs(&mut self.state, &self.config, &self.keyboard);
    }

    pub fn input_buffer(&self) -> *const u8 {
        return self.input_buffer.as_ptr();
    }
}
