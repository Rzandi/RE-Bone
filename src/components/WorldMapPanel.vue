<script setup>
import { computed } from 'vue';

import { gameStore } from '../game/store';
import { Game } from '../game/core/game.js';

const unlockedRealms = computed(() => gameStore.state.world.unlockedRealms);

import { REALMS } from '../game/config/realms.js';

const realms = computed(() => Object.values(REALMS));

const selectRealm = (realm) => {
    // For now, just log or set active
    // console.log("Selected Realm:", realm.name);
    gameStore.log(`You enter the ${realm.name}...`, 'boss');
    
    // Call Game Core
    if (Game) {
        Game.enterRealm(realm.id);
    }
};
</script>

<template>
  <div class="world-map-panel">
    <div class="map-header">
      <h2>🌍 THE CROSSROADS</h2>
      <p>The Void has opened. Choose your target.</p>
    </div>

    <div class="realm-grid">
      <div 
        v-for="r in realms" 
        :key="r.id"
        class="realm-card"
        :style="{ borderColor: r.color }"
        @click="selectRealm(r)"
      >
        <div class="realm-icon">{{ r.icon }}</div>
        <div class="realm-info">
          <h3 :style="{ color: r.color }">{{ r.name }}</h3>
          <p>{{ r.desc }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.world-map-panel {
  display: flex;
  flex-direction: column;
  height: 100%;
  padding: 20px;
  background: rgba(0, 0, 0, 0.95);
  border: 4px double #444;
  color: #fff;
}

.map-header {
  text-align: center;
  margin-bottom: 20px;
  border-bottom: 1px solid #333;
  padding-bottom: 10px;
}

.map-header h2 {
  color: #fff;
  text-shadow: 0 0 10px #fff;
  margin: 0;
}

.realm-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 15px;
  overflow-y: auto;
}

.realm-card {
  display: flex;
  align-items: center;
  padding: 15px;
  border: 2px solid #444;
  background: #111;
  cursor: pointer;
  transition: all 0.2s;
}

.realm-card:hover {
  background: #222;
  transform: translateX(5px);
  box-shadow: 0 0 15px rgba(255, 255, 255, 0.1);
}

.realm-icon {
  font-size: 2.5rem;
  margin-right: 20px;
  width: 50px;
  text-align: center;
}

.realm-info h3 {
  margin: 0 0 5px 0;
  text-transform: uppercase;
  font-size: 1.2rem;
}

.realm-info p {
  margin: 0;
  font-size: 0.9rem;
  color: #888;
  font-style: italic;
}
</style>
