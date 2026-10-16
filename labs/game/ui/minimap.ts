/** @file Player-centred radar and full district map derived from the same level data as the simulation. */
import { BUILDINGS, ROADS, MISSION_STAGES, RACE_GATES } from '../world/level';
import type { GameView } from '../bot';
export function drawMap(canvas: HTMLCanvasElement, v: GameView, full = false): void {
  const ctx = canvas.getContext('2d')!,
    w = canvas.width,
    h = canvas.height;
  ctx.clearRect(0, 0, w, h);
  ctx.fillStyle = '#152f39';
  ctx.fillRect(0, 0, w, h);
  const scale = full ? Math.min(w / 230, h / 365) : 2.5;
  const ox = full ? -20 : v.player.x,
    oz = full ? 0 : v.player.z;
  const x = (a: number) => w / 2 + (a - ox) * scale,
    z = (a: number) => h / 2 + (a - oz) * scale;
  ctx.fillStyle = '#2d6b72';
  ctx.fillRect(x(80), 0, w, h);
  ctx.fillStyle = '#a29b80';
  ctx.fillRect(x(63), 0, 17 * scale, h);
  ctx.strokeStyle = '#7e8c8d';
  ctx.lineWidth = 16 * scale;
  for (const a of ROADS.vertical) {
    ctx.beginPath();
    ctx.moveTo(x(a), z(-175));
    ctx.lineTo(x(a), z(175));
    ctx.stroke();
  }
  for (const a of ROADS.horizontal) {
    ctx.beginPath();
    ctx.moveTo(x(-115), z(a));
    ctx.lineTo(x(65), z(a));
    ctx.stroke();
  }
  ctx.fillStyle = '#52666c';
  for (const b of BUILDINGS) ctx.fillRect(x(b.x - b.w / 2), z(b.z - b.d / 2), b.w * scale, b.d * scale);
  const target = v.job.race >= 0 ? RACE_GATES[v.job.race] : MISSION_STAGES[Math.min(5, v.job.stage)].target;
  ctx.strokeStyle = '#fdc99d';
  ctx.lineWidth = full ? 3 : 2;
  ctx.setLineDash([4, 5]);
  ctx.beginPath();
  ctx.moveTo(x(v.player.x), z(v.player.z));
  ctx.lineTo(x(target.x), z(target.z));
  ctx.stroke();
  ctx.setLineDash([]);
  const dot = (px: number, pz: number, color: string, r: number) => {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(x(px), z(pz), r, 0, Math.PI * 2);
    ctx.fill();
  };
  for (const c of v.cars) if (c.type === 'police' && c.active) dot(c.x, c.z, '#fc7797', full ? 6 : 4);
  for (const n of v.npcs) if (n.role === 'guard' && n.hp > 0 && v.job.stage === 2) dot(n.x, n.z, '#ff7a90', 4);
  if (full) for (const c of v.pickups) if (!c.taken) dot(c.x, c.z, '#bd97fa', 4);
  dot(target.x, target.z, '#ffe2a6', full ? 9 : 7);
  dot(target.x, target.z, '#765954', 3);
  ctx.save();
  ctx.translate(x(v.player.x), z(v.player.z));
  ctx.rotate(-v.player.yaw);
  ctx.fillStyle = '#a4fff1';
  ctx.beginPath();
  ctx.moveTo(0, 8);
  ctx.lineTo(-6, -6);
  ctx.lineTo(6, -6);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
  ctx.font = `600 ${full ? 14 : 12}px sans-serif`;
  ctx.fillStyle = '#e3f4ed';
  ctx.fillText('N', w - 20, 22);
  if (full) {
    ctx.font = '600 15px sans-serif';
    ctx.fillStyle = '#eac3d6';
    ctx.fillText('OCEAN DRIVE', x(34), z(-152));
    ctx.fillText('MIRAGE', x(-99), z(54));
    ctx.fillText('MARINA', x(-10), z(-121));
    ctx.fillText('SUNSET MOTORS', x(-108), z(-20));
  }
}
