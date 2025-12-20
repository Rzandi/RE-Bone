<script setup>
import { computed } from "vue";
import { gameStore } from "../game/store.js";

const s = gameStore.state;
const enemy = computed(() => s.combat.enemy);

const formatHp = (hp) => Math.floor(hp);

// Computed HP Bar Color (Green -> Yellow -> Red)
const hpColor = computed(() => {
  if (!enemy.value) return "#f00";
  const pct = enemy.value.hp / enemy.value.maxHp;
  if (pct > 0.5) return "#4f4";
  if (pct > 0.25) return "#fa0";
  return "#f44";
});

// Sprite Handling (HTML/Emoji)
// Legacy used .pixel-sprite classes or raw HTML headers
// We will try to render the sprite string as HTML, or fallback
// Enemy sprites in DB are often strings like `<span ...>...</span>`
const spriteHtml = computed(() => {
  if (!enemy.value) return "";
  // Use SpriteManager if available to handle states/HTML
  if (window.SpriteManager) {
      return window.SpriteManager.render(enemy.value.sprite || "👹");
  }
  return enemy.value.sprite || "👹";
});
</script>

<template>
  <div class="combat-panel scanline" v-if="enemy ">
    <!-- ENEMY INFO -->
    <div class="enemy-header">
      <h2 :class="{ boss: enemy.isBoss }">{{ enemy.name }}</h2>
      <small class="enemy-type">{{ enemy.desc || "A dangerous foe." }}</small>
    </div>

    <!-- SPRITE AREA -->
    <div class="sprite-container">
      <!-- Render Raw HTML from DB (Safe because internal content) -->
      <div id="mob-sprite" class="mob-sprite" v-html="spriteHtml"></div>

    </div>

    <!-- HP BAR -->
    <div class="hp-container">
      <div class="hp-bar-bg">
        <div
          class="hp-bar-fill"
          :style="{
            width: Math.min(100, Math.max(0, (enemy.hp / enemy.maxHp) * 100)) + '%',
            background: hpColor,
          }"
        ></div>
      </div>
      <div class="hp-text">
        HP {{ formatHp(enemy.hp) }} / {{ enemy.maxHp }}
      </div>
    </div>

    <!-- STATUS ICONS -->
    <div class="enemy-status" v-if="enemy.status && enemy.status.length">
      <span
        v-for="(st, i) in enemy.status"
        :key="i"
        class="status-badge"
        :title="st.id"
      >
        {{ st.id.substring(0, 2) }}
      </span>
    </div>
  </div>
  <div v-else class="combat-empty">Searching for enemies...</div>
</template>

<style scoped>
.combat-panel {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 10px; /* Reduced from 20px */
  background: rgba(20, 10, 10, 0.8);
  border: 1px solid #522;
  margin-bottom: 5px; /* Reduced from 10px */
  position: relative;
  border-radius: 4px;
}

.enemy-header {
  text-align: center;
  margin-bottom: 5px; /* Reduced from 15px */
}
.enemy-header h2 {
  margin: 0;
  font-size: 1.2rem; /* Reduced from 1.4rem */
  color: #fff;
  text-shadow: 0 0 5px #f00;
}
.enemy-header h2.boss {
  color: #f55;
  font-size: 1.5rem;
  letter-spacing: 2px;
}
.enemy-type {
  color: #aaa;
  font-style: italic;
  font-size: 0.8rem;
}

.sprite-container {
  height: 80px; /* Reduced from 120px */
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 10px; /* Reduced from 15px */
  position: relative;
}

.mob-sprite {
  font-size: 3rem; /* Fallback size for emojis */
  filter: drop-shadow(0 0 10px rgba(255, 0, 0, 0.3));
  /* The sprite HTML usually contains its own styling if using pixel-art spans */
}

.hp-container {
  width: 100%;
  max-width: 300px;
  position: relative;
  margin-bottom: 10px;
}
.hp-bar-bg {
  background: #222;
  height: 16px;
  border: 1px solid #555;
  border-radius: 2px;
}
.hp-bar-fill {
  height: 100%;
  transition: width 0.2s;
}
.hp-text {
  position: absolute;
  top: -1px;
  width: 100%;
  text-align: center;
  font-size: 12px;
  color: #fff;
  text-shadow: 1px 1px 0 #000;
  font-weight: bold;
}

.enemy-status {
  display: flex;
  gap: 4px;
}
.status-badge {
  background: #333;
  color: #fff;
  padding: 2px 4px;
  font-size: 10px;
  border: 1px solid #555;
}
</style>
