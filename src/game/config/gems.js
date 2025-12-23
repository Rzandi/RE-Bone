// v37.0 Gem System - Quality × Rarity × Floor Scaling
// 3 Quality Tiers × 4 Rarity Levels × Floor Scaling = Huge Variety!
// 
// System:
// - Quality: Lesser → Standard → Perfect (gem type)
// - Rarity: Common → Rare → Epic → Legendary (drop chance + base multiplier)
// - Floor: Scales stats by +5% per floor
//
// Example: "Lesser Sapphire (Legendary, FL10)" > "Lesser Sapphire (Common, FL10)"

export const GEM_TYPES = {
  // ========== RUBY (Attack Damage) ==========
  lesser_ruby: {
    id: 'lesser_ruby',
    name: 'Lesser Ruby',
    icon: '🔴',
    quality: 'lesser',
    baseBonus: { atk: 3 },
    desc: 'A small crimson shard. Basic attack boost.',
    lore: 'Common in mines. Flawed but functional.',
    usage: 'Entry-level damage gem.'
  },
  
  ruby: {
    id: 'ruby',
    name: 'Ruby',
    icon: '💎',
    quality: 'standard',
    baseBonus: { atk: 6, crit: 0.02 },
    desc: 'A quality red gem. Solid offensive power.',
    lore: 'Forged in volcanic heat.',
    usage: 'Core DPS gem for mid-game.'
  },
  
  perfect_ruby: {
    id: 'perfect_ruby',
    name: 'Perfect Ruby',
    icon: '🔺',
    quality: 'perfect',
    baseBonus: { atk: 12, crit: 0.05, lifesteal: 0.03 },
    desc: 'Flawless bloodstone. Extreme power.',
    lore: 'Crystallized dragon blood.',
    usage: 'End-game offensive gem.'
  },

  // ========== SAPPHIRE (Mana & Magic) ==========
  lesser_sapphire: {
    id: 'lesser_sapphire',
    name: 'Lesser Sapphire',
    icon: '🔵',
    quality: 'lesser',
    baseBonus: { mp: 15, int: 1 },
    desc: 'A small blue shard. Weak mana boost.',
    lore: 'Novice mages use these.',
    usage: 'Basic mana gem.'
  },
  
  sapphire: {
    id: 'sapphire',
    name: 'Sapphire',
    icon: '💠',
    quality: 'standard',
    baseBonus: { mp: 30, int: 3 },
    desc: 'A pristine azure gem. Strong magic.',
    lore: 'Condensed from mana storms.',
    usage: 'Mage core gem.'
  },
  
  perfect_sapphire: {
    id: 'perfect_sapphire',
    name: 'Perfect Sapphire',
    icon: '🔷',
    quality: 'perfect',
    baseBonus: { mp: 60, int: 6, spellPower: 0.10 },
    desc: 'Flawless arcane crystal.',
    lore: 'Archmage treasure.',
    usage: 'Ultimate mage gem. +10% spell power!'
  },

  // ========== EMERALD (Health & Defense) ==========
  lesser_emerald: {
    id: 'lesser_emerald',
    name: 'Lesser Emerald',
    icon: '🟢',
    quality: 'lesser',
    baseBonus: { hp: 20, def: 2 },
    desc: 'A small green stone. Basic vitality.',
    lore: 'Touched by nature.',
    usage: 'Entry tank gem.'
  },
  
  emerald: {
    id: 'emerald',
    name: 'Emerald',
    icon: '💚',
    quality: 'standard',
    baseBonus: { hp: 50, def: 4, regen: 2 },
    desc: 'A vibrant life gem. Strong endurance.',
    lore: 'Blessed by ancient forests.',
    usage: 'Survival builds.'
  },
  
  perfect_emerald: {
    id: 'perfect_emerald',
    name: 'Perfect Emerald',
    icon: '🟩',
    quality: 'perfect',
    baseBonus: { hp: 100, def: 8, regen: 5, block: 0.05 },
    desc: 'Pristine vitality crystal.',
    lore: 'The heart of immortal trees.',
    usage: 'Best tank gem. +5% block!'
  },

  // ========== TOPAZ (Critical Strike) ==========
  lesser_topaz: {
    id: 'lesser_topaz',
    name: 'Lesser Topaz',
    icon: '🟡',
    quality: 'lesser',
    baseBonus: { crit: 0.03 },
    desc: 'A small yellow shard. Minor crit.',
    lore: 'Lightning-touched.',
    usage: '+3% crit chance.'
  },
  
  topaz: {
    id: 'topaz',
    name: 'Topaz',
    icon: '🟨',
    quality: 'standard',
    baseBonus: { crit: 0.06, atk: 4 },
    desc: 'A golden lightning gem.',
    lore: 'Forged from storms.',
    usage: 'Crit build core. +6% crit.'
  },
  
  perfect_topaz: {
    id: 'perfect_topaz',
    name: 'Perfect Topaz',
    icon: '🔶',
    quality: 'perfect',
    baseBonus: { crit: 0.12, atk: 8, critDmg: 0.30 },
    desc: 'Flawless lightning crystal.',
    lore: 'Thunderstorm frozen in time.',
    usage: '12% crit + 30% crit damage!'
  },

  // ========== AMETHYST (Magic Power) ==========
  lesser_amethyst: {
    id: 'lesser_amethyst',
    name: 'Lesser Amethyst',
    icon: '🟣',
    quality: 'lesser',
    baseBonus: { int: 2, mp: 10 },
    desc: 'A small purple stone. Weak focus.',
    lore: 'Apprentice gem.',
    usage: 'Basic INT boost.'
  },
  
  amethyst: {
    id: 'amethyst',
    name: 'Amethyst',
    icon: '💜',
    quality: 'standard',
    baseBonus: { int: 5, mp: 25 },
    desc: 'A deep purple gem. Sharp focus.',
    lore: 'Mined from meteorites.',
    usage: 'Balanced magic gem.'
  },
  
  perfect_amethyst: {
    id: 'perfect_amethyst',
    name: 'Perfect Amethyst',
    icon: '🟪',
    quality: 'perfect',
    baseBonus: { int: 10, mp: 50, cooldownReduction: 0.10 },
    desc: 'Pristine cosmic crystal.',
    lore: 'Wisdom of fallen stars.',
    usage: 'Mage pinnacle. +10% CDR!'
  }
};

