// v37.0 Phase 3: Black Market Manager
// Mystery boxes, curse handling, dealer reputation

import { gameStore } from '../store.js';
import { CURSED_ITEMS, getRandomCursedItems, getCursedItemsList } from '../config/cursed_items.js';

export const BlackMarketManager = {
  
  // ============================================
  // MYSTERY BOX CONFIGURATION
  // ============================================
  
  // Soul-based boxes (primary, better rates)
  soulBoxes: {
    small: {
      name: 'Small Soul Box',
      cost: 20,
      currency: 'souls',
      pityThreshold: 5,  // Guarantee rare after 5 opens
      minRarity: 'common',
      maxRarity: 'rare',
      gemCount: [1, 3],
      cursedChance: 0
    },
    medium: {
      name: 'Medium Soul Box',
      cost: 50,
      currency: 'souls',
      pityThreshold: 8,  // Guarantee epic after 8 opens
      minRarity: 'uncommon',
      maxRarity: 'epic',
      gemCount: [2, 5],
      cursedChance: 0.05
    },
    large: {
      name: 'Large Soul Box',
      cost: 100,
      currency: 'souls',
      pityThreshold: 15,  // Guarantee legendary after 15 opens
      minRarity: 'rare',
      maxRarity: 'legendary',
      gemCount: [3, 6],
      cursedChance: 0.15
    }
  },
  
  // Gold-based boxes (more expensive, lower pity)
  goldBoxes: {
    bronze: {
      name: 'Bronze Chest',
      cost: 500,
      currency: 'gold',
      pityThreshold: 8,
      minRarity: 'common',
      maxRarity: 'uncommon',
      gemCount: [0, 1],
      cursedChance: 0
    },
    silver: {
      name: 'Silver Chest',
      cost: 1500,
      currency: 'gold',
      pityThreshold: 15,
      minRarity: 'uncommon',
      maxRarity: 'rare',
      gemCount: [1, 2],
      cursedChance: 0.02
    },
    gold: {
      name: 'Gold Chest',
      cost: 5000,
      currency: 'gold',
      pityThreshold: 30,
      minRarity: 'rare',
      maxRarity: 'epic',
      gemCount: [2, 3],
      cursedChance: 0.08
    }
  },
  
  // Rarity weights
  rarityWeights: {
    common: 40,
    uncommon: 30,
    rare: 20,
    epic: 8,
    legendary: 2
  },
  
  // ============================================
  // MYSTERY BOX LOGIC
  // ============================================
  
  // Get adjusted drop rates based on floor and box type
  getDropRates(floor, boxType) {
    const base = { ...this.rarityWeights };
    const floorBonus = Math.floor(floor / 5);
    const soulMult = boxType === 'soul' ? 1.5 : 1.0;
    
    return {
      common: Math.max(10, base.common - floorBonus * 2),
      uncommon: base.uncommon - floorBonus,
      rare: base.rare + Math.floor(floorBonus * soulMult),
      epic: base.epic + Math.floor(floorBonus * 0.5 * soulMult),
      legendary: base.legendary + Math.floor(floorBonus * 0.2 * soulMult)
    };
  },
  
  // Get inflation multiplier (1.0 to 5.0)
  getInflationMult() {
    const s = gameStore.state;
    if (!s.blackMarket) s.blackMarket = {};
    const purchases = s.blackMarket.purchases || 0;
    // +5% per purchase, max +400% (5x total)
    const mult = 1 + (purchases * 0.05);
    return Math.min(5.0, mult);
  },

  // Calculate actual cost with inflation
  calculateBoxCost(boxConfig) {
    const mult = this.getInflationMult();
    return Math.floor(boxConfig.cost * mult);
  },

  // Check if player can afford box
  canAffordBox(boxConfig) {
    const s = gameStore.state;
    const cost = this.calculateBoxCost(boxConfig);
    if (boxConfig.currency === 'souls') {
      return (Number(s.souls) || 0) >= cost;
    } else {
      return s.gold >= cost;
    }
  },
  
  // Open mystery box
  openBox(boxKey, boxType = 'soul') {
    const s = gameStore.state;
    const boxes = boxType === 'soul' ? this.soulBoxes : this.goldBoxes;
    const boxConfig = boxes[boxKey];
    
    if (!boxConfig) {
      return { success: false, error: 'Invalid box type' };
    }
    
    if (!this.canAffordBox(boxConfig)) {
      return { success: false, error: `Not enough ${boxConfig.currency}` };
    }
    
    // Deduct cost (with inflation)
    const actualCost = this.calculateBoxCost(boxConfig);
    
    if (boxConfig.currency === 'souls') {
      s.souls = (Number(s.souls) || 0) - actualCost;
    } else {
      s.gold -= actualCost;
    }
    
    // Increment purchase count for inflation
    if (!s.blackMarket) s.blackMarket = {};
    s.blackMarket.purchases = (s.blackMarket.purchases || 0) + 1;
    
    // Initialize pity if needed
    if (!s.mysteryBoxPity) s.mysteryBoxPity = {};
    const pityKey = `${boxType}_${boxKey}`;
    if (!s.mysteryBoxPity[pityKey]) s.mysteryBoxPity[pityKey] = 0;
    
    // Determine rarity
    const floor = s.floor || 1;
    const rates = this.getDropRates(floor, boxType);
    let rarity = this.rollRarity(rates, boxConfig.minRarity, boxConfig.maxRarity);
    
    // Pity check
    s.mysteryBoxPity[pityKey]++;
    if (s.mysteryBoxPity[pityKey] >= boxConfig.pityThreshold) {
      // Force upgrade rarity
      rarity = this.upgradeRarity(rarity, boxConfig.maxRarity);
      s.mysteryBoxPity[pityKey] = 0;
      gameStore.log('✨ PITY ACTIVATED! Guaranteed upgrade!', 'buff');
    }
    
    // Reset pity on rare+ drop
    if (['rare', 'epic', 'legendary'].includes(rarity)) {
      s.mysteryBoxPity[pityKey] = 0;
    }
    
    // Generate item
    let item = null;
    const isCursed = Math.random() < boxConfig.cursedChance;
    
    if (isCursed && Object.keys(CURSED_ITEMS).length > 0) {
      // Give random cursed item
      const cursedItems = getRandomCursedItems(1, floor);
      if (cursedItems.length > 0) {
        item = { ...cursedItems[0] };
        item.fromBox = true;
        gameStore.log(`☠️ Cursed item emerged! ${item.name}`, 'danger');
      }
    }
    
    // Generate normal item if not cursed
    if (!item && window.LootManager) {
      const slot = ['weapon', 'armor', 'acc'][Math.floor(Math.random() * 3)];
      item = window.LootManager.generateDrop(floor, rarity, slot);
      item.fromBox = true;
    }
    
    // Generate gems
    const gemCount = Math.floor(Math.random() * (boxConfig.gemCount[1] - boxConfig.gemCount[0] + 1)) + boxConfig.gemCount[0];
    const gems = [];
    for (let i = 0; i < gemCount; i++) {
      if (window.SocketManager) {
        const gem = window.SocketManager.generateGemDrop(floor);
        if (gem) gems.push(gem);
      }
    }
    
    // Add to inventory
    if (item && window.Player) {
      window.Player.addItem(item);
    }
    
    gameStore.log(`📦 Opened ${boxConfig.name}: ${item?.name || 'nothing'}!`, 'loot');
    
    // Track for achievements
    if (window.Achievements) {
      window.Achievements.addProgress('mystery_opener', 1);
    }
    
    return { 
      success: true, 
      item, 
      gems,
      rarity,
      wasPity: s.mysteryBoxPity[pityKey] === 0
    };
  },
  
  // Roll rarity with weights
  rollRarity(rates, minRarity, maxRarity) {
    const rarityOrder = ['common', 'uncommon', 'rare', 'epic', 'legendary'];
    const minIdx = rarityOrder.indexOf(minRarity);
    const maxIdx = rarityOrder.indexOf(maxRarity);
    
    // Filter to valid rarity range
    const validRarities = rarityOrder.slice(minIdx, maxIdx + 1);
    
    let total = 0;
    const weights = validRarities.map(r => {
      total += rates[r] || 0;
      return { rarity: r, cumulative: total };
    });
    
    const roll = Math.random() * total;
    for (const w of weights) {
      if (roll <= w.cumulative) return w.rarity;
    }
    
    return validRarities[0]; // Fallback
  },
  
  // Force upgrade rarity
  upgradeRarity(current, max) {
    const order = ['common', 'uncommon', 'rare', 'epic', 'legendary'];
    const currentIdx = order.indexOf(current);
    const maxIdx = order.indexOf(max);
    const nextIdx = Math.min(currentIdx + 1, maxIdx);
    return order[nextIdx];
  },
  
  // ============================================
  // CURSE EFFECT CALCULATIONS
  // ============================================
  
  // Get cumulative curse effects from equipped items
  getCurseEffects(equippedItems) {
    const effects = {
      // Multiplicative effects (start at 1.0)
      maxHpMult: 1.0,
      maxMpMult: 1.0, 
      defMult: 1.0,
      atkMult: 1.0,
      speedMult: 1.0,
      expGainMult: 1.0,
      goldFindMult: 1.0,
      damageTakenMult: 1.0,
      sellPriceMult: 1.0,
      
      // Additive effects (start at 0)
      missChance: 0,
      critChance: 0,
      dodgeChance: 0,
      
      // New Stats (from orphan code)
      hpPerKill: 0,
      selfPoison: 0,
      selfDmgOnHit: 0,
      selfDmgPercent: 0,
      
      // Chance effects
      backfireChance: 0,
      zeroDmgChance: 0,
      confusionChance: 0,
      skipTurnChance: 0,
      
      // Booleans
      noHealInCombat: false,
      noFlee: false,
      permadeath: false,
      noHealingBuffs: false,
      revealedOnCrit: false,
      copyEnemyDebuff: false
    };
    
    if (!equippedItems) return effects;

    // Robust iteration (handle Object or Array)
    const items = Array.isArray(equippedItems) ? equippedItems : Object.values(equippedItems);

    for (const item of items) {
      if (!item || !item.curses) continue;
      
      const c = item.curses;
      
      // Multipliers
      if (c.maxHpMult) effects.maxHpMult *= c.maxHpMult;
      if (c.maxMpMult) effects.maxMpMult *= c.maxMpMult; 
      if (c.defMult) effects.defMult *= c.defMult;
      if (c.atkMult) effects.atkMult *= c.atkMult;
      if (c.speedMult) effects.speedMult *= c.speedMult;
      if (c.expGainMult) effects.expGainMult *= c.expGainMult;
      if (c.goldFindMult) effects.goldFindMult *= c.goldFindMult;
      if (c.damageTakenMult) effects.damageTakenMult *= c.damageTakenMult;
      if (c.sellPriceMult) effects.sellPriceMult *= c.sellPriceMult;
      
      // Additive
      if (c.missChance) effects.missChance += c.missChance;
      if (c.critChance) effects.critChance += c.critChance;
      if (c.dodgeChance) effects.dodgeChance += c.dodgeChance;
      if (c.hpPerKill) effects.hpPerKill += c.hpPerKill;
      if (c.selfPoison) effects.selfPoison += c.selfPoison;
      if (c.selfDmgOnHit) effects.selfDmgOnHit += c.selfDmgOnHit;
      if (c.selfDmgPercent) effects.selfDmgPercent += c.selfDmgPercent;

      // Chance (Bounded)
      if (c.backfireChance) effects.backfireChance = Math.min(0.5, effects.backfireChance + c.backfireChance);
      if (c.zeroDmgChance) effects.zeroDmgChance = Math.min(0.5, effects.zeroDmgChance + c.zeroDmgChance);
      if (c.confusionChance) effects.confusionChance = Math.min(0.5, effects.confusionChance + c.confusionChance);
      if (c.skipTurnChance) effects.skipTurnChance = Math.min(0.25, effects.skipTurnChance + c.skipTurnChance);
      
      // Booleans
      if (c.noHealInCombat) effects.noHealInCombat = true;
      if (c.noFlee) effects.noFlee = true;
      if (c.permadeath) effects.permadeath = true;
      if (c.noHealingBuffs) effects.noHealingBuffs = true;
      if (c.revealedOnCrit) effects.revealedOnCrit = true;
      if (c.copyEnemyDebuff) effects.copyEnemyDebuff = true;
    }
    
    return effects;
  },
  
  // Get cumulative buff effects from equipped cursed items
  getBuffEffects(equippedItems) {
    const effects = {
      // Multiplicative buffs
      atkMult: 1.0,
      defMult: 1.0,
      critDmgMult: 1.0,
      spellPowerMult: 1.0,
      itemDropMult: 1.0,
      dmgMult: 1.0,
      
      // Additive buffs
      lifesteal: 0,
      dodge: 0,
      critRate: 0,
      poisonDmg: 0,
      reflectDmg: 0,
      regenPercent: 0,
      soulsPerKill: 0,
      
      // Stackable buffs
      atkPerKill: 0,
      atkPerKillMax: 0,
      
      // Chance buffs
      extraTurnChance: 0,
      
      // Conditional buffs
      lowHpAtkMult: 1.0,
      lowHpThreshold: 0,
      
      // Boolean buffs
      critImmune: false,
      copyEnemyBuff: false
    };
    
    if (!equippedItems || equippedItems.length === 0) return effects;
    
    for (const item of equippedItems) {
      if (!item || !item.buffs) continue;
      
      const buffs = item.buffs;
      
      // Apply buff effects...
      if (buffs.atkMult) effects.atkMult *= buffs.atkMult;
      if (buffs.defMult) effects.defMult *= buffs.defMult;
      if (buffs.critDmgMult) effects.critDmgMult = Math.max(effects.critDmgMult, buffs.critDmgMult);
      if (buffs.spellPowerMult) effects.spellPowerMult *= buffs.spellPowerMult;
      if (buffs.itemDropMult) effects.itemDropMult *= buffs.itemDropMult;
      if (buffs.dmgMult) effects.dmgMult *= buffs.dmgMult;
      
      if (buffs.lifesteal) effects.lifesteal += buffs.lifesteal;
      if (buffs.dodge) effects.dodge += buffs.dodge;
      if (buffs.critRate) effects.critRate += buffs.critRate;
      if (buffs.poisonDmg) effects.poisonDmg += buffs.poisonDmg;
      if (buffs.reflectDmg) effects.reflectDmg += buffs.reflectDmg;
      if (buffs.regenPercent) effects.regenPercent += buffs.regenPercent;
      if (buffs.soulsPerKill) effects.soulsPerKill += buffs.soulsPerKill;
      
      if (buffs.atkPerKill) effects.atkPerKill += buffs.atkPerKill;
      if (buffs.atkPerKillMax) effects.atkPerKillMax = Math.max(effects.atkPerKillMax, buffs.atkPerKillMax);
      
      if (buffs.extraTurnChance) effects.extraTurnChance += buffs.extraTurnChance;
      
      if (buffs.lowHpAtkMult) {
        effects.lowHpAtkMult = Math.max(effects.lowHpAtkMult, buffs.lowHpAtkMult);
        effects.lowHpThreshold = buffs.lowHpThreshold || 0.30;
      }
      
      if (buffs.critImmune) effects.critImmune = true;
      if (buffs.copyEnemyBuff) effects.copyEnemyBuff = true;
    }
    
    return effects;
  },

  // Get cumulative buff effects from equipped cursed items
  getBuffEffects(equippedItems) {
    const effects = {
      // Multiplicative buffs
      atkMult: 1.0,
      defMult: 1.0,
      critDmgMult: 1.0,
      spellPowerMult: 1.0,
      itemDropMult: 1.0,
      dmgMult: 1.0,
      
      // Additive buffs
      lifesteal: 0,
      dodge: 0,
      critRate: 0,
      poisonDmg: 0,
      reflectDmg: 0,
      regenPercent: 0,
      soulsPerKill: 0,
      
      // Stackable buffs
      atkPerKill: 0,
      atkPerKillMax: 0,
      
      // Chance buffs
      extraTurnChance: 0,
      
      // Conditional buffs
      lowHpAtkMult: 1.0,
      lowHpThreshold: 0,
      
      // Boolean buffs
      critImmune: false,
      copyEnemyBuff: false
    };
    
    // Robust iteration
    const items = Array.isArray(equippedItems) ? equippedItems : Object.values(equippedItems || {});
    
    for (const item of items) {
      if (!item || !item.buffs) continue;
      
      const buffs = item.buffs;
      
      // Apply buff effects...
      if (buffs.atkMult) effects.atkMult *= buffs.atkMult;
      if (buffs.defMult) effects.defMult *= buffs.defMult;
      if (buffs.critDmgMult) effects.critDmgMult = Math.max(effects.critDmgMult, buffs.critDmgMult);
      if (buffs.spellPowerMult) effects.spellPowerMult *= buffs.spellPowerMult;
      if (buffs.itemDropMult) effects.itemDropMult *= buffs.itemDropMult;
      if (buffs.dmgMult) effects.dmgMult *= buffs.dmgMult;
      
      if (buffs.lifesteal) effects.lifesteal += buffs.lifesteal;
      if (buffs.dodge) effects.dodge += buffs.dodge;
      if (buffs.critRate) effects.critRate += buffs.critRate;
      if (buffs.poisonDmg) effects.poisonDmg += buffs.poisonDmg;
      if (buffs.reflectDmg) effects.reflectDmg += buffs.reflectDmg;
      if (buffs.regenPercent) effects.regenPercent += buffs.regenPercent;
      if (buffs.soulsPerKill) effects.soulsPerKill += buffs.soulsPerKill;
      
      if (buffs.atkPerKill) effects.atkPerKill += buffs.atkPerKill;
      if (buffs.atkPerKillMax) effects.atkPerKillMax = Math.max(effects.atkPerKillMax, buffs.atkPerKillMax);
      
      if (buffs.extraTurnChance) effects.extraTurnChance += buffs.extraTurnChance;
      
      if (buffs.lowHpAtkMult) {
        effects.lowHpAtkMult = Math.max(effects.lowHpAtkMult, buffs.lowHpAtkMult);
        effects.lowHpThreshold = buffs.lowHpThreshold || 0.30;
      }
      
      if (buffs.critImmune) effects.critImmune = true;
      if (buffs.copyEnemyBuff) effects.copyEnemyBuff = true;
    }
    
    return effects;
  },

  // ============================================
  // SHADY DEALER
  // ============================================
  
  // Get dealer reputation level
  getDealerReputation() {
    const s = gameStore.state;
    if (!s.blackMarket) s.blackMarket = { purchases: 0, reputation: 0 };
    
    const purchases = s.blackMarket.purchases || 0;
    
    if (purchases >= 50) return 5;  // Shadow Partner
    if (purchases >= 20) return 4;  // Dark Pact
    if (purchases >= 10) return 3;  // Inner Circle
    if (purchases >= 3) return 2;   // Trust Building
    if (purchases >= 1) return 1;   // First Contact
    return 0;  // Unknown
  },
  
  // Get discount based on reputation
  getDiscount() {
    const rep = this.getDealerReputation();
    if (rep >= 4) return 0.20;  // 20% off
    if (rep >= 3) return 0.10;  // 10% off
    if (rep >= 2) return 0.05;  // 5% off
    return 0;
  },
  
  // Generate dealer stock
  generateDealerStock(floor) {
    const rep = this.getDealerReputation();
    const stock = {
      cursedItems: getRandomCursedItems(2 + Math.floor(rep / 2), floor),
      boxes: {
        soul: ['small'],
        gold: ['bronze']
      },
      services: []
    };
    
    // Unlock more based on reputation
    if (rep >= 2) {
      stock.boxes.soul.push('medium');
      stock.boxes.gold.push('silver');
    }
    if (rep >= 3) {
      stock.boxes.soul.push('large');
      stock.boxes.gold.push('gold');
      stock.services.push('identify', 'curse_transfer');
    }
    if (rep >= 4) {
      stock.services.push('curse_removal', 'curse_amplify');
    }
    
    return stock;
  },
  
  // Track purchase for reputation
  recordPurchase() {
    const s = gameStore.state;
    if (!s.blackMarket) s.blackMarket = { purchases: 0 };
    s.blackMarket.purchases++;
    
    // Check for reputation milestone
    const newRep = this.getDealerReputation();
    if (newRep > (s.blackMarket.lastRep || 0)) {
      s.blackMarket.lastRep = newRep;
      gameStore.log(`☠️ Dealer Reputation increased! Level ${newRep}`, 'system');
    }
  },
  
  // ============================================
  // SPECIAL SERVICES
  // ============================================
  
  serviceCosts: {
    identify: { souls: 10, gold: 200 },
    curse_transfer: { souls: 50, gold: 1000 },
    curse_removal: { souls: 50, gold: 0 },
    curse_amplify: { souls: 75, gold: 1500 },
    curse_suppress: { souls: 75, gold: 1500 },
    reroll_curse: { souls: 150, gold: 3000 },
    add_curse: { souls: 200, gold: 5000 }
  },
  
  canAffordService(serviceKey, useSouls = true) {
    const s = gameStore.state;
    const costs = this.serviceCosts[serviceKey];
    if (!costs) return false;
    
    if (useSouls) {
      return (Number(s.souls) || 0) >= costs.souls;
    } else {
      return s.gold >= costs.gold;
    }
  },
  
  // Use service on item
  useService(serviceKey, item, useSouls = true) {
    if (!this.canAffordService(serviceKey, useSouls)) {
      return { success: false, error: 'Cannot afford service' };
    }
    
    const s = gameStore.state;
    const costs = this.serviceCosts[serviceKey];
    
    // Deduct cost
    if (useSouls) {
      s.souls = (Number(s.souls) || 0) - costs.souls;
    } else {
      s.gold -= costs.gold;
    }
    
    this.recordPurchase();
    
    switch (serviceKey) {
      case 'curse_removal':
        if (item.curses) {
          delete item.curses;
          gameStore.log(`🔮 Curse removed from ${item.name}!`, 'buff');
        }
        break;
        
      case 'curse_amplify':
        if (item.buffs) {
          // Amplify all buff values by 50%
          for (const key in item.buffs) {
            if (typeof item.buffs[key] === 'number') {
              item.buffs[key] *= 1.5;
            }
          }
          gameStore.log(`⚡ Buffs amplified on ${item.name}!`, 'buff');
        }
        // Also increase curse effects by 25%
        if (item.curses) {
          for (const key in item.curses) {
            if (typeof item.curses[key] === 'number') {
              item.curses[key] *= 1.25;
            }
          }
        }
        break;
        
      default:
        return { success: false, error: 'Unknown service' };
    }
    
    return { success: true };
  },
  // v37.1 E3.9: Cost to cleanse a cursed item
  getCleanseCost(item) {
      if (!item || !item.curses) return 0;
      return 50; 
  },

  // v37.1 E3.9: Cleanse curse from item
  cleanseCurse(item) {
      if (!item || !item.curses) return { success: false, error: "Item is not cursed" };
      
      const cost = this.getCleanseCost(item);
      const s = gameStore.state;
      
      if ((Number(s.souls) || 0) < cost) {
          return { success: false, error: "Not enough Souls" };
      }
      
      // Deduct cost
      s.souls -= cost;
      
      // Remove curses property
      delete item.curses;
      
      // Update lore
      if (item.desc) item.desc += " (Cleansed)";
      
      gameStore.log(`Cleansed ${item.name}!`, "buff");
      if (window.SoundManager) window.SoundManager.play('relic'); 
      
      return { success: true };
  }
};

// Global export
window.BlackMarketManager = BlackMarketManager;
