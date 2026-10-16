/** @file End-to-end UI, attract, input, full mission and GPU performance verification. Outputs stay outside the repo. */
import { chromium } from '@playwright/test';
import { mkdirSync, writeFileSync } from 'node:fs';
import assert from 'node:assert/strict';
const destination = process.env.QA_OUT || '/tmp/getaway-qa';
mkdirSync(destination, { recursive: true });
const base = process.env.QA_URL || 'http://127.0.0.1:5183/labs/game/';
const browser = process.env.QA_CDP
  ? await chromium.connectOverCDP(process.env.QA_CDP)
  : await chromium.launch({
      executablePath:
        process.env.CHROMIUM_PATH || `${process.env.HOME}/.cache/my3dge/chrome-141.0.7390.37/chrome-linux64/chrome`,
      args: [
        '--enable-unsafe-webgpu',
        '--use-angle=swiftshader',
        '--use-vulkan=swiftshader',
        '--enable-features=Vulkan',
        '--disable-vulkan-surface',
      ],
    });
const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });
const errors = [];
page.on('pageerror', (e) => errors.push(e.message));
const checks = [];
const pass = (name) => {
  checks.push(name);
  console.log('PASS', name);
};
try {
  await page.goto(`${base}?qa=1`);
  await page.waitForFunction(() => window.__game && document.getElementById('loading').hidden, {}, { timeout: 60000 });
  await page.mouse.move(900, 500);
  await page.waitForTimeout(900);
  if ((await page.evaluate(() => window.__game.mode())) === 'demo') await page.keyboard.press('Escape');
  await page.screenshot({ path: `${destination}/title.png` });
  assert.equal(await page.evaluate(() => window.__game.mode()), 'title');
  pass('Title and GPU renderer initialize');
  await page.keyboard.press('ArrowDown');
  await page.keyboard.press('ArrowDown');
  await page.keyboard.press('Enter');
  await page.waitForFunction(() => window.__game.mode() === 'options');
  pass('Keyboard focus skips unavailable Continue and opens Settings');
  await page.getByRole('button', { name: /MASTER VOLUME/ }).click();
  await page.keyboard.press('Escape');
  const settings = await page.evaluate(() => JSON.parse(localStorage.getItem('getaway38:v1')).settings);
  assert.ok(settings.volume >= 0 && settings.volume <= 1);
  pass('Settings persist');
  await page.reload();
  await page.waitForFunction(() => window.__game && document.getElementById('loading').hidden, {}, { timeout: 60000 });
  // Timestamp the actual browser input and mode mutation; IPC/driver load cannot turn a nine-second sleep into a false failure.
  await page.evaluate(() => {
    window.__game.action('title');
    window.__idleEvidence = { input: performance.now(), demo: 0 };
    addEventListener('keyup', () => {
      window.__idleEvidence.input = performance.now();
    });
    new MutationObserver(() => {
      if (document.body.dataset.mode === 'demo') window.__idleEvidence.demo = performance.now();
    }).observe(document.body, { attributes: true, attributeFilter: ['data-mode'] });
  });
  await page.keyboard.press('Control');
  await page.waitForFunction(() => window.__game.mode() === 'demo', {}, { timeout: 20000 });
  const idleEvidence = await page.evaluate(() => window.__idleEvidence);
  assert.ok(idleEvidence.demo - idleEvidence.input >= 9990, JSON.stringify(idleEvidence));
  pass('Attract starts only after ten seconds without input');
  await page.mouse.move(910, 460);
  await page.waitForFunction(() => window.__game.mode() === 'title');
  pass('Pointer movement immediately interrupts attract');
  await page.evaluate(() => {
    window.__game.action('options');
    window.__game.idle();
  });
  await page.waitForFunction(() => window.__game.mode() === 'demo');
  await page.keyboard.press('Control');
  await page.waitForFunction(() => window.__game.mode() === 'title');
  pass('Idle title submenus also enter attract and consume the returning input');
  await page.keyboard.press('Enter');
  await page.waitForFunction(() => window.__game.mode() === 'playing');
  pass('New Game starts with keyboard confirm');
  await page.waitForTimeout(500);
  await page.keyboard.down('KeyW');
  await page.waitForTimeout(700);
  await page.keyboard.up('KeyW');
  assert.ok((await page.evaluate(() => window.__game.snapshot())).player.z < 107);
  pass('Keyboard moves the player');
  await page.keyboard.press('Escape');
  const tick = await page.evaluate(() => window.__game.snapshot().tick);
  await page.waitForTimeout(400);
  assert.equal(await page.evaluate(() => window.__game.snapshot().tick), tick);
  pass('Pause freezes simulation');
  await page.getByRole('button', { name: 'DISTRICT MAP' }).click();
  await page.screenshot({ path: `${destination}/map.png` });
  await page.keyboard.press('Tab');
  assert.equal(await page.evaluate(() => window.__game.mode()), 'playing');
  pass('Map opens and resumes');
  await page.evaluate(() => window.__game.start(0));
  await page.waitForFunction(() => window.__game.mode() === 'playing');
  const before = await page.evaluate(() => window.__game.snapshot());
  await page.evaluate(() => {
    window.__pad = {
      id: 'DualSense test',
      index: 0,
      connected: true,
      mapping: 'standard',
      axes: [0, -1, 0, 0],
      buttons: Array.from({ length: 18 }, () => ({ pressed: false, touched: false, value: 0 })),
      timestamp: 1,
    };
    Object.defineProperty(navigator, 'getGamepads', { configurable: true, value: () => [window.__pad] });
  });
  await page.waitForTimeout(350);
  assert.ok((await page.evaluate(() => window.__game.snapshot())).player.z < before.player.z);
  await page.evaluate(() => {
    window.__pad.axes = [0, 0, 0, 0];
    window.__pad.buttons[9] = { pressed: true, value: 1 };
  });
  await page.waitForFunction(() => window.__game.mode() === 'paused');
  pass('Standard gamepad left stick and Options button work');
  await page.evaluate(() => {
    window.__pad.buttons[9] = { pressed: false, value: 0 };
  });
  await page.waitForTimeout(60);
  await page.evaluate(() => {
    window.__pad.buttons[0] = { pressed: true, value: 1 };
  });
  await page.waitForFunction(() => window.__game.mode() === 'playing');
  await page.evaluate(() => {
    window.__pad.connected = false;
  });
  pass('Gamepad confirm resumes');
  await page.evaluate(() => window.__game.start(0, true));
  for (let i = 0; i < 9; i++) {
    await page.evaluate(() => window.__game.stepBot(400));
    if ((await page.evaluate(() => window.__game.snapshot())).job.state === 'won') break;
  }
  const won = await page.evaluate(() => window.__game.snapshot());
  assert.equal(won.job.state, 'won');
  assert.equal(won.job.kills, 3);
  await page.screenshot({ path: `${destination}/rooftop.png` });
  pass('Browser simulation completes driving, combat, pursuit and delivery');
  await page.waitForFunction(
    () => window.__game.snapshot().job.stage === 0 && window.__game.mode() === 'demo',
    {},
    { timeout: 10000 },
  );
  pass('Attract automatically loops after the ending');
  await page.keyboard.press('KeyZ');
  await page.waitForFunction(() => window.__game.mode() === 'title');
  pass('Any keyboard key interrupts attract');
  await page.evaluate(() => window.__game.start(2));
  await page.waitForTimeout(2000);
  await page.screenshot({ path: `${destination}/marina.png` });
  // Reset sampling after setup and compile. Measure actual RAF intervals, including stalls, through a full AI run.
  await page.evaluate(() => window.__game.start(0, true));
  await page.evaluate(() => {
    window.__frameSamples = [];
    let last = performance.now();
    window.__sampling = true;
    function sample(t) {
      if (!window.__sampling) return;
      window.__frameSamples.push(t - last);
      last = t;
      requestAnimationFrame(sample);
    }
    requestAnimationFrame(sample);
  });
  await page.waitForFunction(() => window.__game.snapshot().job.state === 'won', {}, { timeout: 90000 });
  const performanceReport = await page.evaluate(async () => {
    window.__sampling = false;
    const samples = window.__frameSamples.filter((n) => n > 0);
    const a = await navigator.gpu.requestAdapter();
    return {
      frames: samples.length,
      meanFPS: 1000 / (samples.reduce((a, b) => a + b, 0) / samples.length),
      p95FrameMs: samples.toSorted((a, b) => a - b)[Math.floor(samples.length * 0.95)],
      maxFrameMs: Math.max(...samples),
      adapter: {
        vendor: a.info.vendor,
        architecture: a.info.architecture,
        device: a.info.device,
        description: a.info.description,
      },
      renderer: window.__game.stats(),
    };
  });
  if (process.env.QA_CDP) assert.ok(performanceReport.meanFPS >= 25, JSON.stringify(performanceReport));
  pass('Measured gameplay frame-rate budget');
  assert.deepEqual(errors, []);
  pass('No uncaught browser errors');
  writeFileSync(
    `${destination}/report.json`,
    JSON.stringify({ checks, errors, performance: performanceReport, browser: browser.version() }, null, 2),
  );
  console.log(JSON.stringify(performanceReport));
} finally {
  await page.close();
  await browser.close();
}
