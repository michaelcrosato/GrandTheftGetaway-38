/** @file Shared pure spatial helpers with no engine or browser dependencies. */
export const distance = (a: { x: number; z: number }, b: { x: number; z: number }): number =>
  Math.hypot(a.x - b.x, a.z - b.z);
