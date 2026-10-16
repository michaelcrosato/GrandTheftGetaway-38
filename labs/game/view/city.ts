/** @file Assemble the expanded city from shared content, portable art recipes and illustrated signs. */
import { type RenderScene } from '../../../engine';
import { BUILDINGS } from '../world/level';
import { LANDMARKS, DISTRICTS } from '../world/districts';
import { PROPS } from '../world/props';
import { Scenery, label } from './primitives';
import { environment } from './environment';
import { missionArt } from './mission-art';
import { drawBuilding } from '../art/architecture';
import { placeAsset } from '../art/catalog';
import { billboard, GRAPHIC_IDS } from '../art/graphics';
import { P } from '../art/palette';
export function createCity(scene: RenderScene) {
  const s = new Scenery();
  const sky = environment(scene, s);
  for (const b of BUILDINGS) drawBuilding(s, b, scene);
  for (const p of PROPS) placeAsset(s, p.kind, p.x, p.z, p.yaw, p.y);
  missionArt(scene, s);
  // All illustrated campaigns are installed in-world, with a support structure and real local asset source.
  const ads = [
    [-149, -310],
    [-340, -210],
    [-438, -360],
    [-450, 14],
    [-342, 210],
    [-150, 330],
    [42, 205],
    [42, -200],
  ];
  GRAPHIC_IDS.forEach((id, i) => {
    const [x, z] = ads[i];
    s.range = 300;
    s.box(P.metal, x, 5, z, 0.22, 10, 0.22);
    s.box(P.dark, x, 10, z, 12.4, 6.4, 0.25);
    billboard(scene, id, x, 10, z + 0.14, 0);
    s.count(`graphic:${id}`);
  });
  for (const landmark of LANDMARKS) {
    const sign = label(landmark.name, P.cream, Math.min(22, landmark.name.length * 1.1), 1.5);
    sign.position.set(landmark.x, 5, landmark.z - 22);
    sign.userData.artDistance = 220;
    scene.add(sign);
  }
  for (const d of DISTRICTS) {
    const sign = label(d.name.toUpperCase(), d.accent, 12, 1);
    sign.position.set(d.x, 3.5, d.z + 32);
    sign.userData.artDistance = 150;
    scene.add(sign);
  }
  // A broad pier with a cafe and a lookout gives the new coast a destination beyond the roadway.
  placeAsset(s, 'pergola', 120, 300);
  placeAsset(s, 'cafeTable', 113, 301);
  placeAsset(s, 'cafeChair', 112, 301);
  placeAsset(s, 'flamingo', 124, 299);
  s.flush(scene);
  const labels = scene.children.filter((o) => o.userData.artDistance);
  return {
    ...sky,
    scenery: s,
    update(x: number, z: number) {
      s.update(x, z);
      for (const o of labels) o.visible = Math.hypot(o.position.x - x, o.position.z - z) < o.userData.artDistance;
    },
    stats: () => ({ buildings: BUILDINGS.length, districts: DISTRICTS.length, props: PROPS.length, ...s.stats() }),
  };
}
