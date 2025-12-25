<script setup>
import { ref, computed, watch } from "vue";
import { gameStore } from "../game/store.js";

const s = gameStore.state;
const activeFx = ref([]);
let lastProcessedLength = 0;

// Watch the VFX queue for new items
watch(
  () => s.vfx.length,
  (newLen) => {
    // Check for reset (new length smaller than processed)
    if (newLen < lastProcessedLength) {
      lastProcessedLength = 0;
    }
    
    // Process new items
    if (newLen > lastProcessedLength) {
      const newItems = s.vfx.slice(lastProcessedLength);
      lastProcessedLength = newLen;
      
      // Batch deduplication: Remove duplicates within the same batch
      const uniqueItems = [];
      const seen = new Set();
      
      for (const item of newItems) {
        const key = `${item.type}-${item.val}-${item.target}`;
        if (!seen.has(key)) {
          seen.add(key);
          uniqueItems.push(item);
        }
      }
      
      uniqueItems.forEach((item) => {
        addFx(item);
      });
    }
  }
);

const addFx = (item) => {
  // ALLOW ALL VFX (Text Popups Restored)
  if (!item.type) return;

  // Smart dedupe for particles & text
  const now = Date.now();
  const isDup = activeFx.value.some(fx => 
    fx.type === item.type && 
    fx.target === item.target &&
    fx.val === item.val && // Check VALUE to allow different numbers
    fx.timestamp && (now - fx.timestamp) < 100 // Reduced window to 100ms
  );
  
  if (isDup) return;
  
  // Add timestamp for tracking
  item.timestamp = now;
  
  // Add to local display list with random offset
  const offsetX = Math.random() * 60 - 30;
  const offsetY = Math.random() * 40 - 20;

  // Particle Logic
  if(item.type && item.type.startsWith('particle-')) {
      const pType = item.type.replace('particle-', '');
      const angle = Math.random() * Math.PI * 2;
      const dist = 30 + Math.random() * 30;
      const tx = Math.cos(angle) * dist;
      const ty = Math.sin(angle) * dist;
      
      const fx = {
          ...item,
          isParticle: true,
          style: {
              left: `50%`, top: `40%`,
              backgroundColor: getParticleColor(pType),
              '--tx': `${tx}px`, '--ty': `${ty}px`
          }
      };
      activeFx.value.push(fx);
  } else {
      // Text Popup Logic
      const fx = {
        ...item,
        style: {
          left: `calc(50% + ${offsetX}px)`,
          top: `calc(40% + ${offsetY}px)`,
          "--tx": `${Math.random() * 40 - 20}px`,
          "--ty": "-80px", // Float up
        },
      };
      activeFx.value.push(fx);
  }

  // Auto remove after animation
  setTimeout(() => {
    // Find generic index (obj identity)
    // Note: slice() in watch creates copy, so referencing `item` directly works? 
    // No, `fx` is new object.
    const idx = activeFx.value.findIndex(x => x.id === item.id);
    if (idx > -1) activeFx.value.splice(idx, 1);
  }, 1000);
};

const getAttackIcon = (item) => {
  if (item.type === 'heal') return '💚';
  if (item.type === 'buff') return '✨';
  if (item.type === 'critical') return '⚡';
  
  // Damage types based on target
  if (item.type === 'damage') {
    if (item.target === 'enemy') return '⚔️'; // Player attacking
    if (item.target === 'player') return '💥'; // Enemy attacking
  }
  
  if (item.type === 'poison') return '🤢';
  if (item.type === 'heat') return '🔥';
  if (item.type === 'shock') return '⚡';
  
  return ''; // No icon for particles
};

const getParticleColor = (t) => {
    switch(t) {
        case 'fire': return '#f55';
        case 'ice': return '#aaf';
        case 'blood': return '#a00';
        case 'heal': return '#4f4';
        case 'sludge': return '#2ecc71'; // Poison
        case 'spore': return '#9b59b6'; // Purple
        case 'mist': return '#bdc3c7'; // Gray
        case 'gold': return '#f1c40f';
        default: return '#fff';
    }
}
</script>

<template>
  <div class="vfx-layer">
    <div
      v-for="fx in activeFx"
      :key="fx.id"
      class="dmg-popup"
      :class="[fx.type, { 'player-dmg': fx.target === 'player' }]"
      :style="fx.style"
    >
      <span class="icon">{{ fx.icon }}</span>
      <span class="value">{{ fx.val }}</span>
    </div>
  </div>
</template>

<style scoped>
.vfx-layer {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 9000;
  overflow: hidden;
}

