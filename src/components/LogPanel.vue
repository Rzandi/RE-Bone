<script setup>
import { nextTick, watch, ref } from "vue";

const props = defineProps(["logs"]);
const logContainer = ref(null);

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
</script>

<template>
  <div id="log-panel" ref="logRef">
    <div v-for="(log, i) in props.logs" :key="i" class="log-entry" :class="log.type">
      <span v-if="log.count > 1" class="log-count">x{{ log.count }}</span>
      <span v-html="log.msg"></span>
    </div>
  </div>
</template>

<style scoped>
.log-panel {
  flex: 1;
  border: 1px solid var(--c-border);
  background: rgba(0, 0, 0, 0.5);
  margin: 10px 0;
  padding: 10px;
  overflow-y: auto;
  font-family: "Courier New", Courier, monospace;
  font-size: 0.9rem;
  text-align: left;
}
.log-item {
  margin-bottom: 4px;
  border-bottom: 1px solid #111;
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
</style>
