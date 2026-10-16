/** @file Native-browser expansion proof: all neighborhoods, performance, cruise save isolation, gallery and downloads. */
import { chromium } from '@playwright/test';
import { mkdirSync, writeFileSync, readFileSync } from 'node:fs';
import assert from 'node:assert/strict';
const out = process.env.QA_OUT || '/tmp/getaway-expansion';
mkdirSync(out, { recursive: true });
const base = process.env.QA_URL || 'http://127.0.0.1:5184';
const browser = await chromium.connectOverCDP(process.env.QA_CDP || 'http://172.28.192.1:9339');
const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });
const errors = [];
page.on('pageerror', (e) => errors.push(e.message));
const reports = [];
const categories = [];
try {
  await page.goto(`${base}/labs/game/?qa=1`);
  await page.waitForFunction(() => window.__game && document.getElementById('loading').hidden, {}, { timeout: 90000 });
  await page.bringToFront();
  await page.evaluate(() => window.__game.action('title'));
  await page.mouse.move(900, 400);
  await page.getByRole('button', { name: /CRUISE THE CITY/ }).click();
  await page.waitForFunction(() => window.__game.snapshot().job.cruise);
  const save = await page.evaluate(() => localStorage.getItem('getaway38:v1'));
  await page.keyboard.press('Escape');
  await page.getByRole('button', { name: 'DISTRICT MAP' }).click();
  await page.screenshot({ path: `${out}/full-city-map.png` });
  await page.keyboard.press('Tab');
  await page.evaluate(() => {
    window.__frameSamples = [];
    window.__sampling = true;
    let last = performance.now();
    function sample(t) {
      if (!window.__sampling) return;
      window.__frameSamples.push(t - last);
      last = t;
      requestAnimationFrame(sample);
    }
    requestAnimationFrame(sample);
  });
  // Normal bot input advances along the actual road network; no teleports or direct component edits.
  await page.keyboard.press('Escape');
  const destinations = [
    { name: 'Ocean Drive', until: () => true },
    { name: 'North Marina', until: (v) => v.player.z < -235 },
    { name: 'Downtown', until: (v) => v.player.x < -225 && v.player.x > -400 && v.player.z < -200 },
    { name: 'Port Meridian', until: (v) => v.player.x < -480 },
    { name: 'Little Sol', until: (v) => v.job.route >= 6 && v.player.x > -415 && Math.abs(v.player.z) < 20 },
    { name: 'Civic Quarter', until: (v) => v.job.route >= 7 && v.player.z > 155 && v.player.x > -420 },
    { name: 'Sunset Heights', until: (v) => v.job.route >= 8 && v.player.x < -495 && v.player.z > 144 },
    { name: 'South Beach', until: (v) => v.job.route >= 13 && v.player.x > -100 && v.player.z > 300 },
  ];
  for (const stop of destinations) {
    let state = await page.evaluate(() => window.__game.snapshot());
    while (!stop.until(state) && state.job.state === 'playing')
      state = await page.evaluate(() => window.__game.stepBot(60));
    assert.equal(state.job.state, 'playing', `Tour stopped before ${stop.name}`);
    await page.evaluate(() => window.__game.autoplay(true));
    await page.waitForTimeout(1200);
    await page.evaluate(() => {
      window.__frameSamples = [];
    });
    await page.waitForTimeout(1800);
    const sample = await page.evaluate(() => {
      const a = window.__frameSamples.filter((n) => n > 0),
        s = window.__game.stats();
      return {
        fps: 1000 / (a.reduce((x, y) => x + y, 0) / a.length),
        p95Ms: a.toSorted((x, y) => x - y)[Math.floor(a.length * 0.95)],
        frames: a.length,
        drawCalls: s.drawCalls,
        triangles: s.triangles,
        city: s.city,
        position: window.__game.snapshot().player,
      };
    });
    await page.screenshot({ path: `${out}/${stop.name.toLowerCase().replaceAll(' ', '-')}.png` });
    await page.evaluate(() => window.__game.autoplay(false));
    assert.equal(
      await page.locator('#district').textContent(),
      stop.name,
      'Sample must remain in its named neighborhood',
    );
    assert.ok(sample.fps >= 25, `${stop.name}: ${sample.fps.toFixed(1)} FPS`);
    reports.push({ name: stop.name, ...sample });
    console.log('PASS district', stop.name, sample.fps.toFixed(1), 'FPS', sample.drawCalls, 'draws');
  }
  let end = await page.evaluate(() => window.__game.snapshot());
  while (end.job.state === 'playing') end = await page.evaluate(() => window.__game.stepBot(60));
  assert.equal(end.job.state, 'won');
  assert.equal(end.job.discovered, 255);
  assert.equal(await page.evaluate(() => localStorage.getItem('getaway38:v1')), save);
  console.log('PASS complete city tour; all eight districts discovered; story save preserved');
  await page.evaluate(() => {
    window.__sampling = false;
  });
  await page.goto(`${base}/labs/art/`);
  await page.waitForSelector('.card');
  assert.equal(await page.locator('.card').count(), 101);
  await page.screenshot({ path: `${out}/art-library.png` });
  for (const name of ['Architecture', 'Vehicles', 'Characters', 'Illustrated signs', 'Port & service']) {
    await page.getByRole('button', { name, exact: true }).click();
    const count = await page.locator('.card').count();
    assert.ok(count > 0);
    categories.push({ name, count });
    await page.screenshot({
      path: `${out}/library-${name.toLowerCase().replaceAll(' ', '-').replace('&', 'and')}.png`,
    });
  }
  await page.getByRole('button', { name: 'Street', exact: true }).click();
  await page.locator('.card').first().click();
  await page.waitForSelector('dialog[open]');
  const obj = page.getByRole('link', { name: 'DOWNLOAD OBJ' });
  const downloaded = await obj.evaluate(async (a) => {
    const response = await fetch(a.href);
    return { status: response.status, text: await response.text(), filename: a.download };
  });
  assert.equal(downloaded.status, 200);
  assert.equal(downloaded.filename, 'bench.obj');
  assert.ok(downloaded.text.includes('mtllib bench.mtl'));
  await page.screenshot({ path: `${out}/asset-detail.png` });
  await page.keyboard.press('Escape');
  const manifest = JSON.parse(readFileSync(new URL('../../art/manifest.json', import.meta.url), 'utf8'));
  assert.deepEqual(errors, []);
  writeFileSync(
    `${out}/report.json`,
    JSON.stringify(
      {
        districts: reports,
        categories,
        assets: manifest.assets.length,
        models: manifest.assets.filter((a) => a.obj).length,
        errors,
        browser: browser.version(),
        cruiseCompleted: true,
      },
      null,
      2,
    ),
  );
  console.log('PASS 101-asset gallery, categories, preview and actual OBJ download');
} finally {
  await page.close();
  await browser.close();
}
