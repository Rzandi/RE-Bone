<script setup>
import { computed } from "vue";
import { gameStore } from "../game/store.js";
import { DB } from "../game/config/database.js";

const s = gameStore.state;

const skills = computed(() => {
    return s.unlockedSkills.map(id => {
        const data = DB.SKILLS[id];
        // Normalize 'cost' to 'mpCost'
        return data ? { id, ...data, mpCost: data.cost || 0 } : null;
    }).filter(sk => sk); // Filter nulls
});

// Auto-generate detailed description from skill data
const getDetailedDesc = (skill) => {
    const parts = [];
    
    // Damage calculation
    if (skill.power) {
        const dmgPercent = Math.round(skill.power * 100);
        if (skill.type === 'mag') {
            parts.push(`Deals ${dmgPercent}% INT as magic damage`);
        } else if (skill.type === 'phys') {
            parts.push(`Deals ${dmgPercent}% ATK as physical damage`);
        } else if (skill.type === 'heal') {
            parts.push(`Heals ${dmgPercent}% of max HP`);
        }
    }
    
    // Status effects
    if (skill.status) {
        const status = skill.status;
        const effectName = status.id.charAt(0).toUpperCase() + status.id.slice(1);
        
        if (status.id === 'shock' || status.id === 'stun') {
            parts.push(`Stuns enemy for ${status.turn} turn(s)`);
        } else if (status.id === 'bleed') {
            parts.push(`Applies Bleed: ${status.val} damage per turn for ${status.turn} turns`);
        } else if (status.id === 'burn') {
            parts.push(`Applies Burn: ${status.val} damage per turn for ${status.turn} turns`);
        } else if (status.id === 'poison') {
            parts.push(`Applies Poison: ${status.val} damage per turn for ${status.turn} turns`);
        } else {
            parts.push(`Applies ${effectName} for ${status.turn} turn(s)`);
        }
    }
    
    // Buff type
    if (skill.type === 'buff') {
        parts.push(skill.desc || 'Applies buff effect');
    }
    
    return parts.join('. ') || skill.desc || 'No description';
};

const useSkill = (skill) => {
    if (s.mp < (skill.mpCost || 0)) {
        gameStore.log("Not enough MP!", "error");
        return;
    }
    
    // Deduct MP (UI side immediate feedback)
    s.mp -= (skill.mpCost || 0);
    
    // Execute
    if (window.CombatManager) {
        CombatManager.executeSkill(skill);
    }
};

const close = () => {
    gameStore.state.activePanel = 'combat';
};
</script>

<template>
  <div class="skill-selector scanline">
    <div class="header">
        <h2>SELECT SKILL</h2>
        <button class="btn-close" @click="close">X</button>
    </div>
    
    <div class="skill-list">
        <div v-for="skill in skills" :key="skill.id" class="skill-card" @click="useSkill(skill)">
            <div class="icon">{{ skill.icon || '⚡' }}</div>
            <div class="info">
                <h3>{{ skill.name }}</h3>
                <small>{{ getDetailedDesc(skill) }}</small>
            </div>
            <div class="cost" :class="{ 'no-mp': s.mp < (skill.mpCost || 0) }">
                {{ skill.mpCost || 0 }} MP
            </div>
        </div>
        
        <div v-if="skills.length === 0" class="empty-msg">
            No active skills learned yet.
        </div>
    </div>
  </div>
</template>

<style scoped>
.skill-selector {
    position: absolute; bottom: 0; left: 0; width: 100%; height: 50%;
    background: #111; border-top: 2px solid #444;
    display: flex; flex-direction: column; z-index: 100;
    box-shadow: 0 -5px 20px rgba(0,0,0,0.8);
}

.header {
    padding: 10px; background: #222; border-bottom: 1px solid #444;
    display: flex; justify-content: space-between; align-items: center;
}
.header h2 { margin: 0; font-size: 1rem; color: #aaa; }
.btn-close { background: #500; color: #fff; border: none; width: 25px; height: 25px; cursor: pointer; }

.skill-list {
    flex: 1; overflow-y: auto; padding: 10px;
    display: grid; grid-template-columns: 1fr; gap: 8px;
}

.skill-card {
    display: flex; align-items: center; gap: 10px;
    padding: 10px; background: #1a1a1a; border: 1px solid #333;
    cursor: pointer; transition: all 0.2s;
}
.skill-card:hover { background: #2a2a2a; border-color: var(--c-blue); }

.icon { font-size: 1.5rem; }
.info { flex: 1; }
.info h3 { margin: 0; font-size: 0.9rem; color: #eec; }
.info small { color: #888; font-size: 0.75rem; }

.cost { font-weight: bold; color: var(--c-blue); }
.cost.no-mp { color: #f55; }
</style>
