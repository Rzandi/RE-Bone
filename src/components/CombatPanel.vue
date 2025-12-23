<script setup>
import { computed } from "vue";
import { gameStore } from "../game/store.js";
import { REALMS } from "../game/config/realms";

const s = gameStore.state;
const enemy = computed(() => s.combat.enemy);
const activeRealm = computed(() => s.world.activeRealm);

const realmConfig = computed(() => {
    if (activeRealm.value && REALMS[activeRealm.value]) {
        return REALMS[activeRealm.value];
    }
    return null;
});

const panelStyle = computed(() => {
    if (realmConfig.value) {
        return {
            borderColor: realmConfig.value.color,
            background: `linear-gradient(to bottom, rgba(20,10,10,0.95), ${realmConfig.value.color}11)` 
        };
    }
    return {}; 
});

const formatHp = (hp) => Math.floor(hp);

const hpColor = computed(() => {
  if (!enemy.value) return "#f00";
  const pct = enemy.value.hp / enemy.value.maxHp;
  if (pct > 0.5) return "#4f4";
  if (pct > 0.25) return "#fa0";
  return "#f44";
});

const spriteHtml = computed(() => {
  if (!enemy.value) return "";
  if (window.SpriteManager) {
      return window.SpriteManager.render(enemy.value.sprite || "👹");
  }
  return enemy.value.sprite || "👹";
});

// v36.4.3: MP display
const mpColor = computed(() => {
  if (!enemy.value || !enemy.value.maxMp) return "#5bf";
  const pct = enemy.value.mp / enemy.value.maxMp;
  if (pct > 0.5) return "#5bf"; // Blue
  if (pct > 0.25) return "#fa0"; // Orange
  return "#a55"; // Red (low MP)
});

const hasMp = computed(() => {
  return enemy.value && enemy.value.maxMp > 0;
});

// v36.8: Status icon mapping
const statusIcons = {
  burn: '🔥',
  poison: '☠️',
  shock: '⚡',
  bleed: '🩸',
  weak: '💔',
  chill: '❄️',
  stun: '😵',
  doom: '💀',
  regen: '💚',
  shield: '🛡️'
};

const statusNames = {
  burn: 'Burning',
  poison: 'Poisoned',
  shock: 'Stunned',
  bleed: 'Bleeding',
  weak: 'Weakened',
  chill: 'Chilled',
  stun: 'Stunned',
  doom: 'Doomed',
  regen: 'Regenerating',
  shield: 'Shielded'
};

const getStatusIcon = (statusId) => {
  return statusIcons[statusId] || '❓';
};

const getStatusName = (statusId) => {
  return statusNames[statusId] || statusId;
};
</script>

<template>
  <div class="combat-panel scanline" v-if="enemy" :style="panelStyle">
    <!-- ENEMY INFO -->
    <div class="enemy-header">
      <h2 :class="{ boss: enemy.isBoss }" :style="{ color: realmConfig ? realmConfig.color : '#fff' }">
          {{ enemy.name }}
      </h2>
      <small class="enemy-type">{{ enemy.desc || "A dangerous foe." }}</small>
    </div>

    <!-- SPRITE AREA -->
    <div class="sprite-container">
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

    <!-- MP BAR (v36.4.3) -->
    <div class="mp-container" v-if="hasMp">
      <div class="mp-bar-bg">
        <div
          class="mp-bar-fill"
          :style="{
            width: Math.min(100, Math.max(0, (enemy.mp / enemy.maxMp) * 100)) + '%',
            background: mpColor,
          }"
        ></div>
      </div>
      <div class="mp-text">
        MP {{ Math.floor(enemy.mp) }} / {{ enemy.maxMp }}
      </div>
    </div>

    <!-- STATUS ICONS -->
    <div class="enemy-status" v-if="enemy.status && enemy.status.length">
      <span
        v-for="(st, i) in enemy.status"
        :key="i"
        class="status-badge"
        :title="`${getStatusName(st.id)}: ${st.turn} turns`"
      >
        {{ getStatusIcon(st.id) }}
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
  padding: 15px;
  background: var(--glass-bg, rgba(20, 10, 10, 0.9));
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border: 1px solid rgba(80, 30, 30, 0.6);
  margin-bottom: 5px;
  position: relative;
  border-radius: 8px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.4);
}

