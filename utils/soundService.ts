import { SoundType } from '../types';

class SoundService {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;

  constructor() {
    // Initialize on user interaction usually, handling loosely here
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      this.ctx = new AudioContextClass();
      this.masterGain = this.ctx.createGain();
      this.masterGain.connect(this.ctx.destination);
      this.masterGain.gain.value = 0.3; // Default volume
    } catch (e) {
      console.warn('Web Audio API not supported');
    }
  }

  public async resume() {
    if (this.ctx?.state === 'suspended') {
      await this.ctx.resume();
    }
  }

  public play(type: SoundType) {
    if (!this.ctx || !this.masterGain) return;
    this.resume();

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    
    osc.connect(gain);
    gain.connect(this.masterGain);

    const now = this.ctx.currentTime;

    switch (type) {
      case SoundType.ROAR:
        // Deep monster roar: Sawtooth wave dropping in pitch
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(150, now);
        osc.frequency.exponentialRampToValueAtTime(40, now + 1.5);
        
        // Rumble effect (LFO)
        const lfo = this.ctx.createOscillator();
        lfo.frequency.value = 30; // 30Hz rumble
        const lfoGain = this.ctx.createGain();
        lfoGain.gain.value = 500;
        lfo.connect(lfoGain);
        lfoGain.connect(osc.frequency);
        lfo.start();
        lfo.stop(now + 1.5);

        gain.gain.setValueAtTime(0, now);
        gain.gain.linearRampToValueAtTime(1, now + 0.1);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 1.5);
        
        osc.start(now);
        osc.stop(now + 1.5);
        break;

      case SoundType.SONAR:
        // High ping
        osc.type = 'sine';
        osc.frequency.setValueAtTime(800, now);
        osc.frequency.exponentialRampToValueAtTime(1200, now + 0.1);
        
        gain.gain.setValueAtTime(0, now);
        gain.gain.linearRampToValueAtTime(0.5, now + 0.05);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 1.5);
        
        osc.start(now);
        osc.stop(now + 1.5);
        break;

      case SoundType.EAT:
        // Quick low crunch
        osc.type = 'square';
        osc.frequency.setValueAtTime(100, now);
        osc.frequency.exponentialRampToValueAtTime(20, now + 0.1);
        
        gain.gain.setValueAtTime(0.5, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
        
        osc.start(now);
        osc.stop(now + 0.1);
        break;
    }
  }
}

export const soundService = new SoundService();