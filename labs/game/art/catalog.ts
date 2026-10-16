/** @file The reusable art catalog: each ID has its own geometry recipe, category and readable name. */
import { STREET, type Recipe } from './street';
import { COAST } from './coast';
import { INDUSTRY } from './industry';
import { CIVIC } from './civic';
import { type Scenery } from '../view/primitives';
export interface Asset {
  id: string;
  name: string;
  category: string;
  build: Recipe;
}
export const ASSETS: Asset[] = [
  ...Object.entries(STREET).map(([id, build]) => ({ id, build, category: 'Street' })),
  ...Object.entries(COAST).map(([id, build]) => ({ id, build, category: 'Coast & gardens' })),
  ...Object.entries(INDUSTRY).map(([id, build]) => ({ id, build, category: 'Port & service' })),
  ...Object.entries(CIVIC).map(([id, build]) => ({ id, build, category: 'Public spaces' })),
].map((a) => ({ ...a, name: a.id.replace(/([A-Z])/g, ' $1').replace(/^./, (s) => s.toUpperCase()) }));
const catalog = new Map(ASSETS.map((a) => [a.id, a]));
export function placeAsset(s: Scenery, id: string, x: number, z: number, yaw = 0, y = 0): void {
  const asset = catalog.get(id);
  if (!asset) throw new Error(`Unknown city art asset '${id}'; add its recipe to the catalog.`);
  s.count(id);
  s.at(x, y, z, yaw, () => asset.build(s));
}
