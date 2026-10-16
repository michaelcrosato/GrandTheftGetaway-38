/** @file Arcade vehicle handling, possession, collisions, pedestrian movement and jump simulation. */
import { held, pressed, type Intents } from '../../../engine/sim-api';
import { blocked, LOCATIONS } from '../world/level';
import { TRAFFIC_ROUTES, ROADS } from '../world/districts';
import { clamp, distance, jobOf, message, playerOf, type GameWorld, type Vehicle } from './components';
export function moveBody(
  body: { x: number; z: number },
  dx: number,
  dz: number,
  radius: number,
  roof = false,
): boolean {
  let hit = false;
  if (!blocked(body.x + dx, body.z, radius, roof)) body.x += dx;
  else hit = true;
  if (!blocked(body.x, body.z + dz, radius, roof)) body.z += dz;
  else hit = true;
  return hit;
}
export function possession(w: GameWorld, intents: Intents): void {
  const p = playerOf(w);
  if (!pressed(intents, 'interact')) return;
  if (distance(p, LOCATIONS.garage) < 7) return;
  if (p.car) {
    const v = w.get(p.car)?.vehicle;
    if (!v) return;
    if (Math.abs(v.speed) > 6) {
      message(w, 'Slow down to step out');
      return;
    }
    const side = { x: v.x + Math.cos(v.yaw) * 2.5, z: v.z - Math.sin(v.yaw) * 2.5 };
    const other = { x: v.x - Math.cos(v.yaw) * 2.5, z: v.z + Math.sin(v.yaw) * 2.5 };
    const safe = !blocked(side.x, side.z, 0.5) ? side : other;
    if (blocked(safe.x, safe.z, 0.5)) {
      message(w, 'Move away from the wall to exit');
      return;
    }
    p.x = safe.x;
    p.z = safe.z;
    p.car = 0;
    v.speed = 0;
    w.emit('exit', {});
    return;
  }
  if (p.y > 2) return;
  const car = w
    .query('vehicle')
    .filter((e) => e.vehicle.active && e.vehicle.hp > 0 && e.vehicle.type !== 'police' && distance(p, e.vehicle) < 5)
    .sort((a, b) => distance(p, a.vehicle) - distance(p, b.vehicle))[0];
  if (car) {
    p.car = car.id;
    p.x = car.vehicle.x;
    p.z = car.vehicle.z;
    p.yaw = car.vehicle.yaw;
    w.emit('enter', {});
  }
}
export function motion(w: GameWorld, intents: Intents): void {
  const p = playerOf(w),
    j = jobOf(w);
  possession(w, intents);
  if (p.car) {
    const v = w.get(p.car)!.vehicle!;
    const throttle = Number(intents['game:throttle'] ?? 0),
      steer = Number(intents['game:steer'] ?? 0);
    const braking = held(intents, 'brake');
    const boost = held(intents, 'sprint');
    const accel = throttle * 19 - v.speed * (braking ? 3.5 : 0.58);
    v.speed = clamp(v.speed + accel * w.dt, -10, boost ? 35 : 28);
    v.yaw += steer * (braking ? 2.5 : 1.35) * Math.min(1, Math.abs(v.speed) / 5) * Math.sign(v.speed || 1) * w.dt;
    if (moveBody(v, Math.sin(v.yaw) * v.speed * w.dt, Math.cos(v.yaw) * v.speed * w.dt, 1.3)) {
      if (Math.abs(v.speed) > 7 && v.flash === 0) {
        v.hp = Math.max(0, v.hp - Math.abs(v.speed) * 0.6);
        v.flash = 25;
        j.crashes++;
        w.emit('crash', { speed: v.speed });
      }
      v.speed *= -0.25;
    }
    for (const e of w.query('vehicle'))
      if (
        e.id !== p.car &&
        e.vehicle.active &&
        distance(v, e.vehicle) < 2.8 &&
        Math.abs(v.speed) > 8 &&
        v.flash === 0
      ) {
        v.hp -= 6;
        v.speed *= -0.3;
        v.flash = 30;
        e.vehicle.speed *= 0.4;
        j.crashes++;
        w.emit('crash', {});
      }
    p.x = v.x;
    p.z = v.z;
    p.yaw = v.yaw;
    p.y = 0;
    p.moving = Math.abs(v.speed);
    if (v.hp <= 0) {
      p.car = 0;
      p.x += 3;
      p.hp -= 25;
      v.active = false;
      message(w, 'Ride totalled. Find another car.');
    }
  } else {
    const [mx, mz] = intents.move ?? [0, 0];
    const len = Math.hypot(mx, mz);
    const speed = held(intents, 'sprint') ? 9 : 5;
    const factor = len > 1 ? 1 / len : 1;
    const dx = mx * factor * speed * w.dt,
      dz = mz * factor * speed * w.dt;
    moveBody(p, dx, dz, 0.45, p.y >= 7);
    p.moving = Math.hypot(dx, dz) / w.dt;
    if (len > 0.1) p.yaw = Math.atan2(mx, mz);
    if (pressed(intents, 'jump') && p.jump === 0) {
      p.vy = 6;
      p.jump = 0.01;
    }
    if (p.jump > 0) {
      p.jump += p.vy * w.dt;
      p.vy -= 18 * w.dt;
      if (p.jump <= 0) {
        p.jump = 0;
        p.vy = 0;
      }
    }
  }
  p.invincible = Math.max(0, p.invincible - 1);
  for (const { vehicle: v } of w.query('vehicle')) {
    v.flash = Math.max(0, v.flash - 1);
  }
}
/** Traffic follows lane-centred loops. Police use a separate pursuit system. */
export function traffic(w: GameWorld): void {
  const p = playerOf(w);
  for (const e of w.query('vehicle')) {
    const v = e.vehicle;
    if (e.id === p.car || v.type !== 'traffic' || !v.active) continue;
    const path = TRAFFIC_ROUTES[v.circuit];
    const target = path[v.route % path.length];
    const d = distance(v, target);
    if (d < 2.2) {
      v.route = (v.route + 1) % path.length;
      continue;
    }
    const angle = Math.atan2(target.x - v.x, target.z - v.z);
    v.yaw = angle;
    v.speed = distance(v, p) < 6 ? 2 : 8;
    moveBody(v, Math.sin(angle) * v.speed * w.dt, Math.cos(angle) * v.speed * w.dt, 1.3);
  }
}
/** Path on the orthogonal street grid; reused by pursuit and attract driving. */
export function roadTarget(v: Vehicle, target: { x: number; z: number }): { x: number; z: number } {
  const lane = [...ROADS.vertical].sort((a, b) => Math.abs(v.x - a) - Math.abs(v.x - b))[0];
  const targetLane = [...ROADS.vertical].sort((a, b) => Math.abs(target.x - a) - Math.abs(target.x - b))[0];
  if (Math.abs(v.x - lane) > 5) {
    const cross = [...ROADS.horizontal].sort((a, b) => Math.abs(v.z - a) - Math.abs(v.z - b))[0];
    return { x: targetLane, z: cross };
  }
  if (lane !== targetLane) {
    const cross = [...ROADS.horizontal].sort(
      (a, b) => Math.abs(v.z - a) + Math.abs(target.z - a) - (Math.abs(v.z - b) + Math.abs(target.z - b)),
    )[0];
    if (Math.abs(v.z - cross) > 4) return { x: lane, z: cross };
    return { x: targetLane, z: cross };
  }
  if (Math.abs(v.x - target.x) > 8 && Math.abs(v.z - target.z) > 7) return { x: lane, z: target.z };
  return target;
}
