# my-3dge evaluation

This document evaluates the engine separately from the game's source-reference metadata.

The supported new-game scaffold established a reproducible repository with TypeScript, Vite, Vitest, pinned dependencies, asset auditing and engine-file provenance. The scene/component model, fixed ticks, named RNG, Rapier queries, inspector, replay recording and state capture/restore all directly power this game. These are functional dependencies, not unused credits.

The default visual layer is aimed at compiled tile worlds and actor/prop registries. The open coastal city needed a custom graph, vehicle chase camera, car models and title composition. The public API did not expose enough graph primitives to implement those without importing internals. The local append-only presentation export exposes the same pinned three.js WebGPU classes through the public engine boundary. The renderer remains WebGPU-only.

Long-lived kiosk use also revealed the need for explicit disposal of headless runs. The local lifecycle extension frees retired Rapier worlds, including seed/replay restarts, and exports idempotent `disposeHeadless`. Without it, garbage-collecting the JavaScript wrapper does not release native WASM world allocations.

Game systems added above the engine: arcade vehicle dynamics/possession, street traffic and police routing, pursuit/search, magazines/reloads, mission goal kinds, checkpoint reconstruction, shops, collectibles, street sprint, controller menu arbitration, map/radar, audio, and autonomous attract play.

Remaining platform boundaries: WebKit/Firefox configurations without WebGPU cannot render the game; the startup UI explains the requirement. Linux SwiftShader screenshots in this WSL environment can show black/corrupted WebGPU content, so native Windows Chrome and its NVIDIA adapter provide the visual/performance evidence. This is not claimed as real iOS Safari verification. Physical DualSense USB/Bluetooth behavior depends on browser support; the standard Gamepad API mappings are exercised by scripted gamepad tests.
