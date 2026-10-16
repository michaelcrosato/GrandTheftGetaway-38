# Verification record

Verified on October 16, 2026. The implementation gates passed: `npm run check`, `npm test` (14 tests), `npm run build`, `node x sim labs/game/scenes/play.ts --steps 600`, and `node x replay labs/game/replays --browser sim`.

The complete 2,821-tick mission replay matched all 11 golden checkpoints in Node ×3 and Chromium ×3, final hash `c14efc9c932c60c4`. The browser end-to-end suite passed all 17 checks with zero uncaught errors. On native Windows Chrome 155 using the NVIDIA Ampere WebGPU adapter, a complete real-time autonomous mission at 1920 × 1080 averaged **60.0 FPS** across 2,821 measured frames; 95th-percentile frame time was **16.8 ms**. `nvidia-smi` identified the target GPU as an RTX 3060 Ti.

The initial 24-viewport matrix caught a Firefox import failure. After fixing capability detection, the 14-layout Firefox/WebKit matrix and six phone/foldable checks passed with no overflow, JS errors or failed requests. Native NVIDIA screenshots were inspected for the title, gameplay, marina, map and rooftop. Phone presentation shows only the menu button; no touch action controls exist.

Raw local evidence: `/tmp/getaway-qa/report.json`, `/tmp/getaway-qa/*.png`, `/tmp/getaway-compatibility/report.json`, `/tmp/getaway-mobile-final/report.json`, and engine reports under ignored `out/`. CI independently reruns code, simulation and build gates on every main push. Performance figures are measurements of this hardware/browser configuration, not promises for unsupported GPUs or drivers.

## Acceptance gates

| Requirement | Evidence |
| --- | --- |
| Original full mission | Ordinary-input bot traverses all six stages, wins on ten seeds, and wins from every saved checkpoint |
| Gameplay state correctness | Golden full-run replay, capture/restore, walls/bounds, magazines, reload, damage/failure, police search, collectible uniqueness, race and timeout tests |
| Controller-first UI | Browser tests of focus navigation, standard mapped gamepad movement, Options and Cross; keyboard uses the same action model |
| Kiosk behavior | Browser idle timing, arbitrary-input interruption, real bot mission completion and automatic loop restart |
| Performance | Native Windows Chrome using the NVIDIA Ampere WebGPU adapter; actual RAF frame intervals, including stalls, at 1920 × 1080 |
| Responsive presentation | Phone, tablet, desktop and ultrawide screenshots; WebKit/Firefox startup and capability handling; no mobile touch controls |
| Infrastructure | Engine provenance/asset gate, types, lint, format, build, public GitHub repository and CI / GitHub Pages |

## Reproduce

```sh
npm run check
npm test
npm run build
npm run bot
npm run e2e
```

Browser QA defaults to the engine-pinned Linux Chromium. For native hardware, set `QA_CDP` to an existing Chrome DevTools endpoint and `QA_URL` to the served production game. `QA_OUT` defaults to `/tmp/getaway-qa`; screenshots and raw JSON never enter the repository. No real controller is emulated by a keyboard: the test installs a standard Gamepad API device and drives its buttons and axes.

WebKit on this Linux machine is Safari's engine, not real iOS Safari. Its WebGPU availability differs from current native Safari. Unsupported browsers are expected to show an informative capability message and working menus. Linux software WebGPU capture showed black/corrupt output while the native NVIDIA path rendered correctly, so Linux captures are not used as proof of rendering quality or RTX performance.

The stock engine's `x shot` view probe targets its built-in renderer. This game's custom renderer is covered by `npm run e2e`, while `node x sim` and the replay tests cover the actual engine simulation. No automated test claims to certify every physical controller model or every GPU/driver combination.
