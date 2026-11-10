// Web Audio API Synthesizer for Cricket Scoring Sounds (Zero external asset dependencies)

class CricketSoundEffects {
  private ctx: AudioContext | null = null;
  private soundEnabled: boolean = true;

  constructor() {
    // AudioContext will be initialized on first user interaction
  }

  private initCtx() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public toggleSound(enabled?: boolean) {
    this.soundEnabled = enabled !== undefined ? enabled : !this.soundEnabled;
    return this.soundEnabled;
  }

  public isEnabled(): boolean {
    return this.soundEnabled;
  }

  // Dot Ball Click (Subtle mechanical tick)
  public playDot() {
    if (!this.soundEnabled) return;
    this.initCtx();
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(440, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(120, this.ctx.currentTime + 0.05);

    gain.gain.setValueAtTime(0.2, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.05);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.05);
  }

  // Single / Double Running Beep
  public playSingle() {
    if (!this.soundEnabled) return;
    this.initCtx();
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(520, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(780, this.ctx.currentTime + 0.1);

    gain.gain.setValueAtTime(0.25, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.1);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.1);
  }

  // FOUR Boundary Fanfare (Crisp 2-chord chime)
  public playFour() {
    if (!this.soundEnabled) return;
    this.initCtx();
    if (!this.ctx) return;

    const notes = [523.25, 659.25, 783.99, 1046.50]; // C Major arpeggio
    notes.forEach((freq, idx) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, this.ctx!.currentTime + idx * 0.07);

      gain.gain.setValueAtTime(0, this.ctx!.currentTime + idx * 0.07);
      gain.gain.linearRampToValueAtTime(0.3, this.ctx!.currentTime + idx * 0.07 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.01, this.ctx!.currentTime + idx * 0.07 + 0.25);

      osc.connect(gain);
      gain.connect(this.ctx!.destination);
      osc.start(this.ctx!.currentTime + idx * 0.07);
      osc.stop(this.ctx!.currentTime + idx * 0.07 + 0.25);
    });
  }

  // SIX Maximum Stadium Airhorn / Trumpet Sweep
  public playSix() {
    if (!this.soundEnabled) return;
    this.initCtx();
    if (!this.ctx) return;

    const chords = [
      { freq: 440, time: 0 },
      { freq: 554.37, time: 0.08 },
      { freq: 659.25, time: 0.16 },
      { freq: 880, time: 0.24 },
      { freq: 1108.73, time: 0.32 },
    ];

    chords.forEach(({ freq, time }) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(freq, this.ctx!.currentTime + time);

      gain.gain.setValueAtTime(0.2, this.ctx!.currentTime + time);
      gain.gain.exponentialRampToValueAtTime(0.01, this.ctx!.currentTime + time + 0.4);

      osc.connect(gain);
      gain.connect(this.ctx!.destination);
      osc.start(this.ctx!.currentTime + time);
      osc.stop(this.ctx!.currentTime + time + 0.4);
    });
  }

  // WICKET Down / Stumps Clatter
  public playWicket() {
    if (!this.soundEnabled) return;
    this.initCtx();
    if (!this.ctx) return;

    // Deep low thump
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(150, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(40, this.ctx.currentTime + 0.35);

    gain.gain.setValueAtTime(0.4, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.35);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.35);

    // Followed by high appeal whistle
    setTimeout(() => {
      if (!this.ctx) return;
      const whistle = this.ctx.createOscillator();
      const wGain = this.ctx.createGain();
      whistle.type = 'sine';
      whistle.frequency.setValueAtTime(900, this.ctx.currentTime);
      whistle.frequency.linearRampToValueAtTime(1350, this.ctx.currentTime + 0.2);

      wGain.gain.setValueAtTime(0.2, this.ctx.currentTime);
      wGain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.25);

      whistle.connect(wGain);
      wGain.connect(this.ctx.destination);
      whistle.start();
      whistle.stop(this.ctx.currentTime + 0.25);
    }, 120);
  }
}

export const cricketSound = new CricketSoundEffects();
