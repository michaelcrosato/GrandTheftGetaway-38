/** @file HUD and controller focus. Mission copy is shared with simulation content, with contextual input prompts. */
import { MISSION_STAGES, LOCATIONS } from '../world/level';
import { distance } from '../world/math';
import type { GameView } from '../bot';
import type { Save } from './storage';
import { drawMap } from './minimap';
export const $ = <T extends HTMLElement = HTMLElement>(id: string): T => document.getElementById(id) as T;
export function setText(id: string, text: string): void {
  const element = $(id);
  if (element.textContent !== text) element.textContent = text;
}
export class Interface {
  action: (name: string) => void = () => {};
  focusIndex = 0;
  constructor() {
    document.addEventListener('click', (event) => {
      const b = (event.target as HTMLElement).closest<HTMLButtonElement>('[data-action]');
      if (b && !b.disabled) this.action(b.dataset.action!);
    });
  }
  buttons(): HTMLButtonElement[] {
    const region = !$('panel').hidden ? $('panel') : !$('map-screen').hidden ? $('map-screen') : $('title');
    return Array.from(region.querySelectorAll<HTMLButtonElement>('button:not(:disabled)'));
  }
  focus(step = 0): void {
    const buttons = this.buttons();
    if (!buttons.length) return;
    const current = buttons.indexOf(document.activeElement as HTMLButtonElement);
    this.focusIndex = ((current < 0 ? 0 : current) + step + buttons.length) % buttons.length;
    buttons[this.focusIndex]?.focus({ preventScroll: true });
    if (!$('panel').hidden) buttons[this.focusIndex]?.scrollIntoView({ block: 'nearest' });
  }
  confirm(): void {
    const b = document.activeElement as HTMLButtonElement;
    if (this.buttons().includes(b)) b.click();
    else {
      this.focus();
    }
  }
  mode(mode: string, save: Save): void {
    document.body.dataset.mode = mode;
    $('title').hidden = !['title', 'loading'].includes(mode);
    $('hud').hidden = !['playing', 'demo'].includes(mode);
    $('panel').hidden = !['paused', 'options', 'controls', 'credits', 'won', 'lost'].includes(mode);
    $('map-screen').hidden = mode !== 'map';
    $('demo-banner').hidden = mode !== 'demo';
    document.querySelector<HTMLButtonElement>('[data-action=continue]')!.disabled = save.checkpoint === 0;
  }
  panel(
    kicker: string,
    title: string,
    content: string,
    buttons: { label: string; action: string; value?: string }[],
  ): void {
    setText('panel-kicker', kicker);
    setText('panel-title', title);
    $('panel-content').innerHTML = content;
    $('panel-menu').innerHTML = buttons
      .map((b) => `<button data-action="${b.action}">${b.label}${b.value ? `<span>${b.value}</span>` : ''}</button>`)
      .join('');
    this.focus();
  }
  options(save: Save): void {
    const s = save.settings;
    this.panel('MAKE YOURSELF AT HOME', 'Your kind of night.', '', [
      { label: 'VISUAL QUALITY', action: 'quality', value: ['PERFORMANCE', 'BALANCED', 'HIGH'][s.quality] },
      { label: 'MASTER VOLUME', action: 'volume', value: `${Math.round(s.volume * 100)}%` },
      { label: 'AFTER HOURS RADIO', action: 'music', value: s.music ? 'ON' : 'OFF' },
      { label: 'CAMERA', action: 'camera', value: s.camera ? 'HIGH / WIDE' : 'CHASE' },
      { label: 'CAMERA MOTION', action: 'motion', value: s.reducedMotion ? 'REDUCED' : 'CINEMATIC' },
      { label: 'DIFFICULTY · NEXT RUN', action: 'difficulty', value: s.difficulty ? 'STANDARD' : 'STORY' },
      { label: 'BACK', action: 'back', value: '○' },
    ]);
  }
  controls(): void {
    this.panel(
      'BUILT FOR THE COUCH',
      'Take control.',
      `<p>A standard gamepad is all you need. DualSense works through your browser’s Gamepad API. Keyboard follows the same actions.</p><div class="control-grid">${[
        ['Move / steer', 'L stick · WASD'],
        ['Look', 'R stick · IJKL'],
        ['Accelerate', 'R2 · W'],
        ['Brake / reverse', 'L2 · S'],
        ['Enter / exit / use', '△ · E'],
        ['Fire / aim assist', 'R2 · F / click'],
        ['Reload', '□ · R'],
        ['Sprint / boost', 'R1 · Shift'],
        ['Jump', '✕ · Space'],
        ['Handbrake', '○ · Space'],
        ['Change weapon', 'L1 · Q'],
        ['Street sprint', '↑ · T'],
        ['Pause', 'Options · Esc'],
        ['District map', 'Touchpad · Tab'],
      ]
        .map(([a, b]) => `<div><span>${a}</span><b>${b}</b></div>`)
        .join(
          '',
        )}</div><p>Follow the gold objective marker. Save points are automatic. Break police line of sight for seven seconds to lose the heat.</p>`,
      [{ label: 'GOT IT', action: 'back', value: '○' }],
    );
  }
  credits(): void {
    this.panel(
      'MADE OF SUNLIGHT & BAD IDEAS',
      'The people behind the palms.',
      `<p>Original story, characters, procedural city, vehicles and synthesized music created for <strong>Grand Theft Getaway-38</strong>. Inspired by the atmosphere and systemic freedom of Grand Theft Auto: Vice City.</p><p class="credits-copy">Initial date: October 16, 2026.<br>SOURCE: Grand Theft Auto: Vice City.<br>Engine: <a href="https://github.com/michaelcrosato/my-3dge" target="_blank" rel="noreferrer">my-3dge</a> at ff439e2, version 0.0.0 · three.js r182 · Rapier 0.21.0.<br>Environment: local Codex workspace, Bash, Ubuntu 26.04 / WSL2 Linux; Chromium, Firefox and WebKit testing; RTX 3060 Ti.<br>AI lab: OpenAI. Agent: Codex. Exact model identifier and reasoning effort not confirmed.<br>No original game assets, music, map or code are used.<br>Engine and game code: MIT. See repository licenses and engine evaluation separately.</p>`,
      [{ label: 'BACK TO THE BAY', action: 'back', value: '○' }],
    );
  }
  hud(v: GameView, gamepad: boolean): void {
    const p = v.player,
      j = v.job,
      stage = MISSION_STAGES[Math.min(j.stage, 5)],
      car = v.cars.find((c) => c.id === p.car);
    setText(
      'district',
      p.y > 3 ? 'Club Mirage' : p.z < -85 ? 'Marina Quarter' : p.x < -30 ? 'Sunset District' : 'Ocean Drive',
    );
    setText('objective-index', String(j.stage + 1).padStart(2, '0'));
    setText('objective', j.race >= 0 ? `Ocean Sprint · Gate ${j.race + 1}/6` : stage.task);
    setText(
      'objective-chapter',
      j.race >= 0 ? `${Math.ceil(90 - j.raceTick / 60)} SECONDS LEFT` : stage.title.toUpperCase(),
    );
    setText('objective-detail', stage.detail);
    setText('distance', `${Math.round(distance(p, stage.target))} m`);
    setText('cash', `$ ${String(Math.round(p.cash)).padStart(6, '0')}`);
    setText('stars', '★'.repeat(j.heat) + '☆'.repeat(5 - j.heat));
    setText('health', `${Math.ceil(p.hp)}`);
    setText('armor', `${Math.ceil(p.armor)}`);
    $('health-bar').style.width = `${p.hp}%`;
    $('armor-bar').style.width = `${p.armor * 2}%`;
    setText(
      'heat-label',
      j.heat ? (j.unseen ? `SEARCHING · ${Math.ceil((420 - j.unseen) / 60)}s` : 'POLICE IN PURSUIT') : '',
    );
    setText('tapes', `${p.tapes} / 5`);
    setText(
      'equipment-label',
      car
        ? car.type === 'cobalt'
          ? 'COBALT · SPORT CABRIOLET'
          : 'BORROWED WHEELS'
        : p.weapon
          ? 'COMPACT SMG'
          : 'SERVICE PISTOL',
    );
    $('equipment-value').innerHTML = car
      ? `${Math.round(Math.abs(car.speed) * 3.6)
          .toString()
          .padStart(2, '0')} <small>km/h</small>`
      : `${p.ammo} <small>/ ${p.reserve}</small>`;
    $('vehicle-bar').hidden = !car;
    if (car) $('vehicle-bar').firstElementChild!.setAttribute('style', `width:${car.hp}%`);
    setText(
      'equipment-note',
      car
        ? `CONDITION ${Math.ceil(car.hp)}%`
        : p.reload
          ? 'RELOADING…'
          : p.ammo === 0
            ? 'OUT OF AMMO · VISIT SUNSET MOTORS'
            : 'AIM ASSIST · READY',
    );
    const use = gamepad ? '△' : 'E';
    let context = '';
    if (j.stage === 0 && distance(p, LOCATIONS.phone) < 5) context = 'Answer the payphone';
    else if (j.stage === 4 && distance(p, LOCATIONS.club) < 6 && !car) context = 'Take the service lift';
    else if (j.stage === 5 && distance(p, LOCATIONS.roof) < 5) context = 'Deliver the master tape';
    else if (distance(p, LOCATIONS.garage) < 7) context = 'Repair & restock · $100';
    else if (car && Math.abs(car.speed) < 7) context = 'Step out';
    else if (!car && v.cars.some((c) => c.active && c.type !== 'police' && distance(p, c) < 5)) context = 'Get in';
    $('context').innerHTML = context ? `<b>${use}</b>${context}` : '';
    setText(
      'help-strip',
      car
        ? gamepad
          ? 'L STEER     R2 ACCELERATE     L2 BRAKE     ○ HANDBRAKE     △ EXIT     ↑ STREET SPRINT'
          : 'A D STEER     W ACCELERATE     S BRAKE     SPACE HANDBRAKE     E EXIT     T STREET SPRINT'
        : gamepad
          ? 'L MOVE     R1 SPRINT     ✕ JUMP     R2 FIRE     □ RELOAD     △ INTERACT'
          : 'WASD MOVE     SHIFT SPRINT     SPACE JUMP     F / CLICK FIRE     R RELOAD     E INTERACT',
    );
    $('dialogue').hidden = j.ticks > 450 || (j.stage === 0 && j.ticks > 300);
    setText('speaker', stage.radio);
    setText('dialogue-text', stage.line);
    $('toast').hidden = j.messageTick <= 0;
    setText('toast', j.message);
    $('damage-flash').style.opacity = p.invincible > 10 ? '.45' : '0';
    drawMap($<HTMLCanvasElement>('radar'), v);
  }
}
