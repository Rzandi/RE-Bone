<script setup>
import { computed } from "vue";
import { gameStore } from "../game/store.js";

const emit = defineEmits(["action"]);

const s = gameStore.state;

// Define buttons based on activePanel
const buttons = computed(() => {
  // 1. Dynamic Overrides (e.g. Sanctuary, Manual Explore)
  if (s.buttons && s.buttons.length > 0) {
      return s.buttons.map(b => {
          if (!b) return null; // Spacer
          return {
              label: b.txt,
              action: "dynamic", // Special action type
              fn: b.fn,          // Direct function reference
              color: b.col
          };
      });
  }

  // 2. Default Panel Logic
  const panel = s.activePanel || "menu-view";

  if (panel === "menu-view") {
    return [
      { label: "🔍 EXPLORE", action: "explore", color: "var(--c-gold)" },
      { label: "👤 STATUS", action: "status" },
      { label: "🎒 ITEM", action: "item" }, 
      { label: "⚙️ OPT", action: "settings" },
    ];
  }
  
  if (panel === "combat") {
    return [
      { label: "⚔️ ATTACK", action: "attack", color: "#f55" },
      { label: "⚡ SKILL", action: "skill", color: "var(--c-blue)" },
      { label: "🎒 ITEM", action: "item" },
      { label: "🏃 FLEE", action: "flee" },
    ];
  }

  if (panel === "inventory") {
    return [{ label: "🔙 BACK", action: "back" }, null, null, null];
  }

  return [{ label: "MENU", action: "menu" }, null, null, null];
});

const handleClick = (btn) => {
  if (btn) {
      if (btn.fn && typeof btn.fn === 'function') {
          btn.fn(); // Execute direct function
      } else if (btn.action) {
          emit("action", btn.action);
      }
  }
};
</script>

<template>
  <div id="controls">
    <template v-for="(btn, idx) in buttons" :key="idx">
      <button
        v-if="btn"
        @click.stop.prevent="handleClick(btn)"
        :style="{
          color: btn.color || 'var(--c-text)',
          borderColor: btn.color ? btn.color : 'var(--c-border)',
        }"
      >
        {{ btn.label }}
      </button>
      <div v-else class="empty-btn"></div>
    </template>
  </div>
</template>

<style scoped>
/* Grid layout forced here for reliability */
#controls {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
  padding: 5px;
  margin-top: auto; /* Push to bottom if flex parent */
}

button {
  background: linear-gradient(to bottom, #222, #111);
  border: 1px solid var(--c-border);
  color: var(--c-text);
  font-family: inherit;
  font-size: 1rem;
  font-weight: bold;
  cursor: pointer;
  text-transform: uppercase;
  transition: all 0.1s;
  border-radius: 6px;
  padding: 0; /* Centered by flex usually, or line-height */
  display: flex; justify-content: center; align-items: center;
  min-height: 54px; /* Optimal Touch Target (48px+) */
  box-shadow: 0 4px 0 #000; /* Retro press depth */
}
button:active {
  background: #333;
  transform: translateY(4px); /* Pushed down */
  box-shadow: 0 0 0 #000;
}
.empty-btn {
  visibility: hidden;
}
</style>
