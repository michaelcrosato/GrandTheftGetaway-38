/** @file Saltwater Bay's art-deco boulevard: instanced architecture, palms, beach, marina and rooftop. */
import {
  RenderScene,
  Mesh,
  MeshBasicMaterial,
  CanvasTexture,
  SphereGeometry,
  PlaneGeometry,
  SRGBColorSpace,
  Fog,
  HemisphereLight,
  DirectionalLight,
} from '../../../engine';
import { BUILDINGS, ROADS } from '../world/level';
import { Scenery, CYL, CONE, BALL, LEAF, label, material } from './primitives';
export function palm(s: Scenery, x: number, z: number, height = 10): void {
  const brown = '#8d7169',
    green = '#3f8376';
  s.add(CYL, brown, [x, height / 2, z], [0.2, height, 0.2], [0.06, 0, -0.08]);
  for (let i = 0; i < 7; i++) {
    const a = (i * Math.PI * 2) / 7;
    s.add(LEAF, green, [x - 0.35, height, z], [1, 1, 1], [0, a, 0]);
  }
  s.add(BALL, '#567868', [x - 0.35, height, z], [0.6, 0.5, 0.6]);
}
function hotel(s: Scenery, b: (typeof BUILDINGS)[number], scene: RenderScene): void {
  s.box(b.color, b.x, b.h / 2, b.z, b.w, b.h, b.d);
  if (!b.roofDeck) {
    s.box('#eee0d4', b.x, b.h + 0.3, b.z, b.w + 1, 0.6, b.d + 1);
    s.box('#f5d9cd', b.x, b.h + 1.1, b.z, b.w * 0.55, 1.2, b.d * 0.55);
  }
  const front = b.x + b.w / 2 + 0.06;
  for (let y = 3.4; y < b.h - 1; y += 3.4) {
    s.box('#efe0d7', front, y - 0.8, b.z, 0.5, 0.25, b.d + 0.5);
    for (let z = b.z - b.d / 2 + 2; z < b.z + b.d / 2 - 1; z += 3.2) {
      s.box('#405970', front + 0.01, y, z, 0.1, 1.8, 1.9);
      s.box('#f4c991', front + 0.07, y, z, 0.05, 1.5, 1.4, 0.12);
    }
  }
  for (let i = -1; i <= 1; i++)
    s.box(b.accent ?? '#ff99bb', front + 0.3, b.h * 0.5, b.z + i * 2, 0.22, b.h - 2, 0.15, 0.4);
  const sign = label(b.name ?? '', b.accent ?? '#ff98d2', Math.min(22, b.d - 2), 2.5);
  sign.position.set(front + 0.3, b.h - 1.4, b.z);
  sign.rotation.y = Math.PI / 2;
  scene.add(sign);
  for (let z = b.z - b.d / 2 + 3; z < b.z + b.d / 2; z += 6) {
    s.box('#295667', front + 0.06, 1.6, z, 0.12, 2.7, 3);
    s.box(b.accent ?? '#e6a4b6', front + 1.3, 3.1, z, 2.6, 0.2, 4);
  }
  if (!b.roofDeck) s.box('#857f8b', b.x, b.h + 0.8, b.z + 4, 3, 1.2, 3);
}
export function createCity(scene: RenderScene): { sun: Mesh; water: Mesh } {
  const canvas = document.createElement('canvas');
  canvas.width = 32;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;
  const gradient = ctx.createLinearGradient(0, 0, 0, 512);
  gradient.addColorStop(0, '#496d9b');
  gradient.addColorStop(0.48, '#c89eb6');
  gradient.addColorStop(0.78, '#f5bea9');
  gradient.addColorStop(1, '#f2ccad');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 32, 512);
  const sky = new CanvasTexture(canvas);
  sky.colorSpace = SRGBColorSpace;
  scene.background = sky;
  scene.fog = new Fog('#e6b8bd', 140, 450);
  scene.add(new HemisphereLight('#c7e9fb', '#956977', 1.8));
  const light = new DirectionalLight('#ffccad', 2.3);
  light.position.set(90, 100, -70);
  scene.add(light);
  const s = new Scenery();
  s.box('#a7b2b5', -23, -0.25, 0, 185, 0.5, 345);
  s.box('#e5c7a3', 70, -0.23, 0, 40, 0.4, 1500);
  const water = new Mesh(new PlaneGeometry(850, 1500), material('#4e98a1'));
  water.rotation.x = -Math.PI / 2;
  water.position.set(513, -0.12, 0);
  scene.add(water);
  for (let x = 87; x < 220; x += 7)
    for (let z = -500; z < 500; z += 19) s.box('#98c5bd', x, -0.08, z + (x % 3) * 3, 1, 0.02, 10 + (x % 9));
  for (const x of ROADS.vertical) {
    s.box('#484a62', x, 0.02, 0, 16, 0.08, 340);
    for (let z = -165; z < 165; z += 8) s.box('#e9c9ab', x, 0.071, z, 0.16, 0.012, 3.6);
    for (const dx of [-8.8, 8.8]) {
      s.box('#efdbcc', x + dx, 0.09, 0, 1.2, 0.19, 340);
      s.box('#f4c6ba', x + dx * 1.2, 0.07, 0, 2.5, 0.12, 340);
    }
  }
  for (const z of ROADS.horizontal) {
    s.box('#484a62', -18, 0.031, z, 188, 0.08, 16);
    for (let x = -110; x < 67; x += 8) s.box('#f0d6b6', x, 0.083, z, 3.8, 0.015, 0.15);
    for (const x of ROADS.vertical) {
      for (let i = 0; i < 6; i++) {
        s.box('#e4d7c8', x - 5 + i * 2, 0.09, z + 8, 1.1, 0.02, 2.4);
        s.box('#e4d7c8', x - 5 + i * 2, 0.09, z - 8, 1.1, 0.02, 2.4);
      }
    }
  }
  for (const b of BUILDINGS) hotel(s, b, scene);
  for (let z = -155; z < 160; z += 19) {
    palm(s, 50, z, 9 + (Math.abs(z) % 4));
    if (Math.abs(z % 96) > 14) palm(s, 19, z, 8);
  }
  for (let z = -150; z < 160; z += 29) {
    s.add(CYL, '#4e6573', [42, 3.2, z], [0.09, 6.4, 0.09]);
    s.box('#4e6573', 40.8, 6.4, z, 2.5, 0.1, 0.1);
    s.box('#fff2be', 39.7, 6.3, z, 0.5, 0.12, 0.6, 0.4);
  }
  for (let z = -140; z < 150; z += 24) {
    s.box('#d5a385', 57, 0.5, z, 3, 0.14, 0.65);
    for (const x of [56, 58]) s.box('#4c626b', x, 0.24, z, 0.1, 0.45, 0.5);
  }
  for (let z = -140; z < 145; z += 26) {
    s.add(CYL, '#eee1b4', [74, 1, z], [0.04, 2, 0.04]);
    s.add(CONE, z % 3 ? '#eea1a8' : '#73b2b2', [74, 2, z], [2, 0.6, 2]);
    s.box('#faf0d6', 77, 0.3, z, 1, 0.2, 2.4);
  }
  // Marina loading court and readable cover.
  s.box('#8e9caa', 3, 0.095, -102, 42, 0.12, 33);
  for (const [x, z] of [
    [-8, -107],
    [-8, -116],
    [15, -118],
  ]) {
    s.box('#a77579', x, 0.8, z, 2, 1.6, 2);
    s.box('#e1b69d', x, 1.3, z, 2.1, 0.15, 2.1);
  }
  for (let z = -130; z < -60; z += 20) {
    s.box('#a78379', 94, 0.35, z, 28, 0.7, 3);
    s.box('#f5decc', 105, 1.1, z + 5, 3, 1.3, 9);
    s.box('#6a9ba7', 105, 2.3, z + 4, 2, 1.2, 3);
  }
  const marina = label('MARINA  /  04', '#ffccab', 16, 2);
  marina.position.set(3, 5, -120);
  scene.add(marina);
  // Payphone, service bay, service lift and rooftop dance floor.
  s.box('#466979', 39, 1.2, 99, 0.7, 2.4, 0.65);
  s.box('#a5eee4', 39, 1.5, 99.35, 0.5, 0.65, 0.06, 0.5);
  const phone = label('CALL', '#affff0', 1.8, 0.6);
  phone.position.set(39, 3, 99);
  scene.add(phone);
  s.box('#43626b', -53, 1.3, -14, 5, 2.6, 7);
  const garage = label('FIX  /  $100', '#81ffe0', 9, 1.3);
  garage.rotation.y = Math.PI / 2;
  garage.position.set(-50, 4, -14);
  scene.add(garage);
  s.box('#404763', -58, 2, 73, 5, 4, 4);
  const lift = label('ROOFTOP ↑', '#ffb3df', 5, 1);
  lift.rotation.y = Math.PI / 2;
  lift.position.set(-55, 4.8, 73);
  scene.add(lift);
  s.box('#66536f', -80, 8.04, 70, 37, 0.12, 27);
  for (let x = -92; x < -67; x += 3)
    for (let z = 61; z < 80; z += 3) s.box((x + z) % 2 ? '#ea98b2' : '#88cec6', x, 8.14, z, 2.8, 0.04, 2.8, 0.15);
  for (const x of [-99, -61]) s.box('#e1c4cc', x, 8.6, 70, 0.3, 1, 26);
  for (const z of [57, 83]) s.box('#e1c4cc', -80, 8.6, z, 38, 1, 0.3);
  s.box('#384654', -91, 9.5, 69, 2, 3, 7);
  s.box('#edc6b0', -86, 9, 79, 12, 1.7, 2);
  const club = label('MIRAGE', '#ffa7d7', 14, 3);
  club.position.set(-80, 13, 58);
  scene.add(club);
  // Soft distant skyline beyond the district.
  for (let i = 0; i < 25; i++) {
    const h = 14 + ((i * 17) % 55);
    s.box(['#9593b1', '#ada1ba', '#a0adb9'][i % 3], -145 - (i % 3) * 18, h / 2, -250 + i * 21, 14, h, 14);
  }
  s.flush(scene);
  const sun = new Mesh(new SphereGeometry(27, 32, 16), new MeshBasicMaterial({ color: '#ffe2b2', fog: false }));
  sun.position.set(140, 20, -340);
  scene.add(sun);
  return { sun, water };
}
