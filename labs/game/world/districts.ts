/** @file Eight connected neighborhoods, their art direction, street grid and explorable bounds. */
export const WORLD_LIMITS = { minX: -594, maxX: 132, minZ: -454, maxZ: 454 };
export const ROADS = {
  vertical: [-546, -450, -354, -258, -162, -42, 30],
  horizontal: [-384, -288, -192, -96, 0, 96, 192, 288, 384],
  halfWidth: 8,
};
export type BuildingStyle =
  | 'deco'
  | 'tower'
  | 'apartment'
  | 'motel'
  | 'villa'
  | 'bungalow'
  | 'warehouse'
  | 'market'
  | 'diner'
  | 'cinema'
  | 'civic'
  | 'church'
  | 'garage'
  | 'station';
export interface Building {
  x: number;
  z: number;
  w: number;
  d: number;
  h: number;
  color: string;
  name?: string;
  accent?: string;
  roofDeck?: boolean;
  style?: BuildingStyle;
  district?: string;
  front?: number;
}
export interface District {
  id: string;
  name: string;
  subtitle: string;
  x: number;
  z: number;
  color: string;
  styles: BuildingStyle[];
  palette: string[];
  accent: string;
}
export const DISTRICTS: District[] = [
  {
    id: 'ocean',
    name: 'Ocean Drive',
    subtitle: 'Pastel dreams & borrowed horsepower',
    x: -20,
    z: 50,
    color: '#c996b0',
    styles: ['deco', 'motel', 'diner'],
    palette: ['#e9b4a2', '#a5cac3', '#cab4d1'],
    accent: '#ff83b5',
  },
  {
    id: 'marina',
    name: 'North Marina',
    subtitle: 'Sailboats, seafood & sea air',
    x: -70,
    z: -325,
    color: '#75bdbb',
    styles: ['motel', 'apartment', 'diner', 'station'],
    palette: ['#c7ddd3', '#e7c2a0', '#a3c5c9'],
    accent: '#89f4df',
  },
  {
    id: 'south',
    name: 'South Beach',
    subtitle: 'Never too late for one more sunset',
    x: -70,
    z: 325,
    color: '#e2a2b1',
    styles: ['deco', 'motel', 'villa', 'diner'],
    palette: ['#ebb2ba', '#ead7b0', '#a9cdd2'],
    accent: '#fcaccc',
  },
  {
    id: 'downtown',
    name: 'Downtown',
    subtitle: 'Tall ambitions. Long shadows.',
    x: -305,
    z: -300,
    color: '#7fabc5',
    styles: ['tower', 'apartment', 'cinema', 'deco'],
    palette: ['#97b4c3', '#bcb5cd', '#b2c5cc'],
    accent: '#a3dfff',
  },
  {
    id: 'sol',
    name: 'Little Sol',
    subtitle: 'Cafecito, courtyard music & color',
    x: -300,
    z: 0,
    color: '#e4b26d',
    styles: ['market', 'apartment', 'diner', 'church'],
    palette: ['#e7ac80', '#d9c291', '#a9c59e', '#d6a3a5'],
    accent: '#ffcd76',
  },
  {
    id: 'civic',
    name: 'Civic Quarter',
    subtitle: 'Fountains, palms & late-night pictures',
    x: -300,
    z: 300,
    color: '#b6b6cd',
    styles: ['civic', 'cinema', 'apartment', 'deco'],
    palette: ['#e1d2b7', '#c1bdc8', '#b8cdc2'],
    accent: '#f7d69c',
  },
  {
    id: 'port',
    name: 'Port Meridian',
    subtitle: 'Steel, salt & the midnight shift',
    x: -505,
    z: -270,
    color: '#8faca5',
    styles: ['warehouse', 'garage', 'station'],
    palette: ['#9ba9a2', '#a9a0a1', '#b8aa8c'],
    accent: '#edbf69',
  },
  {
    id: 'heights',
    name: 'Sunset Heights',
    subtitle: 'Slow streets & bougainvillea',
    x: -505,
    z: 230,
    color: '#a5c1a3',
    styles: ['villa', 'bungalow', 'apartment', 'church'],
    palette: ['#e7c2a5', '#c2c9a5', '#c9b4c3', '#d5b993'],
    accent: '#edd6a5',
  },
];
export function districtAt(x: number, z: number): District {
  if (x > -162) return DISTRICTS[z < -192 ? 1 : z > 192 ? 2 : 0];
  if (x < -450) return DISTRICTS[z < 0 ? 6 : 7];
  return DISTRICTS[z < -144 ? 3 : z > 144 ? 5 : 4];
}
export const TOUR_ROUTE = [
  { x: 30, z: -288 },
  { x: -162, z: -288 },
  { x: -354, z: -288 },
  { x: -546, z: -288 },
  { x: -450, z: -288 },
  { x: -450, z: 0 },
  { x: -354, z: 0 },
  { x: -354, z: 192 },
  { x: -546, z: 192 },
  { x: -546, z: 288 },
  { x: -258, z: 288 },
  { x: -162, z: 288 },
  { x: -162, z: 384 },
  { x: 30, z: 384 },
  { x: 30, z: 104 },
];
/** Different districts share the same road graph; a lane-centred rectangle is one traffic circuit. */
const loop = (east: number, west: number, north: number, south: number) => [
  { x: east - 3, z: south - 3 },
  { x: east - 3, z: north - 3 },
  { x: west - 3, z: north - 3 },
  { x: west - 3, z: south - 3 },
];
export const TRAFFIC_ROUTES = [
  loop(30, -42, -96, 96),
  loop(30, -162, -384, -192),
  loop(30, -162, 192, 384),
  loop(-162, -354, -384, -192),
  loop(-162, -354, -96, 96),
  loop(-162, -354, 192, 384),
  loop(-450, -546, -384, -96),
  loop(-450, -546, 96, 384),
];
export const LANDMARKS = [
  { name: 'CRESCENT PIER', x: 52, z: 300, kind: 'pier', district: 'south' },
  { name: 'REGATTA MARINA', x: 50, z: -320, kind: 'marina', district: 'marina' },
  { name: 'MERIDIAN PORT', x: -500, z: -240, kind: 'port', district: 'port' },
  { name: 'SOL MARKET', x: -306, z: 48, kind: 'market', district: 'sol' },
  { name: 'LIBERTY SQUARE', x: -306, z: 240, kind: 'plaza', district: 'civic' },
  { name: 'CORAL GARDENS', x: -498, z: 144, kind: 'gardens', district: 'heights' },
  { name: 'AURORA TOWER', x: -306, z: -336, kind: 'tower', district: 'downtown' },
];

export const SHORE_X = 86;
export const PIERS = [
  { x: 108, z: 300, w: 44, d: 8 },
  ...Array.from({ length: 7 }, (_, i) => ({ x: 98, z: -415 + i * 25, w: 24, d: 3 })),
];
