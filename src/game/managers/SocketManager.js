// v37.0 Socket Management System
import { gameStore } from '../store.js';
import { DB } from '../config/database.js';
import { generateSocketCount } from '../config/database.js';
import { GEMS } from '../config/gems.js';

export const SocketManager = {
  
  // Add sockets to newly generated item
  addSocketsToItem(item) {
    if (!item) return item;
    
    // Only equipment can have sockets (weapon, armor, acc)
    const validSlots = ['weapon', 'armor', 'acc', 'accessory'];
    if (!validSlots.includes(item.slot)) {
      return item; // Don't socket non-equipment items
    }
    
    // Also skip gems and special items
    if (item.type === 'gem' || item.type === 'material' || item.type === 'skill_book') {
      return item;
    }
    
    const socketCount = generateSocketCount(item.rarity);
    
    if (socketCount > 0) {
      item.sockets = Array(socketCount).fill(null); // Empty sockets
      item.maxSockets = socketCount;
    }
    
    return item;
  },

  
  // Insert gem into socket (Refactored to use Inventory)
  insertGem(item, socketIndex, gemType) {
    if (!item.slot || !['weapon', 'armor', 'acc'].includes(item.slot)) {
      return { success: false, error: 'Can only socket equipment (weapon/armor/accessory)' };
    }
    
    if (!item.sockets || socketIndex >= item.sockets.length) {
      return { success: false, error: 'Invalid socket index' };
    }
    
    if (item.sockets[socketIndex] !== null) {
      return { success: false, error: 'Socket already filled' };
    }
    
    // Check if player has gem in INVENTORY
    // gemType is the logical type (e.g. 'ruby', 'sapphire')
    // Inventory items have .type = 'gem' and .gemType = 'ruby'
    const inventory = gameStore.state.inventory;
    const gemItem = inventory.find(i => i.type === 'gem' && i.gemType === gemType);
    
    if (!gemItem) {
      return { success: false, error: 'Gem not in inventory' };
    }
    
    // Insert gem
    item.sockets[socketIndex] = gemType;
    
    // Remove from inventory
    if (gemItem.qty > 1) {
      gemItem.qty--;
    } else {
      const idx = inventory.indexOf(gemItem);
      if (idx > -1) inventory.splice(idx, 1);
    }
    
    gameStore.log(`Socketed ${GEMS[gemType].icon} ${GEMS[gemType].name}`, 'buff');
    
    // v37.0: Achievement tracking
    if (window.Achievements) {
      window.Achievements.addProgress('socket_novice', 1);
      window.Achievements.addProgress('socket_master', 1);
      
      // Check if item is now fully socketed (3 sockets all filled)
      if (item.sockets.length === 3 && item.sockets.every(s => s !== null)) {
        window.Achievements.unlock('fully_socketed');
      }
    }
    
    return { success: true };
  },
  
  // Remove gem from socket
  removeGem(item, socketIndex) {
    if (!item.sockets || !item.sockets[socketIndex]) {
      return { success: false, error: 'Socket is empty' };
    }
    
    const gemType = item.sockets[socketIndex];
    if (!GEMS[gemType]) {
       // Gem type no longer exists? Clear it anyway
       item.sockets[socketIndex] = null;
       return { success: true };
    }

    const inventory = gameStore.state.inventory;
    const maxInv = (window.Player && window.Player.maxInventory) || 20;

    // Check availability in inventory (stacking)
    const existingGem = inventory.find(i => i.type === 'gem' && i.gemType === gemType);
    
    if (!existingGem) {
        // Need empty slot if not stacking
        if (inventory.length >= maxInv) {
            return { success: false, error: 'Inventory full! Cannot remove gem.' };
        }
    }
    
    // Return gem to inventory
    if (existingGem) {
      existingGem.qty = (existingGem.qty || 1) + 1;
    } else {
      const gemData = GEMS[gemType];
      inventory.push({
          id: `${gemType}_extracted_${Date.now()}`,
          name: gemData.name,
          type: 'gem',
          gemType: gemType,
          slot: 'mat',
          rarity: gemData.rarity,
          icon: gemData.icon,
          desc: gemData.desc,
          qty: 1,
          price: 100 // Default value
      });
    }
    
    item.sockets[socketIndex] = null;
    gameStore.log(`Removed ${GEMS[gemType].icon} ${GEMS[gemType].name}`, 'system');
    
    // v37.1 Polish: Play sound
    if (window.SoundManager) window.SoundManager.play('relic'); // Use relic sound for now
    
    return { success: true };
  },
  
  // Calculate total bonuses from socketed gems
  getSocketBonuses(item) {
    if (!item.sockets) return {};
    
    const bonuses = {};
    
    item.sockets.forEach(gemType => {
      if (!gemType) return;
      
      const gem = GEMS[gemType];
      if (!gem) return;
      
      // Merge gem bonuses
      Object.keys(gem.bonus).forEach(stat => {
        bonuses[stat] = (bonuses[stat] || 0) + gem.bonus[stat];
      });
    });
    
    return bonuses;
  },
  
  // Add gem to player inventory (as material item)
  addGem(gemType, floor, quantity = 1) {
    const baseGem = GEMS[gemType];
    if (!baseGem) return;
    
    const scaledBonus = this.scaleGemStats(baseGem.bonus, floor);
    
    // Create gem as inventory item
    const gemItem = {
      id: `${gemType}_fl${floor}`,
      name: `${baseGem.name} (FL${floor})`,
      icon: baseGem.icon,
      type: 'gem',
      slot: 'mat', // Material type
      rarity: baseGem.rarity,
      gemType: gemType, // Reference to base gem
      dropFloor: floor,
      scaledBonus: scaledBonus,
      desc: `${baseGem.desc}\n\nBonuses: ${Object.entries(scaledBonus).map(([s, v]) => `+${v} ${s.toUpperCase()}`).join(', ')}`,
      qty: quantity,
      sellPrice: this.getGemValue(baseGem.rarity, floor)
    };
    
    // Add to inventory via Player
    if (window.Player) {
      window.Player.addItem(gemItem);
    }
    
    gameStore.log(`Found ${baseGem.icon} ${baseGem.name} (FL${floor})!`, 'loot');
    
    // v37.0: Track gem achievements
    if (window.Achievements) {
      window.Achievements.addProgress('gem_collector', 1);
      window.Achievements.addProgress('gem_hoarder', 1);
      
      // Rarity-specific achievements
      if (baseGem.rarity === 'rare') {
        window.Achievements.addProgress('rare_gem_finder', 1);
      } else if (baseGem.rarity === 'epic') {
        window.Achievements.addProgress('epic_gem_finder', 1);
      } else if (baseGem.rarity === 'legendary') {
        window.Achievements.unlock('legendary_gem_finder');
      }
    }
  },
  
  // Calculate gem sell value
  getGemValue(rarity, floor) {
    const baseValues = {
      common: 10,
      rare: 50,
      epic: 200,
      legendary: 1000
    };
    return Math.floor((baseValues[rarity] || 10) * (1 + floor * 0.1));
  },
  
  // Scale gem stats based on floor
  scaleGemStats(baseBonus, floor) {
    const scaled = {};
    const safeFloor = floor || 1; // Default to floor 1 if undefined
    Object.entries(baseBonus).forEach(([stat, value]) => {
      scaled[stat] = Math.floor(value * (1 + safeFloor * 0.05)); // Scale by 5% per floor
    });
    return scaled;
  },
  

  // Generate random gem drop (based on floor)
  generateGemDrop(floor) {
    const roll = Math.random() * 100;
    
    // Drop rates based on floor
    const baseChance = 10 + (floor * 0.5); // 10% at floor 1, 60% at floor 100
    
    if (roll > baseChance) return null;
    
    // Rarity distribution (floor affects higher tier chances)
    const rarityRoll = Math.random() * 100;
    const floorBonus = floor * 0.3; // +0.3% per floor for rare+
    
    let rarity;
    if (rarityRoll < 50 - floorBonus) {
      rarity = 'common';
    } else if (rarityRoll < 80 - floorBonus) {
      rarity = 'rare';
    } else if (rarityRoll < 95) {
      rarity = 'epic';
    } else {
      rarity = 'legendary';
    }
    
    // Get random gem of that rarity
    const gemsOfRarity = Object.values(GEMS).filter(g => g.rarity === rarity);
    const randomGem = gemsOfRarity[Math.floor(Math.random() * gemsOfRarity.length)];
    
    return randomGem ? randomGem.id : null;
  },
  
  // Get visual representation of sockets
  getSocketDisplay(item) {
    if (!item.sockets) return '';
    
    return item.sockets.map(gemType => {
      if (!gemType) return '⭕'; // Empty socket
      return GEMS[gemType].icon; // Filled socket
    }).join('');
  }
};

// Make available globally
window.SocketManager = SocketManager;
