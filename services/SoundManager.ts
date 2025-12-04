
// A simple synthesizer to avoid external asset dependencies for the demo.
class SoundSynthesizer {
    private ctx: AudioContext | null = null;
    private masterGain: GainNode | null = null;
    private volume: number = 0.3; // Default volume
  
    constructor() {
      // Load saved volume
      const savedVol = localStorage.getItem('neonSlots_volume');
      if (savedVol !== null) {
        this.volume = parseFloat(savedVol);
      }
    }
  
    private init() {
      if (!this.ctx) {
        this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
        this.masterGain = this.ctx.createGain();
        this.masterGain.connect(this.ctx.destination);
        this.masterGain.gain.value = this.volume;
      }
      if (this.ctx.state === 'suspended') {
        this.ctx.resume();
      }
    }

    public setVolume(val: number) {
        this.volume = Math.max(0, Math.min(1, val));
        if (this.masterGain && this.ctx) {
            // Smooth transition
            this.masterGain.gain.cancelScheduledValues(this.ctx.currentTime);
            this.masterGain.gain.setValueAtTime(this.volume, this.ctx.currentTime);
        }
        localStorage.setItem('neonSlots_volume', this.volume.toString());
        
        // If setting volume, ensure context is running so they can hear it
        if (val > 0) this.init();
    }

    public getVolume(): number {
        return this.volume;
    }
  
    public playTone(freq: number, type: OscillatorType, duration: number, startTime: number = 0) {
      this.init();
      if (!this.ctx || !this.masterGain) return;
  
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
  
      osc.type = type;
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime + startTime);
  
      gain.gain.setValueAtTime(0.1, this.ctx.currentTime + startTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + startTime + duration);
  
      osc.connect(gain);
      gain.connect(this.masterGain);
  
      osc.start(this.ctx.currentTime + startTime);
      osc.stop(this.ctx.currentTime + startTime + duration);
    }
  
    public playSpinSound() {
      // Low motor hum
      this.playTone(100, 'sawtooth', 0.1);
    }
  
    public playReelStop() {
      // Mechanical clunk
      this.playTone(150, 'square', 0.05);
      this.playTone(80, 'sine', 0.1);
    }
  
    public playWin(amount: 'small' | 'medium' | 'big') {
      const now = 0;
      if (amount === 'small') {
        this.playTone(523.25, 'sine', 0.2, now); // C5
        this.playTone(659.25, 'sine', 0.2, now + 0.1); // E5
      } else if (amount === 'medium') {
        this.playTone(523.25, 'triangle', 0.1, now);
        this.playTone(659.25, 'triangle', 0.1, now + 0.1);
        this.playTone(783.99, 'triangle', 0.4, now + 0.2); // G5
      } else {
        // Jackpot fanfare
        [0, 0.1, 0.2, 0.4, 0.5, 0.6].forEach((t, i) => {
           this.playTone(523.25 + (i * 50), 'sawtooth', 0.3, now + t);
        });
      }
    }

    public playTestSound() {
        this.playTone(440, 'sine', 0.1);
    }
  }
  
  export const soundManager = new SoundSynthesizer();
