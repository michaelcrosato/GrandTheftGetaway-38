/** @file Yield between deterministic simulation batches so Vitest worker RPC stays responsive on small CI runners. */
import { setImmediate as yieldToRunner } from 'node:timers/promises';
import type { Headless, Intents } from '../../../engine';
import { botIntents, viewOf } from '../bot';
/** Identical intents and tick count to one step(n) call; pressed buttons belong only to the first step. */
export async function stepTicks(h: Headless, ticks: number, intents: Intents = {}): Promise<void> {
  for (let i = 0; i < ticks; i += 240) {
    h.step(Math.min(240, ticks - i), i === 0 ? intents : { ...intents, p: undefined });
    await yieldToRunner();
  }
}
/** The ordinary-input bot with fixed tick limits and cooperative reporting, never a wall-clock gameplay change. */
export async function advanceBot(h: Headless, ticks: number, stopAtEnd = false): Promise<void> {
  for (let i = 0; i < ticks; i++) {
    const view = viewOf(h);
    if (stopAtEnd && view.job.state !== 'playing') break;
    h.step(1, botIntents(view));
    if (i % 240 === 0) await yieldToRunner();
  }
}
export { yieldToRunner };
