<script setup>
import { computed } from "vue";
import { gameStore } from "../game/store.js";

const scores = computed(() => {
    if(window.Social) return Social.getHighScores();
    return [];
});

const close = () => {
  // Smart Close
  if (window.Game && window.Game.state.progress > 0 || window.Game.currAction !== 'idle') {
      gameStore.state.activePanel = 'menu-view';
  } else {
      gameStore.state.activePanel = 'title';
  }
};
</script>

<template>
  <div class="leaderboard-panel scanline">
    <div class="header">
      <h2>HALL OF BONES</h2>
      <button class="btn-close" @click="close">X</button>
    </div>
    
    <div class="table-container">
        <table v-if="scores.length > 0">
            <thead>
                <tr>
                    <th>#</th>
                    <th>Class</th>
                    <th>Lvl</th>
                    <th>Floor</th>
                    <th>Score</th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="(run, i) in scores" :key="i">
                    <td>{{ i + 1 }}</td>
                    <td>{{ run.class || "Skeleton" }}</td>
                    <td>{{ run.level }}</td>
                    <td>{{ run.floor }}</td>
                    <td class="score">{{ run.score }}</td>
                </tr>
            </tbody>
        </table>
        <div v-else class="empty">No souls recorded yet...</div>
    </div>
  </div>
</template>

<style scoped>
.leaderboard-panel {
    position: absolute; top: 0; left: 0; width: 100%; height: 100%;
    background: #050510; z-index: 102;
    display: flex; flex-direction: column;
}
.header { padding: 15px; border-bottom: 2px solid var(--c-cyan); display: flex; justify-content: space-between; }
.header h2 { color: var(--c-cyan); margin: 0; }
.btn-close { background: transparent; border: 1px solid var(--c-cyan); color: var(--c-cyan); width: 30px; }

.table-container { padding: 20px; overflow-y: auto; }
table { width: 100%; border-collapse: collapse; color: #ccc; }
th { text-align: left; border-bottom: 1px solid #444; padding: 10px; color: #888; }
td { padding: 10px; border-bottom: 1px solid #222; }
.score { color: var(--c-gold); font-weight: bold; text-align: right; }
.empty { text-align: center; color: #666; margin-top: 50px; }
</style>
