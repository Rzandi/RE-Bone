<script setup>
import { computed } from "vue";
import { gameStore } from "../game/store.js";
import { DB } from "../game/config/database.js";
import { Player } from "../game/logic/Player.js";

const s = gameStore.state;

// We expect gameStore.state.evolutionOptions to be populated by Player.js
// It should be an array of IDs or Objects
const options = computed(() => s.evolutionOptions || []);

// v38.3: Only allow selecting unlocked options
const selectOption = (opt) => {
  if (opt.locked) return; // Can't select locked classes
  if (Player) {
    Player.selectEvolution(opt.id);
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
          :class="{ locked: opt.locked }"
          @click="selectOption(opt)"
        >
          <!-- v38.3: Locked overlay -->
          <div class="lock-overlay" v-if="opt.locked">
            <span class="lock-icon">🔒</span>
            <span class="lock-text">{{ opt.lockReason }}</span>
          </div>
          
          <div class="evo-icon" v-html="opt.sprite || '✨'"></div>
          <h3>{{ opt.name }}</h3>
          <p>{{ opt.desc }}</p>

          <div class="stats" v-if="opt.stats">
            <span v-if="opt.stats.str" class="stat-str">💪+{{ opt.stats.str }}</span>
            <span v-if="opt.stats.vit" class="stat-vit">❤️+{{ opt.stats.vit }}</span>
            <span v-if="opt.stats.int" class="stat-int">🔮+{{ opt.stats.int }}</span>
            <!-- v38.4: AGI/LUCK display -->
            <span v-if="opt.stats.agi" class="stat-agi">🏃+{{ opt.stats.agi }}</span>
            <span v-if="opt.stats.luck" class="stat-lck">🍀+{{ opt.stats.luck }}</span>
          </div>
          
          <!-- v38.3: Show Unique Passive -->
          <div class="unique-passive" v-if="opt.uniquePassive">
            <span class="passive-label">🌟 {{ opt.uniquePassive }}</span>
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
  flex-wrap: wrap; /* v38.4: Wrap on mobile */
  gap: 8px;
  font-size: 0.85rem;
  font-weight: bold;
}

/* v38.4: Stat colors */
.stat-str { color: #f44; }
.stat-vit { color: #4f4; }
.stat-int { color: #4af; }
.stat-agi { color: #4fa; }
.stat-lck { color: #fa4; }

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

/* v38.3: Locked class styles */
.evo-card.locked {
  opacity: 0.5;
  cursor: not-allowed;
  filter: grayscale(80%);
}

.evo-card.locked:hover {
  transform: none;
  border-color: #444;
  background: #111;
  box-shadow: none;
}

.lock-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  z-index: 10;
  border-radius: 8px;
}

.lock-icon {
  font-size: 2.5rem;
  margin-bottom: 10px;
}

.lock-text {
  color: #f55;
  font-size: 0.8rem;
  font-weight: bold;
  text-align: center;
  padding: 0 10px;
}

/* v38.3: Unique Passive Display */
.unique-passive {
  margin-top: 10px;
  padding: 8px;
  background: linear-gradient(135deg, #2a1f4f, #1a1a2e);
  border-radius: 5px;
  border: 1px solid #7b5fc7;
}

.passive-label {
  color: #c8a2ff;
  font-size: 0.75rem;
  font-weight: bold;
  text-transform: uppercase;
  letter-spacing: 1px;
}

/* v38.3: Mobile Responsive */
@media (max-width: 600px) {
  .panel-content {
    width: 95%;
    padding: 10px;
  }
  
  h1 {
    font-size: 1.5rem !important;
    letter-spacing: 2px;
  }
  
  .options-container {
    flex-direction: column;
    gap: 15px;
  }
  
  .evo-card {
    width: 100%;
    max-width: none;
    padding: 15px;
  }
  
  .evo-card h3 {
    font-size: 1rem;
  }
  
  .evo-card p {
    font-size: 0.8rem;
  }
  
  .evo-icon {
    font-size: 2.5rem;
  }
  
  .stats {
    flex-wrap: wrap;
    font-size: 0.7rem;
  }
  
  .lock-icon {
    font-size: 1.8rem;
  }
  
  .lock-text {
    font-size: 0.65rem;
  }
  
  .unique-passive {
    padding: 6px;
  }
  
  .passive-label {
    font-size: 0.65rem;
  }
}
</style>
