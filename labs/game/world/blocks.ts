/** @file Original core blocks plus district-specific parcels: every building footprint drives physics and art. */
import { ROADS, districtAt, type Building, type BuildingStyle } from './districts';
export const CORE_BUILDINGS: Building[] = [
  { x: -4, z: 124, w: 40, d: 27, h: 15, color: '#f1c0ac', name: 'THE PALMS', accent: '#ff6fbc', style: 'deco' },
  { x: -6, z: 62, w: 38, d: 33, h: 19, color: '#b7d7cf', name: 'HOTEL AZUL', accent: '#62fff0', style: 'deco' },
  { x: -5, z: 22, w: 39, d: 26, h: 11, color: '#eabccf', name: 'PARADISO', accent: '#ffd175', style: 'cinema' },
  { x: -5, z: -39, w: 39, d: 47, h: 23, color: '#c9bbd4', name: 'OCEANIC', accent: '#ff7fb3', style: 'deco' },
  { x: -5, z: -143, w: 39, d: 33, h: 13, color: '#cce5d0', name: 'MARINA CLUB', accent: '#f6d590', style: 'motel' },
  { x: -83, z: 116, w: 49, d: 28, h: 30, color: '#b9b9d3', name: 'SOLSTICE', accent: '#91dfff', style: 'tower' },
  {
    x: -80,
    z: 70,
    w: 38,
    d: 28,
    h: 8,
    color: '#db9cb8',
    name: 'CLUB MIRAGE',
    accent: '#ff82b8',
    roofDeck: true,
    style: 'deco',
  },
  { x: -82, z: 25, w: 48, d: 28, h: 18, color: '#ddcbbb', name: 'CASA LUNA', accent: '#f9b35f', style: 'apartment' },
  { x: -83, z: -48, w: 44, d: 40, h: 17, color: '#9fccc8', name: 'SUNSET MOTORS', accent: '#6af0d4', style: 'garage' },
  { x: -83, z: -126, w: 44, d: 40, h: 24, color: '#c7b2cd', name: 'RADIO 88.4', accent: '#fd8fb4', style: 'deco' },
];
const names: Record<BuildingStyle, string[]> = {
  deco: ['THE FLAMINGO', 'PALM ROYALE', 'SEABREEZE', 'SAPPHIRE', 'CASA ROSA'],
  tower: ['AURORA', 'BAY FINANCIAL', 'PACIFIC TRUST', 'SKYLINE HOUSE', 'ATLANTIC'],
  apartment: ['CASA VERDE', 'BAYVIEW', 'VILLA LUNA', 'PALM COURT', 'LAS FLORES'],
  motel: ['SUNSET INN', 'MOONLIGHT MOTEL', 'CORAL KEYS', 'SEAGLASS'],
  villa: ['CASA DEL MAR', 'VILLA SOL', 'CASA MANGO', 'LAS PALMAS'],
  bungalow: ['HIBISCUS HOUSE', 'JASMINE', 'CORAL COTTAGE', 'BOUGAINVILLEA'],
  warehouse: ['MERIDIAN FREIGHT', 'BAY COLD STORAGE', 'COASTAL EXPORTS', 'NORTH ATLANTIC'],
  market: ['SOL MERCADO', 'FRUTERIA LUNA', 'CASA CAFE', 'FLOR DE SOL'],
  diner: ['PALM DINER', 'CAFECITO', 'BAY CRAB SHACK', 'TANGERINE GRILL'],
  cinema: ['RIVIERA CINEMA', 'THE REGENT', 'NEON PICTURE HOUSE'],
  civic: ['CITY HALL', 'BAY MUSEUM', 'PUBLIC LIBRARY', 'CIVIC THEATRE'],
  church: ['SANTA LUCIA', 'SAN MARINO'],
  garage: ['AUTO ELECTRICA', 'PACIFIC AUTO', 'SUNSET SERVICE'],
  station: ['PALM PETROL', 'COAST FUEL'],
};
export const BUILDING_HEIGHTS: Record<BuildingStyle, number> = {
  deco: 18,
  tower: 58,
  apartment: 22,
  motel: 8,
  villa: 7,
  bungalow: 4.5,
  warehouse: 12,
  market: 7,
  diner: 5,
  cinema: 14,
  civic: 18,
  church: 13,
  garage: 8,
  station: 5,
};
/** Reserve entire parcels for authored public spaces and infrastructure. */
export const PUBLIC_PARCELS = [
  { x: -306, z: 48 },
  { x: -306, z: 240 },
  { x: -498, z: 144 },
  { x: -498, z: -240 },
];
export const BUILDINGS: Building[] = [...CORE_BUILDINGS];
for (let col = 0; col < ROADS.vertical.length - 1; col++)
  for (let row = 0; row < ROADS.horizontal.length - 1; row++) {
    const x = (ROADS.vertical[col] + ROADS.vertical[col + 1]) / 2,
      z = (ROADS.horizontal[row] + ROADS.horizontal[row + 1]) / 2;
    if (col >= 4 && Math.abs(z) < 192) continue;
    if (PUBLIC_PARCELS.some((p) => p.x === x && p.z === z)) continue;
    const district = districtAt(x, z),
      id = col * 8 + row;
    // A tower landmark occupies a full parcel; residential and retail parcels have four distinct street fronts.
    const landmark = x === -306 && z === -336;
    const count = landmark ? 1 : district.id === 'port' ? 2 : 4;
    const cellW = ROADS.vertical[col + 1] - ROADS.vertical[col] - 30;
    for (let i = 0; i < count; i++) {
      const style: BuildingStyle = landmark ? 'tower' : district.styles[(id + i) % district.styles.length];
      const w = count === 1 ? 40 : count === 2 ? cellW * 0.82 : cellW * 0.43;
      const d = count === 1 ? 42 : count === 2 ? 23 : 27;
      const bx = count < 4 ? x : x + (i % 2 ? 1 : -1) * cellW * 0.255;
      const bz = count === 1 ? z : z + (i < count / 2 ? -1 : 1) * 18;
      BUILDINGS.push({
        x: bx,
        z: bz,
        w,
        d,
        h: landmark
          ? 96
          : BUILDING_HEIGHTS[style] + (style === 'tower' ? (id % 3) * 11 : style === 'apartment' ? (id % 3) * 3 : 0),
        style,
        color: district.palette[(id + i) % district.palette.length],
        accent: district.accent,
        name: landmark ? 'AURORA TOWER' : names[style][(id + i) % names[style].length],
        district: district.id,
        front: i % 2 ? 1 : -1,
      });
    }
  }
