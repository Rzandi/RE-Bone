<script setup>
import { computed, ref } from "vue";
import { gameStore } from "../game/store.js";
import { DB } from "../game/config/database.js";

const s = gameStore.state;
const activeTree = ref("st_basic"); // Default tree key, maybe dynamic later

const tree = computed(() => {
  return DB.SKILL_TREES ? DB.SKILL_TREES[activeTree.value] : null;
});

const nodes = computed(() => {
  if (!tree.value) return [];
  return Object.values(tree.value.nodes);
});

const isUnlocked = (node) => {
    return s.unlockedSkills.includes(node.id);
};

const unlock = (node) => {
    if(window.PlayerLogic) {
        PlayerLogic.unlockSkill(activeTree.value, node.id);
    }
};

const canUnlock = (node) => {
    if (s.sp < node.cost) return false;
    if (node.req && !s.unlockedSkills.includes(node.req)) return false;
    return true;
};

const close = () => {
    // Return to previous safe panel (usually Menu)
    gameStore.state.activePanel = "menu-view"; 
};

// v36.6: Get passive ability name
const getPassiveName = (passiveId) => {
    const passive = DB.PASSIVES ? DB.PASSIVES[passiveId] : null;
    return passive ? passive.name : passiveId;
};

// v36.6: Get passive ability description
const getPassiveDesc = (passiveId) => {
    const passive = DB.PASSIVES ? DB.PASSIVES[passiveId] : null;
    return passive ? passive.desc : 'Unknown passive ability';
};
</script>

<template>
  <div class="skills-panel scanline">
    <div class="header">
      <h2>ARCANE KNOWLEDGE</h2>
      <div class="sp-display">SP: {{ s.sp }}</div>
      <button class="btn-close" @click="close">X</button>
    </div>

    <!-- v36.6: 2-Column Layout -->
    <div class="panel-container">
        <!-- LEFT: Passive Skills -->
        <div class="passives-section">
            <h3>⚡ PASSIVE ABILITIES</h3>
            <div class="passive-list">
                <div v-for="passiveId in s.passives" :key="passiveId" class="passive-card">
                    <div class="passive-icon">🛡️</div>
                    <div class="passive-info">
                        <h4>{{ getPassiveName(passiveId) }}</h4>
                        <small>{{ getPassiveDesc(passiveId) }}</small>
                    </div>
                </div>
                
                <div v-if="s.passives.length === 0" class="empty-state">
                    No passive abilities unlocked yet.
                </div>
            </div>
        </div>

        <!-- RIGHT: Active Skills (Skill Tree) -->
        <div class="skills-section">
            <h3>🔮 ACTIVE SKILLS</h3>
            <div class="tree-container" v-if="tree">
                <div v-for="node in nodes" :key="node.id" 
                     class="node-card" 
                     :class="{ unlocked: isUnlocked(node), locked: !isUnlocked(node) }">
                     
                    <div class="node-icon">{{ node.icon || '🔮' }}</div>
                    <div class="node-info">
                        <h3>{{ node.name }} <span v-if="isUnlocked(node)">✔️</span></h3>
                        <p>{{ node.desc }}</p>
                        <div class="cost" v-if="!isUnlocked(node)">Cost: {{ node.cost }} SP</div>
                    </div>
                    
                    <button v-if="!isUnlocked(node)" 
                            :disabled="!canUnlock(node)"
                            @click="unlock(node)"
                            class="btn-unlock">
                        {{ canUnlock(node) ? "UNLOCK" : "LOCKED" }}
                    </button>
                </div>
            </div>
            <div v-else class="empty-state">
                No Skill Tree Data Found.
            </div>
        </div>
    </div>
  </div>
</template>

<style scoped>
.skills-panel {
  position: absolute;
  top: 0; left: 0; width: 100%; height: 100%;
  background: rgba(10, 5, 20, 0.98);
  display: flex; flex-direction: column;
  z-index: 100;
}

