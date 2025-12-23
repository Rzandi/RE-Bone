<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { gameStore } from '../game/store.js';
import { DB } from '../game/config/database.js';
import ConfirmModal from './ConfirmModal.vue';

const s = gameStore.state;
const selected = ref(null);

// Max equip slots
const MAX_SLOTS = 5;

// v36.8 Phase 3: Comparison mode
const compareMode = ref(false);
const comparing = ref([]);

// v36.8 Phase 3: Confirmation modal
const showConfirm = ref(false);
const confirmData = ref(null);

// v36.8 Phase 2: Search & Filter
const searchTerm = ref('');
const filterType = ref('all');

// v36.9 Phase 4: Debounced search for performance (FIXED: Initialize with searchTerm)
const debouncedSearchTerm = ref(searchTerm.value);
let searchDebounceTimer = null;

const updateSearch = (value) => {
  searchTerm.value = value;
  
  // Debounce on mobile
  if (typeof window !== 'undefined' && window.innerWidth <= 767) {
    clearTimeout(searchDebounceTimer);
    searchDebounceTimer = setTimeout(() => {
      debouncedSearchTerm.value = value;
    }, 300);
  } else {
    // Instant on desktop
    debouncedSearchTerm.value = value;
  }
};

// Get all unlocked skills with filtering
const unlockedSkills = computed(() => {
  let skills = s.unlockedSkills.map(id => ({
    id,
    ...DB.SKILLS[id],
    upgrades: s.skillUpgrades[id] || { level: 0, powerBonus: 0, cdReduction: 0 },
    isEquipped: s.equippedSkills.includes(id)
  }));
  
  // Apply search filter (use debounced term)
  const searchValue = debouncedSearchTerm.value || searchTerm.value;
  if (searchValue) {
    const term = searchValue.toLowerCase();
    skills = skills.filter(sk => 
      sk.name.toLowerCase().includes(term) || 
      (sk.desc && sk.desc.toLowerCase().includes(term))
    );
  }
  
  // Apply type filter
  if (filterType.value === 'upgraded') {
    skills = skills.filter(sk => sk.upgrades.level > 0);
  } else if (filterType.value === 'canUpgrade') {
    skills = skills.filter(sk => {
      if (!sk.upgradePath) return false;
      const cost = getUpgradeCost(sk.upgrades.level);
      return sk.upgrades.level < sk.upgradePath.length && s.sp >= cost;
    });
  } else if (filterType.value === 'maxed') {
    skills = skills.filter(sk => sk.upgradePath && sk.upgrades.level >= sk.upgradePath.length);
  }
  
  return skills;
});

// Filter equipped/available
const equippedList = computed(() => unlockedSkills.value.filter(sk => sk.isEquipped));
const availableList = computed(() => unlockedSkills.value.filter(sk => !sk.isEquipped));

// Select skill
const selectSkill = (skill) => {
  selected.value = skill;
  if (window.SoundManager) window.SoundManager.play('click');
};

// Equip skill
const equipSkill = (skillId) => {
  if (s.equippedSkills.length >= MAX_SLOTS) {
    gameStore.log("All slots full! Unequip a skill first.", "error");
    if (window.SoundManager) window.SoundManager.play('error');
    return;
  }
  
  if (!s.equippedSkills.includes(skillId)) {
    s.equippedSkills.push(skillId);
    gameStore.log(`Equipped ${DB.SKILLS[skillId].name}!`, "buff");
    if (window.SoundManager) window.SoundManager.play('item_equip');
  }
};

// Unequip skill
const unequipSkill = (skillId) => {
  const idx = s.equippedSkills.indexOf(skillId);
  if (idx !== -1) {
    s.equippedSkills.splice(idx, 1);
    gameStore.log(`Unequipped ${DB.SKILLS[skillId].name}.`, "system");
    if (window.SoundManager) window.SoundManager.play('sell');
  }
};

