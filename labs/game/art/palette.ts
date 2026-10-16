/** @file Shared art materials and dimensions; bounded palettes keep instancing efficient. */
export const P = {
  cream: '#e9d5bb',
  stone: '#c4b9ac',
  metal: '#42616c',
  dark: '#253a49',
  glass: '#508a9c',
  wood: '#a47c63',
  leaf: '#468e76',
  lightLeaf: '#86ab79',
  pink: '#e997b4',
  mint: '#86c9be',
  coral: '#df967f',
  yellow: '#e4bd74',
  white: '#eee4d2',
  blue: '#6ba2b8',
  red: '#c76f77',
  tile: '#b47e6d',
  water: '#65b7bb',
  asphalt: '#4c5064',
} as const;
export const VEHICLE_BODIES = ['cabriolet', 'coupe', 'sedan', 'taxi', 'wagon', 'pickup', 'van', 'delivery'] as const;
