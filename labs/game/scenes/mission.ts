/** @file Data-led mission progression, checkpoints, optional collectibles, repair economy and street sprint. */
import { pressed, type Intents } from '../../../engine/sim-api';
import { LOCATIONS, RACE_GATES, MISSION_STAGES, CHECKPOINTS, PICKUPS } from '../world/level';
import { DISTRICTS, districtAt, TOUR_ROUTE } from '../world/districts';
import { distance, jobOf, message, playerOf, type GameWorld } from './components';
export function advance(w: GameWorld): void {
  const j = jobOf(w);
  j.stage++;
  j.checkpoint = j.stage;
  j.ticks = 0;
  j.route = 0;
  w.emit('checkpoint', { stage: j.stage });
}
export function mission(w: GameWorld, intents: Intents): void {
  const p = playerOf(w),
    j = jobOf(w);
  j.ticks++;
  j.elapsed++;
  j.messageTick = Math.max(0, j.messageTick - 1);
  if (p.hp <= 0) {
    j.state = 'lost';
    message(w, 'WASTED · Retry from your checkpoint');
    w.emit('lost', {});
    return;
  }
  if (!j.cruise && j.elapsed > 60 * 60 * 12) {
    j.state = 'lost';
    message(w, 'The handoff window closed');
    return;
  }
  const district = districtAt(p.x, p.z),
    bit = 1 << DISTRICTS.indexOf(district);
  if (!(j.discovered & bit)) {
    j.discovered |= bit;
    if (j.cruise) {
      p.cash += 50;
      message(w, `${district.name.toUpperCase()} · New neighborhood · +$50`);
    }
  }
  if (j.cruise && j.route >= TOUR_ROUTE.length) {
    j.state = 'won';
    return;
  }
  const use = pressed(intents, 'interact');
  const goal = MISSION_STAGES[j.stage];
  const reached = distance(p, goal.target) < goal.radius;
  if (!j.cruise) {
    if (goal.kind === 'call' && !p.car && reached && use) advance(w);
    else if (goal.kind === 'drive' && p.car && reached) {
      advance(w);
      message(w, 'MARINA · Park, step out, recover the tape');
    } else if (
      goal.kind === 'clear' &&
      !p.car &&
      w.query('citizen').filter((e) => e.citizen.role === 'guard' && e.citizen.hp > 0).length === 0 &&
      reached
    ) {
      j.delivered = true;
      advance(w);
      j.heat = 2;
      j.lastCrime = w.tick;
      p.reserve += 36;
      message(w, 'MASTER TAPE RECOVERED · Lose the heat');
      const units = w.query('vehicle').filter((e) => e.vehicle.type === 'police');
      units.forEach((e, i) => {
        e.vehicle.x = i ? -42 : 30;
        e.vehicle.z = i ? -90 : -48;
        e.vehicle.yaw = Math.PI;
        e.vehicle.active = true;
      });
    } else if (goal.kind === 'escape' && j.heat === 0) advance(w);
    else if (goal.kind === 'lift' && !p.car && reached && use) {
      const arrival = CHECKPOINTS[j.stage + 1];
      p.x = arrival.player.x;
      p.z = arrival.player.z;
      p.y = arrival.y;
      p.yaw = arrival.yaw;
      advance(w);
    } else if (goal.kind === 'handoff' && reached && use) {
      j.state = 'won';
      p.cash += 2000;
      j.score = Math.max(0, 5000 - Math.floor(j.elapsed / 6) - j.crashes * 50 - j.damage * 5) + p.tapes * 250;
      j.delivered = true;
      w.emit('won', { score: j.score });
    }
  }
  if (
    distance(p, LOCATIONS.garage) < 7 &&
    use &&
    p.cash >= 100 &&
    (!p.car || Math.abs(w.get(p.car)!.vehicle!.speed) < 3)
  ) {
    p.cash -= 100;
    p.hp = 100;
    p.armor = 50;
    p.reserve = 120;
    if (p.car) {
      const v = w.get(p.car)!.vehicle!;
      v.hp = 100;
      v.color = '#f5c58e';
    }
    j.lastCrime = -10000;
    j.unseen = Math.max(0, j.unseen);
    message(w, 'SUNSET MOTORS · Repaired & restocked · −$100');
    w.emit('repair', {});
  }
  if (distance(p, LOCATIONS.garage) < 7 && use && p.cash < 100 && j.messageTick !== 240)
    message(w, 'SUNSET MOTORS · You need $100');
  if (distance(p, LOCATIONS.garage) < 7 && use && p.car && Math.abs(w.get(p.car)!.vehicle!.speed) >= 3)
    message(w, 'Slow down to use the service bay');
  for (const { collectible: c } of w.query('collectible'))
    if (!c.taken && distance(p, c) < 2.3) {
      c.taken = true;
      p.tapes++;
      p.cash += 150;
      message(w, `LOST MIXTAPE ${p.tapes}/${PICKUPS.length} · +$150`);
      w.emit('pickup', {});
    }
  if (pressed(intents, 'race') && p.car) {
    if (j.race < 0) {
      j.race = 0;
      j.raceTick = 0;
      message(w, 'OCEAN SPRINT · 6 checkpoints · beat 90 seconds');
    } else {
      j.race = -1;
      message(w, 'Street sprint cancelled');
    }
  }
  if (j.race >= 0) {
    j.raceTick++;
    if (j.raceTick > 5400) {
      j.race = -1;
      message(w, 'Sprint timed out · Try again');
    } else if (p.car && distance(p, RACE_GATES[j.race]) < 9) {
      j.race++;
      w.emit('gate', {});
      if (j.race === RACE_GATES.length) {
        j.race = -1;
        j.raceBest = j.raceBest ? Math.min(j.raceBest, j.raceTick) : j.raceTick;
        p.cash += 500;
        message(w, `SPRINT COMPLETE · ${(j.raceTick / 60).toFixed(1)}s · +$500`);
      }
    }
  }
}
