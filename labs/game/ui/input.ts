/** @file One action model for DualSense-compatible standard gamepads, keyboard and mouse; no touch sticks. */
import type { Intents } from '../../../engine';
export type UiAction = 'confirm' | 'back' | 'up' | 'down' | 'left' | 'right' | 'pause' | 'map';
export class Controls {
  keys = new Set<string>();
  taps = new Set<string>();
  mouse = false;
  device = 'keyboard';
  lastActivity = performance.now();
  look: [number, number] = [0, 0];
  pad: Gamepad | null = null;
  previousButtons: boolean[] = [];
  repeat = 0;
  previousAxis = 0;
  lastPoll = 0;
  onActivity: () => boolean = () => false;
  onAction: (action: UiAction) => void = () => {};
  constructor() {
    addEventListener('keydown', (e) => {
      if (['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Tab'].includes(e.code)) e.preventDefault();
      if (this.activity()) return;
      this.device = 'keyboard';
      this.keys.add(e.code);
      if (!e.repeat) this.taps.add(e.code);
      const actions: Record<string, UiAction> = {
        Enter: 'confirm',
        Escape: 'pause',
        Tab: 'map',
        ArrowUp: 'up',
        ArrowDown: 'down',
        ArrowLeft: 'left',
        ArrowRight: 'right',
        KeyW: 'up',
        KeyS: 'down',
        KeyA: 'left',
        KeyD: 'right',
      };
      if (actions[e.code] && !e.repeat) this.onAction(actions[e.code]);
    });
    addEventListener('keyup', (e) => {
      this.keys.delete(e.code);
      this.activity();
    });
    addEventListener(
      'pointerdown',
      (e) => {
        if (this.activity()) {
          e.preventDefault();
          e.stopImmediatePropagation();
          return;
        }
        this.device = 'keyboard';
        if (e.button === 0 && e.target instanceof HTMLCanvasElement) this.mouse = true;
      },
      true,
    );
    addEventListener('pointerup', () => {
      this.mouse = false;
      this.activity();
    });
    addEventListener('pointermove', () => this.activity());
    addEventListener('wheel', () => this.activity(), { passive: true });
    addEventListener('blur', () => this.clear());
    addEventListener('gamepadconnected', () => {
      this.device = 'gamepad';
      this.activity();
    });
  }
  activity(): boolean {
    this.lastActivity = performance.now();
    return this.onActivity();
  }
  clear(): void {
    this.keys.clear();
    this.taps.clear();
    this.mouse = false;
    this.look = [0, 0];
  }
  poll(now: number): void {
    const pads = navigator.getGamepads?.() ?? [];
    this.pad = Array.from(pads).find((p) => p?.connected) ?? null;
    const p = this.pad;
    if (!p) {
      this.look = [
        Number(this.keys.has('KeyL')) - Number(this.keys.has('KeyJ')),
        Number(this.keys.has('KeyK')) - Number(this.keys.has('KeyI')),
      ];
      this.previousButtons = [];
      return;
    }
    const active = p.buttons.some((b) => b.pressed) || p.axes.some((a) => Math.abs(a) > 0.18);
    if (active) {
      this.device = 'gamepad';
      if (this.activity()) {
        this.previousButtons = p.buttons.map((b) => b.pressed);
        return;
      }
    }
    const actions: Record<number, UiAction> = {
      0: 'confirm',
      1: 'back',
      9: 'pause',
      12: 'up',
      13: 'down',
      14: 'left',
      15: 'right',
      17: 'map',
    };
    p.buttons.forEach((b, i) => {
      if (b.pressed && !this.previousButtons[i]) {
        this.taps.add(`pad${i}`);
        if (actions[i]) this.onAction(actions[i]);
      }
    });
    const axis = Math.abs(p.axes[1] ?? 0) > 0.6 ? Math.sign(p.axes[1]) : 0;
    if (axis && (axis !== this.previousAxis || now > this.repeat)) {
      this.onAction(axis > 0 ? 'down' : 'up');
      this.repeat = now + (axis !== this.previousAxis ? 350 : 160);
    }
    this.previousAxis = axis;
    this.previousButtons = p.buttons.map((b) => b.pressed);
    this.look = [p.axes[2] ?? 0, p.axes[3] ?? 0];
    this.lastPoll = now;
  }
  take(driving: boolean, cameraAngle = 0): Intents {
    const down = (code: string) => this.keys.has(code),
      tap = (code: string) => this.taps.has(code);
    const pad = this.pad;
    const button = (i: number) => pad?.buttons[i]?.value ?? 0;
    const dz = (a: number) => (Math.abs(a) > 0.15 ? a : 0);
    let x = (down('KeyD') || down('ArrowRight') ? 1 : 0) - (down('KeyA') || down('ArrowLeft') ? 1 : 0);
    let z = (down('KeyS') || down('ArrowDown') ? 1 : 0) - (down('KeyW') || down('ArrowUp') ? 1 : 0);
    x += dz(pad?.axes[0] ?? 0);
    z += dz(pad?.axes[1] ?? 0);
    const b: string[] = [],
      p: string[] = [];
    if (down('ShiftLeft') || button(5) > 0.5) b.push('sprint');
    if (down('Space') || button(1) > 0.5 || button(6) > 0.5) b.push('brake');
    if (!driving && (this.mouse || down('KeyF') || button(7) > 0.3)) b.push('attack');
    if (tap('KeyE') || tap('pad3')) p.push('interact');
    if (tap('Space') || tap('pad0')) p.push('jump');
    if (tap('KeyR') || tap('pad2')) p.push('reload');
    if (tap('KeyQ') || tap('pad4')) p.push('weapon');
    if (tap('KeyT') || tap('pad12')) p.push('race');
    this.taps.clear();
    const c = Math.cos(cameraAngle),
      s = Math.sin(cameraAngle);
    return {
      move: [x * c + z * s, z * c - x * s],
      b,
      p,
      'game:throttle': driving ? Math.max(-1, Math.min(1, -z + button(7) - button(6))) : 0,
      'game:steer': Math.max(-1, Math.min(1, -x)),
    };
  }
  rumble(strong = 0.5, duration = 140): void {
    const actuator = this.pad?.vibrationActuator;
    actuator?.playEffect('dual-rumble', { duration, strongMagnitude: strong, weakMagnitude: 0.25 }).catch(() => {});
  }
}
