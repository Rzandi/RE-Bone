<script setup>
import { computed } from "vue";
import { gameStore } from "../game/store.js";
import { Player } from "../game/logic/Player.js";

const s = gameStore.state;

// v37.3: Stat bonuses per point (based on recalc logic in Player.js)
const stats = computed(() => [
  { 
    key: "STR", 
    label: "💪 STRENGTH", 
    val: s.str || 0,
    base: s.baseStats?.STR || 0,
    desc: "Physical Attack Power",
    color: "#f44",
    bonuses: [
      { icon: "⚔️", name: "ATK", val: "+2 per point" },
      { icon: "💥", name: "Phys Dmg", val: "+1% per point" }
    ]
  },
  { 
    key: "VIT", 
    label: "❤️ VITALITY", 
    val: s.vit || 0,
    base: s.baseStats?.VIT || 0,
    desc: "Max HP & Defense",
    color: "#4f4",
    bonuses: [
      { icon: "❤️", name: "Max HP", val: "+5 per point" },
      { icon: "🛡️", name: "DEF", val: "+0.5 per point" }
    ]
  },
  { 
    key: "INT", 
    label: "🔮 INTELLIGENCE", 
    val: s.int || 0,
    base: s.baseStats?.INT || 0,
    desc: "Magic Power & Max MP",
    color: "#4af",
    bonuses: [
      { icon: "✨", name: "Magic Dmg", val: "+3% per point" },
      { icon: "💧", name: "Max MP", val: "+5 per point" }
    ]
  }
]);

const remainingPoints = computed(() => s.statPt || 0);

const allocate = (stat) => {
  if (Player && Player.allocateStat) {
    Player.allocateStat(stat);
  }
};

const close = () => {
  // v38.3: Check if there's a pending evolution to show
  if (gameStore.state.pendingEvolution && gameStore.state.evolutionOptions?.length > 0) {
    gameStore.state.activePanel = 'evolution';
  } else {
    gameStore.state.activePanel = 'menu-view';
  }
};

const allocateAll = (stat) => {
  const pts = remainingPoints.value;
  for (let i = 0; i < pts; i++) {
    allocate(stat);
  }
};
</script>

<template>
  <div class="stat-alloc-panel scanline">
    <div class="header">
      <h2>📊 ALLOCATE STAT POINTS</h2>
      <div class="points-display">
        <span class="points-count">{{ remainingPoints }}</span>
        <span class="points-label">Points</span>
      </div>
    </div>

    <div class="hint" v-if="remainingPoints > 0">
      Click a stat to allocate 1 point. Build your character freely!
    </div>
    <div class="hint done" v-else>
      All points allocated! Check your new stats.
    </div>

    <div class="stats-grid">
      <div 
        v-for="stat in stats" 
        :key="stat.key" 
        class="stat-card"
        :class="{ disabled: remainingPoints <= 0 }"
        :style="{ borderColor: stat.color }"
        @click="remainingPoints > 0 && allocate(stat.key)"
      >
        <div class="stat-header">
          <span class="stat-label" :style="{ color: stat.color }">{{ stat.label }}</span>
          <span class="stat-value">{{ stat.val }}</span>
        </div>
        <div class="stat-base">(Base: {{ stat.base }})</div>
        
        <!-- Bonus Info -->
        <div class="stat-bonuses">
          <div v-for="bonus in stat.bonuses" :key="bonus.name" class="bonus-item">
            <span class="bonus-icon">{{ bonus.icon }}</span>
            <span class="bonus-name">{{ bonus.name }}:</span>
            <span class="bonus-val" :style="{ color: stat.color }">{{ bonus.val }}</span>
          </div>
        </div>
        
        <div class="stat-buttons" v-if="remainingPoints > 0">
          <button class="btn-add" @click.stop="allocate(stat.key)">+1</button>
          <button class="btn-all" @click.stop="allocateAll(stat.key)" v-if="remainingPoints > 1">
            +{{ remainingPoints }}
          </button>
        </div>
      </div>
    </div>

    <div class="preview">
      <h3>📈 Current Combat Stats</h3>
      <div class="preview-grid">
        <div class="preview-stat">
          <span class="preview-icon">⚔️</span>
          <span class="preview-label">ATK</span>
          <span class="preview-val">{{ s.atk }}</span>
        </div>
        <div class="preview-stat">
          <span class="preview-icon">🛡️</span>
          <span class="preview-label">DEF</span>
          <span class="preview-val">{{ s.def }}</span>
        </div>
        <div class="preview-stat">
          <span class="preview-icon">❤️</span>
          <span class="preview-label">HP</span>
          <span class="preview-val">{{ s.maxHp }}</span>
        </div>
        <div class="preview-stat">
          <span class="preview-icon">💧</span>
          <span class="preview-label">MP</span>
          <span class="preview-val">{{ s.maxMp }}</span>
        </div>
        <div class="preview-stat">
          <span class="preview-icon">💥</span>
          <span class="preview-label">CRIT</span>
          <span class="preview-val">{{ Math.floor((s.crit || 0) * 100) }}%</span>
        </div>
        <div class="preview-stat">
          <span class="preview-icon">🌀</span>
          <span class="preview-label">DODGE</span>
          <span class="preview-val">{{ Math.floor((s.dodge || 0) * 100) }}%</span>
        </div>
      </div>
    </div>

    <button class="btn-close" @click="close">
      {{ remainingPoints > 0 ? 'SAVE FOR LATER' : 'DONE' }}
    </button>
  </div>
