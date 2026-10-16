/** @file Check browser capability before importing WebGPU dependencies; keep usable menus on unsupported engines. */
import { Interface, $, setText } from './ui/interface';
import { Controls } from './ui/input';
import { readSave } from './ui/storage';
function unsupported(reason: string): void {
  const ui = new Interface(),
    controls = new Controls(),
    save = readSave();
  save.checkpoint = 0;
  const showTitle = () => {
    ui.mode('title', save);
    document.querySelector<HTMLButtonElement>('[data-action=new]')!.disabled = true;
  };
  showTitle();
  $('loading').innerHTML =
    '<span>WebGPU is required to play.<br><small>Use a WebGPU-enabled Chrome, Edge or Safari browser.</small></span>';
  $('loading').dataset.reason = reason;
  setText('device-label', 'WEBGPU UNAVAILABLE · MENUS ARE AVAILABLE');
  ui.action = (action) => {
    if (action === 'controls') {
      ui.mode('controls', save);
      ui.controls();
    } else if (action === 'credits') {
      ui.mode('credits', save);
      ui.credits();
    } else if (action === 'options') {
      ui.mode('options', save);
      ui.panel(
        'BROWSER SUPPORT',
        'A different way into the city.',
        '<p>This game needs WebGPU. Enable hardware acceleration and use a WebGPU-capable version of Chrome, Edge or Safari. No downloads or accounts are needed.</p><p>Your controller and keyboard will be ready when the graphics API is available.</p>',
        [
          { label: 'HOW TO PLAY', action: 'controls' },
          { label: 'BACK', action: 'back' },
        ],
      );
    } else if (action === 'back') showTitle();
  };
  controls.onAction = (action) => {
    if (action === 'up' || action === 'down') ui.focus(action === 'up' ? -1 : 1);
    else if (action === 'confirm') ui.confirm();
    else if (action === 'pause' || action === 'back') showTitle();
  };
  $('mobile-menu').addEventListener('click', () => {
    document.body.dataset.mobileMenu = document.body.dataset.mobileMenu === 'true' ? 'false' : 'true';
  });
  function poll(t: number): void {
    controls.poll(t);
    requestAnimationFrame(poll);
  }
  requestAnimationFrame(poll);
}
if (!navigator.gpu || typeof GPUShaderStage === 'undefined') unsupported('WebGPU API is not exposed by this browser');
else import('./main').catch((error) => unsupported(error instanceof Error ? error.message : String(error)));
