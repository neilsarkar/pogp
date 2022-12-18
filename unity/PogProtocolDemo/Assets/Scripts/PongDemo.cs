using System;
using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public class PongDemo : MonoBehaviour
{
    GameState gameState;
    IntPtr baton;
    long frame;

    // Start is called before the first frame update
    void Start()
    {
        Debug.Log($"Hello World");
        Debug.Log($"1+1={PogpNative.pogp_add(1, 1)}");
        PogpNative.pogp_start(out baton, out gameState);
    }

    // Update is called once per frame
    void Update()
    {
        var inputBytes = Pogp.Inputs.ReadInputs();
        gameState = PogpNative.pogp_tick(baton, frame++, inputBytes, inputBytes.Length);

        Debug.Log($"ball.x={gameState.ball.x}");
    }
}
