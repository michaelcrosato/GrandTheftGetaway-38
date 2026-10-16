/** @file Original low-poly vehicles and articulated characters, assembled entirely from geometry. */
import { Group, Mesh, MeshBasicMaterial, CircleGeometry } from '../../../engine';
import { BOX, CYL, BALL, piece, compact } from './primitives';
export function carModel(color: string, police = false): Group {
  const g = new Group();
  piece(g, BOX, color, [0, 0.69, 0], [1.95, 0.55, 4.3]);
  piece(g, BOX, color, [0, 0.99, 1.15], [1.87, 0.18, 1.65]);
  piece(g, BOX, color, [0, 0.95, -1.6], [1.85, 0.2, 0.9]);
  piece(g, BOX, '#152637', [0, 0.95, -0.3], [1.57, 0.2, 1.65]);
  piece(g, BOX, '#e0d1c4', [-0.42, 1.15, -0.6], [0.55, 0.6, 0.35], [-0.13, 0, 0]);
  piece(g, BOX, '#e0d1c4', [0.42, 1.15, -0.6], [0.55, 0.6, 0.35], [-0.13, 0, 0]);
  piece(g, BOX, '#72d7e2', [0, 1.45, 0.5], [1.7, 0.65, 0.075], [0.28, 0, 0]);
  piece(g, BOX, color, [0, 1.77, 0.59], [1.86, 0.07, 0.08]);
  for (const x of [-0.91, 0.91]) piece(g, BOX, color, [x, 1.42, 0.52], [0.075, 0.73, 0.08], [0.28, 0, 0]);
  for (const z of [-1.35, 1.35])
    for (const x of [-1.01, 1.01]) {
      piece(g, CYL, '#172532', [x, 0.48, z], [0.44, 0.25, 0.44], [0, 0, Math.PI / 2]);
      piece(g, CYL, '#b3c5c6', [x * 1.12, 0.48, z], [0.25, 0.02, 0.25], [0, 0, Math.PI / 2]);
    }
  for (const x of [-0.65, 0.65]) {
    piece(g, BOX, '#fff0c4', [x, 0.82, 2.16], [0.48, 0.18, 0.03], [], 1.2);
    piece(g, BOX, '#ff537f', [x, 0.82, -2.16], [0.5, 0.12, 0.03], [], 0.7);
  }
  for (const z of [-2.18, 2.18]) piece(g, BOX, '#b4c2ca', [0, 0.53, z], [1.92, 0.12, 0.1]);
  piece(g, BOX, '#263246', [0, 0.78, 2.18], [0.64, 0.13, 0.03]);
  if (police) {
    piece(g, BOX, '#1b2840', [0, 1.7, -0.2], [1.8, 0.15, 1.6]);
    piece(g, BOX, '#ff5973', [-0.4, 1.89, -0.2], [0.6, 0.2, 0.3], [], 1);
    piece(g, BOX, '#63c7ff', [0.4, 1.89, -0.2], [0.6, 0.2, 0.3], [], 1);
  }
  const result = compact(g);
  result.add(shadow(2.9, 5.6));
  return result;
}
export function shadow(w: number, d: number): Mesh {
  const m = new Mesh(
    new CircleGeometry(1, 20),
    new MeshBasicMaterial({ color: '#1f203c', transparent: true, opacity: 0.24, depthWrite: false }),
  );
  m.rotation.x = -Math.PI / 2;
  m.scale.set(w / 2, d / 2, 1);
  m.position.y = 0.13;
  return m;
}
export interface PersonModel {
  group: Group;
  legs: Group[];
  arms: Group[];
  body: Group;
}
export function personModel(role: string, index = 0): PersonModel {
  const g = new Group(),
    body = new Group();
  g.add(body);
  const shirt =
    role === 'player'
      ? '#6be6dc'
      : role === 'guard'
        ? '#77475f'
        : role === 'contact'
          ? '#fff1c8'
          : ['#ef9bb6', '#85c5bf', '#eecca0'][index % 3];
  piece(body, CYL, shirt, [0, 1.22, 0], [0.34, 0.7, 0.23]);
  piece(body, BALL, '#d79b77', [0, 1.83, 0.01], [0.23, 0.27, 0.21]);
  piece(body, BALL, '#29243b', [0, 2, 0], [0.24, 0.15, 0.22]);
  if (role === 'player') {
    piece(body, BOX, '#203045', [0, 1.87, 0.18], [0.36, 0.075, 0.04]);
    piece(body, BOX, '#f2dbaa', [0, 1.46, 0.19], [0.08, 0.14, 0.035]);
  }
  const legs: Group[] = [],
    arms: Group[] = [];
  for (const x of [-0.17, 0.17]) {
    const l = new Group();
    l.position.set(x, 0.93, 0);
    body.add(l);
    piece(l, BOX, role === 'player' ? '#eae3cb' : '#25384b', [0, -0.4, 0], [0.24, 0.8, 0.28]);
    piece(l, BOX, '#f3e8d5', [0, -0.85, 0.055], [0.25, 0.13, 0.42]);
    legs.push(l);
  }
  for (const x of [-0.43, 0.43]) {
    const a = new Group();
    a.position.set(x, 1.49, 0);
    body.add(a);
    piece(a, BOX, shirt, [0, -0.16, 0], [0.22, 0.35, 0.28]);
    piece(a, BOX, '#d79b77', [0, -0.42, 0], [0.18, 0.28, 0.21]);
    arms.push(a);
  }
  if (role === 'guard' || role === 'player') piece(arms[1], BOX, '#293045', [0, -0.5, 0.18], [0.12, 0.17, 0.4]);
  g.add(shadow(1.3, 1.3));
  return { group: g, legs, arms, body };
}
export function animatePerson(model: PersonModel, speed: number, time: number, aim = false, dead = false): void {
  model.body.rotation.z = dead ? Math.PI / 2 : 0;
  model.body.position.y = dead ? 0.2 : 0;
  const stride = Math.sin(time * 10) * Math.min(speed / 7, 0.65);
  model.legs[0].rotation.x = stride;
  model.legs[1].rotation.x = -stride;
  model.arms[0].rotation.x = aim ? -1.25 : -stride;
  model.arms[1].rotation.x = aim ? -1.4 : stride;
}
