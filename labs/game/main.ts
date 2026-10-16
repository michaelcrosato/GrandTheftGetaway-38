/** @file Game lifecycle: engine simulation, presentation, input arbitration, checkpoint saves and infinite attract mode. */
import { createHeadless, disposeHeadless, type Headless, type Intents } from '../../engine';
import { play } from './scenes/play';
import { viewOf, botIntents, type GameView } from './bot';
import { GameRenderer } from './view/renderer';
import { Controls } from './ui/input';
import { Interface, $, setText } from './ui/interface';
import { readSave, writeSave } from './ui/storage';
import { drawMap } from './ui/minimap';
import { Soundtrack } from './audio/sound';
import { MISSION_STAGES } from './world/level';
const save = readSave(),
  ui = new Interface(),
  controls = new Controls(),
  sound = new Soundtrack();
let mode = 'loading',
  returnMode = 'title',
  engine: Headless,
  view: GameView,
  renderer: GameRenderer | null = null;
let accumulator = 0,
  lastTime = 0,
  seed = 38,
  endingAt = 0,
  lastCheckpoint = 0,
  runGeneration = 0;
let initializing = false;
const params = new URLSearchParams(location.search);
function changeMode(next: string): void {
  mode = next;
  ui.mode(mode, save);
  controls.clear();
  accumulator = 0;
  if (next === 'title') {
    controls.lastActivity = performance.now();
    document.body.dataset.mobileMenu = 'false';
  }
  if (['title', 'paused', 'won', 'lost'].includes(next)) ui.focus();
}
function applySettings(): void {
  renderer?.setOptions(save.settings);
  sound.configure(save.settings.volume, save.settings.music);
  writeSave(save);
}
async function start(checkpoint = 0, demo = false): Promise<void> {
  if (initializing) return;
  initializing = true;
  const generation = ++runGeneration;
  try {
    const previousEngine = engine;
    engine = await createHeadless({
      scene: play,
      seed: seed++,
      settings: { 'game.checkpoint': checkpoint, 'game.difficulty': save.settings.difficulty },
    });
    if (previousEngine) disposeHeadless(previousEngine);
    if (generation !== runGeneration) return;
    view = viewOf(engine);
    lastCheckpoint = checkpoint;
    endingAt = 0;
    changeMode(demo ? 'demo' : 'playing');
    document.body.dataset.mobileMenu = 'false';
    if (!demo) {
      save.checkpoint = checkpoint;
      writeSave(save);
      void sound.unlock();
    }
    Object.assign(window, { __engine: engine });
    if (renderer) {
      renderer.camera.position.set(view.player.x + 7, view.player.y + 5, view.player.z + 10);
      renderer.angle = 0;
    }
  } finally {
    initializing = false;
  }
}
function paused(): void {
  if (mode === 'demo') {
    changeMode('title');
    return;
  }
  if (mode === 'playing') {
    changeMode('paused');
    ui.panel('THE CITY CAN WAIT', 'Taking a breather.', `<p>${MISSION_STAGES[view.job.stage].task}</p>`, [
      { label: 'BACK TO THE CITY', action: 'resume', value: '✕' },
      { label: 'DISTRICT MAP', action: 'map' },
      { label: 'RETRY CHECKPOINT', action: 'retry' },
      { label: 'SETTINGS', action: 'options' },
      { label: 'HOW TO PLAY', action: 'controls' },
      { label: 'TITLE SCREEN', action: 'title' },
    ]);
  } else if (mode === 'paused' || mode === 'map') changeMode('playing');
  else if (mode !== 'title') back();
}
function back(): void {
  if (returnMode === 'paused') {
    changeMode('playing');
    paused();
  } else changeMode('title');
}
ui.action = (action) => {
  if (mode === 'loading') return;
  void sound.unlock();
  sound.sfx('select');
  if (action === 'new') void start();
  else if (action === 'continue') void start(save.checkpoint);
  else if (action === 'retry') void start(lastCheckpoint);
  else if (action === 'resume') changeMode('playing');
  else if (action === 'title') {
    changeMode('title');
  } else if (action === 'back') back();
  else if (action === 'options' || action === 'controls' || action === 'credits') {
    if (!['options', 'controls', 'credits'].includes(mode)) returnMode = mode === 'paused' ? 'paused' : 'title';
    changeMode(action);
    if (action === 'options') ui.options(save);
    else if (action === 'controls') ui.controls();
    else ui.credits();
  } else if (action === 'map') {
    changeMode('map');
    drawMap($<HTMLCanvasElement>('full-map'), view, true);
    setText('map-objective', MISSION_STAGES[view.job.stage].task);
    ui.focus();
  } else {
    const s = save.settings;
    const index = ui.buttons().indexOf(document.activeElement as HTMLButtonElement);
    if (action === 'quality') s.quality = (s.quality + 1) % 3;
    if (action === 'volume') s.volume = s.volume >= 0.99 ? 0 : Math.min(1, Math.round((s.volume + 0.25) * 4) / 4);
    if (action === 'music') s.music = !s.music;
    if (action === 'camera') s.camera = 1 - s.camera;
    if (action === 'motion') s.reducedMotion = !s.reducedMotion;
    if (action === 'difficulty') s.difficulty = 1 - s.difficulty;
    applySettings();
    ui.options(save);
    ui.buttons()[index]?.focus();
  }
};
controls.onActivity = () => {
  if (mode === 'demo') {
    changeMode('title');
    controls.clear();
    return true;
  }
  return false;
};
controls.onAction = (action) => {
  if (action === 'pause' || action === 'back') {
    paused();
    return;
  }
  if (action === 'map') {
    if (mode === 'playing') ui.action('map');
    else if (mode === 'map') changeMode('playing');
    return;
  }
  if (['playing', 'demo', 'loading', 'map'].includes(mode)) return;
  if (action === 'up' || action === 'down') ui.focus(action === 'up' ? -1 : 1);
  if (action === 'left' || action === 'right') {
    if (mode === 'options') ui.confirm();
    else ui.focus(action === 'left' ? -1 : 1);
  }
  if (action === 'confirm') ui.confirm();
};
$('mobile-menu').addEventListener('click', () => {
  if (mode === 'playing') paused();
  else {
    document.body.dataset.mobileMenu = document.body.dataset.mobileMenu === 'true' ? 'false' : 'true';
    if (mode === 'demo') changeMode('title');
  }
});
addEventListener('blur', () => {
  if (mode === 'playing') paused();
});
document.addEventListener('visibilitychange', () => {
  if (document.hidden && mode === 'playing') paused();
  lastTime = 0;
  accumulator = 0;
});
function endRun(): void {
  if (mode === 'demo') {
    if (!endingAt) endingAt = performance.now();
    if (performance.now() - endingAt > 6500) void start(0, true);
    return;
  }
  const j = view.job;
  if (j.state === 'won') {
    save.completed = true;
    save.bestScore = Math.max(save.bestScore, j.score);
    save.checkpoint = 0;
    writeSave(save);
    changeMode('won');
    sound.sfx('won');
    ui.panel(
      'MISSION COMPLETE',
      'The night is yours.',
      `<p>The master tape is safe. Margo has your cut. For once, the city owes you something.</p><div class="summary-row"><div><strong>${j.score.toLocaleString()}</strong><span>REPUTATION</span></div><div><strong>${Math.floor(j.elapsed / 3600)}:${String(Math.floor(j.elapsed / 60) % 60).padStart(2, '0')}</strong><span>YOUR TIME</span></div><div><strong>${view.player.tapes}/5</strong><span>MIXTAPES</span></div></div><p>Best score: <strong>${save.bestScore.toLocaleString()}</strong>. Replay to find every mixtape and take the Ocean Sprint.</p>`,
      [
        { label: 'ANOTHER NIGHT', action: 'new', value: '✕' },
        { label: 'TITLE SCREEN', action: 'title' },
      ],
    );
  } else {
    changeMode('lost');
    ui.panel(
      'NOT YOUR NIGHT',
      'Wasted.',
      `<p>${j.message || 'The city got the better of you.'}</p><p>Your last checkpoint is ready.</p>`,
      [
        { label: 'RETRY CHECKPOINT', action: 'retry', value: '✕' },
        { label: 'START OVER', action: 'new' },
        { label: 'TITLE SCREEN', action: 'title' },
      ],
    );
  }
}
function simStep(intents: Intents): void {
  const old = view;
  engine.step(1, intents);
  view = viewOf(engine);
  if (mode !== 'demo' && view.job.stage !== lastCheckpoint) {
    lastCheckpoint = view.job.stage;
    save.checkpoint = lastCheckpoint;
    writeSave(save);
    sound.sfx('checkpoint');
  }
  if (view.player.shot > old.player.shot) {
    sound.sfx('shot');
    controls.rumble(0.2, 55);
  }
  if (view.player.hp < old.player.hp) {
    sound.sfx('hurt');
    controls.rumble(0.7);
  }
  if (view.job.crashes > old.job.crashes) {
    sound.sfx('crash');
    controls.rumble(0.8, 220);
  }
  if (view.player.tapes > old.player.tapes) sound.sfx('pickup');
}
function frame(now: number): void {
  const dt = lastTime ? Math.min((now - lastTime) / 1000, 0.1) : 1 / 60;
  lastTime = now;
  controls.poll(now);
  const titleMenu = mode === 'title' || (['options', 'controls', 'credits'].includes(mode) && returnMode === 'title');
  if (titleMenu && !initializing && renderer?.ready) {
    const idle = (now - controls.lastActivity) / 1000;
    setText(
      'idle-label',
      idle > 5 ? `THE CITY TAKES OVER IN ${Math.ceil(10 - idle)}…` : 'TAKE A BREATH. THE CITY NEVER DOES.',
    );
    if (idle >= 10) void start(0, true);
  }
  if (view && ['playing', 'demo'].includes(mode)) {
    accumulator += dt;
    let steps = 0;
    while (accumulator >= 1 / 60 && steps < 6) {
      if (view.job.state === 'playing')
        simStep(mode === 'demo' ? botIntents(view) : controls.take(!!view.player.car, renderer?.angle ?? 0));
      accumulator -= 1 / 60;
      steps++;
    }
    ui.hud(view, controls.device === 'gamepad');
    if (view.job.state !== 'playing') endRun();
  }
  if (renderer?.ready && view) {
    renderer.sync(view, now / 1000, mode, controls.look);
    renderer.draw(now);
    setText('performance', `${Math.round(renderer.fps)} FPS · ${renderer.frameMs.toFixed(1)} MS`);
  }
  if (view)
    sound.update(view.player.moving, !!view.player.car, view.job.heat, !['playing', 'demo', 'title'].includes(mode));
  requestAnimationFrame(frame);
}
async function boot(): Promise<void> {
  engine = await createHeadless({ scene: play, seed: 38 });
  view = viewOf(engine);
  Object.assign(window, { __engine: engine });
  try {
    if (!navigator.gpu) throw new Error('WebGPU is unavailable');
    renderer = new GameRenderer($<HTMLCanvasElement>('view'));
    renderer.sync(view, 0, 'title');
    await renderer.init();
    applySettings();
    $('loading').hidden = true;
    changeMode('title');
  } catch (error) {
    $('loading').innerHTML =
      `<span>WebGPU is required. Open in a WebGPU-enabled Chrome, Edge, or Safari browser.<br><small>${String(error instanceof Error ? error.message : error)}</small></span>`;
    changeMode('title');
    document
      .querySelectorAll<HTMLButtonElement>('[data-action=new],[data-action=continue]')
      .forEach((b) => (b.disabled = true));
  }
  requestAnimationFrame(frame);
  if (params.has('qa'))
    Object.assign(window, {
      __game: {
        snapshot: () => structuredClone(view),
        mode: () => mode,
        stats: () => renderer?.stats(),
        start,
        action: (s: string) => ui.action(s),
        step: (n: number, intents: Intents = {}) => {
          for (let i = 0; i < n; i++) simStep(intents);
          return view;
        },
        stepBot: (n: number) => {
          for (let i = 0; i < n && view.job.state === 'playing'; i++) simStep(botIntents(view));
          return view;
        },
        idle: () => {
          controls.lastActivity = performance.now() - 10001;
        },
        setLook: (angle: number) => {
          if (renderer) renderer.angle = angle;
        },
      },
    });
}
boot().catch((error) => {
  setText('loading', `The city could not start: ${String(error)}`);
  console.error(error);
});