// Rarity multipliers (applied to base stats)
export const RARITY_MULTIPLIERS = {
  common: 1.0,
  rare: 1.5,
  epic: 2.0,
  legendary: 3.0
};

// Create actual gems with rarity variations
export const GEMS = {};

Object.keys(GEM_TYPES).forEach(gemId => {
  const baseGem = GEM_TYPES[gemId];
  
  ['common', 'rare', 'epic', 'legendary'].forEach(rarity => {
    const multiplier = RARITY_MULTIPLIERS[rarity];
    const fullId = `${gemId}_${rarity}`;
    
    // Scale bonuses by rarity
    const scaledBonus = {};
    Object.keys(baseGem.baseBonus).forEach(stat => {
      const baseValue = baseGem.baseBonus[stat];
      
      // For percentage stats (crit, lifesteal, dodge, etc)
      if (baseValue < 1 && baseValue > 0) {
        scaledBonus[stat] = baseValue * Math.sqrt(multiplier); // Gentler scaling
      } else {
        // For flat stats
        scaledBonus[stat] = Math.floor(baseValue * multiplier);
      }
    });
    
    GEMS[fullId] = {
      id: fullId,
      gemType: gemId, // Reference to base type
      name: `${baseGem.name} (${rarity.charAt(0).toUpperCase() + rarity.slice(1)})`,
      icon: baseGem.icon,
      quality: baseGem.quality,
      rarity: rarity,
      bonus: scaledBonus,
      desc: baseGem.desc,
      lore: baseGem.lore,
      usage: baseGem.usage
    };
  });
});

// Helper: Generate socket count (unchanged)
export const generateSocketCount = (rarity) => {
  const chances = {
    common: [90, 10, 0, 0],
    uncommon: [70, 25, 5, 0],
    rare: [50, 35, 12, 3],
    epic: [30, 30, 30, 10],
    legendary: [10, 20, 40, 30]
  };
  
  const rarityChances = chances[rarity] || chances.common;
  const roll = Math.random() * 100;
  let cumulative = 0;
  
  for (let i = 0; i < rarityChances.length; i++) {
    cumulative += rarityChances[i];
    if (roll < cumulative) return i;
  }
  
  return 0;
};

// Helper: Get gem tier info
export const getGemTierInfo = (rarity) => {
  const info = {
    common: { dropChance: '40%', quality: 'Common', color: '#888' },
    rare: { dropChance: '15%', quality: 'Rare', color: '#4af' },
    epic: { dropChance: '4%', quality: 'Epic', color: '#d4f' },
    legendary: { dropChance: '1%', quality: 'Legendary', color: '#fa0' }
  };
  return info[rarity] || info.common;
};
