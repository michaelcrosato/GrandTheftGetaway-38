/** @file Record the bot's real input stream and golden hashes after an intentional gameplay change. */
import { writeFileSync } from 'node:fs';
import { createHeadless } from '../../../engine';
import { play } from '../scenes/play';
import { botIntents, viewOf } from '../bot';
const h = await createHeadless({ scene: play, seed: 38 });
const hashes: Record<string, string> = { '0': h.hash() };
let v = viewOf(h);
for (let t = 0; t < 12000 && v.job.state === 'playing'; t++) {
  h.step(1, botIntents(v));
  v = viewOf(h);
  if ((t + 1) % 300 === 0) hashes[t + 1] = h.hash();
}
if (v.job.state !== 'won') throw new Error('Bot did not finish; refusing to replace a golden replay');
hashes[h.info().tick] = h.hash();
const replay = (h.input as { record: () => Record<string, unknown> }).record();
Object.assign(replay, {
  description:
    'One Last Delivery. Full ordinary-input mission: payphone, driving, marina combat, tape, pursuit, rooftop handoff.',
  hashes: { [`${process.platform}-${process.arch}`]: hashes },
});
writeFileSync(new URL('../replays/bot.replay.json', import.meta.url), JSON.stringify(replay, null, 2) + '\n');
console.log(
  JSON.stringify({ state: v.job.state, ticks: h.info().tick, hash: h.hash(), checkpoints: Object.keys(hashes).length }),
);
