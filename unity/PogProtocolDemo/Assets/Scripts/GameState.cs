using System;
using System.Runtime.InteropServices;

[StructLayout(LayoutKind.Sequential)]
[Serializable]
public class GameState {
    public Paddle p0;
    public Paddle p1;
    public Ball ball;
    public Int32 p0Score;
    public Int32 p1Score;
}

[StructLayout(LayoutKind.Sequential)]
[Serializable]
public struct Paddle {
	public float x;
	public float y;
	public float w;
	public float h;
}

[StructLayout(LayoutKind.Sequential)]
[Serializable]
public struct Ball {
	public float x;
	public float y;
	public float w;
	public float h;
	public Vector2 v;
}

[StructLayout(LayoutKind.Sequential)]
[Serializable]
public struct Vector2 {
	public float x;
	public float y;
}
