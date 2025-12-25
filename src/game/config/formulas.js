/* =========================================
   GAME LEGIC FORMULAS (v38.0)
   Centralized math for easy balancing and testing.
   ========================================= */

export const Formulas = {
    // --- PLAYER COMBAT ---

    /**
     * Calculate Player Attack Damage
     * @param {Object} playerState - Player state object (needs str, multipliers, equip)
     * @param {Object} enemy - Enemy object (for specific mechanics, optional)
     * @returns {number} Final raw damage before crit/mitigation
     */
    calculatePlayerDamage(playerState, enemy = null) {
        const p = playerState;
        
        let bonusDmg = 0; // Add logic for status effects if passed in? For now use base.
        
        // Base ATK formula: (STR * Mult * 1.5)
        let calcAtk = Math.max(1, Math.floor((p.attr.STR * p.multipliers.str) * 1.5));
        
        // Weapon/Equip ATK
        for (let k in p.equip) {
            if (p.equip[k] && p.equip[k].atk) {
                calcAtk += p.equip[k].atk;
            }
        }
        
        // Damage Multiplier
        calcAtk = Math.floor(calcAtk * p.multipliers.dmg);
        
        // Undead Mastery Checking (Requires external context usually, but we can pass floor if needed)
        // If we want this pure, we might need a separate 'getBonusDamage' helper passed in or simple logic here
        
        return calcAtk + bonusDmg;
    },

    calculateCritDamage(playerState) {
        let mult = 1.5 + (playerState.bonuses.critDmg || 0);
        
        // v38.2 Fix: Apply Cursed Item Multipliers (e.g. Chaos Axe)
        if (playerState.cursedBuffs && playerState.cursedBuffs.critDmgMult) {
            mult *= playerState.cursedBuffs.critDmgMult;
        }
        
        return mult;
    },

    // --- REWARDS ---

    /**
     * Calculate EXP Reward
     * @param {Object} enemy - Enemy object
     * @param {Object} playerState - Player state
     * @returns {number} EXP amount
     */
    calculateExpReward(enemy, playerState) {
        const baseExp = enemy.exp || 10;
        const mult = playerState.multipliers.exp || 1;
        return Math.floor(baseExp * mult);
    },

    /**
     * Calculate Gold Reward
     * @param {Object} enemy 
     * @param {number} currentFloor 
     * @param {Object} playerState 
     * @returns {number} Gold amount
     */
    calculateGoldReward(enemy, currentFloor, playerState) {
        const baseGold = Math.floor((enemy.exp || 10) * 0.5) + (currentFloor * 2);
        const variance = 0.8 + Math.random() * 0.4; // 0.8 - 1.2
        const mult = playerState.multipliers.gold || 1;
        
        // v38.4: LUCK bonus to gold (+0.5% per LUCK point)
        const luck = playerState.luck || 0;
        const luckMult = 1 + (luck * 0.005); // GOLD_PER_LUCK = 0.005
        
        // v38.4: Apply Poverty modifier goldMult
        const modifierGoldMult = playerState.modifierEffects?.goldMult || 1;
        
        let gold = Math.floor(baseGold * variance * mult * luckMult * modifierGoldMult);
        return Math.max(1, gold);
    },

    /**
     * Calculate Drop Chance
     * @param {Object} enemy 
     * @returns {number} Drop chance (0.0 - 1.0)
     */
    calculateDropChance(enemy) {
        let chance = 0.30; // Base 30%

        // Rank modifiers
        if (enemy.isBoss || enemy.rank === 'S') chance = 1.0;
        else if (enemy.isElite || enemy.rank === 'A' || enemy.rank === 'B') chance = 0.50;
        else if (enemy.rank === 'C') chance = 0.35;

        // Rarity modifiers
        const rarityBonus = {
            'common': 0,
            'uncommon': 0.05,
            'rare': 0.10,
            'epic': 0.15,
            'legend': 0.20
        };
        chance += (rarityBonus[enemy.rarity] || 0);
        
        return Math.min(1.0, chance);
    }
};
