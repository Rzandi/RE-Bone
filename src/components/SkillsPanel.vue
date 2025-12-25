<script setup>
import { computed, ref } from "vue";
import { gameStore } from "../game/store.js";
import { DB } from "../game/config/database.js";
import { Player } from "../game/logic/Player.js";

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
    if(Player) {
        Player.unlockSkill(activeTree.value, node.id);
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

// v38.3: Check if passive is a unique evolution passive
const isUniquePassive = (passiveId) => {
    // Unique passives typically have complex stats objects
    const passive = DB.PASSIVES ? DB.PASSIVES[passiveId] : null;
    return passive?.stats && Object.keys(passive.stats).length > 0;
};

// v38.3: Format stat bonuses for display
const getStatBonuses = (passiveId) => {
    const passive = DB.PASSIVES ? DB.PASSIVES[passiveId] : null;
    if (!passive?.stats) return '';
    
    const bonuses = [];
    const stats = passive.stats;
    
    if (stats.crit) bonuses.push(`+${Math.floor(stats.crit * 100)}% Crit`);
    if (stats.dodge) bonuses.push(`+${Math.floor(stats.dodge * 100)}% Dodge`);
    if (stats.lifesteal) bonuses.push(`+${Math.floor(stats.lifesteal * 100)}% Lifesteal`);
    if (stats.mag) bonuses.push(`+${Math.floor(stats.mag * 100)}% MAG`);
    if (stats.allDmg) bonuses.push(`+${Math.floor(stats.allDmg * 100)}% DMG`);
    if (stats.hp) bonuses.push(`+${Math.floor(stats.hp * 100)}% HP`);
    if (stats.atk) bonuses.push(`+${Math.floor(stats.atk * 100)}% ATK`);
    if (stats.def) bonuses.push(`+${Math.floor(stats.def * 100)}% DEF`);
    if (stats.critMult) bonuses.push(`${stats.critMult}x Crit DMG`);
    if (stats.executeThreshold) bonuses.push(`Execute <${Math.floor(stats.executeThreshold * 100)}%`);
    if (stats.lowHpAtkBonus) bonuses.push(`+${Math.floor(stats.lowHpAtkBonus * 100)}% Low HP ATK`);
    if (stats.skillPower) bonuses.push(`+${Math.floor(stats.skillPower * 100)}% Skill Power`);
    if (stats.startShield) bonuses.push(`+${stats.startShield} Shield`);
    
    return bonuses.join(' | ');
};

// v38.3: Get skill details with actual damage calculation
const getSkillDetails = (skillId) => {
    const skill = DB.SKILLS ? DB.SKILLS[skillId] : null;
    if (!skill) return null;
    
    // v38.3 Fix: Use Player state directly for accurate ATK
    const p = Player?.state || s;
    
    // Calculate base ATK from player (formula: str * 2 + base)
    const baseAtk = p.atk || (p.baseStats?.str || 5) * 2 + 5;
    
    // Calculate actual damage if skill has power
    let damage = 0;
    if (skill.power) {
        damage = Math.floor(baseAtk * skill.power);
    }
    
    return {
        name: skill.name || skillId,
        type: skill.type || 'phys',
        cost: skill.cost || 0,
        cooldown: skill.cooldown || 0,
        power: skill.power || 0,
        damage: damage,
        desc: skill.desc || '',
        hits: skill.hits || 1,
        status: skill.status || null,
        lifesteal: skill.lifesteal || 0
    };
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
                <div v-for="passiveId in s.passives" :key="passiveId" 
                     class="passive-card"
                     :class="{ 'unique-passive': isUniquePassive(passiveId) }">
                    <!-- v38.3: Different icon for unique vs regular passives -->
                    <div class="passive-icon">{{ isUniquePassive(passiveId) ? '🌟' : '🛡️' }}</div>
                    <div class="passive-info">
                        <h4>{{ getPassiveName(passiveId) }}</h4>
                        <small class="passive-desc">{{ getPassiveDesc(passiveId) }}</small>
                        <!-- v38.3: Show stat bonuses for unique passives -->
                        <div class="stat-bonuses" v-if="getStatBonuses(passiveId)">
                            {{ getStatBonuses(passiveId) }}
                        </div>
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
                        
                        <!-- v38.3: Show skill details with actual damage -->
                        <div class="skill-details" v-if="getSkillDetails(node.id)">
                            <span class="skill-stat" v-if="getSkillDetails(node.id).damage > 0">
                                ⚔️ {{ getSkillDetails(node.id).damage }} DMG
                            </span>
                            <span class="skill-stat" v-if="getSkillDetails(node.id).cost > 0">
                                💧 {{ getSkillDetails(node.id).cost }} MP
                            </span>
                            <span class="skill-stat" v-if="getSkillDetails(node.id).cooldown > 0">
                                ⏱️ {{ getSkillDetails(node.id).cooldown }} CD
                            </span>
                            <span class="skill-stat" v-if="getSkillDetails(node.id).hits > 1">
                                ✖️ {{ getSkillDetails(node.id).hits }} Hits
                            </span>
                            <span class="skill-stat" v-if="getSkillDetails(node.id).lifesteal > 0">
                                🩸 {{ Math.floor(getSkillDetails(node.id).lifesteal * 100) }}% Steal
                            </span>
                        </div>
                        
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

/* v38.3: Unique Passive Styling */
.passive-card.unique-passive {
    background: linear-gradient(135deg, #1a1a2a, #2a1f4a);
    border-color: #7b5fc7;
    box-shadow: 0 0 8px rgba(123, 95, 199, 0.3);
}

.passive-card.unique-passive h4 {
    color: #c8a2ff;
}

.stat-bonuses {
    margin-top: 5px;
    padding: 4px 8px;
    background: rgba(100, 80, 180, 0.2);
    border-radius: 3px;
    font-size: 0.65rem;
    color: #9af;
    font-weight: bold;
}

/* v38.3: Skill Details Styling */
.skill-details {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
    margin-top: 8px;
}

.skill-stat {
    display: inline-block;
    padding: 3px 8px;
    border-radius: 4px;
    font-size: 0.7rem;
    font-weight: bold;
    background: rgba(50, 50, 80, 0.8);
    border: 1px solid #555;
}

.skill-stat:nth-child(1) { /* DMG */
    background: rgba(200, 50, 50, 0.3);
    border-color: #f55;
    color: #f99;
}

.skill-stat:nth-child(2) { /* MP */
    background: rgba(50, 100, 200, 0.3);
    border-color: #5af;
    color: #8cf;
}

.skill-stat:nth-child(3) { /* CD */
    background: rgba(150, 100, 50, 0.3);
    border-color: #fa5;
    color: #fc8;
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

/* v38.3: Mobile Responsive */
@media (max-width: 600px) {
  .panel-container {
    grid-template-columns: 1fr;
    gap: 15px;
    padding: 10px;
  }
  
  .passives-section {
    border-right: none;
    border-bottom: 2px solid #444;
    padding-right: 0;
    padding-bottom: 15px;
    max-height: 35vh;
  }
  
  .skills-section {
    padding-left: 0;
  }
  
  .header h2 {
    font-size: 1rem;
  }
  
  .sp-display {
    font-size: 1rem;
  }
  
  .passive-card {
    padding: 8px;
  }
  
  .passive-icon {
    font-size: 1.2rem;
    width: 28px;
  }
  
  .passive-info h4 {
    font-size: 0.75rem;
  }
  
  .passive-info small {
    font-size: 0.6rem;
  }
  
  .stat-bonuses {
    font-size: 0.55rem;
    padding: 3px 6px;
  }
  
  .node-card {
    padding: 10px;
    gap: 10px;
  }
  
  .node-icon {
    font-size: 1.5rem;
    width: 35px;
  }
  
  .node-info h3 {
    font-size: 0.9rem;
  }
  
  .node-info p {
    font-size: 0.75rem;
  }
  
  .skill-details {
    gap: 4px;
  }
  
  .skill-stat {
    font-size: 0.6rem;
    padding: 2px 6px;
  }
  
  .btn-unlock {
    padding: 8px 12px;
    font-size: 0.8rem;
  }
}
</style>
