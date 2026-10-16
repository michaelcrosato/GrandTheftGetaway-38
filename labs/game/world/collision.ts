/** @file Immutable spatial bins for the expanded city's shared physics and navigation footprints. */
import { BUILDINGS } from './blocks';
import { PROP_SOLIDS } from './props';
export const SOLIDS = [...BUILDINGS, ...PROP_SOLIDS];
const bins = new Map<string, typeof SOLIDS>();
for (const b of SOLIDS)
  for (let x = Math.floor((b.x - b.w / 2 - 3) / 32); x <= Math.floor((b.x + b.w / 2 + 3) / 32); x++)
    for (let z = Math.floor((b.z - b.d / 2 - 3) / 32); z <= Math.floor((b.z + b.d / 2 + 3) / 32); z++) {
      const key = `${x}:${z}`,
        list = bins.get(key) ?? [];
      list.push(b);
      bins.set(key, list);
    }
export function collides(x: number, z: number, radius: number): boolean {
  return (bins.get(`${Math.floor(x / 32)}:${Math.floor(z / 32)}`) ?? []).some(
    (b) => Math.abs(x - b.x) < b.w / 2 + radius && Math.abs(z - b.z) < b.d / 2 + radius,
  );
}
