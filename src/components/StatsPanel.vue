<script setup>
import { computed } from "vue";
import { gameStore } from "../game/store.js";
import { ProgressionManager } from "../game/managers/progression.js";
import { Biomes } from "../game/config/biomes.js";

const s = gameStore.state;

// Check if we are in "Level Up" mode (forced allocation)
const isLevelUp = computed(() => s.activePanel === 'levelup');

// Computed Stats for Display - v38.4: Added icons
const stats = computed(() => {
  return [
    { label: "💪 STR", val: s.str, desc: "Physical Damage", key: "STR", color: "#f44" },
    { label: "❤️ VIT", val: s.vit, desc: "Max HP", key: "VIT", color: "#4f4" },
    { label: "🔮 INT", val: s.int, desc: "Magic & MP", key: "INT", color: "#4af" },
    { label: "🏃 AGI", val: s.agi || 0, desc: "Dodge & Flee", key: "AGI", color: "#4fa" },
    { label: "🍀 LCK", val: s.luck || 0, desc: "Crit & Gold", key: "LCK", color: "#fa4" },
  ];
});

// Derived Stats - v38.4: Added FLEE stat
const derived = computed(() => {
  // Calculate flee chance (base 20% + level diff + AGI bonus, cap 70%)
  const agi = s.agi || 0;
  const fleeBase = 20 + (agi * 0.5);
  const fleeChance = Math.min(70, Math.max(0, fleeBase));
  
  // v38.8: Soul Forge bonuses
  const totalCrit = Math.floor(((s.crit || 0) + (s.bonusCrit || 0) / 100) * 100);
  const totalCritDmg = Math.floor(((s.critDmg || 1.5) + (s.bonusCritDmg || 0)) * 100);
  
  return [
    { label: "⚔️ ATK", val: s.atk || 0 },
    { label: "🛡️ DEF", val: s.def || 0 },
    { label: "💥 CRIT", val: Math.min(100, totalCrit) + "%", color: "#fa0" },
    { label: "💀 CRIT DMG", val: totalCritDmg + "%", color: "#fa0" },
    { label: "🌀 DODGE", val: Math.floor((s.dodge || 0) * 100) + "%", color: "#4fa" },
    { label: "🏃 FLEE", val: Math.floor(fleeChance) + "%", color: "#4fa" },
    // v35.3: New Relic Stats
    { label: "🩸 L.STEAL", val: Math.floor((s.bonuses?.lifesteal || 0) * 100) + "%", color: "#f55" },
    { label: "↩️ REFLECT", val: Math.floor((s.bonuses?.reflect || 0) * 100) + "%", color: "#a5f" },
    { label: "💰 GOLD+", val: "x" + (s.multipliers?.gold || 1).toFixed(2), color: "#fd0" },
    { label: "📈 EXP+", val: "x" + (s.multipliers?.exp || 1).toFixed(2), color: "#4af" },
    // v38.8: Soul Forge Regen
    ...(s.exploreHpRegen > 0 ? [{ label: "❤️ HP REGEN", val: s.exploreHpRegen + "%/exp", color: "#f55" }] : []),
    ...(s.exploreMpRegen > 0 ? [{ label: "💧 MP REGEN", val: s.exploreMpRegen + "%/exp", color: "#4af" }] : []),
  ];
});

const equip = computed(() => s.equip || {});

// v37.0 Phase 3: Active curse effects
const curseEffects = computed(() => {
  if (!s.curseEffects) return [];
  const effects = [];
  const ce = s.curseEffects;
  
  if (ce.maxHpMult < 1) effects.push({ label: 'MAX HP', val: `-${Math.round((1-ce.maxHpMult)*100)}%`, color: '#f44' });
  if (ce.defMult < 1) effects.push({ label: 'DEF', val: `-${Math.round((1-ce.defMult)*100)}%`, color: '#f44' });
  if (ce.missChance > 0) effects.push({ label: 'MISS', val: `+${Math.round(ce.missChance*100)}%`, color: '#f44' });
  if (ce.noHealInCombat) effects.push({ label: 'NO HEAL', val: '⚠️', color: '#f44' });
  if (ce.noFlee) effects.push({ label: 'NO FLEE', val: '⚠️', color: '#f44' });
  
  return effects;
});

