<script setup>
import { computed } from "vue";
import { gameStore } from "../game/store.js";
import { SoundManager } from "../game/managers/sound.js";

const s = gameStore.state;
const settings = computed(() => s.settings || { audio: true, volume: 0.5, crt: true });

const toggleAudio = () => {
    s.settings.audio = !s.settings.audio;
    if(s.settings.audio) SoundManager.playBGM();
    else SoundManager.stopBGM();
    SoundManager.play('click');
};

const updateVolume = (e) => {
    s.settings.volume = parseFloat(e.target.value);
};

const toggleCRT = () => {
    s.settings.crt = !s.settings.crt;
    SoundManager.play('click');
};

const close = () => {
    s.activePanel = "menu-view";
    SoundManager.play('click');
};
</script>

<template>
  <div class="settings-panel">
    <div class="header">
      <h2>SYSTEM SETTINGS</h2>
      <button class="btn-close" @click="close">X</button>
    </div>

    <div class="content">
        <!-- AUDIO SECTION -->
        <div class="section">
            <h3>AUDIO</h3>
            <div class="row">
                <span>Master Audio</span>
                <button :class="['btn-toggle', settings.audio ? 'on' : 'off']" @click="toggleAudio">
                    {{ settings.audio ? "ON" : "OFF" }}
                </button>
            </div>
            
            <div class="row" :style="{ opacity: settings.audio ? 1 : 0.5 }">
                <span>Volume ({{ Math.round(settings.volume * 100) }}%)</span>
                <input type="range" min="0" max="1" step="0.1" :value="settings.volume" @input="updateVolume" :disabled="!settings.audio">
            </div>
        </div>

        <hr>

        <!-- VISUALS SECTION -->
        <div class="section">
            <h3>VISUALS</h3>
            <div class="row">
                <span>CRT Scanlines</span>
                <button :class="['btn-toggle', settings.crt ? 'on' : 'off']" @click="toggleCRT">
                    {{ settings.crt ? "ON" : "OFF" }}
                </button>
            </div>
        </div>

        <hr>

        <div class="footer">
            <small>v32.3 RE:BONE</small>
        </div>
    </div>
  </div>
</template>

<style scoped>
.settings-panel {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: #050505;
  color: #eee;
  font-family: 'Courier New', monospace;
  border: 2px solid #333;
}

.header {
  background: #111;
  padding: 10px;
  display: flex;
  justify-content: space-between;
  border-bottom: 2px solid #333;
}
.header h2 { margin: 0; color: #aaa; }

.content {
  padding: 20px;
  flex: 1;
}

.section { margin-bottom: 20px; }
.section h3 { color: var(--c-gold, #ffd700); border-bottom: 1px solid #333; padding-bottom: 5px; }

.row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 15px 0;
}

.btn-toggle {
    width: 60px;
    padding: 5px;
    border: 1px solid #444;
    cursor: pointer;
    font-weight: bold;
}
.btn-toggle.on { background: #0a0; color: #000; }
.btn-toggle.off { background: #333; color: #888; }

.btn-close {
  background: transparent;
  border: 1px solid #444;
  color: #fff;
  width: 30px;
  cursor: pointer;
}

input[type=range] {
    width: 150px;
}

hr { border-color: #222; }

.footer { text-align: center; color: #444; margin-top: 40px; }
</style>
