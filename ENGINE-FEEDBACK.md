# Engine feedback: grand-theft-getaway-38

What this game needed from the my-3dge engine (at ff439e2) and did not get. The owner collects this file
from every game to improve the engine, so write each item for an engine agent who has never seen this repository:
what you tried, what happened (the command, the error code), what you expected, and what you did instead.

## Requests

<!-- What the engine should add or fix, most costly first. -->

## Friction

<!-- Docs, errors, templates or APIs that slowed you down or misled you, most costly first. -->

## Local engine patches

<!--
`npm run check` accepts an edited engine file only when it is listed here, one line each, its path in backticks:
- `engine/path/to/file.ts`: why no workaround in the game would do, and what the engine should change instead.
-->

- `engine/index.ts`: expose the engine's pinned three.js WebGPU presentation primitives. Existing public APIs cannot attach a custom procedural open-world city or implement the vehicle chase camera; this append-only export keeps the sim and game imports behind the public API. No renderer fallback is introduced.

- `engine/gfx/gamePresentation.ts`: declarations for the public presentation export above, kept separate to preserve the engine API file size limit.

- `engine/app/headless.ts`: add idempotent `disposeHeadless` and release old Rapier worlds on seed/replay restart. The engine had no public teardown, so an indefinite attract loop would accumulate native WASM allocations; JavaScript garbage collection alone cannot free Rapier worlds.
