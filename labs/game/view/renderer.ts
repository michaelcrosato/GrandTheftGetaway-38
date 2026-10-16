/** @file WebGPU-only presentation, cinematic title shot, chase/orbit camera, world guidance and live performance. */
import {
  WebGPURenderer,
  RenderScene,
  PerspectiveCamera,
  Vector3,
  Group,
  Mesh,
  TorusGeometry,
  MeshBasicMaterial,
  BufferGeometry,
  Float32BufferAttribute,
  Line,
  LineBasicMaterial,
  ACESFilmicToneMapping,
} from '../../../engine';
import { createCity } from './city';
import { carModel, personModel, animatePerson, type PersonModel } from './models';
import { BOX, piece } from './primitives';
import { MISSION_STAGES, RACE_GATES, LOCATIONS, BUILDINGS } from '../world/level';
import type { GameView } from '../bot';
export interface RenderOptions {
  quality: number;
  reducedMotion: boolean;
  camera: number;
}
export class GameRenderer {
  renderer: WebGPURenderer;
  city: ReturnType<typeof createCity>;
  scene = new RenderScene();
  camera = new PerspectiveCamera(58, 1, 0.1, 1400);
  cars = new Map<number, { group: Group; color: string; model: string }>();
  people = new Map<number, PersonModel>();
  hero = personModel('player');
  ring: Mesh;
  tape: Group;
  pickups: Group[] = [];
  tracer: Line;
  enemyTracers: Line[] = [];
  target = new Vector3();
  eye = new Vector3();
  angle = 0;
  pitch = 0.32;
  ready = false;
  frameMs = 16.7;
  fps = 60;
  lastTime = 0;
  frames = 0;
  totalTime = 0;
  resolution = 1;
  cameraMode = 'follow';
  lastLayer = 0;
  options: RenderOptions = { quality: 1, reducedMotion: false, camera: 0 };
  constructor(canvas: HTMLCanvasElement) {
    this.renderer = new WebGPURenderer({ canvas, antialias: true, alpha: false });
    this.renderer.toneMapping = ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.05;
    this.city = createCity(this.scene);
    this.scene.add(this.hero.group);
    this.ring = new Mesh(
      new TorusGeometry(2.1, 0.065, 6, 40),
      new MeshBasicMaterial({ color: '#9cffee', transparent: true, opacity: 0.8 }),
    );
    this.ring.rotation.x = Math.PI / 2;
    this.scene.add(this.ring);
    this.tape = new Group();
    piece(this.tape, BOX, '#271c36', [0, 0, 0], [1, 0.6, 0.16]);
    piece(this.tape, BOX, '#ff82be', [0, 0.05, 0.09], [0.82, 0.3, 0.02], [], 0.4);
    this.scene.add(this.tape);
    this.tracer = this.line('#ffedbc');
    this.scene.add(this.tracer);
    for (let i = 0; i < 3; i++) {
      const l = this.line('#ff647c');
      this.enemyTracers.push(l);
      this.scene.add(l);
    }
    this.resize();
    addEventListener('resize', () => this.resize());
  }
  line(color: string): Line {
    const g = new BufferGeometry();
    g.setAttribute('position', new Float32BufferAttribute([0, 0, 0, 0, 0, 0], 3));
    return new Line(g, new LineBasicMaterial({ color }));
  }
  async init(): Promise<void> {
    await this.renderer.init();
    await this.renderer.compileAsync(this.scene, this.camera);
    this.renderer.render(this.scene, this.camera);
    this.ready = true;
  }
  resize(): void {
    const w = innerWidth,
      h = innerHeight;
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
    this.renderer.setPixelRatio(Math.min(devicePixelRatio, this.options.quality === 2 ? 1.5 : 1) * this.resolution);
    this.renderer.setSize(w, h);
  }
  setOptions(options: RenderOptions): void {
    this.options = options;
    this.resolution = options.quality === 0 ? 0.75 : 1;
    this.resize();
  }
  sync(view: GameView, time: number, mode: string, look: [number, number] = [0, 0]): void {
    const p = view.player,
      j = view.job;
    for (const v of view.cars) {
      let model = this.cars.get(v.id);
      if (!model) {
        model = { group: carModel(v.color, v.type === 'police', v.model), color: v.color, model: v.model };
        this.cars.set(v.id, model);
        this.scene.add(model.group);
      }
      if (model.color !== v.color || model.model !== v.model) {
        this.scene.remove(model.group);
        model = { group: carModel(v.color, v.type === 'police', v.model), color: v.color, model: v.model };
        this.cars.set(v.id, model);
        this.scene.add(model.group);
      }
      model.group.position.set(v.x, 0, v.z);
      model.group.rotation.y = v.yaw;
      model.group.visible = v.active && Math.hypot(v.x - p.x, v.z - p.z) < 220;
      if (v.type === 'police') model.group.position.y = Math.sin(time * 18) * 0.015;
    }
    this.hero.group.position.set(p.x, p.y + p.jump, p.z);
    this.hero.group.rotation.y = p.yaw;
    this.hero.group.visible = !p.car;
    animatePerson(this.hero, p.moving, time, p.shot > 0, j.state === 'lost');
    view.npcs.forEach((n, i) => {
      let model = this.people.get(n.id);
      if (!model) {
        model = personModel(n.role, i);
        this.people.set(n.id, model);
        this.scene.add(model.group);
      }
      model.group.visible = Math.hypot(n.x - p.x, n.z - p.z) < 115;
      model.group.position.set(n.x, n.role === 'contact' ? 8 : 0, n.z);
      model.group.rotation.y = n.yaw;
      animatePerson(model, !['guard', 'contact'].includes(n.role) ? 1.4 : 0, time + i, n.alert > 0.2, n.hp <= 0);
    });
    view.pickups.forEach((c, i) => {
      if (!this.pickups[i]) {
        const g = new Group();
        piece(g, BOX, '#ffc1e3', [0, 0, 0], [0.5, 0.4, 0.15], [], 0.5);
        this.pickups.push(g);
        this.scene.add(g);
      }
      const g = this.pickups[i];
      g.position.set(c.x, 1.2 + Math.sin(time * 2 + i) * 0.2, c.z);
      g.rotation.y = time;
      g.visible = !c.taken;
    });
    const goal = j.race >= 0 ? RACE_GATES[j.race] : MISSION_STAGES[Math.min(5, j.stage)].target;
    this.ring.position.set(goal.x, (j.stage === 5 ? 8 : 0) + 0.16, goal.z);
    this.ring.scale.setScalar(1 + Math.sin(time * 3) * 0.07);
    this.ring.visible = j.state === 'playing' && (!j.cruise || j.race >= 0);
    this.tape.position.set(LOCATIONS.tape.x, 1.2 + Math.sin(time * 2) * 0.15, LOCATIONS.tape.z);
    this.tape.rotation.y = time;
    this.tape.visible = !j.cruise && j.stage <= 2;
    this.tracer.visible = p.shot > 2;
    this.updateLine(this.tracer, [p.x, p.y + 1.4, p.z], [p.shotX, p.y + 1.1, p.shotZ]);
    const guards = view.npcs.filter((n) => n.role === 'guard');
    guards.forEach((n, i) => {
      const l = this.enemyTracers[i];
      l.visible = !j.cruise && n.hp > 0 && j.stage === 2 && (n.shot > 0 || n.alert > 0.75);
      this.updateLine(l, [n.x, 1.3, n.z], [p.x, p.y + 0.7, p.z]);
    });
    const menu = mode === 'title' || mode === 'options' || mode === 'controls' || mode === 'credits';
    if (menu) {
      const drift = this.options.reducedMotion ? 0 : Math.sin(time * 0.08) * 4;
      this.eye.set(50 + drift, 6.8, 121);
      this.target.set(17, 5, 85);
      this.camera.fov = 55;
      this.camera.position.copy(this.eye);
      this.camera.lookAt(this.target);
    } else {
      this.angle += look[0] * 0.035;
      this.pitch = Math.max(0.15, Math.min(0.85, this.pitch + look[1] * 0.02));
      if (p.car && Math.abs(look[0]) < 0.1) this.angle *= 0.97;
      const yaw = p.car ? p.yaw + this.angle : this.angle + Math.PI;
      const dist = p.car ? 10.5 : 7;
      const high = this.options.camera === 1 ? 12 : 3.2 + this.pitch * 4;
      this.eye.set(p.x - Math.sin(yaw) * dist, p.y + high, p.z - Math.cos(yaw) * dist);
      this.target.set(p.x, p.y + 1.35, p.z);
      // Keep the chase camera in front of a wall instead of exposing the inside of a building.
      for (let i = 1; i <= 20; i++) {
        const t = i / 20;
        const point = this.target.clone().lerp(this.eye, t);
        if (
          BUILDINGS.some(
            (b) =>
              Math.abs(point.x - b.x) < b.w / 2 + 0.4 && Math.abs(point.z - b.z) < b.d / 2 + 0.4 && point.y < b.h + 0.4,
          )
        ) {
          this.eye.lerpVectors(this.target, this.eye, Math.max(0.12, t - 0.08));
          break;
        }
      }
      const smoothing =
        this.options.reducedMotion ||
        Math.abs(p.y - this.lastLayer) > 3 ||
        this.camera.position.distanceTo(this.eye) > 45
          ? 1
          : 0.13;
      this.lastLayer = p.y;
      this.camera.position.lerp(this.eye, smoothing);
      this.camera.lookAt(this.target);
      this.camera.fov = p.car ? 60 + Math.min(9, p.moving * 0.3) : 58;
    }
    this.camera.updateProjectionMatrix();
    this.city.update(this.camera.position.x, this.camera.position.z);
  }
  updateLine(l: Line, a: number[], b: number[]): void {
    const pos = l.geometry.attributes.position;
    pos.setXYZ(0, a[0], a[1], a[2]);
    pos.setXYZ(1, b[0], b[1], b[2]);
    pos.needsUpdate = true;
    l.geometry.computeBoundingSphere();
  }
  draw(now: number): void {
    if (this.lastTime) {
      const dt = now - this.lastTime;
      this.frameMs = this.frameMs * 0.94 + dt * 0.06;
      this.fps = 1000 / this.frameMs;
      this.frames++;
      this.totalTime += dt;
    }
    this.lastTime = now;
    this.renderer.render(this.scene, this.camera);
    if (this.frames % 180 === 0 && this.fps < 32 && this.resolution > 0.55) {
      this.resolution = Math.max(0.55, this.resolution - 0.1);
      this.resize();
    }
  }
  stats(): object {
    return {
      frames: this.frames,
      lastFrameAgo: performance.now() - this.lastTime,
      fps: this.fps,
      frameMs: this.frameMs,
      averageFPS: this.frames / (this.totalTime / 1000),
      drawCalls: this.renderer.info.render.drawCalls,
      triangles: this.renderer.info.render.triangles,
      resolution: this.resolution,
      backend: 'WebGPU',
      city: this.city.stats(),
    };
  }
}
