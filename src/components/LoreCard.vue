<script setup>
import { computed } from "vue";
import { gameStore } from "../game/store.js";

const active = computed(() => gameStore.state.lore.active);
const title = computed(() => gameStore.state.lore.title);
const text = computed(() => gameStore.state.lore.text);

const close = () => {
    gameStore.state.lore.active = false;
};
</script>

<template>
  <div v-if="active" class="lore-backdrop" @click="close">
    <div class="lore-card" @click.stop>
       <h2>{{ title }}</h2>
       <hr/>
       <p>{{ text }}</p>
       <button @click="close">CLOSE</button>
    </div>
  </div>
</template>

<style scoped>
.lore-backdrop {
    position: fixed; top: 0; left: 0; width: 100%; height: 100dvh;
    background: rgba(0,0,0,0.8); z-index: 10000;
    display: flex; align-items: center; justify-content: center;
}
.lore-card {
    background: #1a1a1a; border: 2px solid gold; color: #e0e0e0;
    padding: 20px; width: 90%; max-width: 400px;
    box-shadow: 0 0 30px rgba(255, 215, 0, 0.2);
    animation: fadeIn 0.3s ease;
}
h2 { color: gold; margin-top: 0; }
hr { border-color: #444; margin: 10px 0; }
p { line-height: 1.5; white-space: pre-wrap; margin-bottom: 20px; }
button { width: 100%; padding: 10px; background: #333; color: white; border: 1px solid #555; cursor: pointer; }

@keyframes fadeIn { from { opacity: 0; transform: scale(0.9); } to { opacity: 1; transform: scale(1); } }
</style>
