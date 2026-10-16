/** @file Portable asset-manifest contract, shared by the gallery, exporter and validation tests. */
export interface ArtAsset {
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
export interface ArtManifest {
  version: number;
  license: string;
  units: string;
  up: string;
  assets: ArtAsset[];
}
