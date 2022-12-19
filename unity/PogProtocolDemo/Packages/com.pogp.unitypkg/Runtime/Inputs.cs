using UnityEngine;
using System.IO;
using System;

namespace Pogp {
	public static class Inputs {
		const int KEYBOARD_LENGTH = 1 + 8 + 8;
		const int KEYBOARD_KEY_COUNT = 128;
		const byte INPUT_TYPE = 4;

		public static byte[] buffer = new byte[KEYBOARD_LENGTH];

		public static byte[] ReadInputs() {
			Array.Clear(buffer, 0, buffer.Length);
			// initialize byte to fill with bools and bitoffset
			byte b = 0;
			byte bitOffset = 0;
			byte byteOffset = 0;

			buffer[0] = INPUT_TYPE;
			byteOffset++;

			for (byte keyId = 0; keyId < KEYBOARD_KEY_COUNT; keyId++) {
				// map pogp key id to unity key id
				var unityKeyCode = PogpKeyToUnityKey(keyId);
				// check whether key is pressed
				var isPressed = Input.GetKey(PogpKeyToUnityKey(keyId));

				// set the current bit to 1 if the key is pressed
				b |= (byte)((isPressed ? 1 : 0) << bitOffset);
				// increase the bit offset
				bitOffset++;
				// if we've filled this byte with bits, write the byte and reset
				// for the next byte to fill
				if (bitOffset == 8) {
					buffer[byteOffset] = b;
					bitOffset = b = 0;
					byteOffset++;
				}
			}

			return buffer;
		}

		static KeyCode PogpKeyToUnityKey(byte keyId) {
			switch (keyId) {
				case 0: return KeyCode.None;
				case 1: return KeyCode.DownArrow;
				case 2: return KeyCode.LeftArrow;
				case 3: return KeyCode.RightArrow;
				case 4: return KeyCode.UpArrow;

				case 5: return KeyCode.Backspace;
				case 6: return KeyCode.Tab;
				case 7: return KeyCode.CapsLock;
				case 8: return KeyCode.Return;
				case 9: return KeyCode.LeftShift;
				case 10: return KeyCode.RightShift;
				case 11: return KeyCode.LeftControl;
				case 12: return KeyCode.LeftCommand;
				case 13: return KeyCode.LeftAlt;
				case 14: return KeyCode.Space;
				case 15: return KeyCode.RightAlt;
				case 16: return KeyCode.RightMeta;
				case 17: return KeyCode.Menu;
				case 18: return KeyCode.RightControl;
				case 19: return KeyCode.BackQuote;
				case 20: return KeyCode.Alpha1;
				case 21: return KeyCode.Alpha2;
				case 22: return KeyCode.Alpha3;
				case 23: return KeyCode.Alpha4;
				case 24: return KeyCode.Alpha5;
				case 25: return KeyCode.Alpha6;
				case 26: return KeyCode.Alpha7;
				case 27: return KeyCode.Alpha8;
				case 28: return KeyCode.Alpha9;
				case 29: return KeyCode.Alpha0;
				case 30: return KeyCode.Minus;
				case 31: return KeyCode.Equals;
				case 32: return KeyCode.None; // IntlYen
				case 33: return KeyCode.Q;
				case 34: return KeyCode.W;
				case 35: return KeyCode.E;
				case 36: return KeyCode.R;
				case 37: return KeyCode.T;
				case 38: return KeyCode.Y;
				case 39: return KeyCode.U;
				case 40: return KeyCode.I;
				case 41: return KeyCode.O;
				case 42: return KeyCode.P;
				case 43: return KeyCode.LeftBracket;
				case 44: return KeyCode.RightBracket;
				case 45: return KeyCode.Backslash;
				case 46: return KeyCode.A;
				case 47: return KeyCode.S;
				case 48: return KeyCode.D;
				case 49: return KeyCode.F;
				case 50: return KeyCode.G;
				case 51: return KeyCode.H;
				case 52: return KeyCode.J;
				case 53: return KeyCode.K;
				case 54: return KeyCode.L;
				case 55: return KeyCode.Semicolon;
				case 56: return KeyCode.Quote;
				case 57: return KeyCode.None; // IntlBackslash
				case 58: return KeyCode.Z;
				case 59: return KeyCode.X;
				case 60: return KeyCode.C;
				case 61: return KeyCode.V;
				case 62: return KeyCode.B;
				case 63: return KeyCode.N;
				case 64: return KeyCode.M;
				case 65: return KeyCode.Comma;
				case 66: return KeyCode.Period;
				case 67: return KeyCode.Slash;
				case 68: return KeyCode.None; // IntlRo

				default: return KeyCode.None;
			}
		}
	}
}