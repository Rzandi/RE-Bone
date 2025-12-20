<script setup>
import { computed } from "vue";
import { gameStore } from "../game/store.js";

const active = computed(() => gameStore.state.mobileTooltip && gameStore.state.mobileTooltip.active);
const text = computed(() => gameStore.state.mobileTooltip ? gameStore.state.mobileTooltip.text : "");

const close = () => {
    if(gameStore.state.mobileTooltip) {
        gameStore.state.mobileTooltip.active = false;
    }
};
</script>

<template>
  <div v-if="active" class="mobile-tooltip-backdrop" @click="close">
      <div class="mobile-tooltip-content" @click.stop>
          <div style="white-space: pre-wrap;">{{ text }}</div>
          <button @click="close" style="width:100%; margin-top:10px; padding:10px; background:#333; color:#fff; border:1px solid #555;">CLOSE</button>
      </div>
  </div>
</template>

<style scoped>
.mobile-tooltip-backdrop {
    position: fixed; top: 0; left: 0; width: 100%; height: 100%;
    background: rgba(0,0,0,0.6); z-index: 9999;
    display: flex; align-items: center; justify-content: center;
}
.mobile-tooltip-content {
    background: #111; border: 2px solid gold; color: #fff;
    padding: 20px; width: 80%; max-width: 300px;
    box-shadow: 0 0 20px #000;
}
</style>
