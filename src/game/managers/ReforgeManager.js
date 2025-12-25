// v37.0 Reforging System
// Reroll item stats at the cost of gold or souls
import { gameStore } from '../store.js';
import { Player } from '../logic/Player.js';
import { SaveManager } from './SaveManager.js';
import { EconomyManager } from './EconomyManager.js';

export const ReforgeManager = {
  
  // Cost scaling by rarity
  goldCosts: {
    common: 50,
    uncommon: 100,
    rare: 200,
    epic: 350,
    legendary: 500 // Can't reforge, but for completeness
  },
  
  soulCosts: {
    common: 10,
    uncommon: 25,
    rare: 50,
    epic: 75
  },
  
  // Validate if item can be reforged
  canReforge(item) {
    if (!item) {
      return { success: false, error: 'No item selected' };
    }
    
    // Only equipment can be reforged
    if (!item.slot || !['weapon', 'armor', 'acc'].includes(item.slot)) {
      return { success: false, error: 'Can only reforge equipment (weapon/armor/accessory)' };
    }
    
    // Can't reforge legendary items (too powerful)
    if (item.rarity === 'legendary') {
      return { success: false, error: 'Cannot reforge legendary items' };
    }
    
    return { success: true };
  },
  
  // Check if player can afford reforge
  canAffordGold(rarity) {
    const s = gameStore.state;
    // v38.7: Scale Gold Cost with Floor Multiplier
    const baseCost = this.goldCosts[rarity] || 0;
    const mult = EconomyManager ? EconomyManager.getFloorMult() : 1;
    const cost = Math.floor(baseCost * mult);
    
    if (s.gold < cost) {
      return { success: false, error: `Need ${cost} gold` };
    }
    
    return { success: true, cost };
  },
  
  canAffordSoul(rarity) {
    const s = gameStore.state;
    const cost = this.soulCosts[rarity] || 0;
    const souls = s.meta.souls || 0;
    
    if (souls < cost) {
      return { success: false, error: `Need ${cost} souls` };
    }
    
    return { success: true, cost };
  },
  
  // Gold Reforge: ±10% stat variation
  reforgeGold(item) {
    const validation = this.canReforge(item);
    if (!validation.success) return validation;
    
    const affordCheck = this.canAffordGold(item.rarity);
    if (!affordCheck.success) return affordCheck;
    
    const s = gameStore.state;
    
    // Deduct cost
    s.gold -= affordCheck.cost;
    
    // Store original stats for comparison
    const originalStats = {
      atk: item.atk || 0,
      def: item.def || 0,
      hp: item.hp || 0,
      mp: item.mp || 0
    };
    
    // Reroll stats with ±10% variance
    const variance = 0.10;
    
    if (item.atk) {
      const roll = 1 + (Math.random() * variance * 2 - variance);
      item.atk = Math.max(1, Math.floor(originalStats.atk * roll));
    }
    
    if (item.def) {
      const roll = 1 + (Math.random() * variance * 2 - variance);
      item.def = Math.max(1, Math.floor(originalStats.def * roll));
    }
    
    if (item.hp) {
      const roll = 1 + (Math.random() * variance * 2 - variance);
      item.hp = Math.max(1, Math.floor(originalStats.hp * roll));
    }
    
    if (item.mp) {
      const roll = 1 + (Math.random() * variance * 2 - variance);
      item.mp = Math.max(1, Math.floor(originalStats.mp * roll));
    }
    
    // CRITICAL: Preserve sockets (potential issue #3)
    // Sockets are already on item, no action needed
    
    // Log result
    const changes = this.summarizeChanges(originalStats, item);
    gameStore.log(`🔨 Reforged ${item.name}: ${changes}`, 'buff');
    
    // Trigger recalc if equipped (potential issue #2)
    if (Player && Player.recalc) {
      setTimeout(() => Player.recalc(), 50);
    }
    
    return { success: true, item, originalStats };
  },
  
  // Soul Reforge: ±50% stat variation + chance for bonus
  reforgeSoul(item) {
    const validation = this.canReforge(item);
    if (!validation.success) return validation;
    
    const affordCheck = this.canAffordSoul(item.rarity);
    if (!affordCheck.success) return affordCheck;
    
    const s = gameStore.state;
    
    // Deduct cost
    s.meta.souls = (s.meta.souls || 0) - affordCheck.cost;
    SaveManager.saveMeta();
    
    // Store original stats
    const originalStats = {
      atk: item.atk || 0,
      def: item.def || 0,
      hp: item.hp || 0,
      mp: item.mp || 0
    };
    
    // Reroll stats with ±50% variance (HIGH RISK!)
    const variance = 0.50;
    
    if (item.atk) {
      const roll = 1 + (Math.random() * variance * 2 - variance);
      item.atk = Math.max(1, Math.floor(originalStats.atk * roll));
    }
    
    if (item.def) {
      const roll = 1 + (Math.random() * variance * 2 - variance);
      item.def = Math.max(1, Math.floor(originalStats.def * roll));
    }
    
    if (item.hp) {
      const roll = 1 + (Math.random() * variance * 2 - variance);
      item.hp = Math.max(1, Math.floor(originalStats.hp * roll));
    }
    
    if (item.mp) {
      const roll = 1 + (Math.random() * variance * 2 - variance);
      item.mp = Math.max(1, Math.floor(originalStats.mp * roll));
    }
    
    // 20% chance for bonus stat
    let bonusApplied = false;
    if (Math.random() < 0.20) {
      bonusApplied = this.applyBonusStat(item);
    }
    
    // Log result
    const changes = this.summarizeChanges(originalStats, item);
    const bonusMsg = bonusApplied ? ' + BONUS STAT!' : '';
    gameStore.log(`✨ Soul Reforge ${item.name}: ${changes}${bonusMsg}`, 'buff');
    
    // Trigger recalc
    if (Player && Player.recalc) {
      setTimeout(() => Player.recalc(), 50);
    }
    
    return { success: true, item, originalStats, bonusApplied };
  },
  
  // Apply random bonus stat (soul reforge only)
  applyBonusStat(item) {
    const bonuses = [
      { stat: 'crit', value: 0.05, name: '+5% Crit' },
      { stat: 'lifesteal', value: 0.03, name: '+3% Lifesteal' },
      { stat: 'dodge', value: 0.05, name: '+5% Dodge' },
      { stat: 'block', value: 0.05, name: '+5% Block' }
    ];
    
    const bonus = bonuses[Math.floor(Math.random() * bonuses.length)];
    
    // Add to item (creates bonus property if doesn't exist)
    if (!item.bonus) item.bonus = {};
    item.bonus[bonus.stat] = (item.bonus[bonus.stat] || 0) + bonus.value;
    
    gameStore.log(`  → ${bonus.name} added!`, 'loot');
    return true;
  },
  
  // Summarize stat changes for log
  summarizeChanges(original, current) {
    const changes = [];
    
    if (original.atk && current.atk) {
      const diff = current.atk - original.atk;
      if (diff !== 0) {
        changes.push(`ATK ${original.atk}→${current.atk} (${diff > 0 ? '+' : ''}${diff})`);
      }
    }
    
    if (original.def && current.def) {
      const diff = current.def - original.def;
      if (diff !== 0) {
        changes.push(`DEF ${original.def}→${current.def} (${diff > 0 ? '+' : ''}${diff})`);
      }
    }
    
    if (original.hp && current.hp) {
      const diff = current.hp - original.hp;
      if (diff !== 0) {
        changes.push(`HP ${original.hp}→${current.hp} (${diff > 0 ? '+' : ''}${diff})`);
      }
    }
    
    if (changes.length === 0) return 'No change';
    return changes.join(', ');
  },
  
  // Get costs for UI display
  getCosts(rarity) {
    const baseGold = this.goldCosts[rarity] || 0;
    const mult = EconomyManager ? EconomyManager.getFloorMult() : 1;
    
    return {
      gold: Math.floor(baseGold * mult),
      souls: this.soulCosts[rarity] || 0
    };
  },
  
  // Get stat range preview for UI
  getStatRange(item, mode = 'gold') {
    const variance = mode === 'gold' ? 0.10 : 0.50;
    
    const ranges = {};
    
    if (item.atk) {
      ranges.atk = {
        min: Math.max(1, Math.floor(item.atk * (1 - variance))),
        max: Math.floor(item.atk * (1 + variance)),
        current: item.atk
      };
    }
    
    if (item.def) {
      ranges.def = {
        min: Math.max(1, Math.floor(item.def * (1 - variance))),
        max: Math.floor(item.def * (1 + variance)),
        current: item.def
      };
    }
    
    if (item.hp) {
      ranges.hp = {
        min: Math.max(1, Math.floor(item.hp * (1 - variance))),
        max: Math.floor(item.hp * (1 + variance)),
        current: item.hp
      };
    }
    
    if (item.mp) {
      ranges.mp = {
        min: Math.max(1, Math.floor(item.mp * (1 - variance))),
        max: Math.floor(item.mp * (1 + variance)),
        current: item.mp
      };
    }
    
    return ranges;
  },

  // =========================================
  // v38.7: UPGRADE SYSTEM (+1 to +10)
  // =========================================
  
  getUpgradeCost(item) {
      const currentPlus = item.plus || 0;
      const nextPlus = currentPlus + 1;
      
      // Max Level +10
      if (nextPlus > 10) return null;
      
      const isSoul = nextPlus > 5;
      
      if (isSoul) {
          // Soul Cost: +6 .. +10
          // Base 10, scales with level
          return {
              type: 'souls',
              val: 10 * Math.pow( nextPlus - 4, 1.5 ) // 10 * 2^1.5 approx 28 souls
          };
      } else {
          // Gold Cost: +1 .. +5
          // Base 100 * rarity, scales
          let baseMap = { common: 100, uncommon: 200, rare: 500, epic: 1000, legendary: 2500 };
          let base = baseMap[item.rarity] || 100;
          
          // Floor Scaling
          const floorMult = EconomyManager ? EconomyManager.getFloorMult() : 1;
          
          return {
              type: 'gold',
              val: Math.floor(base * nextPlus * floorMult)
          };
      }
  },

  upgradeItem(item) {
      const costInfo = this.getUpgradeCost(item);
      if (!costInfo) return { success: false, error: "Max level reached!" };
      
      const s = gameStore.state;
      
      // 1. Check Cost
      let costVal = Math.floor(costInfo.val);
      if (costInfo.type === 'gold') {
          if (s.gold < costVal) return { success: false, error: `Need ${costVal} Gold` };
          s.gold -= costVal;
      } else {
          if ((s.meta.souls || 0) < costVal) return { success: false, error: `Need ${costVal} Souls` };
          s.meta.souls = (s.meta.souls || 0) - costVal;
          SaveManager.saveMeta();
      }
      
      // 2. Perform Upgrade
      const currentPlus = item.plus || 0; // 0 if undefined
      const nextPlus = currentPlus + 1;
      
      // Calculate Multiplier Ratio
      // Old Mult: 1 + (0.1 * current)
      // New Mult: 1 + (0.1 * next)
      // Factor = New / Old
      const oldMult = 1 + (currentPlus * 0.1);
      const newMult = 1 + (nextPlus * 0.1);
      const ratio = newMult / oldMult;
      
      // Update Stats
      if(item.atk) item.atk = Math.max(1, Math.floor(item.atk * ratio));
      if(item.def) item.def = Math.max(1, Math.floor(item.def * ratio));
      if(item.hp) item.hp = Math.max(1, Math.floor(item.hp * ratio));
      if(item.mp) item.mp = Math.max(1, Math.floor(item.mp * ratio));
      
      // Update Name & Plus
      item.plus = nextPlus;
      // Regex to remove old +X
      item.name = item.name.replace(/ \+\d+$/, "") + ` +${nextPlus}`;
      
      // Update Value
      item.price = Math.floor(item.price * 1.2); // Increase value
      
      gameStore.log(`Upgraded to +${nextPlus}!`, "buff");
      if(SoundManager) SoundManager.play("upgrade_success"); // Assume sound exists or fallback
      
      // Recalc Player
      if (Player && Player.recalc) {
         setTimeout(() => Player.recalc(), 50);
      }
      
      return { success: true, item };
  }

// Global access
// Global access - REMOVED for v38.0 strict mode
// window.ReforgeManager = ReforgeManager;
};
