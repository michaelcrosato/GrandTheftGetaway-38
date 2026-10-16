/** @file Export the actual procedural models to portable OBJ/MTL and vector thumbnails, plus a gallery manifest. */
import { mkdirSync, writeFileSync, readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import {
  RenderScene,
  Mesh,
  InstancedMesh,
  Matrix4,
  Color,
  Vector3,
  Box3,
  type Group,
  type MeshStandardMaterial,
} from '../../../engine';
import { ASSETS } from '../art/catalog';
import { ARCHITECTURE, drawBuilding } from '../art/architecture';
import { BUILDING_HEIGHTS } from '../world/blocks';
import { VEHICLE_BODIES, P } from '../art/palette';
import { VEHICLE_NAMES } from '../art/vehicle-names';
import { Scenery } from '../view/primitives';
import { carModel, personModel } from '../view/models';
const output = join(process.cwd(), 'labs/art/assets');
mkdirSync(output, { recursive: true });
interface Face {
  points: Vector3[];
  color: string;
  depth: number;
}
interface Entry {
  id: string;
  name: string;
  category: string;
  source: string;
  preview: string;
  obj?: string;
  mtl?: string;
  vertices?: number;
  triangles?: number;
  size?: number[];
}
const manifest: Entry[] = [];
function exportModel(id: string, name: string, category: string, source: string, scene: RenderScene | Group): void {
  scene.updateMatrixWorld(true);
  const bounds = new Box3();
  const lines = [
    `# Grand Theft Getaway-38 / ${name}`,
    `# Original procedural art. MIT. SI metres, +Y up.`,
    `mtllib ${id}.mtl`,
    `o ${id}`,
  ];
  const colors = new Set<string>();
  const faces: Face[] = [];
  let offset = 1;
  scene.traverse((node) => {
    if (!(node instanceof Mesh)) return;
    const mat = node.material as MeshStandardMaterial;
    if (mat.transparent) return;

    const pos = node.geometry.getAttribute('position'),
      index = node.geometry.index;
    const count = node instanceof InstancedMesh ? node.count : 1;
    for (let instance = 0; instance < count; instance++) {
      const tint = new Color(1, 1, 1);
      if (node instanceof InstancedMesh && node.instanceColor) node.getColorAt(instance, tint);
      const color = mat.color.clone().multiply(tint).getHexString();
      colors.add(color);
      const matrix = node.matrixWorld.clone();
      if (node instanceof InstancedMesh) {
        const local = new Matrix4();
        node.getMatrixAt(instance, local);
        matrix.multiply(local);
      }
      const vertices: Vector3[] = [];
      for (let i = 0; i < pos.count; i++) {
        const v = new Vector3().fromBufferAttribute(pos, i).applyMatrix4(matrix);
        if (!Number.isFinite(v.x + v.y + v.z)) throw new Error(`${id} contains non-finite geometry; export stopped`);
        bounds.expandByPoint(v);
        vertices.push(v);
        lines.push(`v ${v.x.toFixed(5)} ${v.y.toFixed(5)} ${v.z.toFixed(5)}`);
      }
      lines.push(`usemtl color_${color}`);
      const length = index ? index.count : pos.count;
      for (let i = 0; i < length; i += 3) {
        const ids = [0, 1, 2].map((k) => (index ? index.getX(i + k) : i + k));
        const points = ids.map((n) => vertices[n]);
        if (points.some((p) => !p)) continue;
        lines.push(`f ${ids.map((n) => n + offset).join(' ')}`);
        faces.push({ points, color, depth: points.reduce((v, p) => v + p.x + p.z + p.y * 0.7, 0) / 3 });
      }
      offset += vertices.length;
    }
  });
  const materials = ['# Original material palette; RGB diffuse colours.'];
  for (const c of colors) {
    const rgb = [0, 2, 4].map((i) => parseInt(c.slice(i, i + 2), 16) / 255);
    materials.push(
      `newmtl color_${c}`,
      `Kd ${rgb.map((v) => v.toFixed(5)).join(' ')}`,
      'Ka 0.15 0.15 0.15',
      'Ks 0.1 0.1 0.1',
      'Ns 24',
      '',
    );
  }
  writeFileSync(join(output, `${id}.obj`), lines.join('\n') + '\n');
  writeFileSync(join(output, `${id}.mtl`), materials.join('\n'));
  const projected = faces.map((f) => ({
    ...f,
    p: f.points.map((v) => ({ x: (v.x - v.z) * 0.75, y: (v.x + v.z) * 0.32 - v.y * 0.9 })),
  }));
  const xs = projected.flatMap((f) => f.p.map((p) => p.x)),
    ys = projected.flatMap((f) => f.p.map((p) => p.y));
  const minX = Math.min(...xs),
    maxX = Math.max(...xs),
    minY = Math.min(...ys),
    maxY = Math.max(...ys);
  const scale = Math.min(216 / Math.max(0.1, maxX - minX), 168 / Math.max(0.1, maxY - minY));
  const polygons = projected
    .sort((a, b) => a.depth - b.depth)
    .map((f) => {
      const normal = f.points[1].clone().sub(f.points[0]).cross(f.points[2].clone().sub(f.points[0])).normalize();
      const light = 0.72 + 0.28 * Math.max(0, normal.dot(new Vector3(-0.5, 1, 0.8).normalize()));
      const color =
        '#' +
        [0, 2, 4]
          .map((i) =>
            Math.min(255, Math.round(parseInt(f.color.slice(i, i + 2), 16) * light))
              .toString(16)
              .padStart(2, '0'),
          )
          .join('');
      const pts = f.p
        .map(
          (p) =>
            `${(128 + (p.x - (minX + maxX) / 2) * scale).toFixed(2)},${(112 + (p.y - (minY + maxY) / 2) * scale).toFixed(2)}`,
        )
        .join(' ');
      return `<polygon points="${pts}" fill="${color}" stroke="${color}" stroke-width=".25"/>`;
    });
  writeFileSync(
    join(output, `${id}.svg`),
    `<svg xmlns="http://www.w3.org/2000/svg" width="256" height="224" viewBox="0 0 256 224"><title>${name}</title><rect width="256" height="224" fill="#233b49"/><ellipse cx="128" cy="200" rx="83" ry="10" fill="#172b36" opacity=".55"/>${polygons.join('')}</svg>\n`,
  );
  const size = bounds.getSize(new Vector3());
  manifest.push({
    id,
    name,
    category,
    source,
    preview: `${id}.svg`,
    obj: `${id}.obj`,
    mtl: `${id}.mtl`,
    vertices: offset - 1,
    triangles: faces.length,
    size: [size.x, size.y, size.z].map((n) => Math.round(n * 100) / 100),
  });
}
for (const a of ASSETS) {
  const scene = new RenderScene(),
    s = new Scenery();
  a.build(s);
  s.flush(scene);
  exportModel(
    a.id,
    a.name,
    a.category,
    `labs/game/art/${a.category === 'Street' ? 'street' : a.category === 'Coast & gardens' ? 'coast' : a.category === 'Port & service' ? 'industry' : 'civic'}.ts`,
    scene,
  );
}
for (const style of ARCHITECTURE) {
  const scene = new RenderScene(),
    s = new Scenery();
  drawBuilding(s, {
    x: 0,
    z: 0,
    w: 18,
    d: 22,
    h: BUILDING_HEIGHTS[style],
    color: P.mint,
    accent: P.pink,
    style,
  });
  s.flush(scene);
  exportModel(
    `building-${style}`,
    style.charAt(0).toUpperCase() + style.slice(1) + ' architecture',
    'Architecture',
    'labs/game/art/architecture.ts',
    scene,
  );
}
for (const [i, body] of VEHICLE_BODIES.entries())
  exportModel(
    `vehicle-${body}`,
    VEHICLE_NAMES[body],
    'Vehicles',
    'labs/game/art/vehicles.ts',
    carModel([P.mint, P.coral, P.blue, P.yellow][i % 4], false, body),
  );
for (const [i, name] of [
  'Street citizen',
  'Beachgoer',
  'Dock worker',
  'Office worker',
  'Vacationer',
  'Market vendor',
].entries())
  exportModel(
    'character-' + name.toLowerCase().replace(/ /g, '-'),
    name,
    'Characters',
    'labs/game/view/models.ts',
    personModel('pedestrian', i).group,
  );
for (const [role, name] of [
  ['player', 'The courier'],
  ['contact', 'Margo'],
  ['guard', 'Marina lookout'],
])
  exportModel('character-' + role, name, 'Characters', 'labs/game/view/models.ts', personModel(role).group);
const graphics = join(process.cwd(), 'labs/game/art/graphics');
for (const file of readdirSync(graphics).filter((p) => p.endsWith('.svg'))) {
  const id = 'graphic-' + file.replace('.svg', '');
  writeFileSync(join(output, `${id}.svg`), readFileSync(join(graphics, file)));
  manifest.push({
    id,
    name: file.replace('.svg', '').replace(/-/g, ' '),
    category: 'Illustrated signs',
    source: `labs/game/art/graphics/${file}`,
    preview: `${id}.svg`,
  });
}
writeFileSync(
  join(process.cwd(), 'labs/art/manifest.json'),
  JSON.stringify({ version: 1, license: 'MIT', units: 'metres', up: '+Y', assets: manifest }, null, 2) + '\n',
);
console.log(
  JSON.stringify({
    assets: manifest.length,
    models: manifest.filter((a) => a.obj).length,
    illustrations: manifest.filter((a) => !a.obj).length,
    triangles: manifest.reduce((v, a) => v + (a.triangles ?? 0), 0),
    output,
  }),
);
