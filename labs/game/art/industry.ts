/** @file Port, utility and service props: fourteen reusable silhouettes. */
import { CYL, BALL, CONE } from '../view/primitives';
import { P } from './palette';
import type { Recipe } from './street';
export const INDUSTRY: Record<string, Recipe> = {
  cargoShip: (s) => {
    s.add(BALL, P.dark, [0, 1.6, 0], [5, 2.2, 19]);
    s.box(P.metal, 0, 3, 0, 8, 0.4, 31);
    s.box(P.cream, 0, 5, -12, 6, 4, 6);
    s.box(P.glass, 0, 6, -8.98, 5, 1, 0.05);
    s.add(CYL, P.metal, [0, 9, -12], [0.12, 5, 0.12]);
    for (const x of [-1.5, 1.5]) for (const z of [-4, 3, 10]) s.at(x, 3.2, z, 0, () => INDUSTRY.container(s));
  },

  container: (s) => {
    s.box(P.red, 0, 1.4, 0, 2.6, 2.8, 6);
    for (let z = -2.8; z < 3; z += 0.4) for (const x of [-1.31, 1.31]) s.box(P.coral, x, 1.4, z, 0.06, 2.6, 0.07);
    for (const x of [-0.6, 0.6]) s.box(P.metal, x, 1.4, 3.02, 0.04, 2.5, 0.05);
  },
  crate: (s) => {
    s.box(P.wood, 0, 0.65, 0, 1.3, 1.3, 1.3);
    for (const x of [-0.5, 0.5]) s.box(P.cream, x, 0.65, 0.66, 0.09, 1.3, 0.03);
    s.box(P.cream, 0, 0.65, 0.68, 1.3, 0.08, 0.02);
  },
  pallet: (s) => {
    for (let i = 0; i < 5; i++) s.box(P.wood, -0.5 + i * 0.25, 0.2, 0, 0.18, 0.12, 1.2);
    for (const x of [-0.5, 0.5]) s.box(P.wood, x, 0.08, 0, 0.14, 0.16, 1.2);
  },
  oilDrum: (s) => {
    s.add(CYL, P.blue, [0, 0.55, 0], [0.38, 1.1, 0.38]);
    for (const y of [0.15, 0.9]) s.add(CYL, P.metal, [0, y, 0], [0.4, 0.05, 0.4]);
  },
  forklift: (s) => {
    s.box(P.yellow, 0, 0.65, 0, 1.5, 1, 2.1);
    for (const x of [-0.75, 0.75])
      for (const z of [-0.65, 0.65]) s.add(CYL, P.dark, [x, 0.3, z], [0.3, 0.16, 0.3], [0, 0, Math.PI / 2]);
    for (const x of [-0.4, 0.4]) {
      s.box(P.dark, x, 1.4, 1, 0.1, 2.8, 0.1);
      s.box(P.dark, x, 0.2, 1.8, 0.13, 0.12, 1.6);
    }
    s.box(P.yellow, 0, 2, 0, 1.7, 0.15, 1.2);
  },
  gantryCrane: (s) => {
    for (const x of [-7, 7]) for (const z of [-4, 4]) s.box(P.yellow, x, 10, z, 0.8, 20, 0.8);
    s.box(P.yellow, 0, 20, 0, 17, 1, 10);
    s.box(P.yellow, 0, 21, 3, 1, 1, 25);
    s.add(CYL, P.dark, [0, 14, 12], [0.035, 14, 0.035]);
    s.box(P.metal, 0, 7, 12, 2, 0.5, 0.5);
    s.box(P.blue, 3, 19, 0, 3, 2, 3);
  },
  waterTower: (s) => {
    for (const x of [-2, 2]) for (const z of [-2, 2]) s.box(P.metal, x, 5, z, 0.18, 10, 0.18);
    s.add(CYL, P.cream, [0, 11, 0], [3, 4, 3]);
    s.add(CONE, P.red, [0, 13.6, 0], [3.3, 1.5, 3.3]);
    s.box(P.metal, 0, 4.5, -2.1, 4, 0.15, 0.15);
  },
  storageTank: (s) => {
    s.add(CYL, P.cream, [0, 3, 0], [4, 6, 4]);
    s.add(BALL, P.cream, [0, 6, 0], [4, 0.7, 4]);
    for (const y of [1, 3, 5]) s.add(CYL, P.metal, [0, y, 0], [4.04, 0.06, 4.04]);
  },
  airConditioner: (s) => {
    s.box(P.metal, 0, 0.6, 0, 1.6, 1.2, 1.2);
    s.add(CYL, P.dark, [0, 1.23, 0], [0.5, 0.04, 0.5]);
    for (let z = -0.45; z < 0.5; z += 0.15) s.box(P.cream, 0.81, 0.5, z, 0.03, 0.8, 0.04);
  },
  satellite: (s) => {
    s.add(CYL, P.metal, [0, 0.55, 0], [0.04, 1.1, 0.04]);
    s.add(BALL, P.cream, [0, 1.2, 0], [0.8, 0.16, 0.8], [0.5, 0, 0]);
    s.add(CYL, P.dark, [0, 1.6, 0.3], [0.03, 0.6, 0.03], [-0.6, 0, 0]);
  },
  fuelPump: (s) => {
    s.box(P.red, 0, 0.8, 0, 0.7, 1.6, 0.55);
    s.box(P.cream, 0, 1.6, 0, 0.9, 0.8, 0.7);
    s.box(P.dark, 0, 1.7, 0.36, 0.6, 0.3, 0.03);
    s.box(P.metal, 0.6, 0.8, 0, 0.08, 1.5, 0.08);
    s.box(P.dark, 0.5, 1.5, 0.1, 0.1, 0.4, 0.2);
  },
  fuelCanopy: (s) => {
    for (const x of [-5, 5]) for (const z of [-3, 3]) s.box(P.cream, x, 2.5, z, 0.2, 5, 0.2);
    s.box(P.cream, 0, 5, 0, 12, 0.4, 8);
    s.box(P.coral, 0, 5.2, 0, 12.2, 0.16, 8.2);
  },
  constructionBarrier: (s) => {
    for (const x of [-1, 1]) s.add(CYL, P.metal, [x, 0.55, 0], [0.04, 1.1, 0.04]);
    s.box(P.coral, 0, 0.85, 0, 2.5, 0.4, 0.1);
    for (let i = 0; i < 4; i++) s.box(P.cream, -0.9 + i * 0.6, 0.85, 0.06, 0.3, 0.4, 0.02);
  },
  trafficCone: (s) => {
    s.box(P.dark, 0, 0.05, 0, 0.6, 0.1, 0.6);
    s.add(CONE, P.coral, [0, 0.45, 0], [0.24, 0.8, 0.24]);
    s.add(CYL, P.cream, [0, 0.4, 0], [0.15, 0.13, 0.15]);
  },
};
