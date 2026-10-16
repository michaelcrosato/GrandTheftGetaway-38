/** @file Game gates: complete bot play, golden replay, deterministic restore, checkpoints and systemic rules. */
import { readFileSync } from 'node:fs';
import { describe, it, expect } from 'vitest';
import { createHeadless, disposeHeadless } from '../../../engine';
import { play } from './play';
import { botIntents, viewOf } from '../bot';
import { blocked } from '../world/level';
import { SHORE_X } from '../world/districts';
import { advanceBot, stepTicks, yieldToRunner } from '../qa/test-helpers';
const fresh = (checkpoint = 0, seed = 38) =>
  createHeadless({ scene: play, seed, settings: { 'game.checkpoint': checkpoint } });
describe('One Last Delivery', () => {
  it.each(Array.from({ length: 10 }, (_, i) => i + 1))(
    'completes every stage by ordinary intents on seed %i',
    async (seed) => {
      const h = await fresh(0, seed);
      try {
        const stages = new Set<number>();
        let v = viewOf(h);
        for (let i = 0; i < 8500 && v.job.state === 'playing'; i++) {
          stages.add(v.job.stage);
          h.step(1, botIntents(v));
          v = viewOf(h);
          if (i % 240 === 0) await yieldToRunner();
        }
        expect({ seed, state: v.job.state }).toEqual({ seed, state: 'won' });
        expect([...stages]).toEqual([0, 1, 2, 3, 4, 5]);
        expect(v.job.kills).toBe(3);
        expect(v.job.heat).toBe(0);
        expect(v.job.delivered).toBe(true);
        expect(v.player.cash).toBeGreaterThanOrEqual(2000);
      } finally {
        disposeHeadless(h);
      }
    },
  );
  it('continues identically after capture and restore, including physics and AI', async () => {
    const h = await fresh();
    await advanceBot(h, 800);
    const c = h.capture();
    await advanceBot(h, 400);
    const hash = h.hash();
    h.restore(c);
    await advanceBot(h, 400);
    expect(h.hash()).toBe(hash);
  });
  it('replays the entire mission to its recorded golden hashes', async () => {
    const text = readFileSync(new URL('../replays/bot.replay.json', import.meta.url), 'utf8');
    const replay = JSON.parse(text);
    const h = await createHeadless({ scene: play });
    const result = await (h.replay as (text: string) => Promise<{ hashes: Record<string, string> }>)(text);
    expect(result.hashes).toEqual(replay.hashes[`${process.platform}-${process.arch}`]);
    expect(viewOf(h).job.state).toBe('won');
  });
  it('every persisted checkpoint is independently completable', async () => {
    for (let stage = 1; stage <= 5; stage++) {
      const h = await fresh(stage);
      await advanceBot(h, 8500, true);
      expect(viewOf(h).job.state, `checkpoint ${stage}`).toBe('won');
      disposeHeadless(h);
    }
  });
  it('walls block walking, and the outer boundary prevents falling out of the map', async () => {
    const h = await fresh();
    await stepTicks(h, 540, { move: [0, -1] });
    await stepTicks(h, 900, { move: [-1, 0] });
    let p = viewOf(h).player;
    expect(p.x).toBeGreaterThan(13);
    expect(blocked(p.x, p.z, 0.4)).toBe(false);
    await stepTicks(h, 3000, { move: [1, 0], b: ['sprint'] });
    p = viewOf(h).player;
    expect(p.x).toBeLessThanOrEqual(SHORE_X - 0.4);
    expect(Number.isFinite(p.x)).toBe(true);
  });
  it('magazines expend, reload and draw from a finite reserve', async () => {
    const h = await fresh();
    h.step(20, { b: ['attack'] });
    let p = viewOf(h).player;
    expect(p.ammo).toBe(10);
    h.step(1, { p: ['reload'] });
    h.step(55);
    p = viewOf(h).player;
    expect(p.ammo).toBe(12);
    expect(p.reserve).toBe(118);
  });
  it('damage can fail a mission and checkpoint retry restores the player', async () => {
    const h = await fresh(2);
    await stepTicks(h, 12000);
    expect(viewOf(h).job.state).toBe('lost');
    const retry = await fresh(2);
    expect(viewOf(retry).player.hp).toBe(100);
    expect(viewOf(retry).job.stage).toBe(2);
  });
  it('police searches end after the player breaks sight, without changing the tape state', async () => {
    const h = await fresh(3);
    await advanceBot(h, 4000);
    const v = viewOf(h);
    expect(v.job.stage).toBeGreaterThan(3);
    expect(v.job.heat).toBe(0);
    expect(v.job.delivered).toBe(true);
  });
  it('collectibles award money once', async () => {
    const h = await fresh();
    h.step(67, { move: [1, 0], b: ['sprint'] });
    h.step(380, { move: [0, -1], b: ['sprint'] });
    let v = viewOf(h);
    expect(v.player.tapes).toBeGreaterThan(0);
    const cash = v.player.cash,
      tapes = v.player.tapes;
    h.step(30);
    v = viewOf(h);
    expect(v.player.cash).toBe(cash);
    expect(v.player.tapes).toBe(tapes);
  });
  it('street sprint activates in a car and ends after its deadline', async () => {
    const h = await fresh(4);
    h.step(1, { p: ['race'] });
    expect(viewOf(h).job.race).toBe(0);
    await stepTicks(h, 5401);
    expect(viewOf(h).job.race).toBe(-1);
    expect(viewOf(h).job.message).toContain('timed out');
  });
  it('a long idle run is a real mission timeout, not a softlock', async () => {
    const h = await fresh();
    await stepTicks(h, 43201);
    expect(viewOf(h).job.state).toBe('lost');
  });
});
