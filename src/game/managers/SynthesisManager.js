// v37.0 Item Synthesis System
// Combine 3 items of same tier → 1 item of higher tier
import { gameStore } from '../store.js';
import { LootManager } from './loot.js';
import { SocketManager } from './SocketManager.js';
import { Player } from '../logic/Player.js';
import { Achievements } from './achievements.js';

import { SoundManager } from './sound.js';
import { SaveManager } from './SaveManager.js';

export const SynthesisManager = {
  
  // Rarity progression chain
  rarityChain: ['common', 'uncommon', 'rare', 'epic', 'legendary'],
  
  // v37.0: Balancing costs
  goldCosts: {
    common: 50,
    uncommon: 150,
    rare: 300,
    epic: 500
  },
  
  materialCosts: {
    common: { souls: 5 },
    uncommon: { souls: 15 },
    rare: { souls: 30, essence: 3 },
    epic: { souls: 50, essence: 10 }
  },
  
  successRates: {
    common: 0.75,    // 75% success
    uncommon: 0.60,  // 60% success
    rare: 0.50,      // 50% success
    epic: 0.40       // 40% success (v37.0: Reduced for challenge)
  },
  
  // Check if player can afford synthesis
  canAfford(rarity) {
    const s = gameStore.state;
    const goldCost = this.goldCosts[rarity] || 0;
    
    if (s.gold < goldCost) return { success: false, reason: 'Not enough gold' };
    
    // Check materials (if implemented) - with type coercion
    const materials = this.materialCosts[rarity];
    if (materials) {
      const souls = s.meta.souls || 0;
      const essence = Number(s.essence) || 0;
      
      if (materials.souls && souls < materials.souls) {
        return { success: false, reason: 'Not enough souls' };
      }
      if (materials.essence && essence < materials.essence) {
        return { success: false, reason: 'Not enough essence' };
      }
    }
    
    return { success: true };
  },
  
  // Check if 3 items can be synthesized
  canSynthesize(items) {
    if (!items || items.length !== 3) return false;
    
    // Must be same slot type
    const firstSlot = items[0].slot;
    if (!['weapon', 'armor', 'acc'].includes(firstSlot)) return false;
    if (!items.every(item => item.slot === firstSlot)) return false;
    
    // Must be same rarity
    const firstRarity = items[0].rarity;
    if (!items.every(item => item.rarity === firstRarity)) return false;
    
    // Can't synthesize legendary (max tier)
    if (firstRarity === 'legendary') return false;
    
    // Check if can afford
    const affordResult = this.canAfford(firstRarity);
    if (!affordResult.success) return false;
    
    return true;
  },
  
  // Get next tier rarity
  getNextRarity(currentRarity) {
    const index = this.rarityChain.indexOf(currentRarity);
    if (index === -1 || index === this.rarityChain.length - 1) return null;
    return this.rarityChain[index + 1];
  },
  
  // Get synthesis costs for UI display
  getCosts(rarity) {
    const s = gameStore.state;
    
    // v37.0: Pity system - increase success rate after failures (with validation)
    const failureCount = Math.max(0, Number((s.synthesisFailures && s.synthesisFailures[rarity]) || 0));
    const pityBonus = Math.min(failureCount * 0.05, 0.15); // +5% per fail, max +15%
    const baseRate = this.successRates[rarity] || 0.80;
    const finalRate = Math.min(baseRate + pityBonus, 0.99); // Cap at 99%
    
    return {
      gold: this.goldCosts[rarity] || 0,
      materials: this.materialCosts[rarity] || {},
      successRate: finalRate * 100,
      pityBonus: pityBonus > 0 ? pityBonus * 100 : 0,
      failureCount: failureCount
    };
  },
  
  // Perform synthesis
  synthesize(items, useEnhanced = false) {
    if (!this.canSynthesize(items)) {
      return { success: false, error: 'Invalid synthesis materials or insufficient resources' };
    }
    
    const baseItem = items[0];
    const nextRarity = this.getNextRarity(baseItem.rarity);
    
    if (!nextRarity) {
      return { success: false, error: 'Cannot upgrade legendary items' };
    }
    
    const s = gameStore.state;
    const goldCost = this.goldCosts[baseItem.rarity] || 0;
    const materials = this.materialCosts[baseItem.rarity] || {};
    
    // v37.0: Pity system - get adjusted success rate with validation
    if (!s.synthesisFailures) s.synthesisFailures = {};
    const failureCount = Math.max(0, Number(s.synthesisFailures[baseItem.rarity]) || 0);
    const pityBonus = Math.min(failureCount * 0.05, 0.15); // +5% per fail, max +15%
    const baseSuccessRate = this.successRates[baseItem.rarity] || 0.80;
    const successRate = Math.min(baseSuccessRate + pityBonus, 0.99); // Cap at 99%
    
    // Enhanced synthesis costs more (souls) - with type coercion
    if (useEnhanced) {
      const souls = s.meta.souls || 0;
      const essence = Number(s.essence) || 0;
      
      // Check souls
      if (materials.souls && souls < materials.souls) {
        return { success: false, error: 'Not enough souls for enhanced synthesis' };
      }
      if (materials.essence && essence < materials.essence) {
        return { success: false, error: 'Not enough essence for enhanced synthesis' };
      }
    }
    
    // Deduct costs
    s.gold -= goldCost;
    if (useEnhanced) {
      if (materials.souls) {
          s.meta.souls = (s.meta.souls || 0) - materials.souls;
          SaveManager.saveMeta();
      }
      if (materials.essence) s.essence = (Number(s.essence) || 0) - materials.essence;
    }
    
    // Remove the 3 source items from inventory (optimized)
    gameStore.state.inventory = gameStore.state.inventory.filter(
      invItem => !items.includes(invItem)
    );
    
    // v37.0: Success check with pity bonus
    const roll = Math.random();
    if (roll > successRate) {
      // FAILURE - items consumed, increase pity counter
      s.synthesisFailures[baseItem.rarity] = (s.synthesisFailures[baseItem.rarity] || 0) + 1;
      
      const bonusMsg = pityBonus > 0 ? ` (had +${Math.round(pityBonus * 100)}% pity bonus)` : '';
      gameStore.log(`⚗️ Synthesis FAILED! ${Math.round(successRate * 100)}% chance${bonusMsg}`, 'system');
      gameStore.log(`💔 Next ${baseItem.rarity} synthesis: +${Math.round((pityBonus + 0.05) * 100)}% success rate!`, 'buff');
      
      if (SoundManager) SoundManager.play('error');
      return { success: false, error: 'Synthesis failed', destroyed: true };
    }
    
    // SUCCESS - Reset pity counter for this rarity
    s.synthesisFailures[baseItem.rarity] = 0;
    
    // SUCCESS - Generate new item of higher tier
    const floor = gameStore.state.floor || 1;
    
    if (LootManager) {
      const newItem = LootManager.generateDrop(floor, nextRarity, baseItem.slot);
      
      if (newItem) {
        // v37.0: Enhanced synthesis bonuses
        if (useEnhanced) {
          // +10% to all stats
          if (newItem.atk) newItem.atk = Math.floor(newItem.atk * 1.10);
          if (newItem.def) newItem.def = Math.floor(newItem.def * 1.10);
          if (newItem.hp) newItem.hp = Math.floor(newItem.hp * 1.10);
          if (newItem.mp) newItem.mp = Math.floor(newItem.mp * 1.10);
          
          // Guaranteed socket (if applicable for rarity)
          if (SocketManager && ['rare', 'epic', 'legendary'].includes(nextRarity)) {
            if (!newItem.sockets) {
              SocketManager.addSocketsToItem(newItem);
            }
          }
          
          gameStore.log(`⚗️ ENHANCED Synthesis SUCCESS! Created ${newItem.name} (+10% stats)!`, 'loot');
        } else {
          // Basic synthesis - no sockets
          delete newItem.sockets;
          gameStore.log(`⚗️ Synthesis SUCCESS! Created ${newItem.name}!`, 'loot');
        }
        
        if (SoundManager) SoundManager.play('loot');
        
        // Add new item
        if (Player) {
          Player.addItem(newItem);
        }
        
        // Track achievement
        if (Achievements) {
          Achievements.addProgress('synthesis_novice', 1);
          Achievements.addProgress('synthesis_master', 1);
          
          // Check if legendary synthesis
          if (nextRarity === 'legendary') {
            Achievements.unlock('legendary_synthesis');
          }
        }
        
        return { success: true, result: newItem, enhanced: useEnhanced };
      }
    }
    
    return { success: false, error: 'Synthesis failed - item generation error' };
  },
  
  // Get synthesis preview (what you'll get)
  getPreview(items) {
    if (items.length === 0) return null;
    
    const nextRarity = this.getNextRarity(items[0].rarity);
    if (!items[0].slot) return null;
    
    const costs = this.getCosts(items[0].rarity);
    
    return {
      slot: items[0].slot,
      fromRarity: items[0].rarity,
      toRarity: nextRarity,
      description: `3x ${items[0].rarity} ${items[0].slot} → 1x ${nextRarity} ${items[0].slot}`,
      costs: costs
    };
  }
};

// Global access
// Global access - REMOVED for v38.0 strict mode
// window.SynthesisManager = SynthesisManager;

