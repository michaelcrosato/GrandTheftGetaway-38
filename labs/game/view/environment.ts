/** @file Coast, roads, walkable piers and atmosphere shared across all eight districts. */
import {
  Mesh,
  MeshBasicMaterial,
  CanvasTexture,
  SphereGeometry,
  PlaneGeometry,
  SRGBColorSpace,
  Fog,
  HemisphereLight,
  DirectionalLight,
  type RenderScene,
} from '../../../engine';
import { WORLD_LIMITS as W, ROADS, SHORE_X, PIERS } from '../world/districts';
import { Scenery, material } from './primitives';
import { P } from '../art/palette';
export function environment(scene: RenderScene, s: Scenery): { sun: Mesh; water: Mesh } {
  const c = document.createElement('canvas');
  c.width = 32;
  c.height = 512;
  const ctx = c.getContext('2d')!;
  const g = ctx.createLinearGradient(0, 0, 0, 512);
  for (const [p, color] of [
    [0, '#527da4'],
    [0.48, '#bb9fbd'],
    [0.78, '#f2baa5'],
    [1, '#f5d0a7'],
  ] as const)
    g.addColorStop(p, color);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 32, 512);
  const sky = new CanvasTexture(c);
  sky.colorSpace = SRGBColorSpace;
  scene.background = sky;
  scene.fog = new Fog('#d5b5bf', 200, 820);
  scene.add(new HemisphereLight('#c7e9fb', '#956977', 1.8));
  const light = new DirectionalLight('#ffccad', 2.3);
  light.position.set(90, 100, -70);
  scene.add(light);
  s.range = Infinity;
  const depth = W.maxZ - W.minZ;
  s.box('#a7b2af', (W.minX + SHORE_X) / 2, -0.25, 0, SHORE_X - W.minX, 0.5, depth + 20);
  s.box('#e5c7a3', 77, -0.05, 0, 30, 0.12, depth + 20);
  const water = new Mesh(new PlaneGeometry(1400, 2300), material('#4e98a1'));
  water.rotation.x = -Math.PI / 2;
  water.position.set(788, -0.12, 0);
  scene.add(water);
  const harbor = new Mesh(new PlaneGeometry(600, 1200), material('#4e98a1'));
  harbor.rotation.x = -Math.PI / 2;
  harbor.position.set(-894, -0.12, 0);
  scene.add(harbor);
  s.box(P.wood, -602, 0.02, -250, 25, 0.12, 7);
  for (let x = 90; x < 310; x += 9)
    for (let z = -700; z < 700; z += 29) s.box('#8dbbb4', x, -0.08, z + (x % 3) * 3, 0.6, 0.02, 12 + (x % 9));
  for (const p of PIERS) {
    s.box(P.wood, p.x, 0.015, p.z, p.w, 0.12, p.d);
    for (let x = p.x - p.w / 2 + 2; x < p.x + p.w / 2; x += 3)
      for (const side of [-1, 1]) s.box(P.wood, x, 0.65, p.z + side * (p.d / 2 - 0.15), 0.13, 1.3, 0.13);
  }
  for (const x of ROADS.vertical) {
    s.box(P.asphalt, x, 0.02, 0, 16, 0.08, depth);
    for (const dx of [-8.8, 8.8]) {
      s.box(P.cream, x + dx, 0.09, 0, 1.2, 0.19, depth);
      s.box('#d2c6b5', x + dx * 1.2, 0.07, 0, 2.5, 0.12, depth);
    }
    s.range = 230;
    for (let z = W.minZ + 3; z < W.maxZ; z += 8) s.box('#e9c9ab', x, 0.071, z, 0.16, 0.012, 3.6);
    s.range = Infinity;
  }
  for (const z of ROADS.horizontal) {
    s.box(P.asphalt, (W.minX + 66) / 2, 0.031, z, 66 - W.minX, 0.08, 16);
    for (const dz of [-8.8, 8.8]) s.box('#d2c6b5', (W.minX + 66) / 2, 0.06, z + dz, 66 - W.minX, 0.12, 2);
    s.range = 230;
    for (let x = W.minX + 3; x < 66; x += 8) s.box('#f0d6b6', x, 0.083, z, 3.8, 0.015, 0.15);
    for (const x of ROADS.vertical)
      for (let i = 0; i < 6; i++) {
        s.box('#e4d7c8', x - 5 + i * 2, 0.105, z + 8, 1.1, 0.02, 2.4);
        s.box('#e4d7c8', x - 5 + i * 2, 0.105, z - 8, 1.1, 0.02, 2.4);
      }
    s.range = Infinity;
  }
  // Distinct public-space paving and green areas help navigation from the street.
  s.box('#c9b5a3', -306, 0.09, 48, 64, 0.12, 68);
  s.box('#b6b1ad', -306, 0.09, 240, 66, 0.12, 68);
  s.box('#91ab86', -498, 0.075, 144, 68, 0.1, 70);
  s.box('#8d9c99', -498, 0.09, -240, 70, 0.12, 68);
  s.range = 260;
  const sun = new Mesh(new SphereGeometry(39, 32, 16), new MeshBasicMaterial({ color: '#ffe2b2', fog: false }));
  sun.position.set(300, 35, -660);
  scene.add(sun);
  return { sun, water };
}