const curseBuffs = computed(() => {
  if (!s.cursedBuffs) return [];
  const buffs = [];
  const cb = s.cursedBuffs;
  
  if (cb.lifesteal > 0) buffs.push({ label: 'LIFESTEAL', val: `+${Math.round(cb.lifesteal*100)}%`, color: '#f55' });
  if (cb.critDmgMult > 1) buffs.push({ label: 'CRIT DMG', val: `x${cb.critDmgMult.toFixed(1)}`, color: '#fa0' });
  if (cb.dodge > 0) buffs.push({ label: 'DODGE', val: `+${Math.round(cb.dodge*100)}%`, color: '#4f4' });
  if (cb.atkMult > 1) buffs.push({ label: 'ATK', val: `+${Math.round((cb.atkMult-1)*100)}%`, color: '#4f4' });
  
  return buffs;
  return buffs;
});

// v38.0: Biome Effects Display
const biomeEffects = computed(() => {
    const node = s.world?.currentNode;
    if (!node || !node.biome || !Biomes) return [];
    
    const mods = Biomes.getCombatMods(node.biome);
    const list = [];
    
    if (mods.accuracy) list.push({ label: 'ACCURACY', val: `${mods.accuracy > 0 ? '+' : ''}${Math.round(mods.accuracy*100)}%`, color: mods.accuracy > 0 ? '#4f4' : '#f44' });
    if (mods.dodge) list.push({ label: 'DODGE', val: `${mods.dodge > 0 ? '+' : ''}${Math.round(mods.dodge*100)}%`, color: '#4f4' });
    if (mods.speed) list.push({ label: 'SPEED', val: `${mods.speed > 0 ? '+' : ''}${Math.round(mods.speed*100)}%`, color: '#4af' });
    if (mods.enemyDef) list.push({ label: 'FOE DEF', val: `+${Math.round(mods.enemyDef*100)}%`, color: '#f44' }); // Red because bad for player
    if (mods.enemyAtk) list.push({ label: 'FOE ATK', val: `+${Math.round(mods.enemyAtk*100)}%`, color: '#f44' });
    
    return list;
});

const formatItem = (item) => {
  if (!item) return "Empty";
  
  // Build stats string based on what the item has
  const statParts = [];
  
  // Primary stats
  if (item.atk) statParts.push(`+${item.atk} ATK`);
  if (item.def) statParts.push(`+${item.def} DEF`);
  if (item.hp) statParts.push(`+${item.hp} HP`);
  if (item.mp) statParts.push(`+${item.mp} MP`);
  
  // Attribute stats
  if (item.str) statParts.push(`+${item.str} STR`);
  if (item.vit) statParts.push(`+${item.vit} VIT`);
  if (item.int) statParts.push(`+${item.int} INT`);
  // v38.4: AGI/LCK
  if (item.agi) statParts.push(`+${item.agi} AGI`);
  if (item.luck) statParts.push(`+${item.luck} LCK`);

  
  // Percentage stats (convert to %)
  if (item.crit) statParts.push(`+${Math.round(item.crit * 100)}% CRIT`);
  if (item.dodge) statParts.push(`+${Math.round(item.dodge * 100)}% DODGE`);
  if (item.lifesteal) statParts.push(`+${Math.round(item.lifesteal * 100)}% LSTEAL`);
  if (item.spellPower) statParts.push(`+${item.spellPower} SPWR`);
  
  // Socket info
  if (item.sockets && item.sockets.length > 0) {
    const filled = item.sockets.filter(s => s !== null).length;
    statParts.push(`💎${filled}/${item.sockets.length}`);
  }
  
  const statsStr = statParts.length > 0 ? ` (${statParts.join(', ')})` : '';
  return `${item.name}${statsStr}`;
};


const rarityColor = (item) => {
  if (!item) return "#555";
  const map = {
    common: "#fff",
    uncommon: "#4f4",
    rare: "#4af",
    epic: "#d0d",
    legendary: "#fa0",
  };
  return map[item.rarity] || "#fff";
};

