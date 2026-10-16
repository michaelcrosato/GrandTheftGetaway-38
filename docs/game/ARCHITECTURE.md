# Extending Saltwater Bay

The engine remains in `engine/`, pinned by `engine-lock.json`. Game code lives in `labs/game/`. Simulation modules import `engine/sim-api`; presentation imports `engine/index`. Input enters only through recorded intents. Rendering, audio, UI, persistence and the camera cannot write component state.

| Layer | Entry | Content and responsibilities |
| --- | --- | --- |
| Level | `world/level.ts` | Building footprints, street graph, landmarks, pickups, race gates, six typed mission goals and checkpoint spawn records |
| Components | `scenes/components.ts` | Driver, vehicle, citizen, job and collectible schemas; all mutable play state is captured and hashed |
| Scene | `scenes/play.ts` | Physics bodies, seeded population, checkpoint reconstruction and system order |
| Movement | `scenes/motion.ts` | Arcade handling, collision response, car possession, jump, traffic and street routing |
| Combat / police | `scenes/combat.ts` | Occlusion through Rapier, aim assistance, magazines/reload, enemy wind-ups, damage, pursuit/search |
| Mission | `scenes/mission.ts` | Reusable goal kinds: call, drive, clear, escape, lift and handoff; repairs, score and side activities |
| Autonomy | `bot.ts` | Same movement and interaction intents as the controller; no teleports, invulnerability or mission completion cheats |
| Art | `view/` | Instanced city, compacted cars, articulated people, cameras, markers, tracers, adaptive resolution and frame timing |
| Input / UI | `ui/` | Shared gamepad/keyboard actions, focus snapping, map/radar, versioned saves, declarative menus |
| Sound | `audio/sound.ts` | Gesture-unlocked Web Audio synth score, engine tone, effects, volume and music controls |
| Lifecycle | `main.ts` | Title, play, pause, map, menus, ending and infinite attract loop; fixed-step accumulator and teardown |

## Adding content

A new district supplies building and street records, named locations and population positions. Both render and collision read the same building records. Add cassette coordinates to `PICKUPS`, route gates to `RACE_GATES`, and matching goal/checkpoint records for another mission using the existing goal kinds. Goal copy and radar destinations consume the same records. Keep targets outside static geometry, put checkpoint vehicle headings toward their next route, and teach the bot the mission's navigation route.

A new car uses the existing vehicle component and handling system with a model from `view/models.ts`. Enemy styles reuse citizen health, perception, wind-up and attack loops. New weapons can reuse cooldown, magazine, reserve and reload state. A truly new game mechanic may require a new system; additional content using the demonstrated mechanics does not require changing the engine.

## State rules

- 60 Hz fixed simulation; cap frame catch-up to six ticks after a stall. The visible frame timer measures actual display intervals, never simulation ticks.
- Named engine RNG for populations. Every position, inventory value, pursuit timer and bot route index is component data.
- Checkpoints reconstruct a coherent mission stage with refreshed health, ammo and vehicle condition. Browser saves retain stage, best score, completed flag and settings; they are not full-world save files.
- Attract never saves progress. A completed or failed attract run starts another run after 6.5 seconds.
- Old Rapier worlds are explicitly disposed when replaced; render objects are reused by entity ID. Audio voices disconnect at completion.
- The game has no network, account, analytics, telemetry, paid services or runtime secrets.

## Relevant APIs

`window.__engine` is the engine inspector (hash, capture, restore, state, intents and replay). `?qa=1` additionally exposes `window.__game` for snapshot reads, ordinary-intent stepping, bot stepping, high-level menu actions and renderer statistics. This test bridge does not expose arbitrary component mutation.

The stock engine's `x shot` assumes its bundled scene renderer; this game owns its view. Use `npm run e2e` for the corresponding display proof and `node x sim labs/game/scenes/play.ts` for engine-level simulation proof. The original engine tools and documentation are retained.
