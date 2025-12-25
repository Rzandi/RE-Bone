<script setup>
import { computed } from "vue";
import { gameStore } from "../game/store.js";
import { ProgressionManager } from "../game/managers/progression.js";

const s = gameStore.state;
const attr = computed(() => s.baseStats || { STR:0, VIT:0, INT:0 });

const chooseStat = (stat) => {
  ProgressionManager.applyLevelUp(stat);
};
</script>

<template>
  <div class="levelup-overlay scanline">
    <div class="panel-content">
      <h1>LEVEL UP!</h1>
      <p>Select a stat to improve:</p>

      <div class="stat-options">
        <button class="btn-stat str" @click="chooseStat('STR')">
          <div class="icon">💪</div>
          <div class="label">STRENGTH</div>
          <div class="val">Current: {{ attr.STR }}</div>
          <div class="bonus">+2 ATK</div>
        </button>

        <button class="btn-stat vit" @click="chooseStat('VIT')">
          <div class="icon">❤️</div>
          <div class="label">VITALITY</div>
          <div class="val">Current: {{ attr.VIT }}</div>
          <div class="bonus">+5 HP</div>
        </button>

        <button class="btn-stat int" @click="chooseStat('INT')">
          <div class="icon">🔮</div>
          <div class="label">INTELLECT</div>
          <div class="val">Current: {{ attr.INT }}</div>
          <div class="bonus">+5 MP</div>
        </button>
        
        <!-- v38.4: AGI and LUCK options -->
        <button class="btn-stat agi" @click="chooseStat('AGI')">
          <div class="icon">🏃</div>
          <div class="label">AGILITY</div>
          <div class="val">Current: {{ attr.AGI || 0 }}</div>
          <div class="bonus">+0.3% Dodge, +0.5% Flee</div>
        </button>
        
        <button class="btn-stat lck" @click="chooseStat('LCK')">
          <div class="icon">🍀</div>
          <div class="label">LUCK</div>
          <div class="val">Current: {{ attr.LCK || 0 }}</div>
          <div class="bonus">+0.3% Crit, +0.5% Gold</div>
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.levelup-overlay {
  position: fixed;
  top: 0; left: 0;
  width: 100%; height: 100%;
  background: rgba(0, 0, 0, 0.95);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 2000;
}

.panel-content {
  text-align: center;
  width: 100%;
  max-width: 600px;
}

h1 {
  font-size: 3rem;
  color: var(--c-gold);
  text-shadow: 0 0 20px var(--c-gold);
  margin-bottom: 10px;
  animation: pulse 1s infinite alternate;
}

p {
  color: #aaa;
  margin-bottom: 30px;
  font-size: 1.2rem;
}

.stat-options {
  display: flex;
  flex-direction: column;
  gap: 15px;
  padding: 0 20px;
}

.btn-stat {
  display: flex;
  align-items: center;
  padding: 2px;
  background: #111;
  border: 2px solid #333;
  color: #fff;
  cursor: pointer;
  transition: all 0.2s;
  height: 80px;
  position: relative;
  overflow: hidden;
}

.btn-stat::before {
  content: "";
  position: absolute;
  top: 0; left: 0; width: 100%; height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent);
  transform: translateX(-100%);
  transition: transform 0.4s;
}

.btn-stat:hover::before {
  transform: translateX(100%);
}

.btn-stat:hover {
  transform: scale(1.02);
}

.icon {
  font-size: 2.5rem;
  width: 80px;
  background: rgba(0,0,0,0.3);
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.label {
  font-size: 1.5rem;
  font-weight: bold;
  flex: 1;
  text-align: left;
  padding-left: 20px;
}

.val {
  font-size: 0.9rem;
  color: #888;
  margin-right: 20px;
}

.bonus {
    position: absolute;
    right: 10px;
    bottom: 5px;
    font-size: 0.7rem;
    color: #aaa;
}

/* Colors */
.str { border-color: var(--c-red); }
.str:hover { background: linear-gradient(90deg, #300, #100); box-shadow: 0 0 15px var(--c-red); }
.str .label { color: var(--c-red); }

.vit { border-color: var(--c-green); }
.vit:hover { background: linear-gradient(90deg, #030, #010); box-shadow: 0 0 15px var(--c-green); }
.vit .label { color: var(--c-green); }

.int { border-color: var(--c-blue); }
.int:hover { background: linear-gradient(90deg, #003, #001); box-shadow: 0 0 15px var(--c-blue); }
.int .label { color: var(--c-blue); }

/* v38.4: AGI and LUCK colors */
.agi { border-color: #4fa; }
.agi:hover { background: linear-gradient(90deg, #023, #012); box-shadow: 0 0 15px #4fa; }
.agi .label { color: #4fa; }

.lck { border-color: #fa4; }
.lck:hover { background: linear-gradient(90deg, #330, #110); box-shadow: 0 0 15px #fa4; }
.lck .label { color: #fa4; }

@keyframes pulse {
  from { text-shadow: 0 0 10px var(--c-gold); transform: scale(1); }
  to { text-shadow: 0 0 25px var(--c-gold), 0 0 10px #fff; transform: scale(1.05); }
}

@media (min-width: 600px) {
    .btn-stat {
        flex-direction: row;
    }
}
</style>
