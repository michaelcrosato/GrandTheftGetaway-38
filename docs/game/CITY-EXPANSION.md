# Saltwater Bay expansion — v1.1

The expanded city has **145 buildings**, **1,004 prop placements**, **eight districts**, **26 collectible mixtapes**, eight drivable vehicle body styles, and a portable **101-asset art library**. The original mission, its checkpoint reconstruction, combat, police pursuit, garage and street sprint remain available.

The former land bounds were 180 × 328 metres (59,040 m²). The new connected mainland is 680 × 908 metres (617,440 m²), **10.46 times the former area**, plus eight walkable piers. Roads, buildings, props with solid footprints, map geometry and navigation all read shared content.

| District | Character and destinations |
| --- | --- |
| Ocean Drive | Original pastel hotel strip, mission marina, Sunset Motors and Club Mirage |
| North Marina | Regatta docks, sailboats, speedboats, fishing boats and yachts |
| Downtown | Aurora tower, apartment balconies, offices and cinemas |
| Port Meridian | Cargo ship, gantry crane, container yard, storage tank, forklift and utility buildings |
| Little Sol | Market carts, cafes, courtyard fountain and clock tower |
| Civic Quarter | Liberty Square, museum/civic architecture, statue and bandstand |
| Sunset Heights | Villas, bungalows, Coral Gardens, gazebo, pergola, pool and tennis court |
| South Beach | Resorts, lifeguard stations, beach huts, surfboards and Crescent Pier |

## Explore

Choose **Cruise the City** on the title screen. It starts you in the convertible with no mission deadline. Each discovered neighborhood awards $50. The street sprint, inventory, vehicle possession, police, repair shop and all collectibles are still systemic. Cruising does not replace the story checkpoint save.

Attract mode now alternates the original complete mission with an autonomous city tour. The tour uses ordinary driving intents on the connected road graph and visits every district. Any input still exits to the title immediately.

## Art pipeline

The library contains 62 reusable scenery recipes, 14 architecture styles, eight vehicle bodies, nine character models, and eight illustrated SVG signs. The gallery and portable OBJ/MTL exports come from the same procedural recipes used by the game. Model positions, indices, dimensions, material references and previews are validated. No binary source art is needed.

Geometry is partitioned by 96 m cells and detail distance. Colour instances share materials, and my-3dge's `createInstancedBatch` uses its common attribute-based path above 1,000 slots. This avoids the per-mesh shader compilation cost encountered with small raw three.js instance buffers. Distant building masses stay visible while facade details, props and populations are culled by distance. Collision queries use immutable spatial bins rather than scanning the whole city per character.

## Validation

`npm run check`, `npm test` (27 checks), `node x replay labs/game/replays --browser sim`, `npm run e2e`, and `npm run e2e:city` cover code, the original mission, all checkpoint starts, all eight neighborhoods, collectibles and unobstructed roads, geometry exports, controller UI, kiosk loops, native GPU rendering and gallery download targets. Regenerate models with `npm run art` and intentionally update replay goldens with `npm run record` when simulation content changes.

The expansion intentionally changes physics bodies, populations and state fields, so its recorded mission hash is `91f3db3c6e337d78`. The ordinary-input mission still finishes in 2,821 ticks. Its 11 golden checkpoints match in Node ×3 and Chromium ×3.

The ten seeded mission runs are separate test cases, with the same 8,500-tick limit and assertions. This preserves the full seed coverage while avoiding one shared wall-clock timeout for all ten enlarged-world simulations. Each retired run releases its Rapier world.
