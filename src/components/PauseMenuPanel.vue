<script setup>
import { gameStore } from "../game/store.js";

const goToStatus = () => {
  gameStore.state.activePanel = "status";
};

const goToSettings = () => {
  gameStore.state.activePanel = "settings";
};

const goBack = () => {
  // Return to menu-view (main game screen)
  if (window.Game) window.Game.menuState();
};
</script>

<template>
  <div class="pause-menu">
    <div class="pause-content">
      <h2>⏸️ PAUSE MENU</h2>
      
      <div class="menu-buttons">
        <button @click="goToStatus" class="menu-btn">
          👤 CHARACTER STATUS
        </button>
        
        <button @click="goToSettings" class="menu-btn">
          ⚙️ OPTIONS
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


</style>
