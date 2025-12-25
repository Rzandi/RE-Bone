import { 
    RARITY_DISTRIBUTIONS, 
    FLOOR_BONUS_CONFIG, 
    RARITY_TIERS,
    DEFAULT_DISTRIBUTION 
} from '../config/loot_config.js';

import { DB } from '../config/database.js';
import { Player } from '../logic/Player.js';
import { Game } from '../core/game.js';
import { gameStore } from '../store.js'; // v38.3: For floor sync
import { RELICS } from '../config/relics.js';
import { Ascension } from './ascension.js';
import { CONSTANTS } from '../config/constants.js'; // v38.4: For LUCK bonuses

const LootManager = {
    /**
     * Main drop logic for enemies
     * @param {Object} enemy - The enemy object
     */
    dropLoot(enemy) {        let dropChance = 0.3; // 30% base drop rate
        let droppedItem = null;
        
        const floor = gameStore.state?.floor || Game.state?.floor || 1; // v38.3: Prefer gameStore for sync

        // Boss guaranteed legendary drop (Only Main Bosses)
        const isMainBoss = enemy.isBoss && (floor === 1 || floor % 20 === 0);
        
        if (isMainBoss) {
            dropChance = 1.0;
            
            // v36: Specific Realm Boss Drop
            if(enemy.drop && DB.ITEMS[enemy.drop]) {
                Player.addItem(enemy.drop);
                return `[MYTHIC] ${DB.ITEMS[enemy.drop].name}`;
            }

            let legendaryItems = this.getLegendaryItems();
            if (legendaryItems.length > 0) {
                let item = legendaryItems[Math.floor(Math.random() * legendaryItems.length)];
                Player.addItem(item);
                // Return item name for Game.js log
                return `[LEGENDARY] ${DB.ITEMS[item].name}`;
            }
            return null;
        }
        
        // Mini Boss Bonus
        if (enemy.isBoss) dropChance = 0.6;
        
        if (Math.random() < dropChance) {
            let rarity = this.getRarityRoll(floor);
            // Mini Bosses have better minimum rarity
            if (enemy.isBoss && rarity === "common") rarity = "rare";

            let itemId = this.getRandomItemByRarity(rarity);
            
            if (itemId && DB.ITEMS[itemId]) {
                const baseItem = DB.ITEMS[itemId];
                let newItem = { ...baseItem, id: itemId, uid: Date.now() + Math.random() };
                
                // v38.7: Soul Forging (Scaling Items)
                // Floor 20 = +1. Floor 500 = +25.
                if (['weapon','armor','acc'].includes(newItem.slot) && floor > 20) {
                     const plus = Math.floor(floor / 20);
                     if (plus > 0) {
                         newItem.plus = plus;
                         newItem.name = `${newItem.name} +${plus}`;
                         newItem.price = Math.floor(newItem.price * (1 + plus * 0.2)); 
                         
                         // Bake Stats
                         const mult = 1 + (plus * 0.1);
                         if(newItem.atk) newItem.atk = Math.floor(newItem.atk * mult);
                         if(newItem.def) newItem.def = Math.floor(newItem.def * mult);
                         if(newItem.hp) newItem.hp = Math.floor(newItem.hp * mult);
                         if(newItem.mp) newItem.mp = Math.floor(newItem.mp * mult);
                         // Don't scale % stats like crit/dodge yet to avoid broken values
                     }
                }
                
                Player.addItem(newItem);
                droppedItem = newItem.name;
            }
        }
        return droppedItem;
    },

    /**
     * Calculate rarity based on floor depth
     * @param {number} floor - Current floor depth
     * @returns {string} Rarity string (common, rare, etc)
     */
    getRarityRoll(floor) {
        let roll = Math.random();
        // v38.6: Rarity Bonus Logic (Higher Floor = Better Loot)
        // Capped at +30% for balance
        let floorBonus = Math.min(0.3, floor * 0.002); 
        if (floor > 100) floorBonus += (floor - 100) * 0.001; // Extra boost for Endless 
        
        // v38.4: LUCK bonus to rarity (+0.5% per LUCK point)
        const luck = Player.state?.luck || 0;
        const luckBonus = luck * CONSTANTS.RARITY_PER_LUCK;
        const totalBonus = floorBonus + luckBonus;
        
        // v30.0 Mythic Drop (Ascension Only)
        if (Ascension && Ascension.meta.ascensionLevel > 0) {
            if (roll < 0.01 + (luckBonus * 0.5)) return "mythic"; // LUCK helps mythic slightly
        }

        if (roll < 0.02 + totalBonus) return "legend";
        if (roll < 0.15 + totalBonus) return "epic";
        if (roll < 0.45 + totalBonus) return "rare";
        
        // v36.5: Deep Floor Clamps (No trash late game) - FIXED INVERTED LOGIC
        if (floor >= 90) return "epic"; // Minimum Epic at Floor 90+
        if (floor >= 70) return "rare"; // Minimum Rare at Floor 70+
        
        return "common";
    },

    getRandomItemByRarity(rarity) {
        let items = [];
        for (let id in DB.ITEMS) {
            let item = DB.ITEMS[id];
            if (item.rarity === rarity && item.slot !== "con") {
                items.push(id);
            }
        }
        
        if (items.length > 0) {
            return items[Math.floor(Math.random() * items.length)];
        }
        
        // Fallback to common consumable
        return "rotten_meat";
    },

    getLegendaryItems() {
        let items = [];
        for (let id in DB.ITEMS) {
            if (DB.ITEMS[id].rarity === "legend") {
                items.push(id);
            }
        }
        return items;
    },
    
    /**
     * Get themed loot pool based on enemy type (ALL VALID ITEMS)
     */
    getEnemyLootPool(enemyName) {
        const name = (enemyName || '').toLowerCase();
        
        // Enemy-specific item themes using ALL new themed items
        if (name.includes('skeleton') || name.includes('bone')) {
            return ['bone_dagger', 'bone_sword', 'skull_helm', 'rib_cage', 'bone_mail', 'bone_ring'];
        }
        if (name.includes('fire') || name.includes('flame') || name.includes('infernal') || name.includes('lava')) {
            return ['flame_sword', 'inferno_robe', 'fire_ring', 'spell_wand', 'wizard_hat', 'lava_rock'];
        }
        if (name.includes('slime') || name.includes('ooze') || name.includes('toxic') || name.includes('sludge') || name.includes('poison')) {
            return ['poison_dagger', 'venom_dagger', 'slimy_boots', 'toxic_ring', 'venom_sac', 'swamp_moss'];
        }
        if (name.includes('wolf') || name.includes('beast') || name.includes('thorn')) {
            return ['claw_gauntlet', 'wolf_pelt', 'fang_necklace', 'beast_fang', 'tough_leather', 'leather_armor'];
        }
        if (name.includes('undead') || name.includes('zombie') || name.includes('ghoul')) {
            return ['rusty_knife', 'rotten_meat', 'dark_essence', 'torn_cloak', 'diseased_cloth'];
        }
        if (name.includes('dragon') || name.includes('drake')) {
            return ['dragon_scale', 'flame_sword', 'excalibur', 'fire_ring', 'fragment_dragon'];
        }
        if (name.includes('shadow') || name.includes('dark') || name.includes('void')) {
            return ['shadow_blade', 'dark_cloak', 'void_ring', 'shadow_cloth', 'rogue_hood', 'dark_essence'];
        }
        if (name.includes('spider') || name.includes('web')) {
            return ['web_cloak', 'spider_ring', 'poison_dagger', 'venom_dagger', 'spider_silk', 'venom_sac'];
        }
        if (name.includes('goblin') || name.includes('thief') || name.includes('assassin') || name.includes('rogue')) {
            return ['thief_ring', 'rusty_knife', 'leather_armor', 'rogue_hood', 'smoke_bomb', 'assassin_token'];
        }
        if (name.includes('golem') || name.includes('stone') || name.includes('gargoyle')) {
            return ['stone_gauntlet', 'rock_shield', 'earth_ring', 'steel_plate', 'plate_mail', 'golem_core'];
        }
        if (name.includes('elf') || name.includes('ranger') || name.includes('druid')) {
            return ['nature_cloak', 'leaf_ring', 'druid_staff', 'bark_shield', 'ironwood_log', 'blessed_robe'];
        }
        if (name.includes('mage') || name.includes('wizard') || name.includes('cultist')) {
            return ['arcane_ring', 'mage_robe', 'spell_wand', 'wizard_hat', 'mana_crystal', 'mana_potion'];
        }
        if (name.includes('knight') || name.includes('guard') || name.includes('warden') || name.includes('paladin')) {
            return ['knight_ring', 'iron_sword', 'plate_mail', 'paladin_shield', 'steel_plate'];
        }
        if (name.includes('rat') || name.includes('crow') || name.includes('fly') || name.includes('pest')) {
            return ['diseased_ring', 'diseased_cloth', 'rotten_meat', 'sewer_rat_tail', 'rusty_knife', 'torn_cloak'];
        }
        if (name.includes('water') || name.includes('siren') || name.includes('elemental') || name.includes('river')) {
            return ['water_staff', 'tide_ring', 'aqua_cloak', 'spell_wand', 'blessed_robe', 'holy_water_vial'];
        }
        if (name.includes('mimic') || name.includes('chest')) {
            return ['silver_ring', 'smoke_bomb', 'mana_crystal', 'thief_ring'];
        }
        
        return null; // No themed pool
    },
    
    /**
     * Weighted rarity roll based on enemy rarity
     * Enemy rarity shifts the probability distribution (bell curve)
     * ALL rarities are possible, but enemy rarity determines the PEAK
     * NOW USES CONFIG FILE - Easy to balance!
     */
    getRarityFromEnemyDistribution(floor, enemyRarity) {
        // Use config distribution, fallback to default
        const dist = RARITY_DISTRIBUTIONS[enemyRarity] || DEFAULT_DISTRIBUTION;
        
        // Floor bonus from config
        const floorBonus = Math.min(
            floor * FLOOR_BONUS_CONFIG.bonusPerFloor, 
            FLOOR_BONUS_CONFIG.maxBonus
        );
        
        // Adjust distribution with floor bonus using config weights
        const adjustedDist = {};
        for (let rarity in dist) {
            const weight = FLOOR_BONUS_CONFIG.weights[rarity] || 0;
            adjustedDist[rarity] = Math.max(1, dist[rarity] + (floorBonus * weight));
        }
        
        // Normalize to 100%
        const total = Object.values(adjustedDist).reduce((a, b) => a + b, 0);
        const normalized = {};
        for (let key in adjustedDist) {
            normalized[key] = (adjustedDist[key] / total) * 100;
        }
        
        // Roll weighted random
        const roll = Math.random() * 100;
        let cumulative = 0;
        
        // Use config rarity tiers for order
        for (let rarity of RARITY_TIERS) {
            if (normalized[rarity]) {
                cumulative += normalized[rarity];
                if (roll <= cumulative) {
                    return rarity;
                }
            }
        }
        
        return 'common'; // Fallback
    },
    
    /**
     * Generate a loot drop (Modern API for Combat.js)
     * @param {number} floor - Current floor
     * @param {string} rarityOverride - Force specific rarity (optional)
     * @param {Object} enemy - Enemy object for themed drops (optional)
     * @returns {Object} Item object with all properties
     */
    generateDrop(floor, rarityOverride = null, enemy = null) {
        // 25% chance for enemy-themed drop (if applicable)
        if (enemy && enemy.name && Math.random() < 0.25) {
            const themedPool = this.getEnemyLootPool(enemy.name);
            if (themedPool && themedPool.length > 0) {
                // Filter by items that exist in DB
                const validItems = themedPool.filter(id => DB.ITEMS[id]);
                if (validItems.length > 0) {
                    const itemId = validItems[Math.floor(Math.random() * validItems.length)];
                    return { ...DB.ITEMS[itemId], id: itemId };
                }
            }
        }
        
        // Weighted rarity distribution based on enemy rarity
        let rarity;
        if (rarityOverride) {
            rarity = rarityOverride;
        } else if (enemy && enemy.rarity) {
            // Use weighted distribution (bell curve centered at enemy rarity)
            rarity = this.getRarityFromEnemyDistribution(floor, enemy.rarity);
        } else {
            // Standard floor-based roll
            rarity = this.getRarityRoll(floor);
        }
        
        let itemId = this.getRandomItemByRarity(rarity);
        if (!itemId || !DB.ITEMS[itemId]) return null;
        
        // v38.7: Apply Scaling to Chest/Event drops too
        let newItem = { ...DB.ITEMS[itemId], id: itemId };
        if (['weapon','armor','acc'].includes(newItem.slot) && floor > 20) {
             const plus = Math.floor(floor / 20);
             if (plus > 0) {
                 newItem.plus = plus;
                 newItem.name = `${newItem.name} +${plus}`;
                 newItem.price = Math.floor(newItem.price * (1 + plus * 0.2));
                 
                 // Bake Stats
                 const mult = 1 + (plus * 0.1);
                 if(newItem.atk) newItem.atk = Math.floor(newItem.atk * mult);
                 if(newItem.def) newItem.def = Math.floor(newItem.def * mult);
                 if(newItem.hp) newItem.hp = Math.floor(newItem.hp * mult);
                 if(newItem.mp) newItem.mp = Math.floor(newItem.mp * mult);
             }
        }
        
        return newItem;
    },
    
    // v35.1: Merchant Stock Generator
    generateMerchantStock(floor) {
        let stock = [];
        // Merchant always has some basics
        stock.push('health_potion');
        
        // Random 5-7 items based on floor
        const count = 5 + Math.floor(Math.random() * 3);
        
        for(let i=0; i<count; i++) {
             // Roll rarity slightly boosted for shop
             let rarity = this.getRarityRoll(floor);
             
             // Ensure we don't just get nulls
             let attempts = 0;
             let item = null;
             while(!item && attempts < 5) {
                 // Use generateDrop to get Scaled Items (Objects)
                 // Pass rarityOverride
                 item = this.generateDrop(floor, rarity);
                 attempts++;
             }
             
             if(item) stock.push(item);
        }
        
        // 5% Chance for a Skill Book
        if(Math.random() < 0.05) {
             const books = Object.keys(DB.ITEMS).filter(k => DB.ITEMS[k].slot === 'skill_book');
             if(books.length > 0) {
                 stock.push(books[Math.floor(Math.random() * books.length)]);
             }
        }
        
        return stock;
    },
    
    // v35.2 Relic Drop
    dropRelic(tier="common") {
        if(!RELICS) return null;
        
        // Filter by rarity if needed, or just random from pool
        const pool = Object.keys(RELICS).filter(k => {
             const r = RELICS[k];
             if(tier === 'legend' && r.rarity === 'legend') return true;
             if(tier === 'common') return true; // All pool for now?
             return true;
        });
        
        if(pool.length === 0) return null;
        
        // Try to give one the player doesn't have
        let valid = pool;
        if(Player && Player.state.relics) {
            valid = pool.filter(id => !Player.state.relics.includes(id));
        }
        
        if(valid.length === 0) return null; // Player has all relics?
        
        const picked = valid[Math.floor(Math.random() * valid.length)];
        Player.addRelic(picked);
        return RELICS[picked].name;
    }
};

// window.LootManager = LootManager;
export { LootManager };
