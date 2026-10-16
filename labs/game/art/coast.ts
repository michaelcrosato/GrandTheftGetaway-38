/** @file Beach, garden and marina art: seventeen reusable coastal objects. */
import { CYL, BALL, CONE, LEAF } from '../view/primitives';
import { P } from './palette';
import type { Recipe } from './street';
export const COAST: Record<string, Recipe> = {
  royalPalm: (s) => {
    s.add(CYL, P.wood, [0, 5, 0], [0.24, 10, 0.24], [0.03, 0, -0.04]);
    for (let i = 0; i < 8; i++) s.add(LEAF, P.leaf, [-0.2, 10, 0], [1, 1, 1], [0, (i * Math.PI) / 4, 0]);
    s.add(BALL, P.leaf, [-0.2, 9.8, 0], [0.6, 0.5, 0.6]);
  },
  fanPalm: (s) => {
    s.add(CYL, P.wood, [0, 2, 0], [0.3, 4, 0.3]);
    for (let i = 0; i < 10; i++) s.add(LEAF, P.lightLeaf, [0, 4, 0], [0.7, 0.6, 0.65], [0, (i * Math.PI) / 5, 0]);
  },
  broadleaf: (s) => {
    s.add(CYL, P.wood, [0, 2.4, 0], [0.27, 4.8, 0.27]);
    s.add(BALL, P.leaf, [0, 5.2, 0], [2.5, 2.2, 2.3]);
    s.add(BALL, P.lightLeaf, [1.4, 5.9, 0.8], [1.4, 1.5, 1.5]);
  },
  cypress: (s) => {
    s.add(CYL, P.wood, [0, 2, 0], [0.15, 4, 0.15]);
    s.add(CONE, P.leaf, [0, 4.5, 0], [1, 6, 1]);
  },
  floweringTree: (s) => {
    s.add(CYL, P.wood, [0, 2.3, 0], [0.2, 4.6, 0.2]);
    s.add(BALL, P.pink, [0, 4.6, 0], [2.2, 1.8, 2]);
    s.add(BALL, P.coral, [-1, 5, 0.6], [1.2, 1, 1.2]);
  },
  hedge: (s) => {
    s.box(P.leaf, 0, 0.65, 0, 3, 1.3, 0.85);
    s.box(P.lightLeaf, 0, 1.2, 0, 3, 0.2, 0.85);
  },
  agave: (s) => {
    for (let i = 0; i < 8; i++) s.add(LEAF, P.mint, [0, 0.2, 0], [0.2, 0.5, 0.3], [0, (i * Math.PI) / 4, 0]);
  },
  umbrella: (s) => {
    s.add(CYL, P.wood, [0, 1.25, 0], [0.045, 2.5, 0.045]);
    s.add(CONE, P.coral, [0, 2.5, 0], [2, 0.7, 2]);
    s.add(CONE, P.cream, [0, 2.55, 0], [1.3, 0.65, 1.3]);
  },
  lounger: (s) => {
    s.box(P.cream, 0, 0.35, 0, 0.8, 0.15, 2);
    s.add(CYL, P.metal, [-0.35, 0.18, 0], [0.04, 0.36, 0.04]);
    s.add(CYL, P.metal, [0.35, 0.18, 0], [0.04, 0.36, 0.04]);
    s.box(P.mint, 0, 0.45, 0.4, 0.72, 0.1, 1);
    s.add(CONE, P.cream, [0, 0.4, -0.6], [0.4, 0.2, 0.4]);
  },
  lifeguardTower: (s) => {
    for (const x of [-1, 1]) for (const z of [-0.8, 0.8]) s.add(CYL, P.wood, [x, 1.4, z], [0.08, 2.8, 0.08]);
    s.box(P.mint, 0, 2.9, 0, 2.8, 0.18, 2.4);
    s.box(P.cream, 0, 3.8, -0.7, 2.4, 1.6, 0.1);
    s.box(P.coral, 0, 4.7, 0, 3.3, 0.18, 3);
    for (const x of [-1.2, 1.2]) s.box(P.cream, x, 3.7, 0, 0.1, 1.6, 2);
    for (let i = 0; i < 7; i++) s.box(P.wood, 0, 0.2 + i * 0.4, 1.5 - i * 0.12, 0.8, 0.08, 0.2);
  },
  surfboardRack: (s) => {
    for (const x of [-1, 1]) s.add(CYL, P.wood, [x, 1, 0], [0.06, 2, 0.06]);
    s.box(P.wood, 0, 1.3, 0, 2.2, 0.1, 0.1);
    for (let i = 0; i < 4; i++)
      s.add(BALL, [P.coral, P.mint, P.yellow, P.pink][i], [-0.8 + i * 0.5, 1.25, 0.1], [0.2, 1.2, 0.07], [0, 0, 0.12]);
  },
  beachHut: (s) => {
    s.box(P.mint, 0, 1.2, 0, 2.8, 2.4, 2.4);
    s.add(CONE, P.wood, [0, 2.9, 0], [2.4, 1.2, 2.2], [0, Math.PI / 4, 0]);
    s.box(P.dark, 0, 1, 1.21, 1, 2, 0.05);
    for (const x of [-0.9, 0.9]) s.box(P.cream, x, 1.4, 1.23, 0.5, 0.8, 0.04);
  },
  sailboat: (s) => {
    s.add(BALL, P.cream, [0, 0.45, 0], [1.2, 0.65, 4]);
    s.box(P.wood, 0, 0.9, 0, 1.8, 0.1, 5);
    s.add(CYL, P.metal, [0, 4.2, 0], [0.055, 7.5, 0.055]);
    s.add(CONE, P.cream, [0, 4.2, 0.55], [0.05, 6, 2.2], [0, 0, 0.08]);
    s.box(P.blue, 0, 1.2, -1, 1.1, 0.6, 1.5);
  },
  speedboat: (s) => {
    s.add(BALL, P.cream, [0, 0.5, 0], [1.25, 0.65, 3.5]);
    s.box(P.coral, 0, 1, -1.1, 2, 0.2, 2);
    s.box(P.glass, 0, 1.45, 0.3, 1.8, 0.6, 0.08);
    s.box(P.cream, 0, 1.2, -0.5, 1.5, 0.3, 0.6);
  },
  fishingBoat: (s) => {
    s.add(BALL, P.blue, [0, 0.7, 0], [1.7, 0.85, 4.2]);
    s.box(P.wood, 0, 1.2, 0, 2.6, 0.15, 6);
    s.box(P.cream, 0, 2, 1, 2.2, 1.6, 2);
    s.box(P.glass, 0, 2.3, 2.01, 1.7, 0.65, 0.04);
    s.add(CYL, P.metal, [0, 4, 0], [0.05, 4, 0.05]);
    s.box(P.metal, 0, 5.5, 0, 3, 0.08, 0.08);
  },
  yacht: (s) => {
    s.add(BALL, P.cream, [0, 0.8, 0], [2.4, 1, 6]);
    s.box(P.cream, 0, 1.5, 0, 3.6, 0.3, 8);
    s.box(P.glass, 0, 2.3, 0.6, 2.7, 1.1, 4.4);
    s.box(P.cream, 0, 3, 0.3, 3, 0.25, 5);
    s.add(CYL, P.metal, [0, 4.1, -1], [0.05, 2.2, 0.05]);
    s.box(P.cream, 0, 4.8, -1, 1.6, 0.1, 0.2);
  },
  dockBollard: (s) => {
    s.add(CYL, P.metal, [0, 0.3, 0], [0.18, 0.6, 0.18]);
    s.add(CYL, P.metal, [0, 0.55, 0], [0.1, 0.6, 0.1], [0, 0, Math.PI / 2]);
  },
};
