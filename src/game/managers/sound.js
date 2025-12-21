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
    
    // SFX Library
    if (t === "ui") this.playTone(400, "square", 0.05, 0.05);
    if (t === "click") this.playTone(600, "sine", 0.05, 0.05);
    if (t === "hit") this.playTone(100, "sawtooth", 0.1, 0.1);
    if (t === "loot") this.playTone(1000, "sine", 0.3, 0.05);
    if (t === "evo") this.playTone(200, "triangle", 1.5, 0.1);
    if (t === "hazard") this.playTone(50, "sawtooth", 0.2, 0.1);
    
    // Complex Sounds
    if (t === "level_up") {
        // Arpeggio
        let now = this.ctx.currentTime;
        [440, 554, 659, 880].forEach((f, i) => { // A Major
            this.playToneAt(f, "triangle", 0.2, 0.1, now + i * 0.1);
        });
    }
    
    if (t === "victory") {
        let now = this.ctx.currentTime;
        [523, 523, 523, 659, 783].forEach((f, i) => { // C C C E G
             let t = (i < 3) ? 0.1 : 0.4;
             let dur = (i < 3) ? 0.1 : 0.3;
             this.playToneAt(f, "square", dur, 0.1, now + i * 0.15);
        });
    }

    if (t === "ascend") {
        let now = this.ctx.currentTime;
        // Deep Rumble Sweep
        const o = this.ctx.createOscillator();
        const g = this.ctx.createGain();
        o.type = "sawtooth";
        o.frequency.setValueAtTime(50, now);
        o.frequency.exponentialRampToValueAtTime(10, now + 3);
        g.gain.setValueAtTime(0.2 * this.volume, now);
        g.gain.exponentialRampToValueAtTime(0.001, now + 3);
        o.connect(g);
        g.connect(this.ctx.destination);
        o.start();
        o.stop(now + 3);
    }
  },

  // Helper for scheduled tones
  playToneAt(freq, type, dur, vol, time) {
    const masterVol = this.volume;
    const finalVol = vol * masterVol;
    const o = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    o.type = type;
    o.frequency.setValueAtTime(freq, time);
    g.gain.setValueAtTime(finalVol, time);
    g.gain.exponentialRampToValueAtTime(0.001, time + dur);
    o.connect(g);
    g.connect(this.ctx.destination);
    o.start(time);
    o.stop(time + dur);
  },

  playAmbience(realmId) {
      if (this.isMuted) return;
      this.init();
      
      // Stop old BGM
      this.stopBGM();
      
      // Select base freq based on Realm
      // Nature = Low, Shadow = Weird, Light = High
      let baseFreq = 50;
      let type = 'sine';
      
      if(realmId === 'nature_den') { baseFreq = 55; type = 'triangle'; } // Low warm
      if(realmId === 'shadow_guild') { baseFreq = 40; type = 'sawtooth'; } // Low gritty
      if(realmId === 'light_castle') { baseFreq = 110; type = 'sine'; } // Ethereal
      if(realmId === 'arcane_tower') { baseFreq = 220; type = 'square'; } // Digital/Magic??
      if(realmId === 'iron_fort') { baseFreq = 30; type = 'square'; } // Industrial
      
      // Create a drone loop
      const drone = this.ctx.createOscillator();
      const g = this.ctx.createGain();
      
      drone.frequency.value = baseFreq;
      drone.type = type;
      
      // LFO for movement
      const lfo = this.ctx.createOscillator();
      lfo.frequency.value = 0.1; // Slow pulse
      const lfoGain = this.ctx.createGain();
      lfoGain.gain.value = 5; 
      lfo.connect(lfoGain);
      lfoGain.connect(drone.frequency);
      
      g.gain.value = 0.05 * this.volume;
      
      // Filter for atmosphere
      const filter = this.ctx.createBiquadFilter();
      filter.type = "lowpass";
      filter.frequency.value = 200;
      
      drone.connect(filter);
      filter.connect(g);
      g.connect(this.ctx.destination);
      
      drone.start();
      lfo.start();
      
      this.bgmOsc.push(drone);
      this.bgmOsc.push(lfo); 
  },
};