// v38.9: Dynamic display for Cursed Relic / Special effects
const relicEffects = computed(() => {
    const list = [];
    
    // 1. Multipliers (Non-standard)
    const knownMults = ['hp', 'mp', 'def', 'dmg', 'gold', 'exp', 'str', 'vit', 'int', 'agi', 'luck'];
    for (const [key, val] of Object.entries(s.multipliers || {})) {
        if (knownMults.includes(key)) continue;
        if (val === 1) continue;
        
        let label = key.toUpperCase();
        let color = val > 1 ? '#4f4' : '#f44';
        
        // Manual Label Mapping
        if (key === 'healingReceived') { label = 'HEAL RCV'; color = val > 1 ? '#4f4' : '#f44'; }
        if (key === 'damageTaken') { label = 'DMG TAKEN'; color = val < 1 ? '#4f4' : '#f44'; } // Lower is better
        if (key === 'magicDmg') label = 'MAGIC DMG';
        if (key === 'atkSpeed') label = 'ATK SPD';
        if (key === 'mpRegen') label = 'MP REGEN';
        if (key === 'cooldown') { label = 'CD REDUC'; color = val < 1 ? '#4f4' : '#f44'; } // Lower is better
        if (key === 'dropRate') { label = 'DROP RATE'; color = '#fd0'; }

        list.push({ 
            label, 
            val: `x${val.toFixed(2)}`, 
            color 
        });
    }

    // 2. Bonuses (Non-standard)
    const knownBonus = ['str', 'vit', 'int', 'agi', 'luck', 'crit', 'dodge', 'lifesteal', 'reflect', 'critDmg', 'spellPower', 'block'];
    for (const [key, val] of Object.entries(s.bonuses || {})) {
         if (knownBonus.includes(key)) continue;
         if (!val) continue;
         if (key.startsWith('_')) continue; // Internal flags
         
         let label = key.toUpperCase();
         let displayVal = val;
         let color = '#eee';
         
         // Mapping
         if (key === 'bossDmg') { label = 'BOSS DMG'; displayVal = `+${Math.round(val*100)}%`; color = '#fa0'; }
         if (key === 'minionDmg') { label = 'MINION DMG'; displayVal = `${Math.round(val*100)}%`; color = val > 0 ? '#4f4' : '#f44'; }
         if (key === 'hpDecay') { label = 'HP DECAY'; displayVal = `${val * 100}%/turn`; color = '#f44'; }
         if (key === 'noPotions') { label = 'NO POTIONS'; displayVal = '⚠️'; color = '#f44'; }
         if (key === 'startEmptyMp') { label = 'START 0 MP'; displayVal = '⚠️'; color = '#f44'; }
         if (key === 'curseAura') { label = 'CURSE AURA'; displayVal = `-${Math.round(val*100)}% HP`; color = '#a5f'; }
         if (key === 'extraTurnChance') { label = 'EXTRA TURN'; displayVal = `${Math.round(val*100)}%`; color = '#fa0'; }
         if (key === 'hpPerKillPercent') { label = 'KILL HEAL'; displayVal = `${Math.round(val*100)}%`; color = '#f55'; }
         if (key === 'fullHealOnLevel') { label = 'LVL HEAL'; displayVal = '✅'; color = '#4f4'; }
         if (key === 'highVariance') { label = 'CHAOS DMG'; displayVal = '✅'; color = '#fa0'; }

         list.push({ label, val: displayVal, color });
    }
    
    return list;
});

const close = () => {
    // If leveled up, can't close without picking!
    if(isLevelUp.value) return;
  gameStore.state.activePanel = "menu-view";
};

const getClassIcon = (className) => {
    const map = {
        'Novice': '😐',
        'Skeleton': '💀',
        'Warrior': '⚔️',
        'Mage': '🧙‍♂️',
        'Rogue': '🗡️',
        'Paladin': '🛡️',
        'Dark Knight': '🦇',
        'Necro Priest': '⚰️',
        'Vampire Lord': '🧛‍♂️',
        'Lich King': '👑'
    };
    return map[className] || '❓';
};

const allocate = (key) => {
    if(ProgressionManager) {
        ProgressionManager.applyLevelUp(key);
    }
}
</script>

