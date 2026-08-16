// AuraOS Web Audio Synthesizer and Master Volume System

interface SoundSettings {
  masterVolume: number; // 0 to 100
  isMuted: boolean;
  systemSoundsEnabled: boolean;
}

const SOUND_STORAGE_KEY = 'aura_os_sound_settings_v1';

class SoundService {
  private audioCtx: AudioContext | null = null;
  private settings: SoundSettings = {
    masterVolume: 80,
    isMuted: false,
    systemSoundsEnabled: true,
  };
  private listeners: Array<(settings: SoundSettings) => void> = [];

  constructor() {
    try {
      const saved = localStorage.getItem(SOUND_STORAGE_KEY);
      if (saved) {
        this.settings = { ...this.settings, ...JSON.parse(saved) };
      }
    } catch {
      // Use defaults
    }
  }

  private initAudio() {
    if (!this.audioCtx && typeof window !== 'undefined') {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioContextClass) {
        this.audioCtx = new AudioContextClass();
      }
    }
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
  }

  public getSettings(): SoundSettings {
    return { ...this.settings };
  }

  public getEffectiveVolume(): number {
    if (this.settings.isMuted || !this.settings.systemSoundsEnabled) return 0;
    return Math.max(0, Math.min(1, this.settings.masterVolume / 100));
  }

  public setMasterVolume(volume: number) {
    this.settings.masterVolume = Math.max(0, Math.min(100, volume));
    if (this.settings.masterVolume > 0 && this.settings.isMuted) {
      this.settings.isMuted = false;
    }
    this.saveAndNotify();
  }

  public toggleMute(): boolean {
    this.settings.isMuted = !this.settings.isMuted;
    this.saveAndNotify();
    return this.settings.isMuted;
  }

  public setSystemSoundsEnabled(enabled: boolean) {
    this.settings.systemSoundsEnabled = enabled;
    this.saveAndNotify();
  }

  public subscribe(listener: (settings: SoundSettings) => void) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  private saveAndNotify() {
    try {
      localStorage.setItem(SOUND_STORAGE_KEY, JSON.stringify(this.settings));
    } catch {}
    this.listeners.forEach((fn) => fn(this.getSettings()));
  }

  // Play a soft test chime preview that reflects current master volume
  public playTestChime(customVolume?: number) {
    this.initAudio();
    if (!this.audioCtx) return;

    const vol =
      customVolume !== undefined
        ? Math.max(0, Math.min(1, customVolume / 100))
        : this.getEffectiveVolume();

    if (vol <= 0) return;

    const ctx = this.audioCtx;
    const now = ctx.currentTime;

    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const gain = ctx.createGain();

    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(523.25, now); // C5
    osc1.frequency.exponentialRampToValueAtTime(659.25, now + 0.12); // E5

    osc2.type = 'triangle';
    osc2.frequency.setValueAtTime(659.25, now);
    osc2.frequency.exponentialRampToValueAtTime(783.99, now + 0.12); // G5

    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(0.25 * vol, now + 0.03);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.35);

    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(ctx.destination);

    osc1.start(now);
    osc2.start(now);
    osc1.stop(now + 0.36);
    osc2.stop(now + 0.36);
  }

  // Play notification chime (3-note pleasant chord)
  public playNotificationChime() {
    this.initAudio();
    if (!this.audioCtx) return;

    const vol = this.getEffectiveVolume();
    if (vol <= 0) return;

    const ctx = this.audioCtx;
    const now = ctx.currentTime;

    const notes = [587.33, 739.99, 880.0]; // D5, F#5, A5
    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + idx * 0.07);

      gain.gain.setValueAtTime(0.001, now + idx * 0.07);
      gain.gain.linearRampToValueAtTime(0.2 * vol, now + idx * 0.07 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.07 + 0.32);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + idx * 0.07);
      osc.stop(now + idx * 0.07 + 0.33);
    });
  }

  // Soft UI click
  public playClickSound() {
    this.initAudio();
    if (!this.audioCtx) return;

    const vol = this.getEffectiveVolume();
    if (vol <= 0) return;

    const ctx = this.audioCtx;
    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(900, now);
    osc.frequency.exponentialRampToValueAtTime(400, now + 0.04);

    gain.gain.setValueAtTime(0.08 * vol, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.045);
  }

  // Window Snap / Dock sound
  public playSnapSound() {
    this.initAudio();
    if (!this.audioCtx) return;

    const vol = this.getEffectiveVolume();
    if (vol <= 0) return;

    const ctx = this.audioCtx;
    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(440, now);
    osc.frequency.exponentialRampToValueAtTime(880, now + 0.08);

    gain.gain.setValueAtTime(0.12 * vol, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.09);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.095);
  }
}

export const soundService = new SoundService();
