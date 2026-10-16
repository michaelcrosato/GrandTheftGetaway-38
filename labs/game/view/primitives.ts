/** @file Shared procedural geometry, cached materials and instanced static scenery. No downloaded artwork. */
import {
  BoxGeometry,
  CylinderGeometry,
  SphereGeometry,
  PlaneGeometry,
  ConeGeometry,
  MeshStandardMaterial,
  MeshBasicMaterial,
  Mesh,
  Group,
  InstancedMesh,
  Object3D,
  CanvasTexture,
  SRGBColorSpace,
  DoubleSide,
  mergeGeometries,
  BufferGeometry,
  Float32BufferAttribute,
  type RenderScene,
} from '../../../engine';
export const BOX = new BoxGeometry(1, 1, 1);
export const CYL = new CylinderGeometry(1, 1, 1, 8);
export const BALL = new SphereGeometry(1, 10, 8);
export const PLANE = new PlaneGeometry(1, 1);
export const CONE = new ConeGeometry(1, 1, 6);
const mats = new Map<string, MeshStandardMaterial>();
export function material(color: string, glow = 0): MeshStandardMaterial {
  const key = `${color}:${glow}`;
  let m = mats.get(key);
  if (!m) {
    m = new MeshStandardMaterial({ color, roughness: 0.75, metalness: 0.12, emissive: color, emissiveIntensity: glow });
    mats.set(key, m);
  }
  return m;
}
export function piece(
  parent: Group,
  geo: BufferGeometry,
  color: string,
  pos: number[],
  scale: number[],
  rotation: number[] = [],
  glow = 0,
): Mesh {
  const mesh = new Mesh(geo, material(color, glow));
  mesh.position.set(pos[0], pos[1], pos[2]);
  mesh.scale.set(scale[0], scale[1], scale[2]);
  mesh.rotation.set(rotation[0] ?? 0, rotation[1] ?? 0, rotation[2] ?? 0);
  parent.add(mesh);
  return mesh;
}
interface Batch {
  geo: BufferGeometry;
  color: string;
  glow: number;
  transforms: Object3D[];
}
export class Scenery {
  batches = new Map<string, Batch>();
  add(geo: BufferGeometry, color: string, pos: number[], scale: number[], rotation: number[] = [], glow = 0): void {
    const key = `${geo.id}:${color}:${glow}`;
    let batch = this.batches.get(key);
    if (!batch) {
      batch = { geo, color, glow, transforms: [] };
      this.batches.set(key, batch);
    }
    const o = new Object3D();
    o.position.set(pos[0], pos[1], pos[2]);
    o.scale.set(scale[0], scale[1], scale[2]);
    o.rotation.set(rotation[0] ?? 0, rotation[1] ?? 0, rotation[2] ?? 0);
    o.updateMatrix();
    batch.transforms.push(o);
  }
  box(color: string, x: number, y: number, z: number, w: number, h: number, d: number, glow = 0): void {
    this.add(BOX, color, [x, y, z], [w, h, d], [], glow);
  }
  flush(scene: RenderScene): void {
    for (const b of this.batches.values()) {
      const m = new InstancedMesh(b.geo, material(b.color, b.glow), b.transforms.length);
      b.transforms.forEach((o, i) => m.setMatrixAt(i, o.matrix));
      m.castShadow = true;
      m.receiveShadow = true;
      m.computeBoundingSphere();
      scene.add(m);
    }
  }
}
/** Collapse a procedural car to a handful of meshes grouped by material. */
export function compact(group: Group): Group {
  const byMaterial = new Map<MeshStandardMaterial, BufferGeometry[]>();
  group.traverse((o) => {
    if (o instanceof Mesh) {
      o.updateMatrixWorld();
      const g = o.geometry.clone().applyMatrix4(o.matrixWorld);
      const m = o.material as MeshStandardMaterial;
      const list = byMaterial.get(m) ?? [];
      list.push(g);
      byMaterial.set(m, list);
    }
  });
  const out = new Group();
  for (const [m, geos] of byMaterial) {
    const mesh = new Mesh(mergeGeometries(geos), m);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    out.add(mesh);
  }
  return out;
}
export function label(text: string, color: string, width = 6, height = 1.5): Mesh {
  const c = document.createElement('canvas');
  c.width = 1024;
  c.height = 192;
  const ctx = c.getContext('2d')!;
  ctx.clearRect(0, 0, c.width, c.height);
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.font = '700 110px sans-serif';
  ctx.shadowBlur = 14;
  ctx.shadowColor = color;
  ctx.fillStyle = color;
  ctx.fillText(text, 512, 96, 990);
  const texture = new CanvasTexture(c);
  texture.colorSpace = SRGBColorSpace;
  return new Mesh(
    new PlaneGeometry(width, height),
    new MeshBasicMaterial({ map: texture, transparent: true, side: DoubleSide, depthWrite: false }),
  );
}

/** A curved palm frond, shared by every tree. */
export const LEAF = new BufferGeometry();
const leafVertices: number[] = [];
for (let i = 0; i < 6; i++) {
  const t = i / 5,
    w = Math.sin(t * Math.PI) * 0.55;
  const y = Math.sin(t * Math.PI) * 1.1 - t * t * 1.6;
  leafVertices.push(-w, y, t * 5, w, y, t * 5);
}
const leafIndices: number[] = [];
for (let i = 0; i < 5; i++) {
  const a = i * 2;
  leafIndices.push(a, a + 1, a + 2, a + 1, a + 3, a + 2, a + 2, a + 1, a, a + 2, a + 3, a + 1);
}
LEAF.setAttribute('position', new Float32BufferAttribute(leafVertices, 3));
LEAF.setIndex(leafIndices);
LEAF.computeVertexNormals();
