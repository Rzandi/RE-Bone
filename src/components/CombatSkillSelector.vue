<script setup>
import { computed } from "vue";
import { gameStore } from "../game/store.js";
import { DB } from "../game/config/database.js";

const s = gameStore.state;

// v36.7: Filter by equipped skills only (max 5)
const skills = computed(() => {
    const equipped = s.equippedSkills || [];
    return s.unlockedSkills
        .filter(id => equipped.length === 0 || equipped.includes(id)) // If empty, show all (backwards compat)
        .map(id => {
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

// v36.6: Get cooldown remaining for a skill
const getSkillCooldown = (skillId) => {
    return s.skillCooldowns && s.skillCooldowns[skillId] ? s.skillCooldowns[skillId] : 0;
};

// v36.6: Check if skill is available (not on cooldown and has MP)
const isSkillAvailable = (skill) => {
    const onCooldown = getSkillCooldown(skill.id) > 0;
    const hasMP = s.mp >= (skill.mpCost || 0);
    return !onCooldown && hasMP;
};

// v36.6.5: Get cooldown color based on progress
const getCDColor = (skill) => {
    const current = getSkillCooldown(skill.id);
    const max = skill.cooldown || 1;
    const progress = 1 - (current / max); // 0 = just used, 1 = ready
    
    if (progress >= 0.66) return '#4a4'; // Green (nearly ready)
    if (progress >= 0.33) return '#aa6'; // Yellow (half way)
    return '#a44'; // Red (just used)
};

// v36.8: Get upgrade level for skill
const getUpgradeLevel = (skillId) => {
    return s.skillUpgrades && s.skillUpgrades[skillId] ? s.skillUpgrades[skillId].level : 0;
};

const useSkill = (skill) => {
    // v36.6: Block if on cooldown
    if (!isSkillAvailable(skill)) {
        const cd = getSkillCooldown(skill.id);
        if (cd > 0) {
            gameStore.log(`${skill.name} is on cooldown! (${cd} turns)`, "system");
        } else {
            gameStore.log("Not enough MP!", "error");
        }
        return;
    }
    
    // Deduct MP (UI side immediate feedback)
    s.mp -= (skill.mpCost || 0);
    
    // Execute (v36.6: Pass skill ID for cooldown tracking)
    if (window.CombatManager) {
        CombatManager.executeSkill(skill.id, skill);
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
        <div v-for="skill in skills" :key="skill.id" 
             class="skill-card" 
             :class="{ 'on-cooldown': getSkillCooldown(skill.id) > 0, 'no-mp': s.mp < (skill.mpCost || 0) }"
             @click="useSkill(skill)">
            <div class="icon">{{ skill.icon || '⚡' }}</div>
            <div class="info">
                <h3>{{ skill.name }}</h3>
                <small>{{ getDetailedDesc(skill) }}</small>
            </div>
            
            <!-- v36.6.5: Enhanced Cooldown Badge -->
            <div v-if="getSkillCooldown(skill.id) > 0" class="cooldown-badge"
                 :style="{ background: getCDColor(skill) }">
                CD: 
                <Transition name="cd-tick" mode="out-in">
                  <span :key="getSkillCooldown(skill.id)" class="cd-number">
                    {{ getSkillCooldown(skill.id) }}
                  </span>
                </Transition>
                /{{ skill.cooldown || 1 }}
            </div>
            
            <!-- v36.8: Upgrade Level Badge -->
            <div v-if="getUpgradeLevel(skill.id) > 0" class="upgrade-badge">
                ⚡{{ getUpgradeLevel(skill.id) }}
            </div>
            
            <div v-if="s.mp < (skill.mpCost || 0)" class="mp-warning">
                Not enough MP!
            </div>
            
            <div v-else-if="getSkillCooldown(skill.id) === 0" class="cost">
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
    background: #222; border: 1px solid #444; padding: 10px;
    cursor: pointer; transition: all 0.2s;
}
.skill-card:hover { background: #333; border-color: #666; }

/* v36.6: On cooldown state */
.skill-card.on-cooldown {
    opacity: 0.5;
    cursor: not-allowed;
    background: #1a1a1a;
    border-color: #555;
}
.skill-card.on-cooldown:hover {
    background: #1a1a1a;
    border-color: #555;
}

.skill-card.no-mp { opacity: 0.6; cursor: not-allowed; }

.mp-warning {
    color: #f55;
    font-size: 0.7rem;
    font-weight: bold;
    text-align: center;
}

.icon { font-size: 2rem; width: 40px; text-align: center; }
.info { flex: 1; }
.info h3 { margin: 0; font-size: 0.95rem; color: #fff; }
.info small { color: #999; font-size: 0.75rem; line-height: 1.3; display: block; margin-top: 3px; }

.cost { background: #333; padding: 5px 10px; border-radius: 4px; font-weight: bold; font-size: 0.9rem; color: #4af; }
.cost.no-mp { color: #f55; }

/* v36.6: Cooldown Badge */
.cooldown-badge {
    background: #553;
    border: 1px solid #aa6;
    padding: 5px 10px;
    border-radius: 4px;
    font-weight: bold;
    font-size: 0.9rem;
    color: #ffa;
    box-shadow: 0 0 10px rgba(255, 170, 0, 0.3);
}

@keyframes upgrade-glow {
    0%, 100% { box-shadow: 0 2px 8px rgba(255, 215, 0, 0.5); }
    50% { box-shadow: 0 2px 12px rgba(255, 215, 0, 0.8); }
}

/* v36.8 Phase 2: Cooldown Tick Animation */
.cd-tick-enter-active {
  animation: tick-down 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55);
}

.cd-tick-leave-active {
  animation: tick-up 0.2s ease-out;
}

@keyframes tick-down {
  0% { 
    transform: scale(1.5) translateY(-5px); 
    opacity: 0;
    color: #ffd700;
  }
  100% { 
    transform: scale(1) translateY(0); 
    opacity: 1;
  }
}

@keyframes tick-up {
  0% { opacity: 1; transform: scale(1); }
  100% { opacity: 0; transform: scale(0.8); }
}

.cd-number {
  display: inline-block;
  min-width: 12px;
  text-align: center;
}

.empty-msg { padding: 20px; text-align: center; color: #666; font-style: italic; }

/* ============================================
   v36.9 PHASE 1: MOBILE TOUCH OPTIMIZATION
   ============================================ */

/* Touch optimization */
.skill-card, button {
  touch-action: manipulation;
  -webkit-tap-highlight-color: transparent;
}

/* Mobile: Larger tap targets */
@media (max-width: 767px) {
  .skill-card {
    padding: 14px;
    min-height: 80px;
  }
  
  .icon {
    font-size: 2.2rem;
    width: 50px;
  }
  
  .info h3 {
    font-size: 1rem;
  }
  
  .info small {
    font-size: 0.8rem;
  }
  
  .cost {
    padding: 8px 14px;
    font-size: 1rem;
  }
  
  .btn-close {
    min-width: 44px;
    min-height: 44px;
  }
}

/* Touch feedback */
@media (hover: none) and (pointer: coarse) {
  .skill-card:active {
    transform: scale(0.98);
    opacity: 0.9;
    transition: transform 0.1s ease;
  }
  
  /* Disable hover on touch */
  .skill-card:hover {
    background: #222;
    border-color: #444;
  }
  
  .skill-card.on-cooldown:hover {
    background: #1a1a1a;
    border-color: #555;
  }
}
</style>
```
