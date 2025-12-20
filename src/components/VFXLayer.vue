<script setup>
import { ref, computed, watch } from "vue";
import { gameStore } from "../game/store.js";

const s = gameStore.state;
const activeFx = ref([]);

// Watch the VFX queue for new items
watch(
  () => s.vfx.length,
  (newLen, oldLen) => {
    if (newLen > oldLen) {
      // Get the new items
      const newItems = s.vfx.slice(oldLen);
      newItems.forEach((item) => {
        addFx(item);
      });
    }
  }
);

const addFx = (item) => {
  // Deduplicate: If this ID is already being shown, ignore it
  if (activeFx.value.some(fx => fx.id === item.id)) return;

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

const getParticleColor = (t) => {
    switch(t) {
        case 'fire': return '#f55';
        case 'ice': return '#aaf';
        case 'blood': return '#a00';
        case 'heal': return '#4f4';
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
      {{ fx.val }}
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
  font-size: 24px;
  font-weight: bold;
  color: #fff;
  text-shadow: 2px 2px 0 #000;
  animation: floatUp 0.8s ease-out forwards;
  white-space: nowrap;
}

.dmg-popup.critical {
  font-size: 36px;
  color: #ff0;
  text-shadow: 3px 3px 0 #f00;
  z-index: 9001;
}

.dmg-popup.heal {
  color: #4f4;
  font-size: 20px;
}

.dmg-popup.damage {
  color: #fff;
}

/* Player took damage */
.dmg-popup.player-dmg {
  color: #f44;
  font-size: 28px;
  border: 1px solid #000; /* Text stroke mock */
  text-shadow: 0 0 5px #f00;
}

@keyframes floatUp {
  0% {
    opacity: 0;
    transform: translate(0, 0) scale(0.5);
  }
  15% {
    opacity: 1;
    transform: translate(var(--tx), -20px) scale(1.2);
  }
  100% {
    opacity: 0;
    transform: translate(var(--tx), var(--ty)) scale(1);
  }
}
</style>
