/* =========================================
   SOUND MANAGER (v37.1 - Enhanced Polish)
   - 25+ sound effects
   - Spam prevention
   - Haptic integration
   ========================================= */
import { gameStore } from "../store.js";
import { MobileHandler } from "./mobile.js";

export const SoundManager = {
  ctx: null,
  bgmOsc: [],
  
  // v37.1: Sound spam prevention
  lastPlayTime: {},      // Track last play time per sound type
  activeSounds: 0,       // Count of currently playing sounds
  maxConcurrentSounds: 10, // Limit concurrent sounds
  debounceMs: 50,        // Minimum ms between same sound
  
  // Initialize Audio Context (Must be triggered by user interaction)
  init() {
    try {
      if (!this.ctx) {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        this.ctx = new AudioContext();
      }
      if (this.ctx.state === "suspended") {
        this.ctx.resume().catch(e => {
            // Expected if no user gesture yet
        });
      }
    } catch (e) {
      console.warn("SoundManager init failed:", e);
      // Fallback: Disable sound for this session?
      this.ctx = null;
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
    if (this.isMuted) return;
    if (!this.ctx) return; // Safety check
    
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
    if (!this.ctx) return;
    
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
    
    // v37.1: Sound spam prevention
    const now = Date.now();
    if (this.lastPlayTime[t] && (now - this.lastPlayTime[t]) < this.debounceMs) {
      return; // Skip if same sound played too recently
    }
    if (this.activeSounds >= this.maxConcurrentSounds) {
      return; // Skip if too many sounds playing
    }
    this.lastPlayTime[t] = now;
    
    this.init(); // Ensure context exists
    if (!this.ctx) return;
    
    // SFX Library
    if (t === "ui") this.playTone(400, "square", 0.05, 0.05);
    if (t === "click") this.playTone(600, "sine", 0.05, 0.05);
    if (t === "hit") this.playTone(100, "sawtooth", 0.1, 0.1);
    if (t === "loot") this.playTone(1000, "sine", 0.3, 0.05);
    if (t === "evo") this.playTone(200, "triangle", 1.5, 0.1);
    if (t === "hazard") this.playTone(50, "sawtooth", 0.2, 0.1);
    
    // v35.3 Polish Sounds
    if (t === "shop_buy") this.playTone(800, "sine", 0.1, 0.1); // Short high blip
    if (t === "sell") this.playTone(600, "square", 0.1, 0.05); // Lower blip
    if (t === "relic") {
        // Magical chime
        let now = this.ctx.currentTime;
        [600, 800, 1000, 1200].forEach((f, i) => { 
            this.playToneAt(f, "sine", 0.3, 0.05, now + i * 0.05);
        });
    }

    // Haptics Integration (v36.1)
    if (MobileHandler) {
        if (t === 'hit') MobileHandler.vibrate(50); // Short
        if (t === 'click') MobileHandler.vibrate(10); // Tiny
        if (t === 'victory') MobileHandler.vibrate([100, 50, 100]);
        if (t === 'hazard') MobileHandler.vibrate(200);
        if (t === 'relic') MobileHandler.vibrate([50, 50, 50]);
    }
    
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

    // v36.3 Event Sounds
    if (t === "event_good") {
        let now = this.ctx.currentTime;
        [523, 659, 783, 1046].forEach((f, i) => { // Major Triad Up
            this.playToneAt(f, "sine", 0.4, 0.05, now + i * 0.08);
        });
    }
    if (t === "event_bad") {
        let now = this.ctx.currentTime;
        // Dissonant Tritone
        this.playToneAt(110, "sawtooth", 0.5, 0.1, now);
        this.playToneAt(155, "sawtooth", 0.5, 0.1, now); // Tritone
    }
    if (t === "event_mystery") {
        let now = this.ctx.currentTime;
        // Mystery Slide
        const o = this.ctx.createOscillator();
        const g = this.ctx.createGain();
        o.type = "sine";
        o.frequency.setValueAtTime(440, now);
        o.frequency.exponentialRampToValueAtTime(880, now + 1); // Slide Up
        g.gain.setValueAtTime(0.05 * this.volume, now);
        g.gain.exponentialRampToValueAtTime(0.001, now + 1);
        o.connect(g);
        g.connect(this.ctx.destination);
        o.start(now);
        o.stop(now + 1);
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

    // ============================================
    // v37.1 POLISH UPDATE - NEW SOUND EFFECTS
    // ============================================

    // UI Sounds
    if (t === "menu_open") {
        // Whoosh sound (rising pitch)
        let now = this.ctx.currentTime;
        const o = this.ctx.createOscillator();
        const g = this.ctx.createGain();
        o.type = "sine";
        o.frequency.setValueAtTime(200, now);
        o.frequency.exponentialRampToValueAtTime(400, now + 0.15);
        g.gain.setValueAtTime(0.05 * this.volume, now);
        g.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
        o.connect(g);
        g.connect(this.ctx.destination);
        o.start(now);
        o.stop(now + 0.2);
    }
    
    if (t === "ui_back") {
        // Low blip for cancel/back
        this.playTone(300, "square", 0.1, 0.05);
    }
    
    if (t === "menu_close") {
        // Whoosh down (falling pitch)
        let now = this.ctx.currentTime;
        const o = this.ctx.createOscillator();
        const g = this.ctx.createGain();
        o.type = "sine";
        o.frequency.setValueAtTime(400, now);
        o.frequency.exponentialRampToValueAtTime(200, now + 0.15);
        g.gain.setValueAtTime(0.05 * this.volume, now);
        g.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
        o.connect(g);
        g.connect(this.ctx.destination);
        o.start(now);
        o.stop(now + 0.2);
    }
    
    if (t === "tab_switch") {
        this.playTone(500, "sine", 0.05, 0.04);
    }
    
    if (t === "button_hover") {
        this.playTone(300, "sine", 0.03, 0.02);
    }
    
    if (t === "error") {
        // Buzz error sound
        let now = this.ctx.currentTime;
        this.playToneAt(150, "square", 0.1, 0.08, now);
        this.playToneAt(100, "square", 0.15, 0.08, now + 0.1);
    }
    
    if (t === "success") {
        // Positive chime
        let now = this.ctx.currentTime;
        this.playToneAt(523, "sine", 0.15, 0.06, now);
        this.playToneAt(659, "sine", 0.2, 0.06, now + 0.1);
    }

    // Combat Sounds
    if (t === "critical_hit") {
        // Dramatic impact with echo
        let now = this.ctx.currentTime;
        this.playToneAt(80, "sawtooth", 0.2, 0.15, now);
        this.playToneAt(150, "square", 0.1, 0.1, now);
        [300, 400, 500].forEach((f, i) => {
            this.playToneAt(f, "sine", 0.1, 0.05, now + i * 0.03);
        });
        if (MobileHandler) MobileHandler.vibrate(100);
    }
    
    if (t === "dodge") {
        // Whoosh miss
        let now = this.ctx.currentTime;
        const o = this.ctx.createOscillator();
        const g = this.ctx.createGain();
        o.type = "sine";
        const filter = this.ctx.createBiquadFilter();
        filter.type = "highpass";
        filter.frequency.value = 500;
        o.frequency.setValueAtTime(600, now);
        o.frequency.exponentialRampToValueAtTime(200, now + 0.2);
        g.gain.setValueAtTime(0.06 * this.volume, now);
        g.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
        o.connect(filter);
        filter.connect(g);
        g.connect(this.ctx.destination);
        o.start(now);
        o.stop(now + 0.25);
    }
    
    if (t === "block") {
        // Shield clang
        let now = this.ctx.currentTime;
        this.playToneAt(200, "square", 0.05, 0.1, now);
        this.playToneAt(400, "triangle", 0.15, 0.08, now + 0.02);
        if (MobileHandler) MobileHandler.vibrate(80);
    }
    
    if (t === "heal") {
        // Magical restore sparkle
        let now = this.ctx.currentTime;
        [800, 1000, 1200, 1400].forEach((f, i) => {
            this.playToneAt(f, "sine", 0.3, 0.04, now + i * 0.08);
        });
    }
    
    if (t === "buff_apply") {
        // Power up rising
        let now = this.ctx.currentTime;
        [400, 500, 600, 800].forEach((f, i) => {
            this.playToneAt(f, "triangle", 0.2, 0.05, now + i * 0.06);
        });
    }
    
    if (t === "debuff_apply") {
        // Negative descending
        let now = this.ctx.currentTime;
        [400, 300, 200, 150].forEach((f, i) => {
            this.playToneAt(f, "sawtooth", 0.2, 0.04, now + i * 0.06);
        });
    }
    
    if (t === "enemy_death") {
        // Death thud + dissolve
        let now = this.ctx.currentTime;
        this.playToneAt(60, "sawtooth", 0.3, 0.12, now);
        this.playToneAt(40, "triangle", 0.5, 0.08, now + 0.1);
    }
    
    if (t === "player_hurt") {
        // Pain grunt equivalent
        let now = this.ctx.currentTime;
        this.playToneAt(150, "sawtooth", 0.1, 0.1, now);
        this.playToneAt(120, "square", 0.15, 0.08, now + 0.05);
        if (MobileHandler) MobileHandler.vibrate([50, 30, 50]);
    }

    // Economy Sounds
    if (t === "gold_gain") {
        // Coin jingle
        let now = this.ctx.currentTime;
        [1200, 1400, 1600].forEach((f, i) => {
            this.playToneAt(f, "sine", 0.1, 0.04, now + i * 0.05);
        });
    }
    
    if (t === "gold_spend") {
        // Coin drop
        let now = this.ctx.currentTime;
        [1000, 800, 600].forEach((f, i) => {
            this.playToneAt(f, "sine", 0.1, 0.04, now + i * 0.04);
        });
    }
    
    if (t === "item_equip") {
        // Armor/weapon equip clunk
        let now = this.ctx.currentTime;
        this.playToneAt(200, "square", 0.08, 0.08, now);
        this.playToneAt(350, "triangle", 0.12, 0.06, now + 0.03);
    }
    
    if (t === "gem_socket") {
        // Crystal insert sparkle
        let now = this.ctx.currentTime;
        [1500, 1800, 2000, 2200].forEach((f, i) => {
            this.playToneAt(f, "sine", 0.2, 0.03, now + i * 0.04);
        });
        this.playToneAt(400, "triangle", 0.3, 0.05, now);
    }
    
    if (t === "reforge") {
        // Anvil hammer hit
        let now = this.ctx.currentTime;
        this.playToneAt(100, "sawtooth", 0.15, 0.12, now);
        this.playToneAt(80, "square", 0.2, 0.1, now + 0.05);
        this.playToneAt(300, "triangle", 0.1, 0.06, now + 0.08);
        if (MobileHandler) MobileHandler.vibrate([100, 50, 100]);
    }

    // Black Market Sounds
    if (t === "curse_apply") {
        // Dark magic whoosh
        let now = this.ctx.currentTime;
        const o = this.ctx.createOscillator();
        const g = this.ctx.createGain();
        o.type = "sawtooth";
        o.frequency.setValueAtTime(300, now);
        o.frequency.exponentialRampToValueAtTime(50, now + 0.5);
        g.gain.setValueAtTime(0.08 * this.volume, now);
        g.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
        o.connect(g);
        g.connect(this.ctx.destination);
        o.start(now);
        o.stop(now + 0.5);
        // Whisper echo
        this.playToneAt(150, "sine", 0.4, 0.03, now + 0.2);
    }
    
    if (t === "mystery_box") {
        // Box shake/rattle
        let now = this.ctx.currentTime;
        for (let i = 0; i < 6; i++) {
            this.playToneAt(200 + Math.random() * 100, "square", 0.05, 0.04, now + i * 0.08);
        }
    }
    
    if (t === "box_open") {
        // Dramatic reveal
        let now = this.ctx.currentTime;
        this.playToneAt(200, "triangle", 0.2, 0.08, now);
        [400, 600, 800, 1000, 1200].forEach((f, i) => {
            this.playToneAt(f, "sine", 0.3, 0.05, now + 0.15 + i * 0.05);
        });
    }
    
    if (t === "rare_loot") {
        // Epic fanfare
        let now = this.ctx.currentTime;
        const fanfare = [523, 659, 783, 1046, 1318];
        fanfare.forEach((f, i) => {
            this.playToneAt(f, "triangle", 0.4, 0.07, now + i * 0.1);
        });
        if (MobileHandler) MobileHandler.vibrate([50, 50, 50, 50, 150]);
    }

    // Notification Sounds
    if (t === "achievement") {
        // Trophy unlock fanfare
        let now = this.ctx.currentTime;
        [659, 783, 880, 1046].forEach((f, i) => {
            this.playToneAt(f, "sine", 0.25, 0.06, now + i * 0.12);
        });
        this.playToneAt(1318, "triangle", 0.5, 0.08, now + 0.5);
        if (MobileHandler) MobileHandler.vibrate([100, 50, 100]);
    }
    
    if (t === "warning") {
        // Alert beep
        let now = this.ctx.currentTime;
        this.playToneAt(800, "square", 0.1, 0.08, now);
        this.playToneAt(800, "square", 0.1, 0.08, now + 0.15);
    }
    
    if (t === "floor_clear") {
        // Floor completion chime
        let now = this.ctx.currentTime;
        [523, 659, 783, 1046].forEach((f, i) => {
            this.playToneAt(f, "sine", 0.3, 0.05, now + i * 0.1);
        });
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
      if (!this.ctx) return; // Safety check
      
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
