/** @file Fourteen architectural styles: broad silhouettes at distance, layered facades close to the player. */
import { type RenderScene } from '../../../engine';
import { Scenery, CYL, CONE, BOX, label } from '../view/primitives';
import type { Building, BuildingStyle } from '../world/districts';
import { P } from './palette';
export const ARCHITECTURE: BuildingStyle[] = [
  'deco',
  'tower',
  'apartment',
  'motel',
  'villa',
  'bungalow',
  'warehouse',
  'market',
  'diner',
  'cinema',
  'civic',
  'church',
  'garage',
  'station',
];
function windows(s: Scenery, b: Building, glass: string = P.glass): void {
  const side = b.front ?? 1,
    front = b.w / 2 + 0.06;
  for (let y = 3.6; y < b.h - 1; y += 3.5) {
    for (let z = -b.d / 2 + 2.3; z < b.d / 2 - 1; z += 3.6) {
      s.box(glass, side * front, y, z, 0.12, 1.9, 1.8);
      s.box(glass, -side * front, y, z, 0.12, 1.9, 1.8);
      if (Math.round(y + z + b.x) % 5 === 0) s.box(P.yellow, side * (front + 0.08), y, z, 0.04, 1.5, 1.4, 0.15);
    }
    for (let x = -b.w / 2 + 2.2; x < b.w / 2 - 1; x += 3.6)
      for (const direction of [-1, 1]) s.box(glass, x, y, direction * (b.d / 2 + 0.06), 1.8, 1.9, 0.12);
  }
}
function balconies(s: Scenery, b: Building): void {
  for (let y = 3; y < b.h - 1; y += 3.8)
    for (let z = -b.d / 2 + 3; z < b.d / 2 - 1; z += 5) {
      s.box(P.cream, b.w / 2 + 0.9, y, z, 1.8, 0.2, 3.6);
      s.box(P.metal, b.w / 2 + 1.7, y + 0.65, z, 0.07, 1.1, 3.6);
    }
}
function slopedRoof(s: Scenery, b: Building): void {
  for (const sign of [-1, 1])
    s.add(BOX, P.tile, [sign * b.w * 0.25, b.h + 0.8, 0], [b.w * 0.57, 0.2, b.d + 1], [0, 0, sign * -0.3]);
}
export function drawBuilding(s: Scenery, b: Building, scene?: RenderScene): void {
  const style = b.style ?? 'deco';
  s.count(`building:${style}`);
  s.at(b.x, 0, b.z, 0, () => {
    s.range = 850;
    s.box(b.color, 0, b.h / 2, 0, b.w, b.h, b.d);
    if (!b.roofDeck) {
      s.box(P.cream, 0, b.h + 0.15, 0, b.w + 0.7, 0.3, b.d + 0.7);
      if (style === 'tower') {
        s.box(b.color, 0, b.h + 3, 0, b.w * 0.65, 6, b.d * 0.65);
        s.box(P.dark, 0, b.h + 7, 0, b.w * 0.4, 2, b.d * 0.4);
        s.add(CYL, P.metal, [0, b.h + 12, 0], [0.08, 10, 0.08]);
      }
      if (style === 'villa' || style === 'bungalow' || style === 'church') slopedRoof(s, b);
      if (style === 'deco') {
        s.box(b.color, 0, b.h + 1.6, 0, b.w * 0.65, 3, b.d * 0.65);
        s.box(P.cream, 0, b.h + 3.15, 0, b.w * 0.67, 0.2, b.d * 0.67);
      }
      if (style === 'church') {
        s.box(P.cream, b.w * 0.35, b.h + 4, 0, 4, 8, 4);
        s.add(CONE, P.tile, [b.w * 0.35, b.h + 9, 0], [3, 3, 3], [0, Math.PI / 4, 0]);
      }
    }
    s.range = 210;
    if (!['warehouse', 'garage', 'station', 'bungalow', 'villa', 'market'].includes(style))
      windows(s, b, style === 'tower' ? '#4d758e' : P.glass);
    if (style === 'deco') {
      for (let y = 3; y < b.h; y += 3.5) s.box(P.cream, 0, y, 0, b.w + 0.35, 0.18, b.d + 0.35);
      for (const z of [-2, 0, 2]) s.box(b.accent ?? P.pink, b.w / 2 + 0.25, b.h * 0.52, z, 0.18, b.h * 0.85, 0.13, 0.4);
    }
    if (style === 'tower') {
      for (let x = -b.w / 2 + 1; x < b.w / 2; x += 4) s.box(P.cream, x, b.h / 2, -b.d / 2 - 0.12, 0.1, b.h, 0.1);
    }
    if (style === 'apartment' || style === 'motel') balconies(s, b);
    if (style === 'warehouse') {
      for (let z = -b.d / 2 + 3; z < b.d / 2; z += 6) {
        s.box(P.metal, b.w / 2 + 0.06, 2.3, z, 0.1, 4.6, 4.4);
        for (let y = 0.4; y < 4.5; y += 0.45) s.box(P.stone, b.w / 2 + 0.13, y, z, 0.03, 0.05, 4.3);
      }
      for (let z = -b.d / 2 + 2; z < b.d / 2; z += 4) s.box(P.glass, 0, b.h + 0.32, z, b.w * 0.7, 0.2, 1.5);
    }
    if (style === 'garage') {
      for (let z = -b.d / 2 + 3; z < b.d / 2; z += 7) {
        s.box(P.dark, b.w / 2 + 0.06, 2, z, 0.1, 4, 5.2);
        for (let y = 0.4; y < 3.8; y += 0.4) s.box(P.stone, b.w / 2 + 0.13, y, z, 0.04, 0.07, 5.1);
      }
      s.box(b.accent ?? P.mint, b.w / 2 + 0.2, b.h - 1, 0, 0.2, 0.3, b.d - 1, 0.3);
    }
    if (style === 'villa' || style === 'bungalow') {
      s.box(P.cream, b.w / 2 + 1.4, 2.5, 0, 3, 0.2, b.d * 0.75);
      for (const z of [-b.d * 0.3, b.d * 0.3]) s.add(CYL, P.cream, [b.w / 2 + 2.5, 1.3, z], [0.13, 2.6, 0.13]);
      for (const z of [-b.d * 0.27, b.d * 0.27]) {
        s.box(P.glass, b.w / 2 + 0.05, 2, z, 0.1, 1.5, 1.6);
        s.box(P.mint, b.w / 2 + 0.1, 2, z - 1, 0.1, 1.6, 0.3);
        s.box(P.mint, b.w / 2 + 0.1, 2, z + 1, 0.1, 1.6, 0.3);
      }
    }
    if (style === 'civic') {
      for (let z = -b.d / 2 + 2; z < b.d / 2; z += 3.5)
        s.add(CYL, P.cream, [b.w / 2 + 1.1, b.h * 0.38, z], [0.45, b.h * 0.76, 0.45]);
      s.box(P.cream, b.w / 2 + 1, b.h * 0.8, 0, 3, 0.5, b.d + 1);
    }
    if (style === 'cinema') {
      s.box(b.accent ?? P.pink, b.w / 2 + 2, 4.3, 0, 4, 0.65, b.d * 0.8, 0.2);
      for (let z = -b.d * 0.35; z < b.d * 0.35; z += 1) s.box(P.yellow, b.w / 2 + 4, 4.3, z, 0.07, 0.12, 0.12, 0.5);
      s.box(P.cream, b.w / 2 + 0.3, b.h - 2, 0, 0.4, 4, b.d * 0.75);
    }
    if (style === 'market' || style === 'diner') {
      for (let z = -b.d / 2 + 3; z < b.d / 2; z += 5) {
        s.box(P.glass, b.w / 2 + 0.08, 1.8, z, 0.1, 2.4, 3.6);
        for (let i = 0; i < 6; i++)
          s.add(
            BOX,
            i % 2 ? P.cream : (b.accent ?? P.coral),
            [b.w / 2 + 1.2, 3.3, z - 1.8 + i * 0.6],
            [2.4, 0.15, 0.6],
            [0, 0, 0.15],
          );
      }
    }
    if (style === 'station') {
      s.box(P.cream, 0, b.h + 0.6, 0, b.w + 2, 0.8, b.d + 2);
      s.box(P.coral, 0, b.h + 1.1, 0, b.w + 2.2, 0.12, b.d + 2.2);
    }
    if (!b.roofDeck) {
      s.box(P.metal, -b.w * 0.25, b.h + 0.6, b.d * 0.25, 2.2, 1.2, 2);
      s.add(CYL, P.dark, [-b.w * 0.25, b.h + 1.23, b.d * 0.25], [0.65, 0.05, 0.65]);
    }
    s.box(P.dark, (b.front ?? 1) * (b.w / 2 + 0.08), 1.4, 0, 0.08, 2.8, 1.6);
  });
  if (scene && b.name && !['villa', 'bungalow'].includes(style)) {
    const sign = label(b.name, b.accent ?? P.cream, Math.min(16, b.d - 2), style === 'cinema' ? 2 : 1.3);
    sign.position.set(
      b.x + (b.front ?? 1) * (b.w / 2 + 0.35),
      Math.min(b.h - 1, style === 'cinema' ? b.h - 2 : 6),
      b.z,
    );
    sign.rotation.y = ((b.front ?? 1) * Math.PI) / 2;
    sign.userData.artDistance = 230;
    scene.add(sign);
  }
  s.range = 260;
}