<template>
  <div class="stats-panel scanline" :class="{ 'levelup-mode': isLevelUp }">
    <div class="header">
      <h2>{{ isLevelUp ? 'LEVEL UP! CHOOSE STAT' : 'CHARACTER STATUS' }}</h2>
      <button v-if="!isLevelUp" @click="close">X</button>
    </div>

    <div class="content">
      <!-- AVATAR / CLASS -->
      <div class="section avatar-section">
        <div class="pixel-art">
          <!-- Class Sprite -->
          <div v-if="s.sprite" v-html="s.sprite" class="class-sprite-render"></div>
          <span v-else style="font-size: 40px">❓</span>
        </div>
        <div class="info">
          <h3>{{ s.className }}</h3>
          <small>Level {{ s.level }}</small><br/>
          <small style="color:#aaa; font-size:0.75rem">EXP {{ s.exp }} / {{ s.nextExp }}</small>
          <div class="bar-group">
            <div class="bar hp">
              <div :style="{ width: (s.hp / s.maxHp) * 100 + '%' }"></div>
            </div>
            <div class="bar mp">
              <div :style="{ width: (s.mp / s.maxMp) * 100 + '%' }"></div>
            </div>
          </div>
        </div>
      </div>

      <hr />

      <!-- ATTRIBUTES - v38.4: Colored icons -->
      <div class="section attributes">
        <div v-for="stat in stats" :key="stat.label" class="stat-row">
          <span class="label" :style="{ color: stat.color || 'var(--c-gold)' }">{{ stat.label }}</span>
          <span class="val" :style="{ color: stat.color || '#eee' }">{{ stat.val }}</span>
          
          <!-- Allocation Button -->
          <button v-if="isLevelUp" class="btn-alloc" @click="allocate(stat.key)">+1</button>
          
          <small v-else>{{ stat.desc }}</small>
        </div>
      </div>

      <div class="section derived">
        <div v-for="stat in derived" :key="stat.label" class="stat-row">
          <span class="label">{{ stat.label }}</span>
          <span class="val" :style="{ color: stat.color || '#eee' }">{{ stat.val }}</span>
        </div>
      </div>

      <hr />

      <!-- EQUIPMENT -->
      <div class="section equipment">
        <h3>EQUIPMENT</h3>
        <div class="equip-slot">
          <span>⚔️ WEAPON</span>
          <span :style="{ color: rarityColor(equip.weapon) }">{{
            formatItem(equip.weapon)
          }}</span>
        </div>
        <div class="equip-slot">
          <span>🛡️ ARMOR</span>
          <span :style="{ color: rarityColor(equip.armor) }">{{
            formatItem(equip.armor)
          }}</span>
        </div>
        <div class="equip-slot">
          <span>💍 ACCESSORY</span>
          <span :style="{ color: rarityColor(equip.acc) }">{{
            formatItem(equip.acc)
          }}</span>
        </div>
      </div>
      
      <!-- v37.0 Phase 3: CURSE EFFECTS -->
      <div class="section curses" v-if="curseEffects.length > 0 || curseBuffs.length > 0">
        <h3 style="color: #a0a;">☠️ CURSE EFFECTS</h3>
        <div v-for="effect in curseBuffs" :key="effect.label" class="stat-row">
          <span class="label" style="color: #4f4;">{{ effect.label }}</span>
          <span class="val" :style="{ color: effect.color }">{{ effect.val }}</span>
        </div>
        <div v-for="effect in curseEffects" :key="effect.label" class="stat-row">
          <span class="label" style="color: #f44;">{{ effect.label }}</span>
          <span class="val" :style="{ color: effect.color }">{{ effect.val }}</span>
        </div>
      </div>

      <!-- v38.9: RELIC EFFECTS -->
      <div class="section relic-fx" v-if="relicEffects.length > 0">
        <h3 style="color: #a5f;">🔮 RELIC EFFECTS</h3>
         <div v-for="effect in relicEffects" :key="effect.label" class="stat-row">
          <span class="label" style="color: #a5f;">{{ effect.label }}</span>
          <span class="val" :style="{ color: effect.color }">{{ effect.val }}</span>
        </div>
      </div>

       <!-- v38.0: BIOME EFFECTS -->
       <div class="section biome-fx" v-if="biomeEffects.length > 0">
         <h3 style="color: #4af;">🌍 ZONE EFFECTS</h3>
          <div v-for="effect in biomeEffects" :key="effect.label" class="stat-row">
           <span class="label" style="color: #4af;">{{ effect.label }}</span>
           <span class="val" :style="{ color: effect.color }">{{ effect.val }}</span>
         </div>
       </div>
    </div>
  </div>
</template>

<style scoped>
.stats-panel {
  background: var(--glass-bg, rgba(10, 10, 12, 0.95));
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  color: #eee;
  padding: 15px;
  border: 1px solid var(--glass-border, rgba(255, 255, 255, 0.08));
  height: 100%;
  display: flex;
  flex-direction: column;
}

