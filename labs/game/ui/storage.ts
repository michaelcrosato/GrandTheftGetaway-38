/** @file Versioned browser persistence. Malformed or unavailable storage never prevents play. */
export interface Settings {
  quality: number;
  volume: number;
  music: boolean;
  reducedMotion: boolean;
  camera: number;
  difficulty: number;
}
export interface Save {
  version: 1;
  checkpoint: number;
  bestScore: number;
  completed: boolean;
  settings: Settings;
}
const DEFAULT: Save = {
  version: 1,
  checkpoint: 0,
  bestScore: 0,
  completed: false,
  settings: { quality: 1, volume: 0.65, music: true, reducedMotion: false, camera: 0, difficulty: 1 },
};
export function readSave(): Save {
  try {
    const s = JSON.parse(localStorage.getItem('getaway38:v1') ?? 'null');
    if (s?.version !== 1) return structuredClone(DEFAULT);
    return {
      ...DEFAULT,
      checkpoint: Number.isInteger(s.checkpoint) ? Math.max(0, Math.min(5, s.checkpoint)) : 0,
      bestScore: Number.isFinite(s.bestScore) ? Math.max(0, s.bestScore) : 0,
      completed: s.completed === true,
      settings: {
        ...DEFAULT.settings,
        ...s.settings,
        quality: [0, 1, 2].includes(s.settings?.quality) ? s.settings.quality : 1,
        volume: Number.isFinite(s.settings?.volume) ? Math.max(0, Math.min(1, s.settings.volume)) : 0.65,
      },
    };
  } catch {
    return structuredClone(DEFAULT);
  }
}
export function writeSave(save: Save): boolean {
  try {
    localStorage.setItem('getaway38:v1', JSON.stringify(save));
    return true;
  } catch {
    return false;
  }
}
