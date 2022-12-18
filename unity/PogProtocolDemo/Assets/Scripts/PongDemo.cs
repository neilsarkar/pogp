using System;
using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public class PongDemo : MonoBehaviour
{
	[NonSerialized]
	GameState gameState;
	[NonSerialized]
	IntPtr baton;
	[NonSerialized]
	long frame;

	void Awake()
	{
		PogpNative.pogp_start(out baton, out gameState);
	}

	// Update is called once per frame
	void Update()
	{
		var inputBytes = Pogp.Inputs.ReadInputs();
		gameState = PogpNative.pogp_tick(baton, frame++, inputBytes, inputBytes.Length);
	}

	void OnGUI()
	{
		DrawPaddle(gameState.p0);
		DrawPaddle(gameState.p1);
		DrawBall(gameState.ball);
	}

	void DrawPaddle(Paddle paddle)
	{
		DrawRect(paddle.x, paddle.y, paddle.w, paddle.h);
	}

	void DrawBall(Ball ball)
	{
		DrawRect(ball.x, ball.y, ball.w, ball.w * screenWidth / screenHeight);
	}

	public float screenWidth = 38f;
	public float screenHeight = 20f;

	void DrawRect(float x, float y, float w, float h)
	{
		var rect = new Rect(x * screenWidth, y * screenHeight, w * screenWidth, h * screenHeight);
		GUI.DrawTexture(rect, Texture2D.whiteTexture, ScaleMode.StretchToFill, false);
	}
}
