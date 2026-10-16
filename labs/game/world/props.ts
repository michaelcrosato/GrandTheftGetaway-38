/** @file Authored and patterned prop placements. Large props share collision footprints with the simulation. */
import { ROADS, WORLD_LIMITS } from './districts';
export interface PropPlacement {
  kind: string;
  x: number;
  z: number;
  y?: number;
  yaw?: number;
}
export const PROPS: PropPlacement[] = [];
const add = (kind: string, x: number, z: number, yaw = 0, y = 0) => PROPS.push({ kind, x, z, yaw, y });
const awayFromJunction = (z: number) => ROADS.horizontal.every((r) => Math.abs(z - r) > 17);
for (const [i, x] of ROADS.vertical.entries())
  for (let z = -430; z < 440; z += 29) {
    if (!awayFromJunction(z)) continue;
    add(i === 6 ? 'royalPalm' : i < 2 ? 'broadleaf' : 'fanPalm', x + 14, z);
    add('lamp', x - 12, z, Math.PI / 2);
    const n = Math.floor((z + 450) / 29) + i;
    add(
      ['bench', 'planter', 'bin', 'parkingMeter', 'mailbox', 'newsstand', 'hydrant', 'bikeRack'][n % 8],
      x + 12,
      z + 5,
      Math.PI / 2,
    );
    if (n % 5 === 0) add('busShelter', x - 14, z + 7, Math.PI / 2);
    if (n % 4 === 0) add('scooter', x + 11, z - 5, Math.PI);
    if (n % 6 === 0) add('bicycle', x - 11, z - 7, Math.PI);
  }
for (const x of ROADS.vertical)
  for (const z of ROADS.horizontal) {
    add('trafficLight', x + 10, z + 10, Math.PI);
    add('bollard', x - 10, z - 10);
  }
for (let z = -430; z < 440; z += 24) {
  add('royalPalm', 50, z);
  add('bench', 57, z);
  add('globeLamp', 61, z + 8);
  add('umbrella', 71, z + 6);
  add('lounger', 74, z + 8);
  add('lounger', 68, z + 8);
  if (Math.floor((z + 430) / 24) % 3 === 0) add('surfboardRack', 62, z - 6);
}
for (const z of [-370, -250, 210, 330, 420]) {
  add('lifeguardTower', 76, z);
  add('beachHut', 64, z + 12);
}
for (const z of [-320, -230, 220, 360]) add('agave', 64, z);
add('cargoShip', -625, -250);
// Regatta Marina: four boat families with docks, bollards and a seafood court.
for (let i = 0; i < 7; i++) {
  const z = -415 + i * 25;
  add(['sailboat', 'speedboat', 'fishingBoat', 'yacht'][i % 4], 99, z, Math.PI / 2);
  add('dockBollard', 84, z - 5);
}
for (const [x, z] of [
  [47, -355],
  [47, -325],
  [47, -295],
]) {
  add('cafeTable', x, z);
  add('cafeChair', x - 1, z);
  add('cafeChair', x + 1, z, Math.PI);
  add('umbrella', x, z);
}
// Port Meridian's reserved cargo yard.
add('gantryCrane', -498, -243);
add('waterTower', -518, -215);
add('storageTank', -476, -215);
for (let i = 0; i < 12; i++)
  add('container', -521 + (i % 4) * 15, -265 + (Math.floor(i / 4) % 2) * 12, Math.PI / 2, i > 7 ? 2.8 : 0);
add('forklift', -483, -245, Math.PI / 2);
for (let i = 0; i < 5; i++) {
  add('oilDrum', -521 + i * 2, -240);
  add('crate', -482 + i * 2, -261);
  add('pallet', -520 + i * 2, -231);
}
// Little Sol market, with a courtyard around the clock tower.
add('clockTower', -306, 48);
for (let i = 0; i < 6; i++) {
  add('marketCart', -330 + i * 10, 28, Math.PI);
  add('marketCart', -330 + i * 10, 71);
}
for (const x of [-330, -320, -290, -280])
  for (const z of [43, 56]) {
    add('cafeTable', x, z);
    add('cafeChair', x - 1, z);
    add('cafeChair', x + 1, z, Math.PI);
  }
add('phoneBooth', -339, 47);
add('fountain', -306, 65);
add('flamingo', -306, 35);
// Liberty Square and Coral Gardens have distinct silhouettes and navigable paths.
add('fountain', -306, 240);
add('statue', -306, 218);
add('bandstand', -306, 265);
for (const x of [-333, -279])
  for (const z of [215, 240, 266]) {
    add('royalPalm', x, z);
    add('gardenBed', x + (x < -300 ? 4 : -4), z);
    add('bench', x, z + 5);
  }
add('gazebo', -498, 144);
add('pergola', -519, 124);
add('pool', -479, 124);
add('tennisCourt', -484, 161);
for (const x of [-526, -470])
  for (const z of [117, 143, 173]) {
    add('floweringTree', x, z);
    add('gardenBed', x + 3, z);
  }
for (let i = 0; i < 6; i++) {
  add('hedge', -520 + i * 6, 178);
  add('cypress', -529, 117 + i * 12);
}
// Service and utility clusters use every member of the portable asset library.
for (const [x, z] of [
  [-570, -360],
  [-570, 20],
  [-130, 420],
]) {
  add('fuelCanopy', x, z);
  for (const dx of [-3, 3]) add('fuelPump', x + dx, z);
  add('dumpster', x + 7, z + 8);
  add('airConditioner', x + 6, z - 7);
  add('satellite', x + 8, z - 7);
  add('constructionBarrier', x - 6, z + 10);
  add('trafficCone', x - 4, z + 10);
}
export const PROP_BOUNDS: Record<string, [number, number, number]> = {
  fountain: [7.8, 7.8, 2.3],
  statue: [1.6, 1.6, 3.5],
  clockTower: [3.5, 3.5, 12],
  container: [2.6, 6, 2.8],
  storageTank: [8, 8, 6.5],
  beachHut: [2.8, 2.4, 3.4],
  dumpster: [2, 1.2, 1.5],
  crate: [1.3, 1.3, 1.3],
  oilDrum: [0.8, 0.8, 1.1],
  fuelPump: [0.9, 0.7, 2],
  marketCart: [2, 1.2, 2.5],
};
export const PROP_SOLIDS = PROPS.filter((p) => p.y === 0 && PROP_BOUNDS[p.kind])
  .map((p) => {
    const [w, d, h] = PROP_BOUNDS[p.kind];
    const turned = Math.abs(Math.sin(p.yaw ?? 0)) > 0.5;
    return { x: p.x, z: p.z, w: turned ? d : w, d: turned ? w : d, h };
  })
  .filter((p) => p.x < WORLD_LIMITS.maxX);
