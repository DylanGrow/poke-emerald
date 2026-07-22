// Web Audio API Retro 8-Bit Synthesizer

class RetroSynth {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;
  private bgmPlaying: boolean = false;
  private bgmTimer: ReturnType<typeof setTimeout> | null = null;
  private bgmNodes: { osc: OscillatorNode; gain: GainNode }[] = [];

  private initCtx() {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  toggleMute() {
    this.isMuted = !this.isMuted;
    return this.isMuted;
  }

  setMuteState(muted: boolean) {
    this.isMuted = muted;
  }

  getMuteStatus() {
    return this.isMuted;
  }

  private playTone(freq: number, type: OscillatorType, duration: number, volume: number = 0.1, delay: number = 0) {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gainNode = this.ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, this.ctx.currentTime + delay);

    gainNode.gain.setValueAtTime(volume, this.ctx.currentTime + delay);
    // Exponential decay
    gainNode.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + delay + duration);

    osc.connect(gainNode);
    gainNode.connect(this.ctx.destination);

    osc.start(this.ctx.currentTime + delay);
    osc.stop(this.ctx.currentTime + delay + duration);
  }

  playSelect() {
    this.playTone(880, 'square', 0.08, 0.05);
    setTimeout(() => this.playTone(1320, 'square', 0.08, 0.05), 80);
  }

  playHit() {
    // Noise/explosion simulation using saw and rapid pitch drop
    this.playTone(220, 'sawtooth', 0.15, 0.15);
    this.playTone(110, 'triangle', 0.25, 0.20);
  }

  playEncounter() {
    // Classic retro battle transition siren
    const duration = 0.08;
    for (let i = 0; i < 6; i++) {
      const delay = i * 0.07;
      const freq = 400 + i * 150;
      this.playTone(freq, 'sawtooth', duration, 0.05, delay);
    }
  }

  playLevelUp() {
    // Fanfare
    const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
    notes.forEach((freq, index) => {
      this.playTone(freq, 'square', 0.2, 0.06, index * 0.12);
    });
  }

  playVictory() {
    // Longer celebration fanfare
    const melody = [
      { f: 587.33, d: 0.1 }, // D5
      { f: 659.25, d: 0.1 }, // E5
      { f: 698.46, d: 0.1 }, // F5
      { f: 783.99, d: 0.15 }, // G5
      { f: 0, d: 0.05 },      // Pause
      { f: 783.99, d: 0.1 }, // G5
      { f: 880.00, d: 0.1 }, // A5
      { f: 987.77, d: 0.1 }, // B5
      { f: 1046.50, d: 0.3 }  // C6
    ];
    let time = 0;
    melody.forEach(note => {
      if (note.f > 0) {
        this.playTone(note.f, 'square', note.d * 1.5, 0.06, time);
      }
      time += note.d;
    });
  }

  playDefeated() {
    // Melancholy descending minor tones
    const notes = [392.00, 349.23, 311.13, 261.63]; // G4, F4, Eb4, C4
    notes.forEach((freq, index) => {
      this.playTone(freq, 'triangle', 0.35, 0.1, index * 0.25);
    });
  }

  playCatchSuccess() {
    this.playTone(659.25, 'triangle', 0.1, 0.05);
    this.playTone(880.00, 'square', 0.1, 0.05, 0.1);
    this.playTone(1320.00, 'sine', 0.3, 0.07, 0.2);
  }

  playEvolution() {
    // Evolving sounds: rising pitch tones repeating rapidly
    const duration = 0.15;
    for (let i = 0; i < 20; i++) {
      const delay = i * 0.18;
      const freq = 330 + (i % 4) * 110 + Math.floor(i / 4) * 50;
      this.playTone(freq, 'square', duration, 0.04, delay);
    }
  }

  playEvolutionComplete() {
    // Joyous retro evolve fanfare
    const notes = [523.25, 587.33, 659.25, 698.46, 783.99, 880.00, 987.77, 1046.50, 1318.51];
    notes.forEach((freq, idx) => {
      this.playTone(freq, 'square', 0.25, 0.05, idx * 0.06);
    });
  }

  playCatchShake() {
    this.playTone(180, 'sine', 0.08, 0.08);
  }

  // --- Background Music (BGM) ---
  // 4-bar chiptune loop: square melody + triangle bass
  // Tempo: 140 BPM → beat = 60/140 ≈ 0.4286s, bar ≈ 1.714s, 4 bars ≈ 6.857s

  playBGM() {
    if (this.bgmPlaying || this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;
    this.bgmPlaying = true;
    this.scheduleBGMLoop();
  }

  stopBGM() {
    this.bgmPlaying = false;
    if (this.bgmTimer !== null) {
      clearTimeout(this.bgmTimer);
      this.bgmTimer = null;
    }
    // Stop all active BGM oscillators
    this.bgmNodes.forEach(({ osc, gain }) => {
      try {
        gain.gain.cancelScheduledValues(0);
        gain.gain.setValueAtTime(0, 0);
        osc.stop(0);
      } catch (_) { /* already stopped */ }
    });
    this.bgmNodes = [];
  }

  private scheduleBGMLoop() {
    if (!this.bgmPlaying || this.isMuted || !this.ctx) {
      this.bgmPlaying = false;
      return;
    }

    const bpm = 140;
    const beat = 60 / bpm; // ~0.4286s
    const sixteenth = beat / 4;

    // Melody: catchy pentatonic-ish C major loop (square wave)
    // Each entry: [frequency, duration in beats, start beat offset]
    // 4 bars = 16 beats
    const melodyNotes: [number, number, number][] = [
      // Bar 1: upward arpeggio motif
      [523.25, 0.5, 0],    // C5
      [587.33, 0.5, 0.5],  // D5
      [659.25, 0.75, 1],   // E5
      [783.99, 0.75, 1.75],// G5
      [659.25, 0.5, 2.5],  // E5
      [523.25, 0.5, 3],    // C5
      [587.33, 1.0, 3.5],  // D5
      // Bar 2: playful call-response
      [783.99, 0.5, 4],    // G5
      [880.00, 0.5, 4.5],  // A5
      [783.99, 0.5, 5],    // G5
      [659.25, 0.75, 5.5], // E5
      [587.33, 0.75, 6.25],// D5
      [523.25, 1.0, 7],    // C5
      // Bar 3: variation climbing
      [587.33, 0.5, 8],    // D5
      [659.25, 0.5, 8.5],  // E5
      [783.99, 0.5, 9],    // G5
      [880.00, 0.75, 9.5], // A5
      [1046.50, 0.75, 10.25], // C6
      [880.00, 0.5, 11],   // A5
      [783.99, 0.5, 11.5], // G5
      // Bar 4: resolve downward
      [880.00, 0.5, 12],   // A5
      [783.99, 0.5, 12.5], // G5
      [659.25, 0.75, 13],  // E5
      [587.33, 0.75, 13.75], // D5
      [523.25, 1.5, 14.5], // C5 (held)
    ];

    // Bass line: root notes (triangle wave), one per beat or half-bar
    const bassNotes: [number, number, number][] = [
      // Bar 1: C
      [130.81, 1.5, 0],   // C3
      [130.81, 1.5, 2],   // C3
      // Bar 2: G → C
      [196.00, 1.5, 4],   // G3
      [130.81, 1.5, 6],   // C3
      // Bar 3: Am → F
      [110.00, 1.5, 8],   // A2
      [174.61, 1.5, 10],  // F3
      // Bar 4: G → C
      [196.00, 1.5, 12],  // G3
      [130.81, 2.0, 14],  // C3 (held)
    ];

    const now = this.ctx.currentTime;
    const loopDuration = 16 * beat;

    // Schedule melody
    melodyNotes.forEach(([freq, dur, startBeat]) => {
      this.scheduleBGMNote(freq, 'square', dur * beat * 0.9, 0.035, now + startBeat * beat);
    });

    // Schedule bass
    bassNotes.forEach(([freq, dur, startBeat]) => {
      this.scheduleBGMNote(freq, 'triangle', dur * beat * 0.85, 0.045, now + startBeat * beat);
    });

    // Schedule hi-hat-like clicks on 8th notes for rhythm
    for (let i = 0; i < 32; i++) {
      const t = now + i * (beat / 2);
      const vol = i % 2 === 0 ? 0.012 : 0.006;
      this.scheduleBGMNote(8000 + Math.random() * 2000, 'square', sixteenth * 0.3, vol, t);
    }

    // Schedule next loop
    this.bgmTimer = setTimeout(() => {
      this.scheduleBGMLoop();
    }, loopDuration * 1000 - 50); // slight overlap to avoid gaps
  }

  private scheduleBGMNote(freq: number, type: OscillatorType, duration: number, volume: number, startTime: number) {
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, startTime);

    gain.gain.setValueAtTime(0.0001, startTime);
    // Quick attack
    gain.gain.linearRampToValueAtTime(volume, startTime + 0.01);
    // Sustain then decay
    gain.gain.setValueAtTime(volume, startTime + duration * 0.6);
    gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(startTime);
    osc.stop(startTime + duration + 0.05);

    const nodeRef = { osc, gain };
    this.bgmNodes.push(nodeRef);

    // Auto-cleanup after note finishes
    osc.onended = () => {
      const idx = this.bgmNodes.indexOf(nodeRef);
      if (idx !== -1) this.bgmNodes.splice(idx, 1);
    };
  }
}

export const sound = new RetroSynth();
export default sound;