.dmg-popup {
  position: absolute;
  font-size: 26px;
  font-weight: bold;
  color: #fff;
  text-shadow: 2px 2px 0 #000, 0 0 10px rgba(255, 255, 255, 0.3);
  animation: floatUp 0.9s ease-out forwards;
  white-space: nowrap;
  display: flex;
  align-items: center;
  gap: 5px;
}

.dmg-popup .icon {
  font-size: 30px;
  filter: drop-shadow(0 0 5px rgba(255,255,255,0.6));
  animation: iconPop 0.3s ease-out;
}

@keyframes iconPop {
  0% { transform: scale(0.5); }
  50% { transform: scale(1.3); }
  100% { transform: scale(1); }
}

.dmg-popup .value {
  font-size: 22px;
  font-family: 'Courier New', monospace;
  letter-spacing: 1px;
}

/* Critical Hit - Larger, flashier */
.dmg-popup.critical {
  font-size: 42px;
  color: #ffd700;
  text-shadow: 3px 3px 0 #f00, 0 0 20px rgba(255, 215, 0, 0.8), 0 0 40px rgba(255, 100, 0, 0.5);
  z-index: 9001;
  animation: criticalFloat 1s ease-out forwards;
}

.dmg-popup.critical .value {
  font-size: 38px;
}

@keyframes criticalFloat {
  0% {
    opacity: 0;
    transform: translate(0, 0) scale(0.3) rotate(-10deg);
  }
  20% {
    opacity: 1;
    transform: translate(var(--tx), -30px) scale(1.5) rotate(5deg);
  }
  40% {
    transform: translate(var(--tx), -50px) scale(1.3) rotate(-3deg);
  }
  100% {
    opacity: 0;
    transform: translate(var(--tx), var(--ty)) scale(1) rotate(0deg);
  }
}

/* Heal Effect */
.dmg-popup.heal {
  color: #4eff4e;
  font-size: 24px;
  text-shadow: 2px 2px 0 #004400, 0 0 15px rgba(76, 255, 76, 0.6);
}

.dmg-popup.heal .value {
  color: #6fff6f;
}

/* Buff Effect */
.dmg-popup.buff {
  color: #ffcc00;
  font-size: 22px;
  text-shadow: 2px 2px 0 #553300, 0 0 15px rgba(255, 204, 0, 0.6);
  animation: buffFloat 1s ease-out forwards;
}

@keyframes buffFloat {
  0% {
    opacity: 0;
    transform: translate(0, 0) scale(0.8);
  }
  20% {
    opacity: 1;
    transform: translate(var(--tx), -20px) scale(1.1);
  }
  100% {
    opacity: 0;
    transform: translate(var(--tx), -100px) scale(1);
  }
}

/* Debuff Effect */
.dmg-popup.debuff {
  color: #ff66ff;
  font-size: 22px;
  text-shadow: 2px 2px 0 #330033, 0 0 15px rgba(255, 66, 255, 0.6);
}

/* Standard Damage */
.dmg-popup.damage {
  color: #fff;
  text-shadow: 2px 2px 0 #000, 0 0 8px rgba(255, 100, 100, 0.4);
}

/* Player took damage - Red and alarming */
.dmg-popup.player-dmg {
  color: #ff4444;
  font-size: 30px;
  text-shadow: 0 0 8px #ff0000, 0 0 20px rgba(255, 0, 0, 0.6);
  animation: playerDmgFloat 0.8s ease-out forwards;
}

@keyframes playerDmgFloat {
  0% {
    opacity: 0;
    transform: translate(0, 0) scale(1.5);
    filter: blur(3px);
  }
  20% {
    opacity: 1;
    transform: translate(var(--tx), -25px) scale(1.2);
    filter: blur(0);
  }
  100% {
    opacity: 0;
    transform: translate(var(--tx), var(--ty)) scale(0.9);
  }
}

/* Particle Effects */
.dmg-popup[class*="particle-"] {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  animation: particleBurst 0.6s ease-out forwards;
}

@keyframes particleBurst {
  0% {
    opacity: 1;
    transform: translate(0, 0) scale(1);
  }
  100% {
    opacity: 0;
    transform: translate(var(--tx), var(--ty)) scale(0.3);
  }
}

/* Default Float Animation */
@keyframes floatUp {
  0% {
    opacity: 0;
    transform: translate(0, 0) scale(0.5);
  }
  15% {
    opacity: 1;
    transform: translate(var(--tx), -25px) scale(1.15);
  }
  100% {
    opacity: 0;
    transform: translate(var(--tx), var(--ty)) scale(1);
  }
}
</style>
