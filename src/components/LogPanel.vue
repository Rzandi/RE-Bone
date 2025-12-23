<script setup>
import { nextTick, watch, ref, onMounted } from "vue";

const props = defineProps(["logs"]);
const logRef = ref(null);

// Auto-scroll logic
const scrollToBottom = async () => {
    await nextTick();
    if(logRef.value) {
        logRef.value.scrollTop = logRef.value.scrollHeight;
    }
};

watch(() => props.logs, () => {
    scrollToBottom();
}, { deep: true, immediate: true });

onMounted(() => {
    scrollToBottom(); 
});

// Get icon and color based on log content
const getLogStyle = (log) => {
  const text = log.text.toLowerCase();
  
  // Universal skill detection - "Used [anything]!" or "[skillname] hit for"
  if (text.includes('used ') || 
      (text.includes(' hit for') && !text.includes('you hit for'))) {
    return { icon: '✨', color: '#c4b5fd' }; // Purple for skills
  }
  
  // Player normal attacks
  if (text.includes('you hit') || text.includes('you dealt')) {
    return { icon: '⚔️', color: '#67e8f9' }; // Cyan for normal attacks
  }
  
  // Enemy attacks
  if (text.includes('attacks for') || text.includes('hit you')) {
    return { icon: '💥', color: '#f87171' }; // Red for enemy
  }
  
  // Buffs/Heals
  if (log.type === 'buff' || text.includes('heal') || text.includes('regen')) {
    return { icon: '💚', color: '#86efac' }; // Green
  }
  
  // Critical
  if (text.includes('crit')) {
    return { icon: '⚡', color: '#fbbf24' }; // Gold
  }
  
  // Default
  return { icon: '', color: '#aaa' };
};
</script>

<template>
  <div id="log-panel" class="log-panel" ref="logRef">
    <div v-for="(log, i) in props.logs" :key="i" class="log-entry" :class="log.type">
      <span v-if="log.count > 1" class="log-count">x{{ log.count }}</span>
      <span class="log-icon">{{ getLogStyle(log).icon }}</span>
      <span v-html="log.text" :style="{ color: getLogStyle(log).color }"></span>
    </div>
  </div>
</template>

<style scoped>
#log-panel {
  flex: 1;
  border: 1px solid #444;
  background: rgba(0, 0, 0, 0.85); /* Darker for readability */
  margin: 5px 0;
  padding: 8px;
  overflow-y: auto;
  font-family: "Courier New", Courier, monospace;
  font-size: 0.85rem;
  text-align: left;
  min-height: 150px;
  border-radius: 4px;
  box-shadow: inset 0 0 10px #000;
}
.log-entry {
  margin-bottom: 3px;
  color: #ccc; /* Brighter default text */
  line-height: 1.3;
  border-bottom: 1px solid rgba(255,255,255,0.05); /* Subtle separator */
}
.log-count {
  color: #fff;
  background: #555;
  border-radius: 4px;
  padding: 0 4px;
  font-size: 0.75rem;
  margin-right: 5px;
}
.log-icon {
  margin-right: 6px;
  font-size: 1.1em;
}
.combat {
  color: #f88;
}
.item {
  color: #fd0;
}
.boss {
  color: #f0f;
  font-size: 1.1em;
  border-bottom: 1px solid #f0f;
}
.damage {
  color: #f44;
}
.buff {
  color: #4f4;
}
</style>