// Upgrade skill
const upgradeSkill = (skillId) => {
  const skill = DB.SKILLS[skillId];
  if (!skill.upgradePath) {
    gameStore.log("This skill cannot be upgraded.", "error");
    return;
  }
  
  const currentLevel = s.skillUpgrades[skillId]?.level || 0;
  
  if (currentLevel >= skill.upgradePath.length) {
    gameStore.log("Max upgrade level reached!", "error");
    return;
  }
  
  const cost = getUpgradeCost(currentLevel);
  if (s.sp < cost) {
    gameStore.log(`Not enough SP! Need ${cost} SP.`, "error");
    return;
  }
  
  // v36.8 Phase 3: Confirm expensive upgrades
  if (cost >= 10 && !confirmData.value) {
    const nextUpgrade = skill.upgradePath[currentLevel];
    confirmData.value = {
      skillId,
      skill,
      cost,
      upgrade: nextUpgrade
    };
    showConfirm.value = true;
    return;
  }
  
  // Proceed with upgrade
  performUpgrade(skillId, cost, currentLevel);
};

const performUpgrade = (skillId, cost, currentLevel) => {
  const skill = DB.SKILLS[skillId];
  
  // Deduct SP
  s.sp -= cost;
  
  // Initialize upgrade if doesn't exist
  if (!s.skillUpgrades[skillId]) {
    s.skillUpgrades[skillId] = { level: 0, powerBonus: 0, cdReduction: 0, ailmentBonus: 0 };
  }
  
  // Apply upgrade
  const nextUpgrade = skill.upgradePath[currentLevel];
  s.skillUpgrades[skillId].level++;
  
  if (nextUpgrade.type === 'power') {
    s.skillUpgrades[skillId].powerBonus += nextUpgrade.value;
  } else if (nextUpgrade.type === 'cd') {
    s.skillUpgrades[skillId].cdReduction += Math.abs(nextUpgrade.value);
  } else if (nextUpgrade.type === 'ailment') {
    s.skillUpgrades[skillId].ailmentBonus = (s.skillUpgrades[skillId].ailmentBonus || 0) + nextUpgrade.value;
  }
  
  gameStore.log(`Upgraded ${skill.name}! (Level ${s.skillUpgrades[skillId].level})`, "buff");
  if (window.SoundManager) window.SoundManager.play('success');
  
  // Refresh selected
  if (selected.value && selected.value.id === skillId) {
    selected.value = unlockedSkills.value.find(sk => sk.id === skillId);
  }
  
  // Clear confirm data
  showConfirm.value = false;
  confirmData.value = null;
};

const cancelUpgrade = () => {
  showConfirm.value = false;
  confirmData.value = null;
};

// v36.8 Phase 3: Comparison mode
const toggleCompareMode = () => {
  compareMode.value = !compareMode.value;
  if (!compareMode.value) {
    comparing.value = [];
  }
};

const addToCompare = (skill) => {
  if (comparing.value.length >= 3) {
    gameStore.log("Max 3 skills for comparison!", "error");
    return;
  }
  if (!comparing.value.find(s => s.id === skill.id)) {
    comparing.value.push(skill);
  }
};

const removeFromCompare = (skillId) => {
  comparing.value = comparing.value.filter(s => s.id !== skillId);
};

// v36.8 Phase 3: Equip recommended
const equipRecommended = () => {
  const topSkills = [...unlockedSkills.value]
    .sort((a, b) => (b.upgrades.level || 0) - (a.upgrades.level || 0))
    .slice(0, MAX_SLOTS);
  
  s.equippedSkills = topSkills.map(sk => sk.id);
  gameStore.log(`Equipped top ${topSkills.length} upgraded skills!`, "buff");
};

// Calculate upgrade cost
const getUpgradeCost = (currentLevel) => {
  const baseCost = 5;
  return Math.floor(baseCost * Math.pow(1.5, currentLevel));
};

// v36.8: Upgrade preview
const hoveredUpgrade = ref(null);

const getUpgradePreview = (skill, upgradeIndex) => {
  if (!skill.upgradePath || upgradeIndex >= skill.upgradePath.length) return null;
  
  const upgrade = skill.upgradePath[upgradeIndex];
  const current = {
    power: getSkillPower(skill),
    cd: getSkillCD(skill)
  };
  
  let preview = { ...current };
  
  if (upgrade.type === 'power') {
    const newBonus = (skill.upgrades.powerBonus || 0) + upgrade.value;
    const newMult = Math.min(3.0, 1 + newBonus);
    preview.power = ((skill.power || 0) * newMult).toFixed(2);
  } else if (upgrade.type === 'cd') {
    preview.cd = Math.max(1, current.cd + upgrade.value);
  }
  
  return { current, preview, upgrade };
};

