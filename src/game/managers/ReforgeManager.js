// v37.0 Reforging System
// Reroll item stats at the cost of gold or souls
import { gameStore } from '../store.js';

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
    const cost = this.goldCosts[rarity] || 0;
    
    if (s.gold < cost) {
      return { success: false, error: `Need ${cost} gold` };
    }
    
    return { success: true, cost };
  },
  
  canAffordSoul(rarity) {
    const s = gameStore.state;
    const cost = this.soulCosts[rarity] || 0;
    const souls = Number(s.souls) || 0;
    
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
    if (window.Player && window.Player.recalc) {
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
    s.souls = (Number(s.souls) || 0) - affordCheck.cost;
    
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
    if (window.Player && window.Player.recalc) {
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
    return {
      gold: this.goldCosts[rarity] || 0,
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
  }
};

// Global access
window.ReforgeManager = ReforgeManager;
