<script setup>
import { computed } from "vue";
import { gameStore } from "../game/store.js";
import { SoundManager } from "../game/managers/sound.js";
import { SaveManager } from "../game/managers/SaveManager.js";

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

const copyToClipboard = (text) => {
    // 1. Try Modern API (HTTPS/Localhost)
    if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(() => {
            alert("Save String Copied to Clipboard!");
            SoundManager.play('click');
        }).catch(err => {
            console.error("Clipboard API Failed:", err);
            fallbackCopy(text);
        });
    } else {
        // 2. Fallback for HTTP/Mobile (Legacy)
        fallbackCopy(text);
    }
};

const fallbackCopy = (text) => {
    try {
        const textArea = document.createElement("textarea");
        textArea.value = text;
        
        // Ensure it's not visible but part of DOM
        textArea.style.position = "fixed";
        textArea.style.left = "-9999px";
        textArea.style.top = "0";
        document.body.appendChild(textArea);
        
        textArea.focus();
        textArea.select();
        
        const successful = document.execCommand('copy');
        document.body.removeChild(textArea);
        
        if (successful) {
            alert("Save String Copied (Legacy Mode)!");
            SoundManager.play('click');
        } else {
            throw new Error("execCommand failed");
        }
    } catch (err) {
        console.error("Fallback Copy Failed:", err);
        prompt("Clipboard blocked. Copy this manually:", text);
    }
};

import { EndlessMode } from "../game/logic/EndlessMode.js";

const exportSave = () => {
    // v38.6: Block Export in Competitive Modes (Endless / Hardcore)
    if (EndlessMode.isActive) {
        alert("🚫 Cannot Export Save during Endless Mode.\nFinish the run or die to export.");
        if(SoundManager) SoundManager.play('error');
        return;
    }
    
    // Check Hardcore
    if (gameStore.state.modifierEffects?.permadeath) {
        alert("🚫 Cannot Export Save in Hardcore Mode.\nDeath is permanent.");
        if(SoundManager) SoundManager.play('error');
        return;
    }

    console.log("exportSave called, SaveManager:", SaveManager ? "exists" : "missing");
    
    if(SaveManager) {
        try {
            console.log("Calling SaveManager.exportSaveString()...");
            const str = SaveManager.exportSaveString();
            console.log("Result:", str ? str.substring(0, 50) + "..." : "null/undefined");
            
            if(str && !str.startsWith("ERROR")) {
                copyToClipboard(str);
            } else {
                // v38.3: Show error if export returned null or error
                alert("Export failed: " + (str || "no data"));
                console.error("exportSaveString returned:", str);
            }
        } catch (e) {
            console.error("Export Error:", e);
            alert("Export failed: " + e.message);
        }
    } else {
        alert("SaveManager not available!");
    }
};

const importSave = () => {
    if(SaveManager) {
        const str = prompt("Paste Save String (Base64):");
        if(str) {
            const success = SaveManager.importSaveString(str);
            if(success) {
                alert("Save Imported Successfully! Reloading...");
                window.location.reload();
            } else {
                alert("Invalid Save Data!");
                SoundManager.play('error');
            }
        }
    }
};

// v38.8: Void Forge Access
import { EventManager } from "../game/logic/EventManager.js";

const openVoidForge = () => {
    if (EventManager && EventManager.triggerVoidForge) {
        EventManager.triggerVoidForge();
        SoundManager.play('event_bad');
    } else {
        alert("Void Forge not available.");
    }
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

        <!-- DATA MANAGEMENT (v36.1) -->
        <div class="section">
            <h3>CLOUD SAVE</h3>
            <div class="row">
                <button class="btn-wide" @click="exportSave">📤 EXPORT TO CLIPBOARD</button>
            </div>
            <div class="row">
                <button class="btn-wide" @click="importSave">📥 IMPORT FROM CLIPBOARD</button>
            </div>
        </div>

        <hr>

        <!-- VOID FORGE (v38.8) -->
        <div class="section" v-if="s.gatekeeper">
            <h3>VOID FORGE</h3>
            <div class="row">
                <span>Limit Break Shards</span>
                <span class="mat-count">{{ s.gatekeeper.limitBreakShards || 0 }} / 4</span>
            </div>
            <div class="row">
                <span>Void Essence</span>
                <span class="mat-count">{{ s.gatekeeper.voidEssence || 0 }} / 1</span>
            </div>
            <div class="row">
                <button class="btn-wide btn-void" @click="openVoidForge" 
                    :disabled="(s.gatekeeper.limitBreakShards || 0) < 4 || (s.gatekeeper.voidEssence || 0) < 1">
                    ⬛ ENTER THE VOID FORGE
                </button>
            </div>
        </div>

        <div class="footer">
            <small>v36.1 RE:BONE</small>
        </div>
    </div>
  </div>
</template>

<style scoped>
.settings-panel {
  display: flex;
  flex-direction: column;
  height: auto;
  max-height: 75dvh; /* Max height to avoid clipping */
  width: 95%;        /* Mobile friendly width */
  max-width: 500px;
  background: #050505;
  color: #eee;
  font-family: 'Courier New', monospace;
  border: 1px solid #333;
  margin: auto;      /* Center it */
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%); /* Start centered */
  z-index: 100;
  box-shadow: 0 0 20px rgba(0,0,0,0.8);
}

.header {
  background: #111;
  padding: 15px;
  display: flex;
  justify-content: space-between;
  border-bottom: 2px solid #333;
}
.header h2 { margin: 0; color: #aaa; }

.content {
  padding: 25px;
  flex: 1;
  overflow-y: auto;
}

.section { margin-bottom: 10px; }
.section h3 { color: var(--c-gold, #ffd700); border-bottom: 1px solid #333; padding-bottom: 5px; }

.row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 5px 0;
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

.btn-wide {
    width: 100%;
    padding: 10px;
    background: #222;
    color: #fff;
    border: 1px solid #444;
    cursor: pointer;
    text-transform: uppercase;
    font-family: inherit;
    transition: all 0.2s;
}
.btn-wide:hover {
    background: #333;
    border-color: #fff;
}

.btn-close {
  background: transparent;
  border: 1px solid #444;
  color: #fff;
  width: 40px;
  cursor: pointer;
}

input[type=range] {
    width: 120px;
}

hr { border-color: #222; }

.footer { text-align: center; color: #444; margin-top: 20px; }
</style>
