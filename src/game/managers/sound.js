/* =========================================
   SOUND MANAGER (Refactored v32.3)
   ========================================= */
import { gameStore } from "../store.js";

export const SoundManager = {
  ctx: null,
  bgmOsc: [],
  
  // Initialize Audio Context (Must be triggered by user interaction)
  init() {
    if (!this.ctx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioContext();
    }
    if (this.ctx.state === "suspended") {
      this.ctx.resume();
    }
  },
  
  // Get settings from Store
  get volume() {
    return gameStore.state.settings ? gameStore.state.settings.volume : 0.3;
  },

  get isMuted() {
    return gameStore.state.settings ? !gameStore.state.settings.audio : true;
  },
  
  playTone(freq, type, dur, vol = 0.1) {
    if (this.isMuted || !this.ctx) return;
    
    // Master Volume Scaling
    const masterVol = this.volume;
    const finalVol = vol * masterVol;

    const o = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    o.type = type;
    o.frequency.setValueAtTime(freq, this.ctx.currentTime);
    g.gain.setValueAtTime(finalVol, this.ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(
      0.001,
      this.ctx.currentTime + dur
    );
    o.connect(g);
    g.connect(this.ctx.destination);
    o.start();
    o.stop(this.ctx.currentTime + dur);
  },
  
  playBGM() {
    if (this.isMuted) return;
    this.init(); // Ensure context is ready
    
    // Drone
    const drone = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    drone.frequency.value = 55;
    drone.type = "triangle";
    g.gain.value = 0.03 * this.volume;
    drone.connect(g);
    g.connect(this.ctx.destination);
    drone.start();
    this.bgmOsc.push(drone);
    this.scheduleNote();
  },
  
  scheduleNote() {
    if (this.isMuted) return;
    setTimeout(() => {
      if (this.isMuted) return;
      const notes = [220, 261.63, 293.66, 329.63];
      this.playTone(
        notes[Math.floor(Math.random() * notes.length)],
        "sine",
        2.5,
        0.03
      );
      this.scheduleNote();
    }, Math.random() * 4000 + 2000);
  },
  
  stopBGM() {
    this.bgmOsc.forEach((o) => o.stop());
    this.bgmOsc = [];
  },
  
  toggleBGM(shouldPlay) {
      if(shouldPlay) {
          this.playBGM();
      } else {
          this.stopBGM();
      }
  },

  play(t) {
    if (this.isMuted) return;
    this.init(); // Ensure context exists
    
    if (t === "ui") this.playTone(400, "square", 0.05, 0.05);
    if (t === "click") this.playTone(600, "sine", 0.05, 0.05); // New click sound
    if (t === "hit") this.playTone(100, "sawtooth", 0.1, 0.1);
    if (t === "loot") this.playTone(1000, "sine", 0.3, 0.05);
    if (t === "evo") this.playTone(200, "triangle", 1.5, 0.1);
    if (t === "hazard") this.playTone(50, "sawtooth", 0.2, 0.1);
  },
};
