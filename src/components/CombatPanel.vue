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
  padding: 10px;
  background: rgba(20, 10, 10, 0.8);
  border: 1px solid #522;
  margin-bottom: 5px;
  position: relative;
  border-radius: 4px;
}

.enemy-header {
  text-align: center;
  margin-bottom: 5px;
}
.enemy-header h2 {
  margin: 0;
  font-size: 1.2rem;
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
  height: 80px;
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 10px;
  position: relative;
}

.mob-sprite {
  font-size: 3rem;
  filter: drop-shadow(0 0 10px rgba(255, 0, 0, 0.3));
  animation: float 3s ease-in-out infinite;
}

@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-5px); }
}

.hp-container {
  width: 100%;
  max-width: 300px;
  position: relative;
  margin-bottom: 10px;
  background: #111; /* Darker bg for contrast */
  border-radius: 4px; /* Consistent rounded */
}
.hp-bar-bg {
  background: #222;
  height: 18px; /* Slightly taller */
  border: 1px solid #444;
  border-radius: 4px;
  overflow: hidden; /* Ensure fill respects radius */
}
.hp-bar-fill {
  height: 100%;
  transition: width 0.3s cubic-bezier(0.25, 0.8, 0.25, 1); /* Smoother */
  box-shadow: 0 0 10px rgba(255, 255, 255, 0.2) inset; /* Gloss */
}
.hp-text {
  position: absolute;
  top: 0;
  width: 100%;
  text-align: center;
  font-size: 11px;
  line-height: 18px; /* Vertically center */
  color: #fff;
  text-shadow: 1px 1px 1px #000;
  font-weight: 700;
  font-family: 'Courier New', monospace; /* Tech feel */
  pointer-events: none;
}

.enemy-status {
  display: flex;
  justify-content: center;
  gap: 4px;
  margin-top: 5px;
}
.status-badge {
  background: #222;
  color: #eee;
  padding: 2px 6px;
  font-size: 10px;
  border: 1px solid #555;
  border-radius: 4px;
  text-transform: uppercase;
  font-weight: bold;
  box-shadow: 0 1px 3px rgba(0,0,0,0.5);
}
/* Dynamic Status Colors could be done via :style in template, 
   but simplistic CSS classes would be cleaner if status IDs matched. 
   For now, generic styling looks cleaner. */
</style>
