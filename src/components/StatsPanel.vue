<script setup>
import { computed } from "vue";
import { gameStore } from "../game/store.js";

const s = gameStore.state;

// Check if we are in "Level Up" mode (forced allocation)
const isLevelUp = computed(() => s.activePanel === 'levelup');

// Computed Stats for Display
const stats = computed(() => {
  return [
    { label: "STR", val: s.str, desc: "Increases Physical Damage", key: "STR" },
    { label: "VIT", val: s.vit, desc: "Increases Max HP", key: "VIT" },
    { label: "INT", val: s.int, desc: "Increases Magic Dmg & MP", key: "INT" },
  ];
});

const derived = computed(() => {
  return [
    { label: "ATK", val: s.atk || 0 },
    { label: "DEF", val: s.def || 0 },
    { label: "CRIT", val: Math.floor((s.crit || 0) * 100) + "%" },
    { label: "DODGE", val: Math.floor((s.dodge || 0) * 100) + "%" },
  ];
});

const equip = computed(() => s.equip || {});

const formatItem = (item) =>
  item ? `${item.name} (+${item.atk || 0} Atk)` : "Empty";

const rarityColor = (item) => {
  if (!item) return "#555";
  const map = {
    common: "#fff",
    uncommon: "#4f4",
    rare: "#4af",
    epic: "#d0d",
    legendary: "#fa0",
  };
  return map[item.rarity] || "#fff";
};

const close = () => {
    // If leveled up, can't close without picking!
    if(isLevelUp.value) return;
  gameStore.state.activePanel = "menu-view";
};

const allocate = (key) => {
    if(window.ProgressionManager) {
        ProgressionManager.applyLevelUp(key);
    }
}
</script>

<template>
  <div class="stats-panel scanline" :class="{ 'levelup-mode': isLevelUp }">
    <div class="header">
      <h2>{{ isLevelUp ? 'LEVEL UP! CHOOSE STAT' : 'CHARACTER STATUS' }}</h2>
      <button v-if="!isLevelUp" @click="close">X</button>
    </div>

    <div class="content">
      <!-- AVATAR / CLASS -->
      <div class="section avatar-section">
        <div class="pixel-art">
          <!-- Placeholder for Class Sprite -->
          <span style="font-size: 40px">💀</span>
        </div>
        <div class="info">
          <h3>{{ s.className }}</h3>
          <small>Level {{ s.level }}</small><br/>
          <small style="color:#aaa; font-size:0.75rem">EXP {{ s.exp }} / {{ s.nextExp }}</small>
          <div class="bar-group">
            <div class="bar hp">
              <div :style="{ width: (s.hp / s.maxHp) * 100 + '%' }"></div>
            </div>
            <div class="bar mp">
              <div :style="{ width: (s.mp / s.maxMp) * 100 + '%' }"></div>
            </div>
          </div>
        </div>
      </div>

      <hr />

      <!-- ATTRIBUTES -->
      <div class="section attributes">
        <div v-for="stat in stats" :key="stat.label" class="stat-row">
          <span class="label">{{ stat.label }}</span>
          <span class="val">{{ stat.val }}</span>
          
          <!-- Allocation Button -->
          <button v-if="isLevelUp" class="btn-alloc" @click="allocate(stat.key)">+1</button>
          
          <small v-else>{{ stat.desc }}</small>
        </div>
      </div>

      <!-- DERIVED STATS -->
      <div class="section derived">
        <div v-for="stat in derived" :key="stat.label" class="stat-row">
          <span class="label">{{ stat.label }}</span>
          <span class="val">{{ stat.val }}</span>
        </div>
      </div>

      <hr />

      <!-- EQUIPMENT -->
      <div class="section equipment">
        <h3>EQUIPMENT</h3>
        <div class="equip-slot">
          <span>⚔️ WEAPON</span>
          <span :style="{ color: rarityColor(equip.weapon) }">{{
            formatItem(equip.weapon)
          }}</span>
        </div>
        <div class="equip-slot">
          <span>🛡️ ARMOR</span>
          <span :style="{ color: rarityColor(equip.armor) }">{{
            formatItem(equip.armor)
          }}</span>
        </div>
        <div class="equip-slot">
          <span>💍 ACCESSORY</span>
          <span :style="{ color: rarityColor(equip.acc) }">{{
            formatItem(equip.acc)
          }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.stats-panel {
  background: rgba(10, 10, 12, 0.95);
  color: #eee;
  padding: 15px;
  border: 1px solid #444;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.levelup-mode {
    border: 2px solid var(--c-gold, #fd0);
    box-shadow: 0 0 20px var(--c-gold, #fd0);
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 2px solid #333;
  margin-bottom: 10px;
}
.header h2 {
  margin: 0;
  color: var(--c-gold);
  font-size: 1.2rem;
}
.header button {
  background: #300;
  border: 1px solid #f00;
  color: #fff;
  cursor: pointer;
}

.content {
  flex: 1;
  overflow-y: auto;
}

.avatar-section {
  display: flex;
  gap: 15px;
  align-items: center;
}
.bar-group {
  width: 100%;
  margin-top: 5px;
}
.bar {
  height: 6px;
  background: #333;
  margin-bottom: 2px;
  position: relative;
}
.bar.hp div {
  background: var(--c-red);
  height: 100%;
}
.bar.mp div {
  background: var(--c-blue);
  height: 100%;
}

.stat-row {
  display: flex;
  justify-content: space-between;
  align-items: center; 
  padding: 5px 0;
  border-bottom: 1px dashed #333;
}
.stat-row .label {
  color: var(--c-gold);
  font-weight: bold;
  width: 40px;
}
.stat-row .val {
  font-weight: bold;
  width: 40px;
  text-align: right;
}
.stat-row small {
  color: #777;
  flex: 1;
  text-align: right;
}

.btn-alloc {
    background: var(--c-gold, #fd0); color: black; font-weight: bold;
    border: none; padding: 5px 15px; cursor: pointer; margin-left: auto;
}
.btn-alloc:hover { transform: scale(1.1); box-shadow: 0 0 5px white; }

.equip-slot {
  display: flex;
  justify-content: space-between;
  padding: 8px 0;
  border-bottom: 1px solid #333;
}
</style>
