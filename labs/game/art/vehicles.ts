/** @file Distinct 1980s vehicle silhouettes layered over a shared chassis and wheel assembly. */
import type { Group } from '../../../engine';
import { BOX, piece } from '../view/primitives';
import { P } from './palette';
export function vehicleBody(g: Group, color: string, kind: string): void {
  if (kind === 'cabriolet') return;
  if (['sedan', 'taxi', 'wagon', 'coupe'].includes(kind)) {
    const long = kind === 'wagon',
      low = kind === 'coupe',
      height = low ? 1.69 : 1.92;
    piece(g, BOX, color, [0, height, long ? -0.55 : -0.15], [1.78, 0.16, long ? 2.9 : 1.9]);
    for (const x of [-0.84, 0.84]) {
      piece(g, BOX, P.glass, [x, 1.5, -0.25], [0.045, low ? 0.4 : 0.6, long ? 2.7 : 1.6]);
      for (const z of [-1, 0.55]) piece(g, BOX, color, [x, 1.5, z], [0.09, 0.7, 0.09]);
    }
    piece(g, BOX, P.glass, [0, 1.48, long ? -1.98 : -1.15], [1.62, 0.55, 0.06], [-0.18, 0, 0]);
    if (kind === 'taxi') {
      piece(g, BOX, P.yellow, [0, 2.14, -0.2], [0.65, 0.3, 0.4], [], 0.15);
      for (const x of [-0.99, 0.99])
        for (let z = -1.6; z < 1.6; z += 0.4)
          piece(g, BOX, Math.round(z * 10) % 8 === 0 ? P.dark : P.cream, [x, 0.93, z], [0.03, 0.16, 0.2]);
    }
    if (long) for (const x of [-0.65, 0.65]) piece(g, BOX, P.metal, [x, 2.06, -0.5], [0.07, 0.08, 2.6]);
  } else if (kind === 'pickup') {
    piece(g, BOX, color, [0, 1.83, 0.5], [1.8, 0.14, 1.45]);
    piece(g, BOX, P.glass, [0, 1.43, -0.22], [1.6, 0.6, 0.06]);
    for (const x of [-0.9, 0.9]) {
      piece(g, BOX, color, [x, 1.42, 0.5], [0.12, 0.8, 1.4]);
      piece(g, BOX, color, [x, 1.15, -1.35], [0.13, 0.45, 1.5]);
    }
    piece(g, BOX, P.dark, [0, 0.98, -1.4], [1.6, 0.08, 1.3]);
  } else {
    const delivery = kind === 'delivery';
    piece(g, BOX, color, [0, 1.5, -0.35], [1.9, 1.6, delivery ? 3.2 : 2.9]);
    piece(g, BOX, P.glass, [0, 1.75, delivery ? 1.26 : 1.12], [1.6, 0.7, 0.05]);
    for (const x of [-0.96, 0.96]) {
      piece(g, BOX, P.glass, [x, 1.7, 0.7], [0.03, 0.65, 0.8]);
      piece(g, BOX, delivery ? P.cream : P.metal, [x, 1.3, -0.65], [0.035, 0.7, 1.6]);
    }
    piece(g, BOX, P.metal, [0, 1.35, -1.98], [0.06, 1.5, 0.03]);
  }
}
