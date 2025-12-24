<script setup>
import { computed, ref, watch, onMounted, onUnmounted } from "vue";
import { gameStore } from "../game/store.js";
import { REALMS } from "../game/config/realms";

const s = gameStore.state;
const enemy = computed(() => s.combat.enemy);
const activeRealm = computed(() => s.world.activeRealm);

// v37.3: Animation states
const isAttacking = ref(false);
const isHit = ref(false);
const lastEnemyHp = ref(0);

// Watch for enemy HP changes to trigger hit animation
watch(() => enemy.value?.hp, (newHp, oldHp) => {
  if (newHp !== undefined && oldHp !== undefined && newHp < oldHp) {
    // Enemy took damage - trigger hit flash
    isHit.value = true;
    setTimeout(() => isHit.value = false, 300);
  }
  lastEnemyHp.value = newHp || 0;
}, { immediate: true });

// Watch for enemy turn to trigger attack animation
watch(() => s.combat.turn, (turn) => {
  if (turn === 'enemy') {
    isAttacking.value = true;
    setTimeout(() => isAttacking.value = false, 400);
  }
});

// Animation class computed
const spriteClasses = computed(() => ({
  'mob-sprite': true,
  'attacking': isAttacking.value,
  'hit': isHit.value,
  'boss-sprite': enemy.value?.isBoss
}));

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
      <div id="mob-sprite" :class="spriteClasses" v-html="spriteHtml"></div>
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
  padding: 5px; /* Reduced from 15px */
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
  margin-bottom: 4px; /* Reduced from 8px */
}
.enemy-header h2 {
  margin: 0;
  font-size: 1.1rem; /* Reduced from 1.2rem */
  color: #fff;
  text-shadow: 0 0 10px rgba(255, 68, 68, 0.5);
}
.enemy-header h2.boss {
  color: #f55;
  font-size: 1.3rem; /* Reduced from 1.5rem */
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
  font-size: 0.75rem; /* Reduced from 0.8rem */
}

.sprite-container {
  height: 50px; /* Reduced from 90px */
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 6px; /* Reduced from 12px */
  position: relative;
}

.mob-sprite {
  font-size: 2.5rem;
  filter: drop-shadow(0 0 15px rgba(255, 0, 0, 0.4));
  animation: float 3s ease-in-out infinite, breathe 2s ease-in-out infinite;
  transition: filter 0.2s, transform 0.1s;
}

/* v37.3: Idle breathing animation */
@keyframes breathe {
  0%, 100% { transform: scale(1) translateY(0); }
  50% { transform: scale(1.03) translateY(0); }
}

/* Float animation */
@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-5px); }
}

/* v37.3: Attack shake animation */
.mob-sprite.attacking {
  animation: attackShake 0.4s ease-out !important;
  filter: drop-shadow(0 0 25px rgba(255, 50, 50, 0.8)) brightness(1.3);
}

@keyframes attackShake {
  0%, 100% { transform: translateX(0) translateY(0); }
  10% { transform: translateX(-8px) translateY(-2px); }
  20% { transform: translateX(8px) translateY(2px); }
  30% { transform: translateX(-6px) translateY(-1px); }
  40% { transform: translateX(6px) translateY(1px); }
  50% { transform: translateX(-4px) translateY(0); }
  60% { transform: translateX(4px) translateY(0); }
  70% { transform: translateX(-2px) translateY(0); }
  80% { transform: translateX(2px) translateY(0); }
}

/* v37.3: Hit flash animation */
.mob-sprite.hit {
  animation: hitFlash 0.3s ease-out !important;
  filter: brightness(3) drop-shadow(0 0 20px #fff);
}

@keyframes hitFlash {
  0% { filter: brightness(3) saturate(0); transform: scale(0.95); }
  50% { filter: brightness(2) saturate(0.5); transform: scale(1.05); }
  100% { filter: brightness(1) saturate(1); transform: scale(1); }
}

/* v37.3: Boss sprite enhanced */
.mob-sprite.boss-sprite {
  font-size: 3rem;
  filter: drop-shadow(0 0 20px rgba(255, 50, 0, 0.6)) drop-shadow(0 0 40px rgba(255, 0, 0, 0.3));
  animation: float 3s ease-in-out infinite, breathe 1.5s ease-in-out infinite, bossAura 2s ease-in-out infinite;
}

@keyframes bossAura {
  0%, 100% { filter: drop-shadow(0 0 20px rgba(255, 50, 0, 0.6)) hue-rotate(0deg); }
  50% { filter: drop-shadow(0 0 30px rgba(255, 100, 50, 0.8)) hue-rotate(10deg); }
}

.hp-container {
  width: 100%;
  max-width: 320px;
  position: relative;
  margin-bottom: 5px; /* Reduced from 10px */
  background: rgba(0, 0, 0, 0.4);
  border-radius: 6px;
  padding: 2px;
}
.hp-bar-bg {
  background: linear-gradient(to bottom, rgba(30, 20, 20, 0.9), rgba(10, 5, 5, 0.95));
  height: 18px; /* Reduced from 22px */
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
  font-size: 11px; /* Slightly smaller or keep readable */
  line-height: 18px; /* Match height */
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

/* ================================
   MOBILE OPTIMIZATION (v37.3)
   ================================ */
@media (max-width: 480px) {
  .combat-panel {
    padding: 4px;
  }
  
  .enemy-header h2 {
    font-size: 1rem;
  }
  
  .mob-sprite {
    font-size: 2rem;
  }
  
  .mob-sprite.boss-sprite {
    font-size: 2.5rem;
  }
  
  .sprite-container {
    height: 45px;
    margin-bottom: 4px;
  }
  
  .hp-bar-bg {
    height: 16px;
  }
  
  .hp-text {
    font-size: 10px;
    line-height: 16px;
  }
  
  .mp-bar-bg {
    height: 14px;
  }
  
  .mp-text {
    font-size: 10px;
    line-height: 14px;
  }
  
  .status-badge {
    padding: 3px 6px;
    font-size: 12px;
  }
}

/* Reduced motion support */
@media (prefers-reduced-motion: reduce) {
  .mob-sprite {
    animation: none !important;
    transition: none !important;
  }
  
  .mob-sprite.attacking,
  .mob-sprite.hit,
  .mob-sprite.boss-sprite {
    animation: none !important;
  }
  
  @keyframes float { }
  @keyframes breathe { }
  @keyframes attackShake { }
  @keyframes hitFlash { }
  @keyframes bossAura { }
  @keyframes bossGlow { }
}
</style>
