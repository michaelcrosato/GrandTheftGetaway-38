# Grand Theft Getaway-38

**One Last Delivery** is an original coastal crime-action vertical slice set in Saltwater Bay, 1987.
Answer Margo's call, borrow a convertible, recover her master tape from the marina, escape the police and make a rooftop handoff. Explore the district, collect five mixtapes, repair at Sunset Motors and race the six-gate Ocean Sprint.

The game is built from the pinned my-3dge scaffold, with its deterministic 60 Hz ECS, named random streams, Rapier world queries, capture/restore and replay system. All geometry, animation and music are original procedural content. The presentation uses the engine's pinned WebGPU renderer through a documented public API extension.

## Play

`npm ci`, then `npm run dev -- --port 5183`. Open `http://localhost:5183/labs/game/` in a WebGPU-capable browser. Use native Chrome/Edge on Windows for the RTX 3060 Ti. WebGPU support is checked at startup; unsupported browsers keep the menus and explain the requirement.

A standard mapped controller is primary: left stick moves/steers; right stick looks; R2 accelerates/fires; L2 brakes/reverses; Triangle enters, exits and interacts; Cross jumps/confirms; Square reloads; R1 sprints; L1 changes weapon; Circle is the handbrake/back action; Options pauses; touchpad opens the map; D-pad Up starts the optional street sprint. Keyboard equivalents are displayed in the game and How to Play.

Title inactivity of 10 seconds starts an actual autonomous playthrough. The bot uses ordinary player intents, completes the mission, waits at the ending and begins again. Any key, pointer movement, wheel, pointer press, gamepad button or stick input immediately returns to the title. Attract runs never overwrite player saves. No virtual joysticks or mobile action buttons exist.

## Verification and handoff

- `npm run check`: TypeScript, ESLint, formatting, assets and engine provenance.
- `npm test`: complete mission on ten seeds, all checkpoint starts, golden replay, physics capture/restore, collisions, inventory, damage/failure, pursuit, pickups, sprint and timeout.
- `npm run bot`: diagnostic real-input playthrough.
- `npm run record`: intentionally rerecord golden input and hashes after gameplay changes.
- `npm run e2e`: browser checks and screenshots under `/tmp/getaway-qa`; `QA_CDP` can connect to native Chrome on target hardware.
- `npm run build`: static production bundle; no runtime network services or keys.

See [architecture](../../docs/game/ARCHITECTURE.md), [verification](../../docs/game/VERIFICATION.md), and [engine evaluation](../../docs/game/ENGINE-EVALUATION.md). Engine changes are declared in [ENGINE-FEEDBACK.md](../../ENGINE-FEEDBACK.md).

## Source information

- Initial date: October 16, 2026.
- SOURCE: Grand Theft Auto: Vice City. Inspiration only; no source assets, soundtrack, dialogue, map or proprietary code.
- GAME ENGINE: https://github.com/michaelcrosato/my-3dge — commit `ff439e25f23762908d0fae29391547c7ccc9d43c`, package version `0.0.0`, three.js `0.182.0`, Rapier SIMD `0.21.0`.
- Environment: local Codex workspace and Bash CLI; Ubuntu 26.04 on WSL2, Linux; browser testing in Chromium, Firefox and WebKit; native Windows Chrome for the NVIDIA RTX 3060 Ti.
- Model and effort: OpenAI Codex. The exact model identifier and reasoning effort are not independently confirmed.

Fifty candidate titles and the cryptographically random selection are preserved in [naming.json](../../docs/game/naming.json). The selected title is **Grand Theft Getaway**, with random alphanumeric suffix **38**.
