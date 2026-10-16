/** @file Saltwater Bay: shared, readable content for collision, navigation and rendering. Metres, +Y up. */
import { WORLD_LIMITS, SHORE_X, PIERS } from './districts';
import { collides } from './collision';
export { BUILDINGS } from './blocks';
export { ROADS, WORLD_LIMITS } from './districts';
export type { Building } from './districts';
export const LOCATIONS = {
  start: { x: 37, z: 108 },
  phone: { x: 39, z: 99 },
  car: { x: 30, z: 104 },
  marina: { x: 30, z: -96 },
  tape: { x: 5, z: -100 },
  garage: { x: -43, z: -14 },
  club: { x: -49, z: 73 },
  roof: { x: -69, z: 70 },
};
export const PICKUPS = [
  { x: 47, z: 51 },
  { x: 47, z: -50 },
  { x: -35, z: 45 },
  { x: -57, z: -86 },
  { x: 8, z: -114 },
  ...[
    [-150, -230],
    [-30, -400],
    [45, -330],
    [-342, -330],
    [-270, -205],
    [-438, -330],
    [-558, -250],
    [-480, -228],
    [-558, -112],
    [-340, 42],
    [-275, 55],
    [-220, -12],
    [-490, 150],
    [-560, 310],
    [-465, 210],
    [-298, 238],
    [-230, 300],
    [-342, 400],
    [18, 230],
    [46, 300],
    [-150, 400],
  ].map(([x, z]) => ({ x, z })),
];
export const RACE_GATES = [
  { x: 30, z: 0 },
  { x: 30, z: -96 },
  { x: -42, z: -96 },
  { x: -42, z: 0 },
  { x: -42, z: 96 },
  { x: 30, z: 96 },
];

export const MISSION_STAGES = [
  {
    kind: 'call',
    radius: 4,
    title: 'A call from Margo',
    task: 'Answer the payphone',
    detail: 'Your last job starts on Ocean Drive.',
    radio: 'MARGO',
    line: 'One tape. One delivery. Then we are out of this town.',
    target: LOCATIONS.phone,
  },
  {
    kind: 'drive',
    radius: 11,
    title: 'Borrowed horsepower',
    task: 'Take the Cobalt to the marina',
    detail: 'Get in the blue convertible. Follow the coast north.',
    radio: 'MARGO',
    line: 'They took our master tape. Marina. Blue car. You know the drill.',
    target: LOCATIONS.marina,
  },
  {
    kind: 'clear',
    radius: 3.5,
    title: 'The wrong crowd',
    task: 'Recover the master tape',
    detail: 'Leave the car. Deal with the three lookouts. Grab the tape.',
    radio: 'MARGO',
    line: 'Looks like they brought company. Keep it clean, get our music back.',
    target: LOCATIONS.tape,
  },
  {
    kind: 'escape',
    radius: 0,
    title: 'Heat on the boulevard',
    task: 'Lose the police',
    detail: 'Break line of sight. Sunset Motors can fix your ride.',
    radio: 'DISPATCH',
    line: 'All units. Blue convertible. Last seen at the marina.',
    target: LOCATIONS.garage,
  },
  {
    kind: 'lift',
    radius: 5,
    title: 'Above the city',
    task: 'Deliver to Club Mirage',
    detail: 'Park by the club and take the service lift to the roof.',
    radio: 'MARGO',
    line: 'Beautiful. Bring the tape to my rooftop. Drinks are on me.',
    target: LOCATIONS.club,
  },
  {
    kind: 'handoff',
    radius: 4,
    title: 'One last delivery',
    task: 'Give Margo the tape',
    detail: 'Your future is on the other side of this dance floor.',
    radio: 'MARGO',
    line: 'Hear that? That is the sound of a fresh start.',
    target: LOCATIONS.roof,
  },
] as const;
/** Safe circles against buildings and the edge; the rooftop is its own navigation surface. */
export function blocked(x: number, z: number, radius: number, roof = false): boolean {
  if (roof) return x < -97 + radius || x > -63 - radius || z < 58 + radius || z > 82 - radius;
  if (
    x < WORLD_LIMITS.minX + radius ||
    x > WORLD_LIMITS.maxX - radius ||
    z < WORLD_LIMITS.minZ + radius ||
    z > WORLD_LIMITS.maxZ - radius
  )
    return true;
  if (
    x > SHORE_X - radius &&
    !PIERS.some((p) => Math.abs(x - p.x) < p.w / 2 - radius && Math.abs(z - p.z) < p.d / 2 - radius)
  )
    return true;
  return collides(x, z, radius);
}

/** Checkpoint content is declarative; supply one record per mission stage. */
export const CHECKPOINTS = [
  {
    player: LOCATIONS.start,
    car: LOCATIONS.car,
    y: 0,
    yaw: Math.PI,
    inCar: false,
    heat: 0,
    guardsAlive: true,
    tape: false,
  },
  {
    player: LOCATIONS.start,
    car: LOCATIONS.car,
    y: 0,
    yaw: Math.PI,
    inCar: false,
    heat: 0,
    guardsAlive: true,
    tape: false,
  },
  {
    player: { x: 30, z: -91 },
    car: { x: 30, z: -91 },
    y: 0,
    yaw: Math.PI,
    inCar: true,
    heat: 0,
    guardsAlive: true,
    tape: false,
  },
  {
    player: LOCATIONS.tape,
    car: { x: 30, z: -96 },
    y: 0,
    yaw: Math.PI,
    inCar: false,
    heat: 2,
    guardsAlive: false,
    tape: true,
  },
  {
    player: { x: -42, z: -14 },
    car: { x: -42, z: -14 },
    y: 0,
    yaw: 0,
    inCar: true,
    heat: 0,
    guardsAlive: false,
    tape: true,
  },
  {
    player: { x: -65, z: 70 },
    car: LOCATIONS.car,
    y: 8,
    yaw: -Math.PI / 2,
    inCar: false,
    heat: 0,
    guardsAlive: false,
    tape: true,
  },
];
