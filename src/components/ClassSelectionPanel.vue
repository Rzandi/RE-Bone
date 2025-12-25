<script setup>
import { computed, onMounted } from "vue";
import { gameStore } from "../game/store.js";
import { DB } from "../game/config/database.js";
import { SaveManager } from "../game/managers/SaveManager.js";
import { Game } from "../game/core/game.js";
import { Player } from "../game/logic/Player.js";
import { SoundManager } from "../game/managers/sound.js";
import { PASSIVES_DB } from "../game/config/skills.js";

const s = gameStore.state;
const classes = computed(() => DB.CLASSES || {});

// Load Meta on mount to ensure we have unlocks
onMounted(() => {
    if(SaveManager && SaveManager.loadMeta) SaveManager.loadMeta();
});

const isUnlocked = (id) => {
    if (id === 'skeleton') return true;
    
    // Meta check
    const meta = s.meta || { unlockedClasses: [], maxFloor: 0 }; 
    return meta.unlockedClasses.includes(id);
}

const getLockReason = (id) => {
    if (id === 'ghoul') return "Reach Floor 20";
    if (id === 'phantom') return "Reach Floor 40";
    if (id === 'vampire') return "Unlock In Souls Shop";
    if (id === 'lich') return "Unlock In Souls Shop";
    
    // Traitor Classes
    if (id === 'druid') return "Defeat Keeper (Nature's Den)";
    if (id === 'paladin') return "Defeat Lord Paladin (Castle)";
    if (id === 'berserker') return "Defeat Warlord (Iron Fort)";
    if (id === 'mechanist') return "Defeat Archmage (Arcane Twr)";
    if (id === 'shadow_assassin') return "Defeat Grandmaster (Shadow Guild)";
    
    return "Locked";
}

// v38.0: Get passive info for display
const getPassiveInfo = (passiveId) => {
    const passive = PASSIVES_DB[passiveId];
    if (!passive) return { name: passiveId, desc: "" };
    return passive;
}

const selectClass = (clsId) => {
    if (!isUnlocked(clsId)) return;

    // Determine if this is New Game or Boss Rush
    if(Game && Game.state.bossRush.active) {
        if(Player) Player.init(clsId);
        Game.bossRushInit(); 
    } else {
        if(Game && Game.resetRunFlags) Game.resetRunFlags();
        if(Player) Player.init(clsId);
        Game.exploreState();
    }
};

const close = () => {
    // Check if we are in Boss Rush mode (which uses this panel)
    if (Game && Game.state.bossRush.active) {
        // Cancel Boss Rush? Go to Menu
        gameStore.state.activePanel = 'menu-view';
        Game.state.bossRush.active = false; // Cancel it
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
                
                <!-- v38.0: Passives Display -->
                <div class="passives" v-if="isUnlocked(id) && cls.passives">
                    <div class="passive-label">PASSIVES:</div>
                    <div class="passive-list">
                        <span v-for="pid in cls.passives" :key="pid" class="passive-item" :title="getPassiveInfo(pid).desc">
                            ⚡ {{ getPassiveInfo(pid).name }}
                        </span>
                    </div>
                </div>
                
                <!-- Locked Overlay Text -->
                <div class="lock-msg" v-else-if="!isUnlocked(id)">
                    🔒 {{ getLockReason(id) }}
                </div>
            </div>
        </div>
    </div>
  </div>
</template>

<style scoped>
.class-panel {
    position: fixed; top: 0; left: 0; width: 100%; height: 100dvh;
    background: #000; z-index: 200;
    display: flex; flex-direction: column;
}

.header { padding: 20px; border-bottom: 2px solid #333; display: flex; justify-content: space-between; align-items: center; }
.header h2 { color: #fff; margin: 0; letter-spacing: 2px; }

.class-list {
    flex: 1; 
    padding: 20px 20px 200px 20px; /* Safe Scroll Area */
    overflow-y: auto;
    display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 20px;
}

.class-card {
    background: #111; border: 1px solid #333; padding: 20px;
    cursor: pointer; transition: all 0.2s; display: flex; gap: 15px; align-items: center;
    position: relative; /* Overflow hidden removed to prevent clipping */
}

.class-card:hover:not(.locked) {
    background: #222; border-color: var(--c-gold); transform: translateY(-2px);
}

.class-card.locked {
    opacity: 0.6; cursor: not-allowed; border-color: #222;
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

/* v38.0: Passives Display */
.passives { margin-top: 10px; padding-top: 8px; border-top: 1px dashed #333; }
.passive-label { color: #888; font-size: 0.7rem; margin-bottom: 4px; letter-spacing: 1px; }
.passive-list { display: flex; flex-wrap: wrap; gap: 6px; }
.passive-item {
    background: linear-gradient(135deg, #2a1f5d, #1a1233);
    color: #c9b0ff;
    padding: 3px 8px;
    border-radius: 3px;
    font-size: 0.75rem;
    border: 1px solid #5a3d8a;
    cursor: help;
}
.passive-item:hover {
    background: linear-gradient(135deg, #3d2a7d, #2a1f4d);
    border-color: #8a6db5;
}
</style>
