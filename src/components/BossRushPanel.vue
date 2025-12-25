<script setup>
import { gameStore } from "../game/store.js";
const s = gameStore.state;
</script>

<template>
  <div class="boss-rush-panel scanline">
    <h1>BOSS RUSH MODE</h1>
    <div class="rules">
      <p>💀 Defeat 5 Bosses back-to-back</p>
      <p>🩸 Healing is limited</p>
      <p>🎁 Rewards: 500 Gold + 2 Legendary Items</p>
    </div>
    <div class="status">
       <span v-if="s.bossRush && s.bossRush.active">
         Round: {{ (s.bossRush.index || 0) + 1 }} / 5
       </span>
       <span v-else>
         ARE YOU PREPARED?
       </span>
    </div>
  </div>
</template>

<style scoped>
.boss-rush-panel {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 100%;
  color: #fff;
  text-align: center;
  background: rgba(20, 0, 0, 0.9);
}

h1 {
  font-size: 3rem;
  color: var(--c-red);
  text-shadow: 0 0 20px var(--c-red);
  margin-bottom: 20px;
  animation: pulse 2s infinite;
}

.rules {
  font-size: 1.2rem;
  color: #ccc;
  border: 1px solid #500;
  padding: 20px;
  background: rgba(50, 0, 0, 0.3);
  margin-bottom: 30px;
}

.rules p {
    margin: 10px 0;
}

.status {
    font-size: 1.5rem;
    color: var(--c-gold);
    font-weight: bold;
}

@keyframes pulse {
    0% { transform: scale(1); text-shadow: 0 0 10px var(--c-red); }
    50% { transform: scale(1.05); text-shadow: 0 0 30px var(--c-red); }
    100% { transform: scale(1); text-shadow: 0 0 10px var(--c-red); }
}
</style>
