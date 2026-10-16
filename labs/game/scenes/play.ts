/** @file One Last Delivery: full mission scene on my-3dge's deterministic ECS and Rapier world. */
import { defineScene, defineSettings, physicsOf } from '../../../engine/sim-api';
import { BUILDINGS, PICKUPS, CHECKPOINTS, blocked } from '../world/level';
import { jobOf, playerOf, type Components } from './components';
import { motion, traffic } from './motion';
import { combat, citizens, police } from './combat';
import { mission } from './mission';
import { TRAFFIC_ROUTES, DISTRICTS, ROADS, WORLD_LIMITS } from '../world/districts';
import { PROP_SOLIDS } from '../world/props';
import { VEHICLE_BODIES } from '../art/palette';
export const GAME_SETTINGS = defineSettings({
  'game.cruise': {
    type: 'boolean',
    default: false,
    when: 'scene',
    description: 'Explore the full city without a mission deadline.',
  },
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
      position: [(WORLD_LIMITS.minX + WORLD_LIMITS.maxX) / 2, -1, 0],
      colliders: [
        {
          shape: {
            type: 'box',
            size: [WORLD_LIMITS.maxX - WORLD_LIMITS.minX, 2, WORLD_LIMITS.maxZ - WORLD_LIMITS.minZ],
          },
        },
      ],
    });
    for (const b of [...BUILDINGS, ...PROP_SOLIDS])
      physics.addBody({
        type: 'fixed',
        position: [b.x, b.h / 2, b.z],
        colliders: [{ shape: { type: 'box', size: [b.w, b.h, b.d] } }],
      });
    const cruise = w.settings.get<boolean>('game.cruise');
    const stage = cruise ? 0 : w.settings.get<number>('game.checkpoint');
    const checkpoint = CHECKPOINTS[stage];
    w.spawn({
      job: {
        cruise,
        stage,
        checkpoint: stage,
        difficulty: w.settings.get<number>('game.difficulty'),
        heat: checkpoint.heat,
        delivered: checkpoint.tape,
      },
    });
    const ride = w.spawn({ vehicle: { ...checkpoint.car, yaw: checkpoint.yaw, type: 'cobalt', color: '#4bd8e3' } });
    w.spawn({
      driver: {
        ...(cruise ? checkpoint.car : checkpoint.player),
        y: checkpoint.y,
        yaw: checkpoint.yaw,
        car: checkpoint.inCar || cruise ? ride : 0,
      },
    });
    const rng = w.rng('city');
    for (let circuit = 0; circuit < TRAFFIC_ROUTES.length; circuit++) {
      const path = TRAFFIC_ROUTES[circuit],
        count = circuit === 0 ? 8 : 4;
      for (let i = 0; i < count; i++) {
        const a = path[i % 4],
          b = path[(i + 1) % 4],
          t = i < 4 ? 0.28 : 0.7;
        const model = VEHICLE_BODIES[(i + circuit) % VEHICLE_BODIES.length];
        w.spawn({
          vehicle: {
            x: a.x + (b.x - a.x) * t,
            z: a.z + (b.z - a.z) * t,
            yaw: Math.atan2(b.x - a.x, b.z - a.z),
            route: (i + 1) % 4,
            circuit,
            model,
            color: model === 'taxi' ? '#e9bc6b' : ['#ffd196', '#db74a2', '#d4e5c3', '#676b8e'][i % 4],
          },
        });
      }
    }
    DISTRICTS.forEach((d, i) => {
      const x = [...ROADS.vertical].sort((a, b) => Math.abs(a - d.x) - Math.abs(b - d.x))[0] + 4;
      const z = d.z + 25;
      if (!blocked(x, z, 1.5))
        w.spawn({
          vehicle: {
            x,
            z,
            yaw: Math.PI,
            type: 'parked',
            model: VEHICLE_BODIES[i],
            color: ['#bd668f', '#6aafb9', '#d4b27f'][i % 3],
          },
        });
    });
    for (let i = 0; i < 2; i++)
      w.spawn({
        vehicle: {
          x: i ? -42 : 30,
          z: i ? -90 : -48,
          yaw: Math.PI,
          type: 'police',
          model: 'sedan',
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
    for (const d of DISTRICTS.slice(1))
      for (let i = 0; i < 10; i++) {
        const road = [...ROADS.vertical].sort((a, b) => Math.abs(a - d.x) - Math.abs(b - d.x))[0];
        const x = road + (i % 2 ? 13 : -13),
          z = d.z + rng.range(-48, 48);
        if (!blocked(x, z, 0.6))
          w.spawn({
            citizen: {
              x,
              z,
              homeX: x,
              homeZ: z,
              phase: rng.range(0, 8),
              role:
                d.id === 'port'
                  ? 'worker'
                  : d.id === 'downtown'
                    ? 'office'
                    : d.id === 'sol'
                      ? 'vendor'
                      : d.id === 'marina' || d.id === 'south'
                        ? 'visitor'
                        : 'pedestrian',
            },
          });
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