.header {
  display: flex; justify-content: space-between; align-items: center;
  padding: 15px; border-bottom: 2px solid var(--c-gold);
  background: #111;
}
.header h2 { color: var(--c-gold); margin: 0; font-size: 1.2rem; }
.sp-display { color: var(--c-blue); font-weight: bold; font-size: 1.2rem; }

/* v36.6: 2-Column Layout */
.panel-container {
    flex: 1;
    display: grid;
    grid-template-columns: 1fr 2fr;
    gap: 10px;
    padding: 15px;
    overflow: hidden;
}

/* LEFT: Passives Section */
.passives-section {
    display: flex;
    flex-direction: column;
    border-right: 2px solid #444;
    padding-right: 15px;
    overflow-y: auto;
}

.passives-section h3 {
    color: #4af;
    margin: 0 0 10px 0;
    font-size: 0.9rem;
    text-align: center;
    border-bottom: 1px solid #444;
    padding-bottom: 5px;
}

.passive-list {
    display: flex;
    flex-direction: column;
    gap: 8px;
}

.passive-card {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 10px;
    background: #1a1a2a;
    border: 1px solid #4a4a6a;
    border-radius: 4px;
    transition: all 0.2s;
}

.passive-card:hover {
    background: #252535;
    border-color: #5a5a7a;
}

.passive-icon {
    font-size: 1.5rem;
    width: 35px;
    text-align: center;
}

.passive-info {
    flex: 1;
}

.passive-info h4 {
    margin: 0;
    font-size: 0.85rem;
    color: #aaf;
}

.passive-info small {
    color: #888;
    font-size: 0.7rem;
    line-height: 1.2;
}

/* RIGHT: Skills Section */
.skills-section {
    display: flex;
    flex-direction: column;
    overflow-y: auto;
    padding-left: 10px;
}

.skills-section h3 {
    color: var(--c-gold);
    margin: 0 0 10px 0;
    font-size: 0.9rem;
    text-align: center;
    border-bottom: 1px solid #444;
    padding-bottom: 5px;
}

.tree-container {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 12px;
}

.node-card {
    display: flex; align-items: center; gap: 15px;
    padding: 15px; background: #222; border: 1px solid #444;
    border-radius: 4px; transition: all 0.2s;
}

.node-card.unlocked { border-color: var(--c-gold); background: #332; }
.node-card.locked { opacity: 0.8; }

.node-icon { font-size: 2rem; width: 50px; text-align: center; }

.node-info { flex: 1; }
.node-info h3 { margin: 0; color: #fff; font-size: 1rem; }
.node-info p { margin: 5px 0 0; color: #aaa; font-size: 0.85rem; }
.cost { color: var(--c-blue); font-weight: bold; margin-top: 5px; font-size: 0.9rem; }

.btn-unlock {
    padding: 10px 20px;
    background: #444; color: #fff; border: 1px solid #666;
    cursor: pointer; font-weight: bold;
}
.btn-unlock:not(:disabled) {
    background: var(--c-gold); color: #000; border-color: #fff;
}
.btn-unlock:disabled { opacity: 0.5; cursor: not-allowed; }

.btn-use {
    padding: 10px 20px;
    background: var(--c-blue); color: #fff; border: 1px solid #4af;
    cursor: pointer; font-weight: bold;
    box-shadow: 0 0 10px var(--c-blue);
    animation: pulse-blue 2s infinite;
}
.btn-use:hover { transform: scale(1.05); }

@keyframes pulse-blue {
    0% { box-shadow: 0 0 5px var(--c-blue); }
    50% { box-shadow: 0 0 15px var(--c-blue); }
    100% { box-shadow: 0 0 5px var(--c-blue); }
}

.btn-close {
    background: #500; color: #fff; border: 1px solid #f00;
    width: 30px; height: 30px; cursor: pointer;
}
</style>