.enemy-header {
  text-align: center;
  margin-bottom: 8px;
}
.enemy-header h2 {
  margin: 0;
  font-size: 1.2rem;
  color: #fff;
  text-shadow: 0 0 10px rgba(255, 68, 68, 0.5);
}
.enemy-header h2.boss {
  color: #f55;
  font-size: 1.5rem;
  letter-spacing: 2px;
  animation: bossGlow 2s ease-in-out infinite;
}
@keyframes bossGlow {
  0%, 100% { text-shadow: 0 0 10px rgba(255, 85, 85, 0.6), 0 0 20px rgba(255, 0, 0, 0.3); }
  50% { text-shadow: 0 0 20px rgba(255, 85, 85, 0.9), 0 0 40px rgba(255, 0, 0, 0.5); }
}
.enemy-type {
  color: #aaa;
  font-style: italic;
  font-size: 0.8rem;
}

.sprite-container {
  height: 90px;
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 12px;
  position: relative;
}

.mob-sprite {
  font-size: 3.5rem;
  filter: drop-shadow(0 0 15px rgba(255, 0, 0, 0.4));
  animation: float 3s ease-in-out infinite;
}

@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-8px); }
}

.hp-container {
  width: 100%;
  max-width: 320px;
  position: relative;
  margin-bottom: 10px;
  background: rgba(0, 0, 0, 0.4);
  border-radius: 6px;
  padding: 2px;
}
.hp-bar-bg {
  background: linear-gradient(to bottom, rgba(30, 20, 20, 0.9), rgba(10, 5, 5, 0.95));
  height: 22px;
  border: 1px solid rgba(255, 68, 68, 0.3);
  border-radius: 5px;
  overflow: hidden;
  position: relative;
}
.hp-bar-fill {
  height: 100%;
  transition: width 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
  box-shadow: 0 0 15px rgba(255, 100, 100, 0.4) inset, 0 -2px 6px rgba(255, 255, 255, 0.15) inset;
  border-radius: 4px;
}
.hp-text {
  position: absolute;
  top: 0;
  width: 100%;
  text-align: center;
  font-size: 12px;
  line-height: 22px;
  color: #fff;
  text-shadow: 1px 1px 2px #000, 0 0 5px rgba(0, 0, 0, 0.8);
  font-weight: 700;
  font-family: 'Courier New', monospace;
  pointer-events: none;
  letter-spacing: 0.5px;
}

/* MP Bar Styling */
.mp-container {
  width: 100%;
  max-width: 320px;
  position: relative;
  margin-bottom: 10px;
  background: rgba(0, 0, 0, 0.4);
  border-radius: 6px;
  padding: 2px;
}
.mp-bar-bg {
  background: linear-gradient(to bottom, rgba(20, 20, 40, 0.9), rgba(5, 5, 20, 0.95));
  height: 16px;
  border: 1px solid rgba(77, 136, 255, 0.3);
  border-radius: 5px;
  overflow: hidden;
  position: relative;
}
.mp-bar-fill {
  height: 100%;
  transition: width 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
  box-shadow: 0 0 15px rgba(100, 150, 255, 0.4) inset, 0 -2px 6px rgba(255, 255, 255, 0.15) inset;
  border-radius: 4px;
}
.mp-text {
  position: absolute;
  top: 0;
  width: 100%;
  text-align: center;
  font-size: 11px;
  line-height: 16px;
  color: #fff;
  text-shadow: 1px 1px 2px #000, 0 0 5px rgba(0, 0, 0, 0.8);
  font-weight: 700;
  font-family: 'Courier New', monospace;
  pointer-events: none;
}

.enemy-status {
  display: flex;
  justify-content: center;
  gap: 6px;
  margin-top: 8px;
  flex-wrap: wrap;
}
.status-badge {
  background: linear-gradient(135deg, rgba(40, 40, 50, 0.9), rgba(25, 25, 35, 0.95));
  color: #eee;
  padding: 4px 8px;
  font-size: 14px;
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 6px;
  text-transform: uppercase;
  font-weight: bold;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.4);
  transition: transform 0.2s ease;
  cursor: help;
}
.status-badge:hover {
  transform: scale(1.1);
}

.combat-empty {
  padding: 30px;
  text-align: center;
  color: #666;
  font-style: italic;
  background: var(--glass-bg, rgba(20, 10, 10, 0.8));
  border-radius: 8px;
}
</style>
