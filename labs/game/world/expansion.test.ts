/** @file Expansion acceptance: traversable scale, district tour, asset usage and finite portable model files. */
import { readFileSync, existsSync } from 'node:fs';
import { describe, it, expect } from 'vitest';
import { createHeadless, disposeHeadless } from '../../../engine';
import { play } from '../scenes/play';
import { viewOf, botIntents } from '../bot';
import { BUILDINGS, PICKUPS, blocked } from './level';
import { DISTRICTS, ROADS, SHORE_X, WORLD_LIMITS as W, TOUR_ROUTE, PIERS } from './districts';
import { PROPS } from './props';
import { ASSETS } from '../art/catalog';
import type { ArtManifest } from '../../art/types';
const manifest = JSON.parse(readFileSync(new URL('../../art/manifest.json', import.meta.url), 'utf8')) as ArtManifest;
describe('Saltwater Bay expansion', () => {
  it('provides over ten times the former land area and varied architecture in every connected district', () => {
    expect(((SHORE_X - W.minX) * (W.maxZ - W.minZ)) / (180 * 328)).toBeGreaterThan(10);
    expect(BUILDINGS.length).toBeGreaterThanOrEqual(140);
    expect(new Set(BUILDINGS.map((b) => b.style)).size).toBe(14);
    expect(DISTRICTS).toHaveLength(8);
    for (const x of ROADS.vertical)
      for (let z = W.minZ + 2; z < W.maxZ - 2; z += 4) expect(blocked(x, z, 1.35), `road ${x},${z}`).toBe(false);
    for (const z of ROADS.horizontal)
      for (let x = W.minX + 2; x < 65; x += 4) expect(blocked(x, z, 1.35), `road ${x},${z}`).toBe(false);
    for (const p of PICKUPS) expect(blocked(p.x, p.z, 0.45), `pickup ${p.x},${p.z}`).toBe(false);
    expect(blocked(120, 300, 0.5)).toBe(false);
    expect(blocked(120, 320, 0.5)).toBe(true);
    expect(PIERS.length).toBe(8);
  });
  it('places every prop recipe in the world and includes all eight original billboard sources', () => {
    expect(PROPS.length).toBeGreaterThanOrEqual(1000);
    for (const a of ASSETS)
      expect(
        PROPS.some((p) => p.kind === a.id),
        a.id,
      ).toBe(true);
    expect(manifest.assets.filter((a) => a.category === 'Illustrated signs')).toHaveLength(8);
  });
  it('ships finite, indexed, material-backed exports and previews for every model', () => {
    expect(manifest.assets.length).toBe(101);
    expect(manifest.assets.filter((a) => a.obj)).toHaveLength(93);
    for (const a of manifest.assets) {
      expect(existsSync(new URL(`../../art/assets/${a.preview}`, import.meta.url))).toBe(true);
      const svg = readFileSync(new URL(`../../art/assets/${a.preview}`, import.meta.url), 'utf8');
      expect(svg).not.toMatch(/NaN|Infinity|undefined/);
      if (!a.obj) continue;
      const obj = readFileSync(new URL(`../../art/assets/${a.obj}`, import.meta.url), 'utf8'),
        mtl = readFileSync(new URL(`../../art/assets/${a.mtl}`, import.meta.url), 'utf8');
      expect(obj, a.id).not.toMatch(/NaN|Infinity|undefined/);
      expect(obj).toContain(`mtllib ${a.mtl}`);
      const vertices = obj.split('\n').filter((s) => s.startsWith('v '));
      expect(vertices.length).toBe(a.vertices);
      const faces = obj.split('\n').filter((s) => s.startsWith('f '));
      expect(faces.length).toBe(a.triangles);
      for (const face of faces)
        for (const index of face.slice(2).split(' ').map(Number))
          expect(index >= 1 && index <= vertices.length, a.id).toBe(true);
      for (const use of new Set(obj.match(/usemtl (\w+)/g))) expect(mtl).toContain(use.replace('usemtl', 'newmtl'));
      expect(
        a.size?.every((n) => Number.isFinite(n) && n > 0),
        a.id,
      ).toBe(true);
    }
  });
  it('drives a continuous ordinary-input tour through all eight neighborhoods and ends cleanly', async () => {
    const h = await createHeadless({ scene: play, seed: 38, settings: { 'game.cruise': true } });
    let v = viewOf(h);
    for (let i = 0; i < 21000 && v.job.state === 'playing'; i++) {
      h.step(1, botIntents(v));
      v = viewOf(h);
    }
    expect(v.job.state).toBe('won');
    expect(v.job.route).toBe(TOUR_ROUTE.length);
    expect(v.job.discovered).toBe(255);
    expect(v.player.hp).toBeGreaterThan(0);
    disposeHeadless(h);
  }, 60000);
});
