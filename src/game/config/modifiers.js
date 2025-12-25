/* =========================================
   RUN MODIFIERS CONFIG (v38.4)
   Challenge modifiers for score/soul multipliers
   Unlocked after completing Floor 100
   ========================================= */

export const RUN_MODIFIERS = {
  // ========== MEDIUM DIFFICULTY ==========
  no_healing: {
    id: 'no_healing',
    name: 'No Healing',
    desc: 'Cannot use healing items or skills',
    icon: '🩹❌',
    difficulty: 'medium',
    scoreMultiplier: 1.5,
    soulMultiplier: 1.3,
    effects: { 
      healingDisabled: true 
    },
    tips: 'Lifesteal and regeneration still work!'
  },

  glass_cannon: {
    id: 'glass_cannon',
    name: 'Glass Cannon',
    desc: '+50% Damage, -50% Max HP',
    icon: '💥',
    difficulty: 'medium',
    scoreMultiplier: 1.3,
    soulMultiplier: 1.2,
    effects: { 
      dmgMult: 1.5, 
      hpMult: 0.5 
    },
    tips: 'High risk, high reward. Dodge is your friend!'
  },

  cursed_run: {
    id: 'cursed_run',
    name: 'Cursed Run',
    desc: 'Start with 3 random curses',
    icon: '☠️',
    difficulty: 'medium',
    scoreMultiplier: 1.4,
    soulMultiplier: 1.25,
    effects: { 
      startCurses: 3 
    },
    tips: 'Curses can sometimes be beneficial...'
  },

  poverty: {
    id: 'poverty',
    name: 'Poverty',
    desc: 'Start with 0 gold, -50% gold drops',
    icon: '💸',
    difficulty: 'easy',
    scoreMultiplier: 1.3,
    soulMultiplier: 1.2,
    effects: { 
      startGold: 0,
      goldMult: 0.5 
    },
    tips: 'Salvaging becomes essential!'
  },

  // ========== HARD DIFFICULTY ==========
  hardcore: {
    id: 'hardcore',
    name: 'Hardcore',
    desc: 'Death = Lose All Progress (No Resurrection)',
    icon: '💀',
    difficulty: 'hard',
    scoreMultiplier: 2.0,
    soulMultiplier: 1.8,
    effects: { 
      permadeath: true,
      noResurrection: true 
    },
    tips: 'True roguelike experience. Play carefully!'
  },

  berserker: {
    id: 'berserker',
    name: 'Berserker',
    desc: '+100% Damage, DEF reduced to 0',
    icon: '🔥',
    difficulty: 'hard',
    scoreMultiplier: 1.5,
    soulMultiplier: 1.4,
    effects: { 
      dmgMult: 2.0, 
      defMult: 0 
    },
    tips: 'Kill before you get killed!'
  },

  speed_run: {
    id: 'speed_run',
    name: 'Speed Run',
    desc: '60-second timer per floor',
    icon: '⏱️',
    difficulty: 'hard',
    scoreMultiplier: 1.8,
    soulMultiplier: 1.5,
    effects: { 
      floorTimer: 60 
    },
    tips: 'Quick decisions, no hesitation!'
  },

  // ========== VERY HARD DIFFICULTY ==========
  ascetic: {
    id: 'ascetic',
    name: 'Ascetic',
    desc: 'Cannot equip any items',
    icon: '🧘',
    difficulty: 'very_hard',
    scoreMultiplier: 2.5,
    soulMultiplier: 2.0,
    effects: { 
      noEquipment: true 
    },
    tips: 'Pure skill test. Rely on skills and passives only!'
  },

  frail: {
    id: 'frail',
    name: 'Frail',
    desc: '-70% Max HP, -50% Defense',
    icon: '🩻',
    difficulty: 'very_hard',
    scoreMultiplier: 2.0,
    soulMultiplier: 1.8,
    effects: { 
      hpMult: 0.3,
      defMult: 0.5 
    },
    tips: 'Every hit counts. Dodge or die!'
  }
};

// Helper function to get all modifier IDs
export const getAllModifierIds = () => Object.keys(RUN_MODIFIERS);

// Helper function to calculate total multiplier from active modifiers
export const calculateModifierMultipliers = (activeModifiers) => {
  let scoreMultiplier = 1;
  let soulMultiplier = 1;
  
  activeModifiers.forEach(modId => {
    const mod = RUN_MODIFIERS[modId];
    if (mod) {
      scoreMultiplier *= mod.scoreMultiplier;
      soulMultiplier *= mod.soulMultiplier;
    }
  });
  
  return { scoreMultiplier, soulMultiplier };
};

// Get modifiers by difficulty
export const getModifiersByDifficulty = (difficulty) => {
  return Object.values(RUN_MODIFIERS).filter(m => m.difficulty === difficulty);
};

// Check for conflicting modifiers (optional warning)
export const checkModifierConflicts = (activeModifiers) => {
  const conflicts = [];
  
  // Glass Cannon + Frail = extremely low HP
  if (activeModifiers.includes('glass_cannon') && activeModifiers.includes('frail')) {
    conflicts.push({ 
      mods: ['glass_cannon', 'frail'], 
      warning: 'Extreme HP reduction! You will be very fragile.' 
    });
  }
  
  // Berserker + No Healing = very dangerous
  if (activeModifiers.includes('berserker') && activeModifiers.includes('no_healing')) {
    conflicts.push({ 
      mods: ['berserker', 'no_healing'], 
      warning: 'No defense AND no healing. Extremely dangerous!' 
    });
  }
  
  // Ascetic + Poverty = limited options
  if (activeModifiers.includes('ascetic') && activeModifiers.includes('poverty')) {
    conflicts.push({ 
      mods: ['ascetic', 'poverty'], 
      warning: 'No equipment AND no gold. Very limited resources!' 
    });
  }
  
  return conflicts;
};
