/** @file Asset browser over generated previews and portable exports of the same models used by the game. */
/// <reference types="vite/client" />
import manifestText from './manifest.json?raw';
import type { ArtManifest } from './types';
const manifest = JSON.parse(manifestText) as ArtManifest;
const files = import.meta.glob('./assets/*', { query: '?url', import: 'default', eager: true }) as Record<
  string,
  string
>;
const graphics = import.meta.glob('../game/art/graphics/*.svg', {
  query: '?url',
  import: 'default',
  eager: true,
}) as Record<string, string>;
const assets = manifest.assets;
type Asset = (typeof assets)[number];
const $ = (id: string) => document.getElementById(id)!;
const url = (file: string) => files[`./assets/${file}`];
let category = 'All assets',
  selected = 0;
const categories = ['All assets', ...new Set(assets.map((a) => a.category))];
$('numbers').innerHTML =
  `<span><b>${assets.length}</b> original assets</span><span><b>${assets.filter((a) => a.obj).length}</b> portable 3D models</span><span><b>${assets.filter((a) => !a.obj).length}</b> illustrated signs</span>`;
function render(): void {
  $('filters').innerHTML = categories.map((c) => `<button aria-pressed="${c === category}">${c}</button>`).join('');
  $('grid').innerHTML = assets
    .filter((a) => category === 'All assets' || a.category === category)
    .map(
      (a) =>
        `<button class="card" data-id="${a.id}"><img src="${url(a.preview)}" alt="${a.name}" loading="lazy"/><div><span>${a.category}</span><h2>${a.name}</h2><b>↗</b></div></button>`,
    )
    .join('');
}
function open(asset: Asset): void {
  selected = assets.indexOf(asset);
  const image = $('preview') as HTMLImageElement;
  image.src = url(asset.preview);
  image.alt = asset.name;
  $('category').textContent = asset.category;
  $('name').textContent = asset.name;
  $('details').textContent = asset.obj
    ? `${asset.triangles?.toLocaleString()} triangles · ${asset.size?.map((n) => `${n}m`).join(' × ')} · +Y up. Download the OBJ and matching MTL into the same folder.`
    : 'An original vector illustration used on billboards throughout Saltwater Bay. Scalable, editable SVG.';
  const links = [
    { name: 'DOWNLOAD SVG', file: asset.preview },
    ...(asset.obj
      ? [
          { name: 'DOWNLOAD OBJ', file: asset.obj },
          { name: 'DOWNLOAD MTL', file: asset.mtl! },
        ]
      : []),
  ];
  $('downloads').innerHTML = links.map((l) => `<a href="${url(l.file)}" download="${l.file}">${l.name} ↓</a>`).join('');
  if (!asset.obj) {
    const original = Object.entries(graphics).find(([key]) => key.endsWith(asset.source.split('/').pop()!));
    if (original) $('downloads').innerHTML = `<a href="${original[1]}" download="${asset.preview}">DOWNLOAD SVG ↓</a>`;
  }
  ($('source') as HTMLAnchorElement).href =
    `https://github.com/michaelcrosato/GrandTheftGetaway-38/blob/main/${asset.source}`;
  const dialog = $('viewer') as HTMLDialogElement;
  if (!dialog.open) dialog.showModal();
}
$('filters').addEventListener('click', (event) => {
  const button = (event.target as HTMLElement).closest('button');
  if (button) {
    category = button.textContent!;
    render();
  }
});
$('grid').addEventListener('click', (event) => {
  const card = (event.target as HTMLElement).closest<HTMLElement>('[data-id]');
  if (card) open(assets.find((a) => a.id === card.dataset.id)!);
});
$('close').addEventListener('click', () => ($('viewer') as HTMLDialogElement).close());
addEventListener('keydown', (e) => {
  if (!($('viewer') as HTMLDialogElement).open) return;
  if (e.key === 'ArrowRight') open(assets[(selected + 1) % assets.length]);
  if (e.key === 'ArrowLeft') open(assets[(selected + assets.length - 1) % assets.length]);
});
render();
