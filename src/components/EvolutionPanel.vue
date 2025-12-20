<script setup>
import { computed } from "vue";
import { gameStore } from "../game/store.js";
import { DB } from "../game/config/database.js";

const s = gameStore.state;

// We expect gameStore.state.evolutionOptions to be populated by Player.js
// It should be an array of IDs or Objects
const options = computed(() => s.evolutionOptions || []);

const selectOption = (opt) => {
  if (window.PlayerLogic) {
    PlayerLogic.selectEvolution(opt.id);
  }
};
</script>

<template>
  <div class="evolution-overlay scanline">
    <div class="panel-content">
      <h1>EVOLUTION AVAILABLE</h1>
      <p>Choose your path...</p>

      <div class="options-container">
        <div
          v-for="opt in options"
          :key="opt.id"
          class="evo-card"
          @click="selectOption(opt)"
        >
          <div class="evo-icon" v-html="opt.sprite || '✨'"></div>
          <h3>{{ opt.name }}</h3>
          <p>{{ opt.desc }}</p>

          <div class="stats" v-if="opt.stats">
            <span v-if="opt.stats.str">STR+{{ opt.stats.str }}</span>
            <span v-if="opt.stats.vit">VIT+{{ opt.stats.vit }}</span>
            <span v-if="opt.stats.int">INT+{{ opt.stats.int }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.evolution-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.9);
  z-index: 999;
  display: flex;
  justify-content: center;
  align-items: center;
}

.panel-content {
  text-align: center;
  width: 90%;
  max-width: 800px;
}

h1 {
  color: var(--c-gold);
  font-size: 2.5rem;
  letter-spacing: 5px;
  margin-bottom: 0px;
  text-shadow: 0 0 10px var(--c-gold);
  animation: pulse 2s infinite;
}
p {
  color: #888;
  font-style: italic;
  margin-bottom: 30px;
}

.options-container {
  display: flex;
  justify-content: center;
  gap: 20px;
  flex-wrap: wrap;
}

.evo-card {
  background: #111;
  border: 2px solid #444;
  padding: 20px;
  width: 200px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  position: relative;
  overflow: hidden;
}

.evo-card:hover {
  border-color: var(--c-gold);
  transform: translateY(-5px);
  background: #222;
  box-shadow: 0 0 20px rgba(255, 215, 0, 0.2);
}

.evo-icon {
  font-size: 4rem;
  margin-bottom: 10px;
}

.evo-card h3 {
  color: #fff;
  margin: 10px 0;
  font-size: 1.2rem;
}
.evo-card p {
  font-size: 0.9rem;
  color: #aaa;
  margin-bottom: 15px;
}

.stats {
  border-top: 1px solid #333;
  padding-top: 10px;
  display: flex;
  justify-content: center;
  gap: 10px;
  font-size: 0.8rem;
  font-weight: bold;
  color: var(--c-blue);
}

@keyframes pulse {
  0% {
    text-shadow: 0 0 10px var(--c-gold);
  }
  50% {
    text-shadow: 0 0 20px var(--c-gold), 0 0 40px var(--c-gold);
  }
  100% {
    text-shadow: 0 0 10px var(--c-gold);
  }
}
</style>
