/** @file Aim-assisted combat with occlusion, magazine/reload decisions, readable enemy wind-ups and wanted search. */
import { held, pressed, physicsOf, type Intents } from '../../../engine/sim-api';
import { clamp, distance, jobOf, message, playerOf, type GameWorld } from './components';
import { moveBody, roadTarget } from './motion';
import { MISSION_STAGES } from '../world/level';
export function sight(w: GameWorld, a: { x: number; z: number }, b: { x: number; z: number }): boolean {
  const d = distance(a, b);
  if (d < 0.01) return true;
  return !physicsOf(w).raycast([a.x, 1.2, a.z], [(b.x - a.x) / d, 0, (b.z - a.z) / d], {
    maxDistance: d,
    groups: ['world'],
  });
}
export function hurtPlayer(w: GameWorld, amount: number): void {
  const p = playerOf(w),
    j = jobOf(w);
  if (p.invincible > 0) return;
  const armor = Math.min(p.armor, amount * 0.7);
  p.armor -= armor;
  p.hp = Math.max(0, p.hp - (amount - armor));
  p.invincible = 18;
  j.damage += amount;
  w.emit('hurt', { amount });
}
export function combat(w: GameWorld, intents: Intents): void {
  const p = playerOf(w),
    j = jobOf(w);
  p.cooldown = Math.max(0, p.cooldown - 1);
  p.shot = Math.max(0, p.shot - 1);
  if (pressed(intents, 'weapon')) {
    p.weapon = 1 - p.weapon;
    p.ammo = Math.min(p.ammo, p.weapon ? 24 : 12);
    message(w, p.weapon ? 'Equipped: compact SMG' : 'Equipped: service pistol');
  }
  if (p.reload > 0) {
    p.reload--;
    if (p.reload === 0) {
      const take = Math.min((p.weapon ? 24 : 12) - p.ammo, p.reserve);
      p.ammo += take;
      p.reserve -= take;
      w.emit('reload', {});
    }
    return;
  }
  if ((pressed(intents, 'reload') || p.ammo === 0) && p.reserve > 0 && p.ammo < (p.weapon ? 24 : 12)) {
    p.reload = p.weapon ? 75 : 55;
    return;
  }
  if (!p.car && held(intents, 'attack') && p.cooldown === 0 && p.ammo > 0) {
    const target = w
      .query('citizen')
      .filter(
        (e) => e.citizen.role === 'guard' && e.citizen.hp > 0 && distance(p, e.citizen) < 32 && sight(w, p, e.citizen),
      )
      .sort((a, b) => distance(p, a.citizen) - distance(p, b.citizen))[0];
    p.ammo--;
    p.cooldown = p.weapon ? 7 : 19;
    p.shot = 6;
    j.lastCrime = w.tick;
    if (target) {
      const n = target.citizen;
      p.yaw = Math.atan2(n.x - p.x, n.z - p.z);
      p.shotX = n.x;
      p.shotZ = n.z;
      n.hp = Math.max(0, n.hp - (p.weapon ? 22 : 42));
      n.alert = 120;
      if (n.hp === 0) {
        j.kills++;
        p.cash += 75;
        w.emit('down', { x: n.x, z: n.z });
      }
    } else {
      p.shotX = p.x + Math.sin(p.yaw) * 24;
      p.shotZ = p.z + Math.cos(p.yaw) * 24;
    }
    w.emit('shot', { x: p.x, z: p.z });
    if (MISSION_STAGES[j.stage].kind !== 'clear') j.heat = Math.max(j.heat, 1);
  }
}
export function citizens(w: GameWorld): void {
  const p = playerOf(w),
    j = jobOf(w);
  for (const { citizen: n } of w.query('citizen')) {
    n.shot = Math.max(0, n.shot - 1);
    if (n.hp <= 0 || n.role === 'contact') continue;
    if (n.role === 'guard') {
      if (MISSION_STAGES[j.stage].kind !== 'clear') continue;
      const d = distance(p, n);
      if (d > 35) continue;
      n.yaw = Math.atan2(p.x - n.x, p.z - n.z);
      n.cooldown--;
      if (d < 25 && sight(w, n, p)) {
        n.alert = clamp(1 - n.cooldown / 95, 0, 1);
        if (n.cooldown <= 0) {
          n.cooldown = j.difficulty === 0 ? 150 : 110;
          n.shot = 8;
          if (p.jump < 0.3) hurtPlayer(w, j.difficulty === 0 ? 4 : 8);
          w.emit('enemyShot', {});
        }
      } else {
        moveBody(n, Math.sin(n.yaw) * 1.6 * w.dt, Math.cos(n.yaw) * 1.6 * w.dt, 0.4);
        n.alert = 0;
      }
    } else {
      n.phase += w.dt;
      const panic = j.heat > 0 && distance(p, n) < 22;
      const dz = (panic ? 3 : 1.1) * Math.cos(n.phase * 0.15) * w.dt;
      if (!moveBody(n, 0, dz, 0.5)) n.yaw = dz > 0 ? 0 : Math.PI;
      if (Math.abs(n.z - n.homeZ) > 15) n.phase += Math.PI / 0.15;
    }
  }
}
export function police(w: GameWorld): void {
  const p = playerOf(w),
    j = jobOf(w);
  let seen = false;
  for (const { vehicle: v } of w.query('vehicle')) {
    if (v.type !== 'police') continue;
    v.active = j.heat > 0;
    if (!v.active) continue;
    const d = distance(v, p);
    if (d < 36 && sight(w, v, p) && p.y < 3) seen = true;
    const target = roadTarget(v, p),
      angle = Math.atan2(target.x - v.x, target.z - v.z);
    const diff = Math.atan2(Math.sin(angle - v.yaw), Math.cos(angle - v.yaw));
    v.yaw += clamp(diff, -2 * w.dt, 2 * w.dt);
    v.speed = d > 5 ? 12 : 0;
    moveBody(v, Math.sin(v.yaw) * v.speed * w.dt, Math.cos(v.yaw) * v.speed * w.dt, 1.35);
    if (d < 5 && w.tick % 60 === 0) {
      if (p.car) {
        const car = w.get(p.car)!.vehicle!;
        car.hp = Math.max(0, car.hp - 8);
      } else hurtPlayer(w, 12);
    }
  }
  if (j.heat > 0) {
    if (seen || w.tick - j.lastCrime < 120) j.unseen = 0;
    else j.unseen++;
    if (j.unseen >= 420) {
      j.heat = 0;
      j.unseen = 0;
      message(w, 'THE COAST IS CLEAR');
      w.emit('escaped', {});
    }
  }
}
