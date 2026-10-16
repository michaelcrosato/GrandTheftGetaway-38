/** @file Diagnostic playthrough using normal bot input, without a browser or gameplay cheats. */
import { createHeadless } from '../../../engine';
import { play } from '../scenes/play';
import { viewOf, botIntents } from '../bot';
const h = await createHeadless({ scene: play, seed: 38 });
let v = viewOf(h),
  stage = -1;
for (let t = 0; t < 18000; t++) {
  h.step(1, botIntents(v));
  v = viewOf(h);
  if (v.job.stage !== stage || t % 1800 === 0) {
    stage = v.job.stage;
    console.log(
      t,
      JSON.stringify({
        stage,
        state: v.job.state,
        x: v.player.x,
        z: v.player.z,
        car: v.player.car,
        hp: v.player.hp,
        heat: v.job.heat,
        route: v.job.route,
      }),
    );
  }
  if (v.job.state !== 'playing') {
    console.log('RESULT', v.job.state, v.job.score, h.hash());
    break;
  }
}
