<script setup>
import { computed } from "vue";
import { gameStore } from "../game/store.js";
import { Game } from "../game/core/game.js";
import { SaveManager } from "../game/managers/SaveManager.js";
import { EndlessMode } from "../game/logic/EndlessMode.js";

const goToStatus = () => {
  gameStore.state.activePanel = "status";
};

const goToSettings = () => {
  gameStore.state.activePanel = "settings";
};

const saveGame = () => {
  if (EndlessMode.isActive) {
      alert("⚠️ SAVE DISABLED IN ENDLESS MODE!\nFind a Sanctuary node or Checkpoint (Every 50 floors) to save.");
      return;
  }
  if (SaveManager) {
    SaveManager.saveGame();
  }
};

const goBack = () => {
  // Return to menu-view (main game screen)
  if (Game) Game.menuState();
};

const runTimeFormatted = computed(() => {
  const s = gameStore.state.runTime || 0;
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
});

</script>

<template>
  <div class="pause-menu">
    <div class="pause-content">
      <h2>⏸️ PAUSE MENU</h2>
      
      <div class="run-time">
        ⏱️ Time: {{ runTimeFormatted }}
      </div>

      <div class="menu-buttons">
        <button @click="goToStatus" class="menu-btn">
          👤 CHARACTER STATUS
        </button>
        
        <button @click="goToSettings" class="menu-btn">
          ⚙️ OPTIONS
        </button>

        <button @click="saveGame" class="menu-btn save-btn">
          💾 SAVE GAME
        </button>
        
        <button @click="goBack" class="menu-btn back-btn">
          🔙 BACK TO GAME
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.pause-menu {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100dvh;
  background: rgba(0, 0, 0, 0.9);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 100;
}

.pause-content {
  background: #111;
  border: 2px solid var(--c-border);
  border-radius: 8px;
  padding: 30px;
  max-width: 500px;
  width: 90%;
  box-shadow: 0 0 20px rgba(255, 255, 255, 0.1);
}

h2 {
  text-align: center;
  color: var(--c-gold);
  margin: 0 0 30px 0;
  font-size: 1.8rem;
  text-shadow: 0 0 10px rgba(255, 215, 0, 0.5);
}

.run-time {
  text-align: center;
  color: #0bd; /* Cyan glow */
  font-family: 'Courier New', Courier, monospace;
  font-size: 1.5rem;
  font-weight: bold;
  margin-bottom: 20px;
  background: #000;
  border: 2px solid #333;
  padding: 10px;
  border-radius: 6px;
  box-shadow: inset 0 0 10px rgba(0, 187, 221, 0.2);
  text-shadow: 0 0 5px rgba(0, 187, 221, 0.5);
}

.menu-buttons {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.menu-btn {
  background: linear-gradient(to bottom, #333, #222);
  border: 2px solid var(--c-border);
  color: var(--c-text);
  font-family: inherit;
  font-size: 1.2rem;
  font-weight: bold;
  padding: 20px;
  cursor: pointer;
  border-radius: 6px;
  transition: all 0.2s;
  text-align: center;
  box-shadow: 0 4px 0 #000;
}

.menu-btn:hover {
  background: linear-gradient(to bottom, #444, #333);
  border-color: var(--c-gold);
  transform: translateY(-2px);
  box-shadow: 0 6px 0 #000;
}

.menu-btn:active {
  transform: translateY(4px);
  box-shadow: 0 0 0 #000;
}

.back-btn {
  background: linear-gradient(to bottom, #1a4d1a, #0d260d);
  border-color: var(--c-green);
  color: var(--c-green);
  margin-top: 10px;
}

.back-btn:hover {
  background: linear-gradient(to bottom, #2a5d2a, #1d361d);
}

.save-btn {
  border-color: var(--c-blue);
  color: var(--c-blue);
}

.save-btn:hover {
  background: linear-gradient(to bottom, #1a3a5a, #0d1a2d);
  box-shadow: 0 0 10px rgba(77, 136, 255, 0.4);
}


</style>
