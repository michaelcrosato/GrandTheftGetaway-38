/** @file One Last Delivery: full mission scene on my-3dge's deterministic ECS and Rapier world. */
import { defineScene, defineSettings, physicsOf } from '../../../engine/sim-api';
import { BUILDINGS, PICKUPS, TRAFFIC_ROUTE, CHECKPOINTS } from '../world/level';
import { jobOf, playerOf, type Components } from './components';
import { motion, traffic } from './motion';
import { combat, citizens, police } from './combat';
import { mission } from './mission';
export const GAME_SETTINGS = defineSettings({
  'game.checkpoint': {
    type: 'integer',
    default: 0,
    minimum: 0,
    maximum: 5,
    when: 'scene',
    description: 'Mission checkpoint on restart.',
  },
  'game.difficulty': {
    type: 'integer',
    default: 1,
    minimum: 0,
    maximum: 1,
    when: 'scene',
    description: '0 story, 1 standard.',
  },
});
export const play = defineScene<Components>('game:play', {
  description: 'One Last Delivery, a coastal open-world mission with driving, combat, pursuit and a rooftop handoff.',
  physics: true,
  setup(w) {
    const physics = physicsOf(w);
    physics.addBody({
      type: 'fixed',
      position: [-20, -1, 0],
      colliders: [{ shape: { type: 'box', size: [260, 2, 360] } }],
    });
    for (const b of BUILDINGS)
      physics.addBody({
        type: 'fixed',
        position: [b.x, b.h / 2, b.z],
        colliders: [{ shape: { type: 'box', size: [b.w, b.h, b.d] } }],
      });
    const stage = w.settings.get<number>('game.checkpoint');
    const checkpoint = CHECKPOINTS[stage];
    w.spawn({
      job: {
        stage,
        checkpoint: stage,
        difficulty: w.settings.get<number>('game.difficulty'),
        heat: checkpoint.heat,
        delivered: checkpoint.tape,
      },
    });
    const ride = w.spawn({ vehicle: { ...checkpoint.car, yaw: checkpoint.yaw, type: 'cobalt', color: '#4bd8e3' } });
    w.spawn({
      driver: { ...checkpoint.player, y: checkpoint.y, yaw: checkpoint.yaw, car: checkpoint.inCar ? ride : 0 },
    });
    const rng = w.rng('city');
    for (let i = 0; i < 8; i++) {
      const a = TRAFFIC_ROUTE[i % 4],
        b = TRAFFIC_ROUTE[(i + 1) % 4];
      const t = i < 4 ? 0.28 : 0.7;
      w.spawn({
        vehicle: {
          x: a.x + (b.x - a.x) * t,
          z: a.z + (b.z - a.z) * t,
          yaw: Math.atan2(b.x - a.x, b.z - a.z),
          route: (i + 1) % 4,
          color: ['#ffd196', '#db74a2', '#d4e5c3', '#676b8e'][i % 4],
        },
      });
    }
    for (let i = 0; i < 2; i++)
      w.spawn({
        vehicle: {
          x: i ? -42 : 30,
          z: i ? -90 : -48,
          yaw: Math.PI,
          type: 'police',
          color: '#e0e5ee',
          active: checkpoint.heat > 0,
        },
      });
    for (let i = 0; i < 3; i++)
      w.spawn({
        citizen: {
          x: 4 + i * 6,
          z: -107 - (i % 2) * 7,
          role: 'guard',
          homeX: 4 + i * 6,
          homeZ: -107,
          hp: checkpoint.guardsAlive ? 100 : 0,
          cooldown: 95 + i * 25,
        },
      });
    for (let i = 0; i < 20; i++) {
      const x = i % 2 ? 44 : -31,
        z = rng.range(-145, 145);
      w.spawn({ citizen: { x, z, homeX: x, homeZ: z, phase: rng.range(0, 8) } });
    }
    w.spawn({ citizen: { x: -73, z: 70, homeX: -73, homeZ: 70, role: 'contact' } });
    for (const p of PICKUPS) w.spawn({ collectible: { ...p } });
  },
  step(w, intents) {
    const j = jobOf(w);
    if (j.state !== 'playing') return;
    if (typeof intents['game:route'] === 'number') j.route = intents['game:route'];
    motion(w, intents);
    traffic(w);
    combat(w, intents);
    citizens(w);
    police(w);
    mission(w, intents);
    const p = playerOf(w);
    if (!Number.isFinite(p.x) || !Number.isFinite(p.z)) throw new Error('Player position became non-finite');
  },
});
export default play;
