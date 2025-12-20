<script setup>
import { computed, onMounted } from "vue";
import { gameStore } from "../game/store.js";
import { DB } from "../game/config/database.js";
import { SaveManager } from "../game/managers/SaveManager.js"; // Import SaveManager to check meta

const s = gameStore.state;
const classes = computed(() => DB.CLASSES || {});

// Load Meta on mount to ensure we have unlocks
onMounted(() => {
    if(SaveManager && SaveManager.loadMeta) SaveManager.loadMeta();
});

const isUnlocked = (id) => {
    if (id === 'skeleton') return true;
    
    // Meta check
    const meta = s.meta || { unlockedClasses: [], maxFloor: 0 }; // Fallback
    
    // Level Based Unlocks (Using Max Floor as proxy for progress, or if they own it)
    if (meta.unlockedClasses.includes(id)) return true;
    
    // Hardcoded Level Unlocks (Check against some meta.maxLevel if we tracked it, 
    // but for now we'll assumes unlockedClasses is the source of truth, 
    // and we will Auto-Unlock them when requirements met).
    // Actually, let's just show them as Locked with logic here.
    
    // NOTE: We need to Auto-Unlock Ghoul/Phantom when requirements met.
    // For now, this function just checks if they ARE unlocked.
    return false;
}

const getLockReason = (id) => {
    if (id === 'ghoul') return "Unlock at Level 50";
    if (id === 'phantom') return "Unlock at Level 80";
    return "Buy in Soul Shop";
}

const selectClass = (clsId) => {
    if (!isUnlocked(clsId)) return;

    // Determine if this is New Game or Boss Rush
    if(window.Game && window.Game.state.bossRush.active) {
        if(window.Player) window.Player.init(clsId);
        window.Game.bossRushInit(); 
    } else {
        if(window.Player) window.Player.init(clsId);
        window.Game.exploreState();
    }
};

const close = () => {
    // Check if we are in Boss Rush mode (which uses this panel)
    if (window.Game && window.Game.state.bossRush.active) {
        // Cancel Boss Rush? Go to Menu
        gameStore.state.activePanel = 'menu-view';
        window.Game.state.bossRush.active = false; // Cancel it
    } else {
        gameStore.state.activePanel = 'title';
    }
};
</script>

<template>
  <div class="class-panel scanline">
    <div class="header">
      <h2>CHOOSE YOUR VESSEL</h2>
      <button class="btn-close" @click="close">BACK</button>
    </div>

    <div class="class-list">
        <div v-for="(cls, id) in classes" :key="id" 
             class="class-card" 
             :class="{ locked: !isUnlocked(id) }"
             @click="selectClass(id)">
            
            <div class="icon">{{ cls.icon || '💀' }}</div>
            
            <div class="info">
                <h3>{{ cls.name }}</h3>
                <p>{{ cls.desc }}</p>
                
                <!-- Stats Display -->
                <div class="stats" v-if="isUnlocked(id)">
                    <span class="stat-str">STR: {{ cls.attr.STR }}</span>
                    <span class="stat-vit">VIT: {{ cls.attr.VIT }}</span>
                    <span class="stat-int">INT: {{ cls.attr.INT }}</span>
                </div>
                
                <!-- Locked Overlay Text -->
                <div class="lock-msg" v-else>
                    🔒 {{ getLockReason(id) }}
                </div>
            </div>
        </div>
    </div>
  </div>
</template>

<style scoped>
.class-panel {
    position: fixed; top: 0; left: 0; width: 100%; height: 100%;
    background: #000; z-index: 200;
    display: flex; flex-direction: column;
}

.header { padding: 20px; border-bottom: 2px solid #333; display: flex; justify-content: space-between; align-items: center; }
.header h2 { color: #fff; margin: 0; letter-spacing: 2px; }

.class-list {
    flex: 1; padding: 20px; overflow-y: auto;
    display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 20px;
}

.class-card {
    background: #111; border: 1px solid #333; padding: 20px;
    cursor: pointer; transition: all 0.2s; display: flex; gap: 15px; align-items: center;
    position: relative; overflow: hidden;
}

.class-card:hover:not(.locked) {
    background: #222; border-color: var(--c-gold); transform: translateY(-2px);
}

.class-card.locked {
    opacity: 0.5; cursor: not-allowed; border-color: #222; grayscale: 100%;
}

.icon { font-size: 3.5rem; }

.info h3 { margin: 0; color: var(--c-gold); font-size: 1.2rem; }
.info p { color: #888; font-size: 0.9rem; margin: 5px 0 10px; }

.stats { display: flex; gap: 15px; color: #aaa; font-size: 0.85rem; font-family: monospace; }
.stat-str { color: #f55; }
.stat-vit { color: #5f5; }
.stat-int { color: #55f; }

.lock-msg {
    color: #f00; font-weight: bold; font-size: 0.9rem;
    background: rgba(0,0,0,0.8); padding: 5px; border-radius: 4px; border: 1px solid #500;
}

.btn-close { background: transparent; border: 1px solid #444; color: #888; padding: 5px 10px; cursor: pointer; }
.btn-close:hover { color: #fff; border-color: #fff; }
</style>
