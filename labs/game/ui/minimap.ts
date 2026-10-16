/** @file The expanded district map and local radar use the same coast, streets, landmarks and building data. */
import { BUILDINGS, MISSION_STAGES, RACE_GATES } from '../world/level';
import { ROADS, WORLD_LIMITS as W, DISTRICTS, LANDMARKS, SHORE_X, PIERS } from '../world/districts';
import type { GameView } from '../bot';
export function drawMap(canvas: HTMLCanvasElement, v: GameView, full = false): void {
  const ctx = canvas.getContext('2d')!,
    w = canvas.width,
    h = canvas.height;
  ctx.clearRect(0, 0, w, h);
  ctx.fillStyle = '#233c43';
  ctx.fillRect(0, 0, w, h);
  const scale = full ? Math.min((w - 36) / (W.maxX - W.minX), (h - 36) / (W.maxZ - W.minZ)) : 2.2;
  const ox = full ? (W.minX + W.maxX) / 2 : v.player.x,
    oz = full ? 0 : v.player.z;
  const x = (a: number) => w / 2 + (a - ox) * scale,
    z = (a: number) => h / 2 + (a - oz) * scale;
  ctx.fillStyle = '#327581';
  ctx.fillRect(x(SHORE_X), 0, w, h);
  ctx.fillStyle = '#b3a48b';
  ctx.fillRect(x(63), 0, (SHORE_X - 63) * scale, h);
  ctx.fillStyle = '#9c8c7b';
  for (const p of PIERS) ctx.fillRect(x(p.x - p.w / 2), z(p.z - p.d / 2), p.w * scale, p.d * scale);
  ctx.strokeStyle = '#72868b';
  ctx.lineWidth = 16 * scale;
  for (const a of ROADS.vertical) {
    ctx.beginPath();
    ctx.moveTo(x(a), z(W.minZ));
    ctx.lineTo(x(a), z(W.maxZ));
    ctx.stroke();
  }
  for (const a of ROADS.horizontal) {
    ctx.beginPath();
    ctx.moveTo(x(W.minX), z(a));
    ctx.lineTo(x(66), z(a));
    ctx.stroke();
  }
  ctx.fillStyle = '#52686f';
  for (const b of BUILDINGS) ctx.fillRect(x(b.x - b.w / 2), z(b.z - b.d / 2), b.w * scale, b.d * scale);
  const target = v.job.race >= 0 ? RACE_GATES[v.job.race] : MISSION_STAGES[Math.min(5, v.job.stage)].target;
  const dot = (px: number, pz: number, color: string, r: number) => {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(x(px), z(pz), r, 0, Math.PI * 2);
    ctx.fill();
  };
  if (!v.job.cruise || v.job.race >= 0) {
    ctx.strokeStyle = '#fdc99d';
    ctx.lineWidth = full ? 2 : 2;
    ctx.setLineDash([4, 5]);
    ctx.beginPath();
    ctx.moveTo(x(v.player.x), z(v.player.z));
    ctx.lineTo(x(target.x), z(target.z));
    ctx.stroke();
    ctx.setLineDash([]);
    dot(target.x, target.z, '#ffe2a6', full ? 7 : 7);
    dot(target.x, target.z, '#765954', 3);
  }
  for (const c of v.cars) if (c.type === 'police' && c.active) dot(c.x, c.z, '#fc7797', 4);
  for (const n of v.npcs)
    if (n.role === 'guard' && n.hp > 0 && v.job.stage === 2 && !v.job.cruise) dot(n.x, n.z, '#ff7a90', 4);
  if (full) {
    for (const c of v.pickups) if (!c.taken) dot(c.x, c.z, '#bd97fa', 2.5);
    ctx.textAlign = 'center';
    for (const d of DISTRICTS) {
      ctx.fillStyle = d.accent;
      ctx.font = '600 12px sans-serif';
      ctx.strokeStyle = '#23333ee0';
      ctx.lineWidth = 4;
      const words = d.name.split(' ');
      words.forEach((word, i) => {
        ctx.strokeText(word.toUpperCase(), x(d.x), z(d.z) + (i - 0.5) * 14);
        ctx.fillText(word.toUpperCase(), x(d.x), z(d.z) + (i - 0.5) * 14);
      });
    }
    for (const l of LANDMARKS) dot(l.x, l.z, '#ffe2a6', 3);
    ctx.textAlign = 'left';
  }
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
  ctx.font = '600 12px sans-serif';
  ctx.fillStyle = '#e3f4ed';
  ctx.fillText('N', w - 20, 22);
}