</template>

<style scoped>
.stat-alloc-panel {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100dvh;
  background: rgba(10, 10, 15, 0.98);
  backdrop-filter: blur(10px);
  padding: 20px;
  display: flex;
  flex-direction: column;
  z-index: 100;
  box-sizing: border-box;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
  padding-bottom: 8px;
  border-bottom: 2px solid rgba(255, 255, 255, 0.1);
  flex-shrink: 0;
}

.header h2 {
  margin: 0;
  color: var(--c-gold);
  font-size: 1.1rem;
  text-shadow: 0 0 10px rgba(207, 170, 76, 0.5);
}

.points-display {
  display: flex;
  flex-direction: column;
  align-items: center;
  background: linear-gradient(135deg, #2a2a35, #1a1a25);
  padding: 8px 15px;
  border-radius: 8px;
  border: 2px solid var(--c-gold);
}

.points-count {
  font-size: 1.5rem;
  font-weight: bold;
  color: var(--c-gold);
  text-shadow: 0 0 10px rgba(255, 215, 0, 0.5);
  animation: pulse 1s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.1); }
}

.points-label {
  font-size: 0.7rem;
  color: #888;
  text-transform: uppercase;
}

.hint {
  text-align: center;
  color: #aaa;
  margin-bottom: 10px;
  font-size: 0.85rem;
  flex-shrink: 0;
}

.hint.done {
  color: #4f4;
}

.stats-grid {
  display: flex;
  flex-direction: column;
  gap: 10px;
  flex: 1;
  overflow-y: auto;
  min-height: 0; /* Important for flex overflow to work */
  padding-right: 5px;
}

.stat-card {
  background: linear-gradient(135deg, rgba(30, 30, 40, 0.8), rgba(20, 20, 30, 0.9));
  border: 2px solid #444;
  border-radius: 10px;
  padding: 15px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.stat-card:hover:not(.disabled) {
  transform: translateX(5px);
  box-shadow: 0 0 20px rgba(255, 255, 255, 0.1);
}

.stat-card.disabled {
  opacity: 0.6;
  cursor: default;
}

.stat-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 5px;
}

.stat-label {
  font-size: 1.1rem;
  font-weight: bold;
}

.stat-value {
  font-size: 1.5rem;
  font-weight: bold;
  color: #fff;
}

.stat-base {
  font-size: 0.8rem;
  color: #666;
}

.stat-desc {
  font-size: 0.85rem;
  color: #888;
  margin-top: 5px;
}

.stat-buttons {
  display: flex;
  gap: 10px;
  margin-top: 10px;
}

