# Saltwater Bay art library

**101 original assets**, all used by the expanded city or its character and vehicle populations:

| Category | Assets |
| --- | ---: |
| Street furniture | 20 |
| Coast and gardens | 17 |
| Port and service | 15 |
| Public spaces | 10 |
| Architectural styles | 14 |
| Vehicles | 8 |
| Characters | 9 |
| Illustrated signs | 8 |

[Open the gallery](https://michaelcrosato.github.io/GrandTheftGetaway-38/labs/art/). It offers category filters, enlarged previews, editable-source links and downloads.

The 93 models each include an ASCII `.obj`, matching `.mtl`, and vector `.svg` preview in `assets/`. Download the OBJ and MTL into the same folder before importing. Geometry uses metres, +Y up, with colour materials and a faceted visual style. Architecture examples are portable representatives of procedural styles; city parcels set their own dimensions, palettes and facade direction.

The eight illustrated signs have original editable SVG sources in `../game/art/graphics/`. The game bakes those exact sources into local billboard textures. No stock imagery, proprietary game assets, external fonts or image-generation services are involved.

`manifest.json` records IDs, categories, source recipes, file names, vertex/triangle counts and model dimensions. Run `npm run art` to regenerate exports and previews from the actual game recipes. `npm test` validates finite geometry, face indices, material references, previews and in-world use.

Recipes live under `../game/art/`; character rigs and shared mesh primitives live under `../game/view/`. Reuse `placeAsset(scenery, id, x, z, yaw, y)` to install a prop. The renderer groups geometry and colours into spatial batches using my-3dge's instancing API.

All artwork and exports are original and MIT licensed; see the repository's root `LICENSE`. SOURCE inspiration and environment/model metadata are retained in the root README and the game HTML, separately from engine evaluation.
