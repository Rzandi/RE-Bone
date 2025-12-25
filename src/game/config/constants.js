/* =========================================
   CONSTANTS - Magic Numbers & Configuration
   ========================================= */

export const CONSTANTS = {
  // Animation Durations (milliseconds)
  ACHIEVEMENT_POPUP_DURATION: 3000,
  DAMAGE_POPUP_DURATION: 1000,
  COMBAT_ACTION_DELAY: 600,
  EXPLORE_TRANSITION_DELAY: 800,
  BOSS_RUSH_DELAY: 1500,
  
  // UI Delays
  SKILL_ANIMATION_DELAY: 150,
  MULTI_HIT_DELAY: 150,
  
  // Inventory
  MAX_INVENTORY_SIZE: 100,
  INVENTORY_PAGE_SIZE: 20,
  
  // Drop Rates
  BASE_DROP_RATE: 0.30, // 30%
  BOSS_DROP_MULTIPLIER: 1.0, // Guaranteed
  
  // Rarity Values (for sorting)
  RARITY_VALUES: {
    common: 1,
    rare: 2,
    epic: 3,
    legend: 4,
    mythic: 5
  },

  // Material IDs (v30.1 Refactor)
  MATERIALS: {
    SCRAP: "scrap_metal",
    LEATHER: "tough_leather",
    DUST: "magic_dust",
    ESSENCE: "dark_essence",
    FRAG_DRAGON: "fragment_dragon",
    FRAG_VOID: "fragment_void"
  },
  
  // Player Stats
  BASE_HP: 20,
  BASE_MP: 10,
  HP_PER_VIT: 5,
  MP_PER_INT: 5, // v36.5: Buffed from 3 to match HP scaling
  
  // Encounters
  MERCHANT_CHANCE: 0.1,
  MERCHANT_PITY: 10,
  
  // Enemy Scaling
  FLOOR_SCALING_POWER: 1.2,
  FLOOR_SCALING_MULTIPLIER: 1.5,
  
  // Achievements
  VAMPIRE_LORD_TARGET: 500,
  COMBO_MASTER_TARGET: 50,
  BOSS_HUNTER_TARGET: 5,
  LEGENDARY_COLLECTOR_TARGET: 5,
  
  // Boss Rush
  BOSS_RUSH_HP_HEAL: 20,
  BOSS_RUSH_MP_HEAL: 10,
  BOSS_RUSH_GOLD_REWARD: 500,
  BOSS_RUSH_LEGENDARY_DROPS: 2,
  
  // Save Keys
  SAVE_KEY: 'rebone_save',
  META_KEY: 'rebone_meta',
  ACHIEVEMENT_KEY: 'rebone_achievements',

  // Gameplay Constants
  LEVEL_CAP: 200, // v38.8: Updated for Gatekeeper Boss System (100 base + 20*5)
  // v38.7: Rebalanced Evolution Pacing (User Request)
  EVOLUTION_LEVELS: [10, 20],      
  CLASS_EVO_LEVELS: [30, 60, 90],

  // v38.4: AGI (Agility) Constants
  DODGE_PER_AGI: 0.003,      // +0.3% per AGI point
  FLEE_PER_AGI: 0.005,       // +0.5% per AGI point
  CDR_PER_AGI: 0.002,        // +0.2% per AGI (max 20%)
  BASE_FLEE_CHANCE: 0.20,    // Nerfed base flee (was 0.30)
  MAX_FLEE_CHANCE: 0.70,     // Cap at 70%
  MAX_CDR_FROM_AGI: 0.20,    // 20% max CDR from AGI
  
  // v38.4: LUCK Constants
  CRIT_PER_LUCK: 0.003,      // +0.3% per LUCK point
  GOLD_PER_LUCK: 0.005,      // +0.5% per LUCK point
  RARITY_PER_LUCK: 0.005,    // +0.5% per LUCK point
  GEM_DROP_PER_LUCK: 0.005   // +0.5% per LUCK point
};

// Global for Legacy Compatibility - REMOVED for v38.0 strict mode
// window.CONSTANTS = CONSTANTS;
