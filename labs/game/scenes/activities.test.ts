/** @file Side activity, shop and kiosk lifecycle checks beyond the main mission path. */
import { describe, it, expect } from 'vitest';
import { createHeadless, disposeHeadless, type Intents } from '../../../engine';
import { play } from './play';
import { viewOf, botIntents } from '../bot';
import { RACE_GATES } from '../world/level';
import type { Vehicle } from './components';
function drive(v: Vehicle, t: { x: number; z: number }): Intents {
  const d = Math.hypot(t.x - v.x, t.z - v.z),
    a = Math.atan2(t.x - v.x, t.z - v.z),
    delta = Math.atan2(Math.sin(a - v.yaw), Math.cos(a - v.yaw));
  const speed = d < 12 ? Math.max(0, (d - 2) * 1.2) : Math.abs(delta) > 0.65 ? 7 : 22;
  return {
    'game:throttle': v.speed < speed ? 1 : 0,
    'game:steer': Math.max(-1, Math.min(1, delta * 2.5)),
    b: v.speed > speed + 1 ? ['brake'] : [],
  };
}
describe('Side activities and lifecycle', () => {
  it('drives the actual six-gate street sprint within its deadline and pays once', async () => {
    const h = await createHeadless({ scene: play });
    let v = viewOf(h);
    for (let i = 0; i < 1000 && !v.player.car; i++) {
      h.step(1, botIntents(v));
      v = viewOf(h);
    }
    expect(v.player.car).not.toBe(0);
    const cash = v.player.cash;
    h.step(1, { p: ['race'] });
    v = viewOf(h);
    const gates = new Set<number>();
    for (let i = 0; i < 5400 && v.job.race >= 0; i++) {
      gates.add(v.job.race);
      h.step(
        1,
        drive(
          v.cars.find((c) => c.id === v.player.car)!,
          RACE_GATES[v.job.race],
        ),
      );
      v = viewOf(h);
    }
    expect([...gates]).toEqual([0, 1, 2, 3, 4, 5]);
    expect(v.job.raceBest).toBeGreaterThan(0);
    expect(v.job.raceBest).toBeLessThan(5400);
    expect(v.player.cash).toBe(cash + 500);
    h.step(60);
    expect(viewOf(h).player.cash).toBe(cash + 500);
    disposeHeadless(h);
  });
  it('the service bay repairs the possessed car without stealing the exit interaction or spending unavailable cash', async () => {
    const h = await createHeadless({ scene: play, settings: { 'game.checkpoint': 4 } });
    const id = viewOf(h).player.car;
    h.step(1, { p: ['interact'] });
    let v = viewOf(h);
    expect(v.player.car).toBe(id);
    expect(v.player.cash).toBe(150);
    expect(v.cars.find((c) => c.id === id)?.color).toBe('#f5c58e');
    expect(v.player.reserve).toBe(120);
    h.step(1, { p: ['interact'] });
    h.step(1, { p: ['interact'] });
    v = viewOf(h);
    expect(v.player.cash).toBe(50);
    expect(v.player.car).toBe(id);
    disposeHeadless(h);
  });
  it('retired physics runs dispose idempotently, including seed and replay replacements', async () => {
    for (let i = 0; i < 12; i++) {
      const h = await createHeadless({ scene: play, seed: i });
      h.step(3);
      h.seed(i + 1);
      h.step(3);
      expect(h.info().tick).toBe(3);
      disposeHeadless(h);
      disposeHeadless(h);
    }
  });
});