// Get skill stats with upgrades
const getSkillPower = (skill) => {
  const base = skill.power || 0;
  const bonus = skill.upgrades.powerBonus || 0;
  const multiplier = Math.min(3.0, 1 + bonus); // Cap at 3x
  return (base * multiplier).toFixed(2);
};

const getSkillCD = (skill) => {
  const base = skill.cooldown || 0;
  const reduction = skill.upgrades.cdReduction || 0;
  return Math.max(1, base - reduction);
};

// Format upgrade text
const formatUpgrade = (upgrade) => {
  if (upgrade.type === 'power') {
    return `+${(upgrade.value * 100)}% Power`;
  } else if (upgrade.type === 'cd') {
    return `-${Math.abs(upgrade.value)} Cooldown`;
  } else if (upgrade.type === 'ailment') {
    return `+${upgrade.value} Ailment Duration`;
  }
  return upgrade.type;
};

const close = () => {
  gameStore.state.activePanel = 'menu-view';
};

// v36.9 Phase 2: Mobile - close detail view
const closeDetail = () => {
  selected.value = null;
};

// v36.9 Phase 3: Swipe to close gesture
let touchStartY = 0;
let touchStartX = 0;

const handleTouchStart = (e) => {
  touchStartY = e.touches[0].clientY;
  touchStartX = e.touches[0].clientX;
};

const handleTouchEnd = (e) => {
  const touchEndY = e.changedTouches[0].clientY;
  const touchEndX = e.changedTouches[0].clientX;
  const diffY = touchEndY - touchStartY;
  const diffX = touchEndX - touchStartX;
  
  // Swipe down to close (must be > 100px vertical, < 50px horizontal)
  if (diffY > 100 && Math.abs(diffX) < 50) {
    close();
  }
};

// v36.9 Phase 2: Mobile back button handler (FIXED: Proper cleanup)
let clickHandler = null;
// searchDebounceTimer is already declared at line 27

onMounted(() => {
  clickHandler = (e) => {
    const detailView = e.target.closest('.detail-view:not(.empty)');
    if (detailView && e.target.textContent === '← Back') {
      closeDetail();
    }
  };
  window.addEventListener('click', clickHandler);
});

onUnmounted(() => {
  if (clickHandler) {
    window.removeEventListener('click', clickHandler);
    clickHandler = null;
  }
  
  // Also cleanup debounce timer
  if (searchDebounceTimer) {
    clearTimeout(searchDebounceTimer);
  }
});
</script>

