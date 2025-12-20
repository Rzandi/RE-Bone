/* =========================================
   SOUND MANAGER
   ========================================= */

const SoundManager = {
  ctx: null,
  on: false,
  bgmOsc: [],
  
  init() {
    if (!this.ctx)
      this.ctx = new (window.AudioContext || window.webkitAudioContext)();
    if (this.ctx.state === "suspended") this.ctx.resume();
  },
  
  toggle() {
    this.on = !this.on;
    document.getElementById("audio-btn").innerText = this.on
      ? "🔊 ON"
      : "🔊 OFF";
    if (this.on) {
      this.init();
      this.playBGM();
    } else this.stopBGM();
  },
  
  playTone(freq, type, dur, vol = 0.1) {
    if (!this.on || !this.ctx) return;
    const o = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    o.type = type;
    o.frequency.setValueAtTime(freq, this.ctx.currentTime);
    g.gain.setValueAtTime(vol, this.ctx.currentTime);
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
    if (!this.on) return;
    const drone = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    drone.frequency.value = 55;
    drone.type = "triangle";
    g.gain.value = 0.03;
    drone.connect(g);
    g.connect(this.ctx.destination);
    drone.start();
    this.bgmOsc.push(drone);
    this.scheduleNote();
  },
  
  scheduleNote() {
    if (!this.on) return;
    setTimeout(() => {
      if (!this.on) return;
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
  
  play(t) {
    if (!this.on) return;
    if (t === "ui") this.playTone(400, "square", 0.05, 0.05);
    if (t === "hit") this.playTone(100, "sawtooth", 0.1, 0.1);
    if (t === "loot") this.playTone(1000, "sine", 0.3, 0.05);
    if (t === "evo") this.playTone(200, "triangle", 1.5, 0.1);
    if (t === "hazard") this.playTone(50, "sawtooth", 0.2, 0.1);
  },
};
