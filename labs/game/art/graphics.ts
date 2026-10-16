/** @file Eight original illustrated billboard textures, authored as portable SVG sources and baked locally. */
/// <reference types="vite/client" />
import {
  CanvasTexture,
  SRGBColorSpace,
  Mesh,
  PlaneGeometry,
  MeshBasicMaterial,
  DoubleSide,
  type RenderScene,
} from '../../../engine';
const sources = import.meta.glob('./graphics/*.svg', { query: '?raw', import: 'default', eager: true }) as Record<
  string,
  string
>;
export const GRAPHIC_IDS = Object.keys(sources).map((p) => p.split('/').pop()!.replace('.svg', ''));
const textures = new Map<string, CanvasTexture>();
export async function prepareArt(): Promise<void> {
  await Promise.all(
    Object.entries(sources).map(async ([path, svg]) => {
      const id = path.split('/').pop()!.replace('.svg', '');
      if (textures.has(id)) return;
      const image = new Image();
      image.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
      await image.decode();
      const canvas = document.createElement('canvas');
      canvas.width = 960;
      canvas.height = 480;
      canvas.getContext('2d')!.drawImage(image, 0, 0);
      const texture = new CanvasTexture(canvas);
      texture.colorSpace = SRGBColorSpace;
      textures.set(id, texture);
    }),
  );
}
export function billboard(
  scene: RenderScene,
  id: string,
  x: number,
  y: number,
  z: number,
  yaw: number,
  width = 12,
): void {
  const texture = textures.get(id);
  if (!texture) throw new Error(`Billboard ${id} is not prepared; call prepareArt before constructing the city.`);
  const mesh = new Mesh(new PlaneGeometry(width, width / 2), new MeshBasicMaterial({ map: texture, side: DoubleSide }));
  mesh.position.set(x, y, z);
  mesh.rotation.y = yaw;
  mesh.userData.artDistance = 310;
  scene.add(mesh);
}
