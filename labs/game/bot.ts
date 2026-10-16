/** @file Autonomous driver: uses the same movement, trigger, interaction and weapon intents as a player. */
import type { Headless, Intents } from '../../engine';
import { LOCATIONS, MISSION_STAGES } from './world/level';
import { distance, type Player, type Vehicle, type Npc, type Mission, type Pickup } from './scenes/components';
import { TOUR_ROUTE } from './world/districts';
import { roadTarget } from './scenes/motion';
export interface GameView {
  player: Player;
  job: Mission;
  cars: ({ id: number } & Vehicle)[];
  npcs: ({ id: number } & Npc)[];
  pickups: Pickup[];
  tick: number;
}
export function viewOf(h: Headless): GameView {
  const entities = h.entities();
  const all = entities.map((e) => h.get(e.id)!);
  return {
    player: all.find((e) => e.driver)!.driver as Player,
    job: all.find((e) => e.job)!.job as Mission,
    cars: all.filter((e) => e.vehicle).map((e) => ({ id: e.id, ...(e.vehicle as Vehicle) })),
    npcs: all.filter((e) => e.citizen).map((e) => ({ id: e.id, ...(e.citizen as Npc) })),
    pickups: all.filter((e) => e.collectible).map((e) => e.collectible as Pickup),
    tick: h.info().tick,
  };
}
function walk(p: Player, target: { x: number; z: number }, buttons: string[] = []): Intents {
  const d = distance(p, target);
  return { move: d > 0.8 ? [(target.x - p.x) / d, (target.z - p.z) / d] : [0, 0], b: ['sprint', ...buttons] };
}
function drive(v: Vehicle, target: { x: number; z: number }): Intents {
  const d = distance(v, target);
  const angle = Math.atan2(target.x - v.x, target.z - v.z);
  const delta = Math.atan2(Math.sin(angle - v.yaw), Math.cos(angle - v.yaw));
  const desired = d < 12 ? Math.max(0, (d - 2) * 1.2) : Math.abs(delta) > 0.65 ? 7 : 22;
  return {
    'game:throttle': v.speed < desired ? 1 : 0,
    'game:steer': Math.max(-1, Math.min(1, delta * 2.5)),
    b: v.speed > desired + 1 ? ['brake'] : [],
  };
}
export function botIntents(view: GameView): Intents {
  const { player: p, job: j, cars, npcs } = view;
  if (j.state !== 'playing') return {};
  const kind = MISSION_STAGES[j.stage].kind;
  const car = cars.find((v) => v.id === p.car);
  const usable = cars
    .filter((v) => v.active && v.hp > 0 && v.type !== 'police')
    .sort((a, b) => distance(p, a) - distance(p, b))[0];
  if (j.cruise) {
    if (!car) return distance(p, usable) < 4 ? { p: ['interact'] } : walk(p, usable);
    const index = Math.min(j.route, TOUR_ROUTE.length - 1),
      target = TOUR_ROUTE[index];
    return { ...drive(car, roadTarget(car, target)), 'game:route': distance(car, target) < 9 ? index + 1 : index };
  }
  if (kind === 'call') return distance(p, LOCATIONS.phone) < 3 ? { p: ['interact'] } : walk(p, LOCATIONS.phone);
  if (kind === 'clear') {
    if (car) return Math.abs(car.speed) > 1 ? { 'game:throttle': 0, b: ['brake'] } : { p: ['interact'] };
    const guards = npcs.filter((n) => n.role === 'guard' && n.hp > 0);
    if (guards.length) {
      const nearest = guards.sort((a, b) => distance(p, a) - distance(p, b))[0];
      return distance(p, nearest) > 20 ? walk(p, nearest, ['attack']) : { b: ['attack'] };
    }
    return walk(p, LOCATIONS.tape);
  }
  if (kind === 'handoff') return distance(p, LOCATIONS.roof) < 3 ? { p: ['interact'] } : walk(p, LOCATIONS.roof);
  if (kind === 'lift' && distance(p, LOCATIONS.club) < (car ? 10 : 22)) {
    if (car) return Math.abs(car.speed) > 1 ? { b: ['brake'] } : { p: ['interact'] };
    return distance(p, LOCATIONS.club) < 4 ? { p: ['interact'] } : walk(p, LOCATIONS.club);
  }
  if (!car) return distance(p, usable) < 4 ? { p: ['interact'] } : walk(p, usable);
  if (kind === 'drive') return drive(car, LOCATIONS.marina);
  if (kind === 'escape') {
    const route = [
      { x: 30, z: -96 },
      { x: -42, z: -96 },
      { x: -42, z: 40 },
      { x: -42, z: 96 },
      { x: 30, z: 96 },
      { x: 30, z: 0 },
    ];
    const index = Math.min(j.route, route.length - 1);
    const target = route[index];
    return { ...drive(car, target), 'game:route': distance(car, target) < 7 ? index + 1 : index };
  }
  return drive(car, roadTarget(car, { x: -42, z: 73 }));
}
export function playBot(h: Headless, limit = 22000): { state: string; steps: number; stage: number } {
  let view = viewOf(h);
  let steps = 0;
  while (view.job.state === 'playing' && steps < limit) {
    h.step(1, botIntents(view));
    view = viewOf(h);
    steps++;
  }
  return { state: view.job.state, steps, stage: view.job.stage };
}
