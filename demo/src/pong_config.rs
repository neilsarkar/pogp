pub struct PongConfig {
    pub ball_speed: f32,
    pub paddle_speed: f32,
}
impl Default for PongConfig {
    fn default() -> Self {
        Self {
            ball_speed: 1.6,
            paddle_speed: 1.0,
        }
    }
}
