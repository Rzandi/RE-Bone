/**
 * LOOT RARITY DISTRIBUTION CONFIG
 * Defines probability distributions for item drops based on enemy rarity
 * 
 * Format: { enemy_rarity: { item_rarity: percentage } }
 * All percentages should sum to 100 for each enemy rarity
 */

export const RARITY_DISTRIBUTIONS = {
    // Common enemies (basic mobs)
    common: {
        common: 50,
        uncommon: 30,
        rare: 15,
        epic: 4,
        legend: 1
    },
    
    // Uncommon enemies (slightly tougher)
    uncommon: {
        common: 30,
        uncommon: 40,  // PEAK - most likely
        rare: 20,
        epic: 8,
        legend: 2
    },
    
    // Rare enemies (mini-bosses, special encounters)
    rare: {
        common: 15,
        uncommon: 25,
        rare: 35,      // PEAK
        epic: 20,
        legend: 5
    },
    
    // Epic enemies (strong bosses)
    epic: {
        common: 5,
        uncommon: 15,
        rare: 25,
        epic: 40,      // PEAK
        legend: 15
    },
    
    // Legendary enemies (world bosses, special bosses)
    legend: {
        common: 2,
        uncommon: 8,
        rare: 20,
        epic: 30,
        legend: 40     // PEAK
    },
    
    // Mythic enemies (if added in future)
    mythic: {
        common: 1,
        uncommon: 4,
        rare: 10,
        epic: 25,
        legend: 45,
        mythic: 15     // Rare mythic drops
    }
};

/**
 * Floor bonus scaling
 * Higher floors boost chances for rare+ items
 */
export const FLOOR_BONUS_CONFIG = {
    bonusPerFloor: 0.5,  // +0.5% per floor
    maxBonus: 10,        // Cap at +10%
    
    // How floor bonus is distributed
    weights: {
        common: -1.0,    // Reduce common drops
        uncommon: 0,     // No change
        rare: 0.4,       // +40% of bonus
        epic: 0.3,       // +30% of bonus
        legend: 0.3      // +30% of bonus
    }
};

/**
 * Lucky drop message thresholds
 * Determines when to show special messages based on rarity difference
 */
export const LUCKY_DROP_MESSAGES = {
    jackpot: 3,      // 3+ tiers higher: "⭐ JACKPOT!"
    veryLucky: 2,    // 2 tiers higher: "🍀 VERY LUCKY!"
    lucky: 1         // 1 tier higher: "✨ Lucky drop!"
};

/**
 * Rarity tier order (for comparisons)
 */
export const RARITY_TIERS = [
    'common',
    'uncommon',
    'rare',
    'epic',
    'legend',
    'mythic'  // Future-proof
];

/**
 * Default distribution (fallback)
 */
export const DEFAULT_DISTRIBUTION = RARITY_DISTRIBUTIONS.common;
