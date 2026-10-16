/** @file Twenty street-furniture models, drawn in local metres by the shared instancer. */
import { CYL, BALL, BOX, Scenery } from '../view/primitives';
import { P } from './palette';
export type Recipe = (s: Scenery) => void;
const legs = (s: Scenery, width = 2, depth = 0.6, height = 0.5) => {
  for (const x of [-width / 2, width / 2])
    for (const z of [-depth / 2, depth / 2]) s.box(P.metal, x, height / 2, z, 0.08, height, 0.08);
};
export const STREET: Record<string, Recipe> = {
  bench: (s) => {
    legs(s);
    for (let i = 0; i < 4; i++) s.box(P.wood, 0, 0.55, -0.3 + i * 0.2, 2.3, 0.12, 0.14);
    for (let y = 0.8; y < 1.3; y += 0.2) s.box(P.wood, 0, y, -0.4, 2.3, 0.13, 0.08);
  },
  lamp: (s) => {
    s.add(CYL, P.metal, [0, 3.7, 0], [0.09, 7.4, 0.09]);
    s.box(P.metal, 1, 7.3, 0, 2, 0.12, 0.12);
    s.box(P.cream, 1.9, 7.15, 0, 0.65, 0.2, 0.75, 0.5);
  },
  globeLamp: (s) => {
    s.add(CYL, P.dark, [0, 2.3, 0], [0.1, 4.6, 0.1]);
    s.add(BALL, P.cream, [0, 4.7, 0], [0.4, 0.4, 0.4], [], 0.3);
    s.add(CYL, P.dark, [0, 0.2, 0], [0.25, 0.4, 0.25]);
  },
  trafficLight: (s) => {
    s.add(CYL, P.metal, [0, 3.3, 0], [0.08, 6.6, 0.08]);
    s.box(P.metal, 2, 6.5, 0, 4, 0.12, 0.12);
    s.box(P.dark, 3.7, 5.95, 0, 0.38, 1.2, 0.35);
    for (let i = 0; i < 3; i++)
      s.add(BALL, [P.red, P.yellow, P.mint][i], [3.7, 6.3 - i * 0.35, 0.2], [0.13, 0.13, 0.04], [], i === 2 ? 0.7 : 0);
  },
  hydrant: (s) => {
    s.add(CYL, P.red, [0, 0.48, 0], [0.23, 0.95, 0.23]);
    s.add(BALL, P.red, [0, 1, 0], [0.28, 0.23, 0.28]);
    s.add(CYL, P.red, [0, 0.65, 0], [0.15, 0.8, 0.15], [0, 0, Math.PI / 2]);
  },
  parkingMeter: (s) => {
    s.add(CYL, P.metal, [0, 0.6, 0], [0.055, 1.2, 0.055]);
    s.box(P.metal, 0, 1.4, 0, 0.3, 0.5, 0.2);
    s.box(P.glass, 0, 1.45, 0.11, 0.21, 0.18, 0.02);
  },
  mailbox: (s) => {
    s.box(P.blue, 0, 0.65, 0, 0.7, 1.25, 0.6);
    s.add(CYL, P.blue, [0, 1.25, 0], [0.35, 0.6, 0.35], [Math.PI / 2, 0, 0]);
    s.box(P.dark, 0, 0.95, 0.31, 0.5, 0.08, 0.02);
  },
  newsstand: (s) => {
    s.box(P.red, 0, 0.65, 0, 0.8, 1.3, 0.55);
    s.box(P.cream, 0, 1, 0.29, 0.65, 0.4, 0.03);
    for (let i = 0; i < 3; i++) s.box(P.dark, 0, 0.92 + i * 0.07, 0.32, 0.43, 0.02, 0.01);
  },
  bin: (s) => {
    s.add(CYL, P.metal, [0, 0.5, 0], [0.33, 1, 0.33]);
    s.add(CYL, P.dark, [0, 1.02, 0], [0.38, 0.08, 0.38]);
    for (let i = 0; i < 8; i++) s.add(BOX, P.cream, [Math.sin(i) * 0.32, 0.5, Math.cos(i) * 0.32], [0.035, 0.8, 0.035]);
  },
  dumpster: (s) => {
    s.box(P.leaf, 0, 0.7, 0, 2, 1.35, 1.2);
    s.box(P.dark, 0, 1.42, 0, 2.15, 0.13, 1.3);
    for (const x of [-0.7, 0.7])
      for (const z of [-0.4, 0.4]) s.add(CYL, P.dark, [x, 0.13, z], [0.13, 0.12, 0.13], [0, 0, Math.PI / 2]);
  },
  busShelter: (s) => {
    for (const x of [-2, 2]) s.box(P.metal, x, 1.4, 0, 0.1, 2.8, 0.1);
    s.box(P.glass, 0, 1.4, -0.6, 4, 2.5, 0.05);
    s.box(P.mint, 0, 2.85, 0, 4.5, 0.16, 2);
    s.at(0, 0, -0.1, 0, () => STREET.bench(s));
  },
  phoneBooth: (s) => {
    for (const x of [-0.65, 0.65]) for (const z of [-0.55, 0.55]) s.box(P.metal, x, 1.3, z, 0.09, 2.6, 0.09);
    s.box(P.mint, 0, 2.6, 0, 1.5, 0.18, 1.3);
    s.box(P.glass, -0.63, 1.4, 0, 0.035, 2.2, 1);
    s.box(P.metal, 0, 1.4, -0.5, 0.5, 0.7, 0.25);
  },
  bollard: (s) => {
    s.add(CYL, P.cream, [0, 0.52, 0], [0.12, 1, 0.12]);
    s.add(BALL, P.cream, [0, 1.02, 0], [0.13, 0.13, 0.13]);
  },
  bikeRack: (s) => {
    for (let i = 0; i < 4; i++) {
      s.add(CYL, P.metal, [i * 0.5 - 0.75, 0.45, 0], [0.04, 0.9, 0.04]);
      s.box(P.metal, i * 0.5 - 0.75, 0.9, 0.25, 0.07, 0.07, 0.5);
    }
    s.box(P.metal, 0, 0.15, 0.2, 2, 0.08, 0.08);
  },
  bicycle: (s) => {
    for (const z of [-0.62, 0.62]) {
      s.add(CYL, P.dark, [0, 0.4, z], [0.39, 0.05, 0.39], [0, 0, Math.PI / 2]);
      s.add(CYL, P.metal, [0, 0.4, z], [0.31, 0.07, 0.31], [0, 0, Math.PI / 2]);
    }
    s.add(BOX, P.coral, [0, 0.66, 0], [0.07, 0.85, 0.07], [0.8, 0, 0]);
    s.add(BOX, P.coral, [0, 0.6, 0], [0.07, 0.85, 0.07], [-0.8, 0, 0]);
    s.box(P.dark, 0, 1, -0.35, 0.25, 0.07, 0.4);
    s.box(P.metal, 0, 1.15, 0.5, 0.6, 0.05, 0.05);
  },
  planter: (s) => {
    s.box(P.stone, 0, 0.38, 0, 1.7, 0.7, 1.2);
    s.add(BALL, P.leaf, [0, 0.8, 0], [0.85, 0.6, 0.6]);
    for (const x of [-0.5, 0, 0.5]) s.add(BALL, P.pink, [x, 1.1, 0.15], [0.18, 0.15, 0.2]);
  },
  cafeTable: (s) => {
    s.add(CYL, P.cream, [0, 0.85, 0], [0.65, 0.08, 0.65]);
    s.add(CYL, P.metal, [0, 0.42, 0], [0.07, 0.84, 0.07]);
    s.add(CYL, P.metal, [0, 0.08, 0], [0.36, 0.05, 0.36]);
    s.add(CYL, P.coral, [0.2, 0.95, 0], [0.07, 0.15, 0.07]);
  },
  cafeChair: (s) => {
    legs(s, 0.45, 0.45, 0.5);
    s.box(P.mint, 0, 0.5, 0, 0.6, 0.08, 0.6);
    s.box(P.mint, 0, 0.85, -0.27, 0.6, 0.65, 0.06);
  },
  scooter: (s) => {
    for (const z of [-0.55, 0.55]) s.add(CYL, P.dark, [0, 0.25, z], [0.25, 0.13, 0.25], [0, 0, Math.PI / 2]);
    s.box(P.pink, 0, 0.6, -0.25, 0.6, 0.65, 0.8);
    s.box(P.dark, 0, 0.97, -0.25, 0.6, 0.13, 0.7);
    s.box(P.pink, 0, 0.8, 0.4, 0.55, 1, 0.15);
    s.box(P.metal, 0, 1.28, 0.4, 0.9, 0.05, 0.08);
  },
  marketCart: (s) => {
    s.box(P.cream, 0, 0.9, 0, 2, 0.7, 1.2);
    for (const x of [-0.8, 0.8]) s.add(CYL, P.dark, [x, 0.35, 0], [0.3, 0.12, 0.3], [0, 0, Math.PI / 2]);
    for (const x of [-0.9, 0.9]) s.box(P.wood, x, 1.65, 0, 0.07, 1.5, 0.07);
    s.box(P.coral, 0, 2.4, 0, 2.5, 0.12, 1.8);
    for (let i = 0; i < 10; i++)
      s.add(
        BALL,
        i % 2 ? P.yellow : P.leaf,
        [-0.8 + (i % 5) * 0.4, 1.32, -0.25 + Math.floor(i / 5) * 0.5],
        [0.15, 0.14, 0.15],
      );
  },
};
