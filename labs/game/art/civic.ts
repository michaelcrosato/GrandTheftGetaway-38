/** @file Ten public-space and landmark models, authored as reusable local-coordinate recipes. */
import { CYL, BALL, CONE } from '../view/primitives';
import { P } from './palette';
import { COAST } from './coast';
import type { Recipe } from './street';
export const CIVIC: Record<string, Recipe> = {
  fountain: (s) => {
    s.add(CYL, P.stone, [0, 0.25, 0], [4, 0.5, 4]);
    s.add(CYL, P.water, [0, 0.52, 0], [3.6, 0.05, 3.6]);
    s.add(CYL, P.cream, [0, 1.2, 0], [0.45, 2.3, 0.45]);
    s.add(CYL, P.stone, [0, 2.2, 0], [1.6, 0.25, 1.6]);
    s.add(CYL, P.water, [0, 2.35, 0], [1.4, 0.04, 1.4]);
    s.add(BALL, P.water, [0, 2.8, 0], [0.18, 0.7, 0.18]);
  },
  statue: (s) => {
    s.box(P.stone, 0, 0.6, 0, 1.6, 1.2, 1.6);
    s.add(CYL, P.mint, [0, 2, 0], [0.43, 1.6, 0.3]);
    s.add(BALL, P.mint, [0, 3.1, 0], [0.32, 0.4, 0.3]);
    for (const x of [-0.2, 0.2]) s.box(P.mint, x, 1.2, 0, 0.22, 1.2, 0.3);
    s.box(P.mint, 0.7, 2.6, 0, 1.2, 0.2, 0.2);
  },
  pergola: (s) => {
    for (const x of [-2, 2]) for (const z of [-2, 2]) s.box(P.cream, x, 1.5, z, 0.18, 3, 0.18);
    for (let z = -2.4; z <= 2.4; z += 0.55) s.box(P.wood, 0, 3.1, z, 5, 0.13, 0.15);
    for (let x = -2.4; x <= 2.4; x += 0.6) s.box(P.wood, x, 3, 0, 0.12, 0.15, 5);
  },
  gazebo: (s) => {
    s.add(CYL, P.cream, [0, 0.2, 0], [3.4, 0.4, 3.4]);
    for (let i = 0; i < 8; i++) {
      const a = (i * Math.PI) / 4;
      s.add(CYL, P.cream, [Math.sin(a) * 2.8, 1.8, Math.cos(a) * 2.8], [0.1, 3.2, 0.1]);
    }
    s.add(CONE, P.tile, [0, 3.8, 0], [3.6, 1.4, 3.6]);
  },
  pool: (s) => {
    s.box(P.cream, 0, 0.15, 0, 10, 0.3, 6);
    s.box(P.blue, 0, 0.32, 0, 9, 0.04, 5);
    s.box(P.water, 0, 0.35, 0, 8.5, 0.02, 4.5);
    for (const x of [-4.4, -4]) s.add(CYL, P.metal, [x, 0.65, 1.5], [0.04, 0.8, 0.04]);
  },
  tennisCourt: (s) => {
    s.box(P.coral, 0, 0.02, 0, 18, 0.04, 28);
    s.box(P.leaf, 0, 0.055, 0, 14, 0.02, 24);
    for (const x of [-6, 6]) s.box(P.cream, x, 0.07, 0, 0.1, 0.02, 22);
    for (const z of [-11, 0, 11]) s.box(P.cream, 0, 0.07, z, 12, 0.02, 0.1);
    s.box(P.metal, 0, 0.75, 0, 15, 1.4, 0.04);
    s.box(P.cream, 0, 1.48, 0, 15, 0.06, 0.06);
  },
  bandstand: (s) => {
    s.add(CYL, P.stone, [0, 0.4, 0], [4.5, 0.8, 4.5]);
    for (const x of [-3.2, 3.2]) s.box(P.metal, x, 1.6, -2, 1, 2.4, 1);
    s.add(CYL, P.dark, [0, 1.6, 0], [0.04, 1.5, 0.04]);
    s.box(P.dark, 0, 2.3, 0.3, 0.1, 0.1, 0.6);
  },
  flamingo: (s) => {
    s.add(BALL, P.pink, [0, 2, 0], [0.6, 0.55, 1]);
    s.add(CYL, P.pink, [0, 2.9, 0.7], [0.1, 1.5, 0.1], [-0.2, 0, 0]);
    s.add(BALL, P.pink, [0, 3.65, 0.85], [0.2, 0.23, 0.26]);
    s.add(CONE, P.dark, [0, 3.6, 1.2], [0.12, 0.4, 0.12], [Math.PI / 2, 0, 0]);
    for (const x of [-0.15, 0.15]) s.add(CYL, P.coral, [x, 0.95, 0], [0.035, 1.9, 0.035]);
  },
  clockTower: (s) => {
    s.box(P.cream, 0, 5, 0, 3.5, 10, 3.5);
    s.box(P.coral, 0, 10.2, 0, 4.5, 0.4, 4.5);
    s.add(CONE, P.tile, [0, 12, 0], [3.4, 3, 3.4], [0, Math.PI / 4, 0]);
    for (const z of [-1.77, 1.77]) {
      s.add(CYL, P.dark, [0, 8.4, z], [1, 0.04, 1], [Math.PI / 2, 0, 0]);
      s.box(P.cream, 0, 8.65, z * 1.02, 0.08, 0.7, 0.05);
      s.box(P.cream, 0.25, 8.4, z * 1.02, 0.6, 0.08, 0.05);
    }
  },
  gardenBed: (s) => {
    s.box(P.stone, 0, 0.2, 0, 4, 0.4, 2);
    s.box(P.wood, 0, 0.42, 0, 3.8, 0.02, 1.8);
    for (let i = 0; i < 5; i++) s.at(-1.5 + i * 0.75, 0.4, 0, 0, () => COAST.agave(s));
    for (let i = 0; i < 8; i++)
      s.add(BALL, P.pink, [-1.7 + (i % 4) * 1.1, 0.8, -0.55 + Math.floor(i / 4) * 1.1], [0.2, 0.15, 0.2]);
  },
};
