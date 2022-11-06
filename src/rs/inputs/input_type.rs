#[repr(u8)]
#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub enum InputType {
    Null,
    Gamepad,
    Touch,
    Mouse,
    Keyboard,
    Custom,
}