.levelup-mode {
    border: 2px solid var(--c-gold, #fd0);
    box-shadow: 0 0 30px rgba(255, 215, 0, 0.4), inset 0 0 20px rgba(255, 215, 0, 0.1);
    animation: levelUpGlow 2s ease-in-out infinite;
}

@keyframes levelUpGlow {
  0%, 100% { box-shadow: 0 0 30px rgba(255, 215, 0, 0.4), inset 0 0 20px rgba(255, 215, 0, 0.1); }
  50% { box-shadow: 0 0 50px rgba(255, 215, 0, 0.6), inset 0 0 30px rgba(255, 215, 0, 0.2); }
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 2px solid rgba(255, 255, 255, 0.1);
  margin-bottom: 12px;
  padding-bottom: 8px;
}
.header h2 {
  margin: 0;
  color: var(--c-gold);
  font-size: 1.2rem;
  text-shadow: 0 0 10px rgba(207, 170, 76, 0.3);
}
.header button {
  background: linear-gradient(135deg, #3a1515, #2a0a0a);
  border: 1px solid rgba(255, 68, 68, 0.4);
  color: #fff;
  cursor: pointer;
  padding: 6px 12px;
  border-radius: var(--radius-sm, 4px);
  transition: all 0.2s ease;
}
.header button:hover {
  background: linear-gradient(135deg, #4a2020, #3a1515);
  border-color: rgba(255, 68, 68, 0.6);
}

.content {
  flex: 1;
  overflow-y: auto;
}

.avatar-section {
  display: flex;
  gap: 15px;
  align-items: center;
  padding: 10px;
  background: rgba(30, 30, 35, 0.5);
  border-radius: var(--radius-md, 8px);
  margin-bottom: 12px;
}

.pixel-art span {
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.5));
}

.bar-group {
  width: 100%;
  margin-top: 5px;
}
.bar {
  height: 8px;
  background: rgba(0, 0, 0, 0.4);
  margin-bottom: 4px;
  position: relative;
  border-radius: 4px;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.05);
}
.bar.hp div {
  background: linear-gradient(90deg, var(--c-red, #bb3333), #ff5555);
  height: 100%;
  border-radius: 4px;
  box-shadow: 0 0 8px rgba(187, 51, 51, 0.5);
  transition: width 0.3s ease-out;
}
.bar.mp div {
  background: linear-gradient(90deg, var(--c-blue, #4d88ff), #66b3ff);
  height: 100%;
  border-radius: 4px;
  box-shadow: 0 0 8px rgba(77, 136, 255, 0.5);
  transition: width 0.3s ease-out;
}

.stat-row {
  display: flex;
  justify-content: space-between;
  align-items: center; 
  padding: 5px 0;
  border-bottom: 1px dashed #333;
}
.stat-row .label {
  color: var(--c-gold);
  font-weight: bold;
  min-width: 70px; /* v38.4: Wider for emojis */
  white-space: nowrap;
}
.stat-row .val {
  font-weight: bold;
  min-width: 45px;
  text-align: right;
  font-size: 1.1em; /* v38.4: Slightly larger values */
}
.stat-row .val-colored {
    font-weight: bold;
    width: 50px;
    text-align: right;
}
.stat-row small {
  color: #888;
  flex: 1;
  text-align: right;
  font-size: 0.8em;
  overflow: hidden;
  text-overflow: ellipsis;
}

.btn-alloc {
    background: var(--c-gold, #fd0); color: black; font-weight: bold;
    border: none; padding: 8px 16px; cursor: pointer; margin-left: auto;
    border-radius: 4px;
    transition: all 0.2s ease;
}
.btn-alloc:hover { transform: scale(1.1); box-shadow: 0 0 8px rgba(255, 215, 0, 0.6); }

.equip-slot {
  display: flex;
  justify-content: space-between;
  padding: 8px 0;
  border-bottom: 1px solid #333;
}

/* v38.4: Mobile responsiveness */
@media (max-width: 480px) {
  .stat-row .label { min-width: 60px; font-size: 0.9em; }
  .stat-row .val { min-width: 35px; font-size: 1em; }
  .stat-row small { font-size: 0.7em; }
  .btn-alloc { padding: 6px 12px; }
}
</style>
