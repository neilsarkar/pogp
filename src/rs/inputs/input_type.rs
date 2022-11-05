#[repr(u8)]
#[derive(Clone, Copy, Debug, PartialEq, Eq)]
#[allow(dead_code)]
pub enum InputType {
    Null,
    Gamepad,
    Touch,
    Mouse,
    Keyboard,
    Custom,
}