<template>
  <div 
    class="skill-management scanline"
    @touchstart="handleTouchStart"
    @touchend="handleTouchEnd"
  >
    <div class="header">
      <h2>SKILL MANAGEMENT</h2>
      <div class="sp-display">SP: {{ s.sp || 0 }}</div>
      <button class="btn-close" @click="close">X</button>
    </div>
    
    <!-- v36.8 Phase 2: Search & Filter -->
    <div class="search-bar">
      <input 
        :value="searchTerm" 
        @input="updateSearch($event.target.value)"
        type="text" 
        placeholder="🔍 Search skills..." 
        class="search-input"
      >
      <select v-model="filterType" class="filter-select">
        <option value="all">All Skills</option>
        <option value="upgraded">Upgraded</option>
        <option value="canUpgrade">Can Upgrade</option>
        <option value="maxed">Max Level</option>
      </select>
      
      <!-- v36.8 Phase 3: Action Buttons -->
      <button class="btn-action" @click="toggleCompareMode" :class="{ active: compareMode }">
        📊 Compare
      </button>
      <button class="btn-action" @click="equipRecommended">
        🎯 Equip Best
      </button>
    </div>
    
    <!-- v36.8 Phase 3: Comparison View -->
    <div v-if="compareMode && comparing.length > 0" class="comparison-view">
      <div class="comparison-header">
        <h3>Comparing {{ comparing.length }}/3 Skills</h3>
        <button class="btn-clear" @click="comparing = []">Clear All</button>
      </div>
      <div class="comparison-grid">
        <div v-for="skill in comparing" :key="skill.id" class="compare-card">
          <button class="btn-remove" @click="removeFromCompare(skill.id)">✖</button>
          <h4>{{ skill.name }}</h4>
          <div class="compare-stat">Power: {{ getSkillPower(skill) }}</div>
          <div class="compare-stat">CD: {{ getSkillCD(skill) }}</div>
          <div class="compare-stat">Level: {{ skill.upgrades.level }}</div>
          <div class="compare-stat">MP: {{ skill.cost || 0 }}</div>
        </div>
      </div>
    </div>
    
    <div class="content">
      <!-- LEFT: Skill Lists -->
      <div class="skill-list">
        <div class="section">
          <h3>⚡ EQUIPPED ({{ equippedList.length }}/{{ MAX_SLOTS }})</h3>
          <div v-for="skill in equippedList" :key="skill.id" 
               class="skill-card equipped"
               :class="{ selected: selected && selected.id === skill.id }"
               @click="selectSkill(skill)">
            <div class="skill-icon">{{ skill.icon || '🔮' }}</div>
            <div class="skill-info">
              <h4>{{ skill.name }}</h4>
              <small>CD: {{ getSkillCD(skill) }}  Lvl: {{ skill.upgrades.level }}</small>
            </div>
            <button v-if="compareMode" class="btn-compare" @click.stop="addToCompare(skill)">
              📊
            </button>
            <button v-else class="btn-unequip" @click.stop="unequipSkill(skill.id)">✖</button>
          </div>
        </div>
        
        <div class="section">
          <h3>📚 AVAILABLE ({{ availableList.length }})</h3>
          <div v-for="skill in availableList" :key="skill.id"
               class="skill-card"
               :class="{ selected: selected && selected.id === skill.id }"
               @click="selectSkill(skill)">
            <div class="skill-icon">{{ skill.icon || '🔮' }}</div>
            <div class="skill-info">
              <h4>{{ skill.name }}</h4>
              <small>CD: {{ getSkillCD(skill) }}  Lvl: {{ skill.upgrades.level }}</small>
            </div>
            <button v-if="compareMode" class="btn-compare" @click.stop="addToCompare(skill)">
              📊
            </button>
            <button v-else class="btn-equip" @click.stop="equipSkill(skill.id)" 
                    :disabled="s.equippedSkills.length >= MAX_SLOTS">
              EQUIP
            </button>
          </div>
        </div>
      </div>
      
      <!-- RIGHT: Detail View -->
      <div class="detail-view" v-if="selected">
        <div class="skill-header">
          <div class="skill-icon-large">{{ selected.icon || '🔮' }}</div>
          <div>
            <h2>{{ selected.name }}</h2>
            <p class="desc">{{ selected.desc }}</p>
          </div>
        </div>
        
        <div class="stats">
          <div class="stat-row">
            <span>Power:</span>
            <span>{{ getSkillPower(selected) }}</span>
          </div>
          <div class="stat-row">
            <span>Cooldown:</span>
            <span>{{ getSkillCD(selected) }} turns</span>
          </div>
          <div class="stat-row">
            <span>MP Cost:</span>
            <span>{{ selected.cost || 0 }}</span>
          </div>
        </div>
        
        <!-- Upgrade Path -->
        <div class="upgrades" v-if="selected.upgradePath">
          <h3>Upgrade Path ({{ selected.upgrades.level }}/{{ selected.upgradePath.length }})</h3>
          <div class="upgrade-list">
            <div v-for="(up, i) in selected.upgradePath" :key="i"
                 class="upgrade-item"
                 :class="{ unlocked: i < selected.upgrades.level, next: i === selected.upgrades.level }"
                 @mouseenter="hoveredUpgrade = i"
                 @mouseleave="hoveredUpgrade = null">
              <span class="level">{{ i + 1 }}</span>
              <span class="upgrade-desc">{{ formatUpgrade(up) }}</span>
              <span class="status">{{ i < selected.upgrades.level ? '✓' : (i === selected.upgrades.level ? '→' : '') }}</span>
              
              <!-- v36.8: Upgrade Preview Tooltip -->
              <div v-if="hoveredUpgrade === i && i === selected.upgrades.level" class="upgrade-tooltip">
                <div v-if="getUpgradePreview(selected, i)">
                  <div v-if="up.type === 'power'">
                    Power: {{ getUpgradePreview(selected, i).current.power }} → 
                    <span class="preview-value">{{ getUpgradePreview(selected, i).preview.power }}</span>
                  </div>
                  <div v-if="up.type === 'cd'">
                    CD: {{ getUpgradePreview(selected, i).current.cd }} → 
                    <span class="preview-value">{{ getUpgradePreview(selected, i).preview.cd }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <button class="btn-upgrade" 
                  @click="upgradeSkill(selected.id)"
                  :disabled="selected.upgrades.level >= selected.upgradePath.length || s.sp < getUpgradeCost(selected.upgrades.level)">
            {{ selected.upgrades.level >= selected.upgradePath.length ? 
               'MAX LEVEL' : 
               `UPGRADE (${getUpgradeCost(selected.upgrades.level)} SP)` }}
          </button>
        </div>
        <div v-else class="no-upgrades">
          This skill has no upgrades available.
        </div>
      </div>
      
      <div class="detail-view empty" v-else>
        <p>Select a skill to view details</p>
      </div>
    </div>
    
    <!-- v36.8 Phase 3: Confirmation Modal -->
    <ConfirmModal
      v-if="showConfirm && confirmData"
      :title="`Upgrade ${confirmData.skill.name}?`"
      :message="`Cost: ${confirmData.cost} SP\n${formatUpgrade(confirmData.upgrade)}`"
      @confirm="performUpgrade(confirmData.skillId, confirmData.cost, confirmData.skill.upgrades.level)"
      @cancel="cancelUpgrade"
    />
  </div>
</template>

<style scoped>
.skill-management {
  position: absolute;
  top: 0; left: 0; width: 100%; height: 100%;
  background: var(--glass-bg, rgba(5, 0, 10, 0.98));
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  display: flex; flex-direction: column;
  z-index: 100;
}

.header {
  display: flex; justify-content: space-between; align-items: center;
  padding: 15px; 
  background: linear-gradient(135deg, rgba(20, 15, 30, 0.9), rgba(10, 5, 15, 0.95));
  border-bottom: 2px solid var(--c-gold, #cfaa4c);
}

.header h2 { 
  margin: 0; 
  color: var(--c-gold, #cfaa4c); 
  font-size: 1.2rem;
  text-shadow: 0 0 10px rgba(207, 170, 76, 0.4);
}
.sp-display { 
  color: var(--c-blue, #4d88ff); 
  font-weight: bold; 
  font-size: 1.2rem;
  text-shadow: 0 0 8px rgba(77, 136, 255, 0.4);
}
.btn-close { 
  background: linear-gradient(135deg, #500, #300); 
  color: #fff; 
  border: 1px solid rgba(255, 68, 68, 0.6); 
  width: 30px; height: 30px; 
  cursor: pointer;
  border-radius: 4px;
  transition: all 0.2s ease;
}
.btn-close:hover {
  background: linear-gradient(135deg, #600, #400);
  box-shadow: 0 0 10px rgba(255, 68, 68, 0.4);
}

/* v36.8 Phase 2: Search Bar */
.search-bar {
  display: flex; gap: 10px; padding: 10px 15px;
  background: #0a0a1a; border-bottom: 1px solid #333;
}

.search-input {
  flex: 1; padding: 8px 12px;
  background: #1a1a2a; border: 1px solid #444;
  color: #fff; border-radius: 4px;
  font-size: 0.9rem;
}

.search-input:focus {
  outline: none; border-color: var(--c-gold);
}

.filter-select {
  padding: 8px 12px; background: #1a1a2a;
  border: 1px solid #444; color: #fff;
  border-radius: 4px; cursor: pointer;
  font-size: 0.9rem;
}

.filter-select:focus {
  outline: none; border-color: var(--c-gold);
}

/* v36.8 Phase 3: Action Buttons */
.btn-action {
  padding: 8px 16px; background: #1a1a2a;
  border: 1px solid #444; color: #fff;
  border-radius: 4px; cursor: pointer;
  font-size: 0.9rem; font-weight: bold;
  transition: all 0.2s;
}

.btn-action:hover {
  background: #2a2a3a; border-color: var(--c-gold);
}

.btn-action.active {
  background: var(--c-gold); color: #000;
  border-color: #fff;
}

.btn-compare {
  background: #363; color: #afa; border: 1px solid #5a5;
  padding: 5px 10px; font-size: 0.75rem; font-weight: bold;
  cursor: pointer; border-radius: 4px;
}

.btn-compare:hover {
  background: #474;
}

/* v36.8 Phase 3: Comparison View */
.comparison-view {
  background: #0a0a1a; border-bottom: 2px solid var(--c-gold);
  padding: 15px;
}

.comparison-header {
  display: flex; justify-content: space-between;
  align-items: center; margin-bottom: 15px;
}

.comparison-header h3 {
  margin: 0; color: var(--c-gold);
}

.btn-clear {
  padding: 5px 15px; background: #633;
  color: #faa; border: 1px solid #a55;
  cursor: pointer; border-radius: 4px;
}

.comparison-grid {
  display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 15px;
}

.compare-card {
  background: #1a1a2a; border: 2px solid var(--c-gold);
  padding: 15px; border-radius: 4px;
  position: relative;
}

.compare-card h4 {
  margin: 0 0 10px 0; color: #fff;
}

.compare-stat {
  padding: 5px 0; color: #aaa;
  border-bottom: 1px solid #333;
}

.btn-remove {
  position: absolute; top: 5px; right: 5px;
  background: #633; color: #faa;
  border: 1px solid #a55;
  width: 20px; height: 20px;
  cursor: pointer; border-radius: 50%;
  font-size: 0.7rem;
}

.content {
  flex: 1; display: grid; grid-template-columns: 1fr 1.5fr; gap: 15px;
  padding: 15px; overflow: hidden;
}

/* LEFT: Skill List */
.skill-list {
  display: flex; flex-direction: column; gap: 15px;
  overflow-y: auto;
}

.section h3 {
  color: #4af; margin: 0 0 10px 0; font-size: 0.9rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1); padding-bottom: 5px;
  text-shadow: 0 0 8px rgba(68, 170, 255, 0.3);
}

.skill-card {
  display: flex; align-items: center; gap: 10px;
  padding: 12px; 
  background: linear-gradient(135deg, rgba(26, 26, 42, 0.8), rgba(16, 16, 32, 0.9));
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 8px;
  cursor: pointer; 
  transition: all 0.25s ease;
  margin-bottom: 8px;
}

.skill-card:hover { 
  background: linear-gradient(135deg, rgba(37, 37, 53, 0.9), rgba(27, 27, 43, 0.95));
  border-color: rgba(100, 130, 180, 0.4);
  transform: translateX(3px);
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
}
.skill-card.selected { 
  border-color: var(--c-gold, #cfaa4c); 
  background: linear-gradient(135deg, rgba(42, 42, 58, 0.95), rgba(32, 32, 48, 0.98));
  box-shadow: 0 0 15px rgba(207, 170, 76, 0.2);
}
.skill-card.equipped { 
  border-color: rgba(74, 180, 74, 0.6);
  background: linear-gradient(135deg, rgba(20, 35, 20, 0.9), rgba(12, 25, 12, 0.95));
}

.skill-icon { 
  font-size: 1.5rem; 
  width: 40px; 
  text-align: center;
  filter: drop-shadow(0 2px 3px rgba(0, 0, 0, 0.4));
}
.skill-info { flex: 1; }
.skill-info h4 { margin: 0; font-size: 0.9rem; color: #fff; }
.skill-info small { color: #888; font-size: 0.75rem; }

.btn-equip, .btn-unequip {
  padding: 6px 12px; font-size: 0.75rem; font-weight: bold;
  border: 1px solid; cursor: pointer;
  border-radius: 4px;
  transition: all 0.2s ease;
}
.btn-equip { 
  background: linear-gradient(135deg, #366, #244); 
  color: #afa; 
  border-color: rgba(90, 180, 90, 0.5); 
}
.btn-equip:hover { 
  background: linear-gradient(135deg, #477, #355); 
  box-shadow: 0 0 8px rgba(90, 180, 90, 0.3);
}
.btn-equip:disabled { opacity: 0.5; cursor: not-allowed; }

.btn-unequip { 
  background: linear-gradient(135deg, #633, #422); 
  color: #faa; 
  border-color: rgba(180, 90, 90, 0.5); 
}
.btn-unequip:hover { 
  background: linear-gradient(135deg, #744, #533); 
  box-shadow: 0 0 8px rgba(180, 90, 90, 0.3);
}

/* RIGHT: Detail View */
.detail-view {
  background: #0a0a1a; border: 1px solid #333; padding: 20px;
  overflow-y: auto;
}

.detail-view.empty {
  display: flex; align-items: center; justify-content: center;
  color: #666; font-style: italic;
}

.skill-header {
  display: flex; align-items: center; gap: 15px;
  margin-bottom: 20px; padding-bottom: 15px; border-bottom: 1px solid #333;
}

.skill-icon-large { font-size: 3rem; }
.skill-header h2 { margin: 0; color: var(--c-gold); }
.desc { color: #aaa; margin: 5px 0 0; font-size: 0.85rem; }

.stats {
  margin-bottom: 20px;
}

.stat-row {
  display: flex; justify-content: space-between;
  padding: 8px; background: #111; margin-bottom: 5px;
  border-left: 3px solid var(--c-blue);
}

.upgrades h3 {
  color: #4af; margin: 0 0 10px 0;
  border-bottom: 1px solid #333; padding-bottom: 5px;
}

.upgrade-list {
  margin-bottom: 15px;
  max-height: 200px; overflow-y: auto;
}

.upgrade-item {
  display: flex; align-items: center; gap: 10px;
  padding: 8px; background: #0f0f1f; margin-bottom: 5px;
  border-left: 3px solid #444;
  position: relative;
  cursor: pointer;
  transition: all 0.2s;
}

.upgrade-item:hover {
  background: #1a1a2a;
}

/* v36.8: Upgrade Preview Tooltip */
.upgrade-tooltip {
  position: absolute;
  left: 100%;
  top: 0;
  margin-left: 10px;
  background: rgba(0, 0, 0, 0.95);
  border: 2px solid var(--c-gold);
  padding: 8px 12px;
  border-radius: 4px;
  white-space: nowrap;
  z-index: 100;
  font-size: 0.85rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.5);
}

.preview-value {
  color: var(--c-gold);
  font-weight: bold;
}

.upgrade-item.unlocked {
  border-left-color: #4a4;
  background: #0a1a0a;
}

.upgrade-item.next {
  border-left-color: var(--c-gold);
  background: #1a1a0a;
}

.level {
  font-weight: bold; color: #666; width: 30px;
}

.upgrade-item.unlocked .level { color: #4a4; }
.upgrade-item.next .level { color: var(--c-gold); }

.upgrade-desc {
  flex: 1; color: #aaa; font-size: 0.9rem;
}

.upgrade-item.unlocked .upgrade-desc { color: #cfc; }
.upgrade-item.next .upgrade-desc { color: #ffa; }

.status {
  color: #4a4; font-weight: bold;
}

.btn-upgrade {
  width: 100%; padding: 12px; font-size: 1rem; font-weight: bold;
  background: var(--c-gold); color: #000; border: 2px solid #fff;
  cursor: pointer; transition: all 0.2s;
}

.btn-upgrade:hover { transform: scale(1.05); }
.btn-upgrade:disabled {
  opacity: 0.5; cursor: not-allowed; transform: none;
}

.no-upgrades {
  padding: 20px; text-align: center; color: #666; font-style: italic;
}

/* Low Priority: Offline indicator */
.offline-indicator {
  position: fixed;
  top: 10px;
  left: 50%;
  transform: translateX(-50%);
  background: #f00;
  color: #fff;
  padding: 8px 16px;
  border-radius: 20px;
  font-size: 0.85rem;
  z-index: 1000;
  display: none;
}

.offline .offline-indicator {
  display: block;
}

/* ============================================
   v36.9 PHASE 2: RESPONSIVE LAYOUTS
   ============================================ */

/* Mobile: Stack search bar vertically */
@media (max-width: 480px) {
  .search-bar {
    flex-direction: column;
    gap: 8px;
  }
  
  .search-input,
  .filter-select,
  .btn-action {
    width: 100%;
  }
}

/* Mobile: Vertical layout for main content */
@media (max-width: 767px) {
  .content {
    grid-template-columns: 1fr !important;
    gap: 0;
  }
  
  /* Hide detail view initially on mobile */
  .detail-view.empty {
    display: none;
  }
  
  /* Full screen detail view when active */
  .detail-view:not(.empty) {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 300;
    background: #0a0a1a;
    overflow-y: auto;
    padding: 15px;
  }
  
  /* Add back button to detail view */
  .detail-view:not(.empty)::before {
    content: '← Back';
    display: block;
    padding: 10px;
    margin-bottom: 15px;
    background: #1a1a2a;
    border: 1px solid #444;
    text-align: center;
    cursor: pointer;
    border-radius: 4px;
  }
}

/* Mobile: Single column comparison grid */
@media (max-width: 480px) {
  .comparison-grid {
    grid-template-columns: 1fr !important;
  }
  
  .comparison-view {
    padding: 10px;
  }
  
  .compare-card {
    padding: 12px;
  }
}

/* Mobile: Adjust section spacing */
@media (max-width: 767px) {
  .section {
    margin-bottom: 15px;
  }
  
  .section h3 {
    font-size: 0.95rem;
    padding: 8px;
  }
  
  .skill-list {
    padding: 10px;
  }
}

/* Mobile: Scrollable upgrade list */
@media (max-width: 767px) {
  .upgrade-list {
    max-height: 300px;
  }
  
  .upgrades {
    margin-bottom: 20px;
  }
}

/* Tablet: Two columns for comparison */
@media (min-width: 481px) and (max-width: 767px) {
  .comparison-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

/* ============================================
   v36.9 PHASE 1: MOBILE TOUCH OPTIMIZATION
   ============================================ */

/* Touch-action optimization */
button, a, .skill-card {
  touch-action: manipulation;
  -webkit-tap-highlight-color: transparent;
}

/* Mobile: Minimum tap targets & spacing */
@media (max-width: 767px) {
  /* Button sizes */
  .btn-equip, .btn-unequip, .btn-compare, .btn-action {
    min-width: 44px;
    min-height: 44px;
    padding: 12px 16px;
    font-size: 0.95rem;
  }
  
  .btn-close {
    min-width: 44px;
    min-height: 44px;
  }
  
  .btn-upgrade {
    min-height: 48px;
    font-size: 1.05rem;
  }
  
  /* Skill cards - larger touch area */
  .skill-card {
    padding: 14px;
    margin-bottom: 10px;
  }
  
  .skill-icon {
    font-size: 1.8rem;
    width: 50px;
  }
  
  /* Upgrade items */
  .upgrade-item {
    padding: 12px;
    margin-bottom: 8px;
  }
}

/* Touch feedback - all devices */
@media (hover: none) and (pointer: coarse) {
  /* Active state feedback */
  button:active,
  .skill-card:active,
  .upgrade-item:active {
    transform: scale(0.97);
    opacity: 0.85;
    transition: transform 0.1s ease, opacity 0.1s ease;
  }
  
  .btn-action:active {
    transform: scale(0.95);
  }
  
  .btn-upgrade:active {
    transform: scale(0.98);
  }
  
  /* Remove hover effects on touch */
  .skill-card:hover,
  .btn-action:hover,
  .upgrade-item:hover {
    transform: none;
    background: inherit;
  }
}

/* Prevent double-tap zoom on buttons */
button {
  touch-action: manipulation;
  user-select: none;
  -webkit-user-select: none;
}

/* Larger font sizes on mobile */
@media (max-width: 767px) {
  .header h2 {
    font-size: 1.1rem;
  }
  
  .skill-info h4 {
    font-size: 1rem;
  }
  
  .skill-info small {
    font-size: 0.8rem;
  }
  
  .sp-display {
    font-size: 1.1rem;
  }
}
</style>
```
