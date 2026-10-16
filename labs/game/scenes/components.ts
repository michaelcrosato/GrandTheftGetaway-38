/** @file ECS schemas: every gameplay value is captured, hashed and replayed by my-3dge. */
import { defineComponent, type World } from '../../../engine/sim-api';
const number = (value = 0) => ({ type: 'number' as const, default: value, description: 'Simulation value.' });
const text = (value = '') => ({ type: 'string' as const, default: value, description: 'Content or state identifier.' });
const bool = (value = false) => ({ type: 'boolean' as const, default: value, description: 'State flag.' });
export interface Player {
  x: number;
  y: number;
  z: number;
  yaw: number;
  hp: number;
  armor: number;
  car: number;
  ammo: number;
  reserve: number;
  weapon: number;
  cooldown: number;
  reload: number;
  invincible: number;
  moving: number;
  jump: number;
  vy: number;
  cash: number;
  tapes: number;
  shot: number;
  shotX: number;
  shotZ: number;
}
export interface Vehicle {
  x: number;
  z: number;
  yaw: number;
  speed: number;
  hp: number;
  type: string;
  color: string;
  route: number;
  active: boolean;
  flash: number;
}
export interface Npc {
  x: number;
  z: number;
  yaw: number;
  hp: number;
  role: string;
  alert: number;
  cooldown: number;
  homeX: number;
  homeZ: number;
  phase: number;
  shot: number;
}
export interface Mission {
  stage: number;
  ticks: number;
  state: string;
  heat: number;
  unseen: number;
  checkpoint: number;
  delivered: boolean;
  startTick: number;
  elapsed: number;
  score: number;
  kills: number;
  race: number;
  raceTick: number;
  raceBest: number;
  message: string;
  messageTick: number;
  lastCrime: number;
  damage: number;
  crashes: number;
  difficulty: number;
  route: number;
}
export interface Pickup {
  x: number;
  z: number;
  taken: boolean;
  kind: string;
}
export type Components = { driver: Player; vehicle: Vehicle; citizen: Npc; job: Mission; collectible: Pickup };
export type GameWorld = World<Components>;
defineComponent('driver', {
  description: 'Player, inventory and vehicle possession.',
  fields: {
    x: number(37),
    y: number(),
    z: number(108),
    yaw: number(Math.PI),
    hp: number(100),
    armor: number(50),
    car: number(),
    ammo: number(12),
    reserve: number(120),
    weapon: number(),
    cooldown: number(),
    reload: number(),
    invincible: number(),
    moving: number(),
    jump: number(),
    vy: number(),
    cash: number(250),
    tapes: number(),
    shot: number(),
    shotX: number(),
    shotZ: number(),
  },
});
defineComponent('vehicle', {
  description: 'Drivable arcade vehicle, traffic or pursuit unit.',
  fields: {
    x: number(),
    z: number(),
    yaw: number(),
    speed: number(),
    hp: number(100),
    type: text('traffic'),
    color: text('#f5c791'),
    route: number(),
    active: bool(true),
    flash: number(),
  },
});
defineComponent('citizen', {
  description: 'Pedestrian, guard, or mission contact.',
  fields: {
    x: number(),
    z: number(),
    yaw: number(),
    hp: number(100),
    role: text('pedestrian'),
    alert: number(),
    cooldown: number(),
    homeX: number(),
    homeZ: number(),
    phase: number(),
    shot: number(),
  },
});
defineComponent('job', {
  description: 'Mission, wanted, checkpoint and optional street sprint state.',
  fields: {
    stage: number(),
    ticks: number(),
    state: text('playing'),
    heat: number(),
    unseen: number(),
    checkpoint: number(),
    delivered: bool(),
    startTick: number(),
    elapsed: number(),
    score: number(),
    kills: number(),
    race: number(-1),
    raceTick: number(),
    raceBest: number(),
    message: text(),
    messageTick: number(),
    lastCrime: number(-10000),
    damage: number(),
    crashes: number(),
    difficulty: number(1),
    route: number(),
  },
});
defineComponent('collectible', {
  description: 'A persistent-in-run collectible cassette.',
  fields: { x: number(), z: number(), taken: bool(), kind: text('cassette') },
});
export const playerOf = (w: GameWorld): Player => w.query('driver')[0].driver;
export const jobOf = (w: GameWorld): Mission => w.query('job')[0].job;
export const distance = (a: { x: number; z: number }, b: { x: number; z: number }): number =>
  Math.hypot(a.x - b.x, a.z - b.z);
export const clamp = (n: number, min: number, max: number): number => Math.max(min, Math.min(max, n));
export function message(w: GameWorld, value: string): void {
  const j = jobOf(w);
  j.message = value;
  j.messageTick = 240;
  w.emit('notice', { text: value });
}
