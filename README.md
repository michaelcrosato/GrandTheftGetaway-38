# Grand Theft Getaway-38

**Good weather. Bad decisions.** An original, controller-first coastal crime-action game set in Saltwater Bay, 1987.

Play one complete mission: answer Margo's call, take a convertible to the marina, recover a stolen master tape, lose the police and deliver it to the rooftop of Club Mirage. A living district adds traffic, pedestrians, 26 hidden mixtapes, a repair garage and the Ocean Sprint time trial. Leave the title idle for ten seconds and the autonomous demo takes over; any input brings you back.

**[Play the game](https://michaelcrosato.github.io/GrandTheftGetaway-38/)** · **[Controls and development](labs/game/README.md)** · **[Architecture](docs/game/ARCHITECTURE.md)** · **[Verification](docs/game/VERIFICATION.md)** · **[Engine evaluation](docs/game/ENGINE-EVALUATION.md)**

## City expansion — v1.1

Saltwater Bay is now **10.46× larger**, with **eight districts, 145 buildings and 1,004 placed props**. Choose **Cruise the City** to explore without a mission deadline. The attract loop alternates the original mission and a complete city tour.

**[Browse the 101-asset art library](https://michaelcrosato.github.io/GrandTheftGetaway-38/labs/art/)** · **[Portable models and editable sources](labs/art/README.md)** · **[Expansion details](docs/game/CITY-EXPANSION.md)**

The original art library includes 93 OBJ/MTL models with vector previews and eight illustrated SVG signs. The same recipes create the in-game city, vehicles and characters. `npm run art` regenerates the portable exports.

## Run locally

```sh
bash scripts/setup.sh
npm run dev -- --port 5183
```

Open `http://localhost:5183/labs/game/` in a WebGPU-capable browser. A standard mapped PS5-compatible controller is primary; keyboard/mouse equivalents are shown in How to Play. No touch joysticks or mobile action controls are included.

```sh
npm run check
npm test
npm run build
npm run bot
npm run e2e
```

Original procedural city, models, animations and synthesized soundtrack; no external assets or runtime services. MIT license. The my-3dge engine and its dependency notices are retained.

## Source information

- **Initial Date:** October 16, 2026.
- **SOURCE:** Grand Theft Auto: Vice City, used as inspiration only. No original game assets, music, map, dialogue or proprietary code.
- **GAME ENGINE:** [michaelcrosato/my-3dge](https://github.com/michaelcrosato/my-3dge), commit `ff439e25f23762908d0fae29391547c7ccc9d43c`; package version `0.0.0`; three.js `0.182.0`; Rapier SIMD `0.21.0`. Pin and hashes: `engine-lock.json`. Local extensions: `ENGINE-FEEDBACK.md`.
- **Environment:** local Codex workspace and Bash CLI, Ubuntu 26.04 on WSL2 Linux; Chromium, Firefox and WebKit testing; native Windows Chrome with an NVIDIA RTX 3060 Ti for target-hardware verification.
- **Model and Effort Level:** OpenAI Codex. Exact model identifier and reasoning effort were not independently confirmed.

[All 50 candidate titles and random naming provenance](docs/game/naming.json). Selected: **Grand Theft Getaway-38**.