.btn-add, .btn-all {
  padding: 8px 20px;
  border: none;
  border-radius: 6px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-add {
  background: linear-gradient(135deg, #4a4a55, #3a3a45);
  color: #fff;
  flex: 1;
}

.btn-add:hover {
  background: linear-gradient(135deg, #5a5a65, #4a4a55);
  transform: scale(1.05);
}

.btn-all {
  background: linear-gradient(135deg, var(--c-gold), #b8941e);
  color: #000;
}

.btn-all:hover {
  transform: scale(1.05);
  box-shadow: 0 0 15px rgba(207, 170, 76, 0.5);
}

.preview {
  background: rgba(0, 0, 0, 0.3);
  padding: 12px;
  border-radius: 8px;
  margin-top: 10px;
  flex-shrink: 0;
}

.preview h3 {
  margin: 0 0 10px 0;
  font-size: 0.9rem;
  color: #aaa;
  text-align: center;
}

.preview-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
}

.preview-stat {
  display: flex;
  flex-direction: column;
  align-items: center;
  background: rgba(30, 30, 40, 0.5);
  padding: 8px;
  border-radius: 6px;
}

.preview-icon {
  font-size: 1.2rem;
}

.preview-label {
  font-size: 0.7rem;
  color: #888;
  text-transform: uppercase;
}

.preview-val {
  font-size: 1rem;
  font-weight: bold;
  color: #fff;
}

/* Stat Bonus Info */
.stat-bonuses {
  margin-top: 8px;
  padding: 8px;
  background: rgba(0, 0, 0, 0.2);
  border-radius: 6px;
}

.bonus-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.85rem;
  padding: 3px 0;
}

.bonus-icon {
  font-size: 0.9rem;
}

.bonus-name {
  color: #888;
}

.bonus-val {
  font-weight: bold;
  margin-left: auto;
}

.btn-close {
  margin-top: 10px;
  padding: 15px;
  background: linear-gradient(135deg, #2a2a35, #1a1a25);
  border: 2px solid var(--c-gold);
  color: var(--c-gold);
  font-size: 1rem;
  font-weight: bold;
  cursor: pointer;
  border-radius: 8px;
  transition: all 0.2s;
  flex-shrink: 0;
}

.btn-close:hover {
  background: linear-gradient(135deg, #3a3a45, #2a2a35);
  box-shadow: 0 0 15px rgba(207, 170, 76, 0.3);
}

/* ================================
   MOBILE OPTIMIZATION (v37.3)
   ================================ */
@media (max-width: 480px) {
  .stat-alloc-panel {
    padding: 12px;
  }
  
  .header h2 {
    font-size: 0.95rem;
  }
  
  .points-display {
    padding: 6px 12px;
  }
  
  .points-count {
    font-size: 1.3rem;
  }
  
  .hint {
    font-size: 0.75rem;
    margin-bottom: 8px;
  }
  
  .stat-card {
    padding: 12px;
  }
  
  .stat-label {
    font-size: 0.95rem;
  }
  
  .stat-value {
    font-size: 1.3rem;
  }
  
  .stat-bonuses {
    padding: 6px;
  }
  
  .bonus-item {
    font-size: 0.75rem;
    padding: 2px 0;
  }
  
  .stat-buttons {
    gap: 8px;
    margin-top: 8px;
  }
  
  .btn-add, .btn-all {
    padding: 12px 16px; /* Min 44px touch target */
    min-height: 44px;
    font-size: 0.9rem;
  }
  
  .preview {
    padding: 10px;
    margin-top: 8px;
  }
  
  .preview h3 {
    font-size: 0.8rem;
    margin-bottom: 8px;
  }
  
  .preview-grid {
    gap: 6px;
  }
  
  .preview-stat {
    padding: 6px;
  }
  
  .preview-icon {
    font-size: 1rem;
  }
  
  .preview-label {
    font-size: 0.6rem;
  }
  
  .preview-val {
    font-size: 0.85rem;
  }
  
  .btn-close {
    padding: 14px;
    min-height: 48px;
    font-size: 0.95rem;
  }
}

/* Larger phones / small tablets */
@media (max-width: 768px) and (min-width: 481px) {
  .stat-alloc-panel {
    padding: 15px;
  }
  
  .btn-add, .btn-all {
    min-height: 44px;
  }
}

/* Reduced motion support */
@media (prefers-reduced-motion: reduce) {
  .stat-card {
    transition: none;
  }
  
  .points-count {
    animation: none;
  }
}
</style>
