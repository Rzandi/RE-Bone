<script setup>
import { computed } from "vue";
import { gameStore } from "../game/store.js";

const list = computed(() => {
    if(window.Achievements) {
        return Object.values(Achievements.list);
    }
    return [];
});

const progress = computed(() => {
     if(window.Achievements) {
         return `${Achievements.getUnlockedCount()} / ${Achievements.getTotalCount()}`;
     }
     return "0/0";
});

const close = () => {
    // Smart Close
    if (window.Game && window.Game.state.progress > 0 || window.Game.currAction !== 'idle') {
        gameStore.state.activePanel = 'menu-view';
    } else {
        gameStore.state.activePanel = 'title';
    }
};

const getStatus = (ach) => {
    if(ach.unlocked) return "UNLOCKED";
    if(ach.target) return `${ach.progress || 0} / ${ach.target}`;
    return "LOCKED";
}
</script>

<template>
  <div class="achievements-panel scanline">
    <div class="header">
      <h2>ACHIEVEMENTS</h2>
      <div class="progress">{{ progress }}</div>
      <button class="btn-close" @click="close">X</button>
    </div>

    <div class="grid">
        <div v-for="ach in list" :key="ach.name" class="card" :class="{ unlocked: ach.unlocked }">
            <div class="icon">{{ ach.icon }}</div>
            <div class="info">
                <h3>{{ ach.name }}</h3>
                <small>{{ ach.desc }}</small>
                <div class="status-bar" v-if="!ach.unlocked && ach.target">
                     <div class="fill" :style="{ width: ((ach.progress||0)/ach.target)*100 + '%' }"></div>
                </div>
                <div class="status-text">{{ getStatus(ach) }}</div>
            </div>
        </div>
    </div>
  </div>
</template>

<style scoped>
.achievements-panel {
    background: #0d0d15; color: #eee;
    height: 100%; display: flex; flex-direction: column;
    padding: 10px;
}

.header {
    display: flex; justify-content: space-between; align-items: center;
    border-bottom: 2px solid #555; padding-bottom: 10px; margin-bottom: 10px;
}
.header h2 { margin: 0; color: #ffd700; }
.progress { font-weight: bold; color: #aaa; }
.btn-close { background: #300; border: 1px solid #f00; color: #fff; cursor: pointer; }

.grid {
    flex: 1; overflow-y: auto;
    display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 10px;
}

.card {
    background: #1a1a25; border: 1px solid #333; padding: 10px;
    display: flex; align-items: center; gap: 10px; opacity: 0.7;
    transition: all 0.3s;
    overflow: hidden;
}
.card.unlocked {
    opacity: 1; border-color: #ffd700; background: #2a2a35;
    box-shadow: 0 0 10px rgba(255, 215, 0, 0.2);
}

.icon { font-size: 2rem; flex-shrink: 0; }
.info { flex: 1; min-width: 0; overflow: hidden; }
.info h3 { margin: 0; font-size: 1rem; color: #ccc; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.card.unlocked h3 { color: #ffd700; }
.info small { color: #888; display: block; margin-bottom: 5px; }

.status-bar {
    height: 4px; background: #333; width: 100%; margin-top: 5px;
}
.fill { height: 100%; background: #00bcd4; }
.status-text { font-size: 0.7rem; color: #666; text-align: right; margin-top: 2px; }
.card.unlocked .status-text { color: #ffd700; font-weight: bold; }
</style>
