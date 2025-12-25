<script setup>
import { ref, onMounted, computed } from "vue";
import { gameStore } from "../game/store.js";
import { Leaderboard } from "../game/managers/Leaderboard.js";

const entries = ref([]);
const filter = ref("All"); // All, Normal, Endless, Daily

// Fetch data on mount
onMounted(() => {
    refresh();
});

const refresh = () => {
    entries.value = Leaderboard.getEntries();
};

const filteredEntries = computed(() => {
    let list = entries.value;
    if (filter.value !== "All") {
        list = list.filter(e => e.mode === filter.value);
    }
    // Sort Score Desc
    return list.sort((a, b) => b.score - a.score).slice(0, 50);
});

const close = () => {
    // v38.8 FIX: Use previousPanel for proper back navigation
    const prev = gameStore.state.previousPanel;
    if (prev) {
        gameStore.state.previousPanel = null;
        gameStore.state.activePanel = prev;
    } else {
        gameStore.state.activePanel = "menu-view";
    }
};

const formatDate = (iso) => {
    try {
        return new Date(iso).toLocaleDateString();
    } catch { return "-"; }
};
</script>

<template>
  <div class="leaderboard-panel scanline">
    <div class="header">
        <h1>HALL OF HEROES</h1>
        <button class="close-btn" @click="close">❌</button>
    </div>

    <!-- Filters -->
    <div class="filters">
        <button v-for="m in ['All', 'Normal', 'Endless', 'Daily', 'Boss Rush']" 
                :key="m"
                :class="{ active: filter === m }"
                @click="filter = m">
            {{ m }}
        </button>
    </div>

    <!-- List -->
    <div class="entries-list">
        <div class="entry header-row">
            <span class="rank">#</span>
            <span class="score">SCORE</span>
            <span class="name">NAME</span>
            <span class="floor">FLOOR</span>
            <span class="mode">MODE</span>
            <span class="date">DATE</span>
        </div>
        
        <div v-for="(entry, index) in filteredEntries" :key="index" class="entry">
            <span class="rank" :class="{'top-3': index < 3}">{{ index + 1 }}</span>
            <span class="score highlight">{{ entry.score }}</span>
            <span class="name">{{ entry.name }}</span>
            <span class="floor">Floor {{ entry.floor }}</span>
            <span class="mode badge" :class="entry.mode.toLowerCase().replace(' ', '-')">{{ entry.mode }}</span>
            <span class="date">{{ formatDate(entry.date) }}</span>
        </div>

        <div v-if="filteredEntries.length === 0" class="empty-state">
            No heroes have fallen... yet.
        </div>
    </div>
  </div>
</template>

<style scoped>
.leaderboard-panel {
    background: #0a0a10;
    color: #eee;
    height: 100dvh;
    display: flex;
    flex-direction: column;
    padding: 20px;
}

.header {
    display: flex; justify-content: space-between; align-items: center;
    margin-bottom: 20px;
    border-bottom: 1px solid #333;
    padding-bottom: 10px;
}

h1 { color: gold; margin: 0; }
.close-btn { background: none; border: none; font-size: 1.5rem; cursor: pointer; color: #fff; }

.filters {
    display: flex; gap: 10px; margin-bottom: 20px;
}
.filters button {
    background: #222; border: 1px solid #444; color: #aaa;
    padding: 8px 16px; cursor: pointer; transition: all 0.2s;
}
.filters button.active {
    background: #444; color: gold; border-color: gold;
}

.entries-list {
    flex: 1; overflow-y: auto;
    border: 1px solid #333;
    background: #111;
}

.entry {
    display: grid;
    grid-template-columns: 40px 100px 1fr 80px 100px 100px;
    padding: 10px;
    border-bottom: 1px solid #222;
    align-items: center;
}

.entry:hover { background: #1a1a20; }

.header-row {
    font-weight: bold; color: #888; background: #151515;
    position: sticky; top: 0;
}

.rank { font-weight: bold; color: #666; }
.rank.top-3 { color: gold; text-shadow: 0 0 5px orange; font-size: 1.2rem; }

.score { font-family: monospace; font-size: 1.1rem; }
.score.highlight { color: #50fa7b; }

.badge {
    padding: 2px 6px; border-radius: 4px; font-size: 0.8rem; text-align: center;
}
.badge.normal { background: #333; color: #ccc; }
.badge.endless { background: #300030; color: #d0d; border: 1px solid #808; }
.badge.daily { background: #002030; color: #00ddee; border: 1px solid #0088aa; }
.badge.boss-rush { background: #300; color: #f55; }

.empty-state {
    padding: 40px; text-align: center; color: #666; font-style: italic;
}
</style>
