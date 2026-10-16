/** @file Original procedural synth soundtrack and vehicle/combat sound; gesture-unlocked, with mute and bus gain. */
export class Soundtrack {
  context: AudioContext | null = null;
  master: GainNode | null = null;
  engine: OscillatorNode | null = null;
  engineGain: GainNode | null = null;
  started = false;
  volume = 0.65;
  music = true;
  nextBeat = 0;
  beat = 0;
  async unlock(): Promise<void> {
    if (!this.context) {
      this.context = new AudioContext();
      this.master = this.context.createGain();
      this.master.gain.value = this.volume * 0.23;
      this.master.connect(this.context.destination);
      this.engine = this.context.createOscillator();
      this.engine.type = 'sawtooth';
      this.engineGain = this.context.createGain();
      this.engineGain.gain.value = 0;
      const filter = this.context.createBiquadFilter();
      filter.frequency.value = 350;
      this.engine.connect(filter);
      filter.connect(this.engineGain);
      this.engineGain.connect(this.master);
      this.engine.start();
    }
    if (this.context.state === 'suspended') await this.context.resume();
    this.started = true;
  }
  configure(volume: number, music: boolean): void {
    this.volume = volume;
    this.music = music;
    if (this.master) this.master.gain.setTargetAtTime(volume * 0.23, this.context!.currentTime, 0.1);
  }
  note(freq: number, time: number, length: number, gain: number, wave: OscillatorType = 'sine'): void {
    const c = this.context,
      m = this.master;
    if (!c || !m) return;
    const o = c.createOscillator(),
      g = c.createGain();
    o.type = wave;
    o.frequency.value = freq;
    g.gain.setValueAtTime(0, time);
    g.gain.linearRampToValueAtTime(gain, time + 0.008);
    g.gain.exponentialRampToValueAtTime(0.001, time + length);
    o.connect(g);
    g.connect(m);
    o.start(time);
    o.stop(time + length + 0.03);
    o.onended = () => {
      o.disconnect();
      g.disconnect();
    };
  }
  sfx(kind: string): void {
    const c = this.context;
    if (!c) return;
    const t = c.currentTime;
    if (kind === 'shot') {
      this.note(95, t, 0.08, 0.8, 'sawtooth');
      this.note(1700, t, 0.035, 0.2, 'square');
    } else if (kind === 'hurt' || kind === 'crash') {
      this.note(52, t, 0.2, 1, 'sawtooth');
    } else if (kind === 'checkpoint' || kind === 'pickup' || kind === 'won') {
      [440, 554, 659, 880].forEach((f, i) => this.note(f, t + i * 0.09, 0.3, 0.4, 'triangle'));
    } else this.note(660, t, 0.07, 0.2, 'triangle');
  }
  update(speed: number, driving: boolean, heat: number, paused: boolean): void {
    const c = this.context;
    if (!c || !this.started) return;
    const t = c.currentTime;
    this.engine?.frequency.setTargetAtTime(38 + Math.abs(speed) * 4, t, 0.1);
    this.engineGain?.gain.setTargetAtTime(driving && !paused ? 0.16 : 0, t, 0.1);
    if (paused || !this.music) {
      this.nextBeat = t + 0.1;
      return;
    }
    if (this.nextBeat < t) this.nextBeat = t + 0.03;
    while (this.nextBeat < t + 0.12) {
      const b = this.beat++,
        at = this.nextBeat;
      const chord = [0, 0, -3, -5][Math.floor(b / 32) % 4];
      const base = 110 * Math.pow(2, chord / 12);
      if (b % 4 === 0) {
        this.note(55, at, 0.13, 0.6);
        this.note(base / 2, at, 0.28, 0.5, 'sawtooth');
      }
      if (b % 8 === 4) this.note(170, at, 0.09, 0.28, 'square');
      const notes = [0, 7, 12, 7, 15, 12, 7, 3];
      this.note(base * Math.pow(2, notes[b % 8] / 12), at, 0.22, 0.12, 'triangle');
      if (heat > 0 && b % 2 === 0) this.note(base * 4, at, 0.07, 0.08, 'square');
      this.nextBeat += 60 / 108 / 4;
    }
  }
}
