## The Problem

Making games should feel like playing games.

As a veteran software engineer, I have been shocked and disappointed by the developer experience of making a commercial pc and console game.

Initially, a project maintains a flow state with quick iteration times.

As a project grows and the developer gets locked into the proprietary ecosystem, the compile time grows and foundational components have to be replaced and rewritten from scratch.

This leads to crunch and people hating their lives and resenting the projects they once loved.

## Goals

* Maintain creative flow state throughout development lifecycle

* Open source sharing of low level best practices for all major distribution platforms

* Reduce crunch due to spiraling technical debt

* Developer experience on par with modern web development

* Write native rendering code for each platform

* Networked by default

## The solution

Every game engine provides a single language solution that handles each line of this.

I believe that if there is an open standard for representing inputs and game state, then each step here can be optimized independently.

If marshaling inputs and state to a binary format can take under 2ms, then either game logic or rendering can easily be rewritten in native code for distribution platforms.

A team can begin prototyping a project in whatever language they're most comfortable in, then switch to a language that's optimized for their distribution platforms halfway through production with a low cost.

The protocol consists of a portable, language-agnostic representation of inputs and state.

### Design Decisions

* Binary representations are little-endian as most modern architectures use this encoding.

* 0,0 represents the top left corner of the screen. This is the standard on the web and in unity.

* The protocol does not use floating point numbers to encourage determinism across architectures.

* All strings are utf-32

* Longs are represented as BigInt in javascript

* Strings are a fixed length to allow optimized reading

* Bytes are unsigned

* Percentages are represented as ints with four digits of precision and not floats. e.g.

| percentage | int |
| --- | ---------- |
| `100%` | `1000000` |
| `50.5%` | `505000` |
| `-10.33%` | `-103300` |
| `25.1258%` | `251258` |


The trade-off for this overhead is that game logic can be fully optimized for the target architecture runtime, and teams can write a prototype in typescript and rust to get funded, then port the logic to c# in a matter of days to ship to consoles.


## Downsides

* performance overhead of 2ms
* maturity of libraries as compared to Unity/Unreal

## Marshalling

Marshalling `Inputs` and `State` into a binary format should take under 2ms.

For large states, this can be achieved with delta compression.

In a web environment, since javascript has access to read and write memory in `WebAssembly`, only the `Inputs` need to be marshalled.

and respect the creator's need to maintain immersion the way we respect the player's need.

like rollback netcode and shader optimization