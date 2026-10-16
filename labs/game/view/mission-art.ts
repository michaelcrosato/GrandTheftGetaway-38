/** @file The original mission's authored props and rooftop, retained inside the expanded city. */
import type { RenderScene } from '../../../engine';
import { Scenery, label } from './primitives';
export function missionArt(scene: RenderScene, s: Scenery): void {
  // Marina loading court and readable cover.
  s.box('#8e9caa', 3, 0.095, -102, 42, 0.12, 33);
  for (const [x, z] of [
    [-8, -107],
    [-8, -116],
    [15, -118],
  ]) {
    s.box('#a77579', x, 0.8, z, 2, 1.6, 2);
    s.box('#e1b69d', x, 1.3, z, 2.1, 0.15, 2.1);
  }
  for (let z = -130; z < -60; z += 20) {
    s.box('#a78379', 94, 0.35, z, 28, 0.7, 3);
    s.box('#f5decc', 105, 1.1, z + 5, 3, 1.3, 9);
    s.box('#6a9ba7', 105, 2.3, z + 4, 2, 1.2, 3);
  }
  const marina = label('MARINA  /  04', '#ffccab', 16, 2);
  marina.position.set(3, 5, -120);
  scene.add(marina);
  // Payphone, service bay, service lift and rooftop dance floor.
  s.box('#466979', 39, 1.2, 99, 0.7, 2.4, 0.65);
  s.box('#a5eee4', 39, 1.5, 99.35, 0.5, 0.65, 0.06, 0.5);
  const phone = label('CALL', '#affff0', 1.8, 0.6);
  phone.position.set(39, 3, 99);
  scene.add(phone);
  s.box('#43626b', -53, 1.3, -14, 5, 2.6, 7);
  const garage = label('FIX  /  $100', '#81ffe0', 9, 1.3);
  garage.rotation.y = Math.PI / 2;
  garage.position.set(-50, 4, -14);
  scene.add(garage);
  s.box('#404763', -58, 2, 73, 5, 4, 4);
  const lift = label('ROOFTOP ↑', '#ffb3df', 5, 1);
  lift.rotation.y = Math.PI / 2;
  lift.position.set(-55, 4.8, 73);
  scene.add(lift);
  s.box('#66536f', -80, 8.04, 70, 37, 0.12, 27);
  for (let x = -92; x < -67; x += 3)
    for (let z = 61; z < 80; z += 3) s.box((x + z) % 2 ? '#ea98b2' : '#88cec6', x, 8.14, z, 2.8, 0.04, 2.8, 0.15);
  for (const x of [-99, -61]) s.box('#e1c4cc', x, 8.6, 70, 0.3, 1, 26);
  for (const z of [57, 83]) s.box('#e1c4cc', -80, 8.6, z, 38, 1, 0.3);
  s.box('#384654', -91, 9.5, 69, 2, 3, 7);
  s.box('#edc6b0', -86, 9, 79, 12, 1.7, 2);
  const club = label('MIRAGE', '#ffa7d7', 14, 3);
  club.position.set(-80, 13, 58);
  scene.add(club);
}
