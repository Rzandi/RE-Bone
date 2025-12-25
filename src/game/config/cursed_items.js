// v37.0 Phase 3: Cursed Items Configuration
// 20 cursed items with powerful buffs but significant drawbacks

export const CURSED_ITEMS = {
  
  // ============================================
  // WEAPONS (6)
  // ============================================
  
  vampire_blade: {
    id: 'vampire_blade',
    name: 'Vampire Blade',
    slot: 'weapon',
    rarity: 'epic',
    icon: '🗡️',
    stats: { atk: 80 },
    buffs: { 
      lifesteal: 0.30  // +30% lifesteal
    },
    curses: { 
      maxHpMult: 0.80  // -20% max HP
    },
    desc: 'A blade that drinks the blood of enemies... and yours.',
    lore: 'Forged in the depths of the Crimson Abyss, this blade was tempered in demon blood. Each swing drains your vitality to heal wounds, but the blade never stops thirsting.',
    price: 800,
    dropFloor: 8
  },
  
  soul_reaper: {
    id: 'soul_reaper',
    name: 'Soul Reaper',
    slot: 'weapon',
    rarity: 'legendary',
    icon: '⚰️',
    stats: { atk: 120 },
    buffs: { 
      atkPerKill: 10,      // +10 ATK per kill
      atkPerKillMax: 50    // caps at +50
    },
    curses: { 
      hpPerKill: 1  // Lose 1 HP per kill
    },
    desc: 'Harvests souls to grow stronger. But at what cost?',
    lore: 'Whispers of the damned grow louder with each soul harvested. The reaper who forged this blade went mad before completing it—his soul was the final ingredient.',
    price: 1500,
    dropFloor: 15
  },
  
  chaos_axe: {
    id: 'chaos_axe',
    name: 'Chaos Axe',
    slot: 'weapon',
    rarity: 'epic',
    icon: '🪓',
    stats: { atk: 150 },
    buffs: { 
      critDmgMult: 2.0  // 2x crit damage
    },
    curses: { 
      missChance: 0.25  // 25% miss chance
    },
    desc: 'Devastating when it hits. IF it hits.',
    lore: 'Wild and unpredictable, forged during a chaotic storm. The axe chooses when to strike true—its wielder has no say in the matter.',
    price: 900,
    dropFloor: 10
  },
  
  poisoned_dagger: {
    id: 'poisoned_dagger',
    name: 'Poisoned Dagger',
    slot: 'weapon',
    rarity: 'rare',
    icon: '🗡️',
    stats: { atk: 45 },
    buffs: { 
      poisonDmg: 0.05  // Poison enemy 5% HP/turn
    },
    curses: { 
      selfPoison: 0.01  // Self-poison 1% HP/turn
    },
    desc: 'The venom knows no master.',
    lore: 'Coated with extract from the Shadowmire serpent. The venom seeps through the hilt, slowly corrupting all who dare wield it.',
    price: 400,
    dropFloor: 5
  },
  
  berserker_blade: {
    id: 'berserker_blade',
    name: "Berserker's Wrath",
    slot: 'weapon',
    rarity: 'legendary',
    icon: '⚔️',
    stats: { atk: 200 },
    buffs: { 
      lowHpAtkMult: 2.0,     // +100% ATK when HP <30%
      lowHpThreshold: 0.30
    },
    curses: { 
      noHealInCombat: true  // Cannot heal during combat
    },
    desc: 'The edge between life and death is where it thrives.',
    lore: 'Forged in rage by a berserker who refused to die. It demands blood be spilled—even if that blood is yours. Healing is for the weak.',
    price: 2000,
    dropFloor: 18
  },
  
  muramasa: {
    id: 'muramasa',
    name: 'Muramasa',
    slot: 'weapon',
    rarity: 'epic',
    icon: '⚔️',
    stats: { atk: 95 },
    buffs: { 
      critRate: 0.50  // +50% crit rate
    },
    curses: { 
      backfireChance: 0.10  // 10% chance to damage self
    },
    desc: 'A blade that hungers to kill—even its master.',
    lore: 'Legend says Muramasa blades are cursed to hunger for blood. The swordsmith went insane, and his madness lives within every blade he crafted.',
    price: 750,
    dropFloor: 9
  },
  
  // ============================================
  // ARMOR (6)
  // ============================================
  
  berserker_helm: {
    id: 'berserker_helm',
    name: 'Berserker Helm',
    slot: 'armor',
    rarity: 'epic',
    icon: '🪖',
    stats: { def: 60 },
    buffs: { 
      atkMult: 1.50  // +50% ATK
    },
    curses: { 
      defMult: 0.70  // -30% DEF
    },
    desc: 'See red. Feel nothing. Kill everything.',
    lore: 'Worn by the Bloodrage clan, this helm clouds the mind with fury. Defense becomes irrelevant when all you know is attack.',
    price: 600,
    dropFloor: 7
  },
  
  haunted_armor: {
    id: 'haunted_armor',
    name: 'Haunted Armor',
    slot: 'armor',
    rarity: 'legendary',
    icon: '🛡️',
    stats: { def: 120 },
    buffs: { 
      defMult: 1.50  // +50% DEF
    },
    curses: { 
      speedMult: 0.50  // -50% speed (always go last)
    },
    desc: 'The souls of fallen knights weigh you down.',
    lore: 'Dozens of warriors died wearing this armor. Their spirits remain, adding weight to every movement but also their strength to your defense.',
    price: 1200,
    dropFloor: 12
  },
  
  bloodsoaked_chainmail: {
    id: 'bloodsoaked_chainmail',
    name: 'Bloodsoaked Chainmail',
    slot: 'armor',
    rarity: 'rare',
    icon: '🩱',
    stats: { def: 80 },
    buffs: { 
      regenPercent: 0.03  // Regen 3% HP/turn
    },
    curses: { 
      damageTakenMult: 1.05  // Take 5% more damage
    },
    desc: 'The blood never dries. It only feeds.',
    lore: 'Stained crimson from countless battles. The chainmail absorbed so much blood that it now pulses with life—your life.',
    price: 500,
    dropFloor: 6
  },
  
  shadow_veil: {
    id: 'shadow_veil',
    name: 'Shadow Veil',
    slot: 'armor',
    rarity: 'epic',
    icon: '🧥',
    stats: { def: 40 },
    buffs: { 
      dodge: 0.40  // +40% dodge
    },
    curses: { 
      revealedOnCrit: true  // Lose dodge next turn if enemy crits
    },
    desc: 'Shadows protect you... until they betray you.',
    lore: 'Woven from shadow essence by the Night Weavers. The cloak conceals you perfectly—unless struck by a critical blow that tears the veil.',
    price: 700,
    dropFloor: 8
  },
  
  thorned_vest: {
    id: 'thorned_vest',
    name: 'Thorned Vest',
    slot: 'armor',
    rarity: 'rare',
    icon: '🦔',
    stats: { def: 70 },
    buffs: { 
      reflectDmg: 0.20  // Reflect 20% damage to attacker
    },
    curses: { 
      selfDmgOnHit: 5  // Take 5 damage when hit
    },
    desc: 'Pain shared is pain doubled.',
    lore: 'Grown from the Thornwood tree, each spike pierces both attacker and wearer. The tree\'s revenge for being cut down.',
    price: 450,
    dropFloor: 5
  },
  
  hollow_shell: {
    id: 'hollow_shell',
    name: 'Hollow Shell',
    slot: 'armor',
    rarity: 'legendary',
    icon: '🥚',
    stats: { def: 150 },
    buffs: { 
      critImmune: true  // Cannot be crit
    },
    curses: { 
      noHealingBuffs: true  // Cannot receive healing buffs/potions
    },
    desc: 'An empty vessel. Nothing can fill the void.',
    lore: 'Crafted from the shell of a Void Turtle that consumed itself. The emptiness within repels critical strikes but also rejects any attempt to restore life.',
    price: 1800,
    dropFloor: 16
  },
  
  // ============================================
  // ACCESSORIES (8)
  // ============================================
  
  ring_of_avarice: {
    id: 'ring_of_avarice',
    name: 'Ring of Avarice',
    slot: 'acc',
    rarity: 'epic',
    icon: '💍',
    stats: {},
    buffs: { 
      goldFindMult: 2.0  // +100% gold find
    },
    curses: { 
      expGainMult: 0.50  // -50% EXP gain
    },
    desc: 'Gold blinds. Gold consumes. Gold is all.',
    lore: 'Worn by the Merchant King who died alone atop mountains of gold. His greed transcended death and now infects all who wear his ring.',
    price: 1000,
    dropFloor: 10
  },
  
  gamblers_dice: {
    id: 'gamblers_dice',
    name: "Gambler's Dice",
    slot: 'acc',
    rarity: 'rare',
    icon: '🎲',
    stats: {},
    buffs: { 
      critDmgMult: 2.0  // 2x crit damage
    },
    curses: { 
      zeroDmgChance: 0.20  // 20% chance to deal 0 damage
    },
    desc: 'Fortune favors the bold... sometimes.',
    lore: 'These dice were used by a gambler who bet his soul and lost. Now they grant incredible highs and devastating lows to their wielder.',
    price: 350,
    dropFloor: 4
  },
  
  soul_anchor: {
    id: 'soul_anchor',
    name: 'Soul Anchor',
    slot: 'acc',
    rarity: 'epic',
    icon: '⚓',
    stats: {},
    buffs: { 
      soulsPerKill: 5  // +5 souls per kill
    },
    curses: { 
      noFlee: true  // Cannot flee from battles
    },
    desc: 'Your soul is bound. There is no escape.',
    lore: 'An anchor from a ship that sailed the River Styx. It binds your soul to the mortal plane, harvesting others but trapping you in every battle.',
    price: 850,
    dropFloor: 9
  },
  
  mirror_of_hate: {
    id: 'mirror_of_hate',
    name: 'Mirror of Hate',
    slot: 'acc',
    rarity: 'epic',
    icon: '🪞',
    stats: {},
    buffs: { 
      copyEnemyBuff: true  // Copy 1 enemy buff
    },
    curses: { 
      copyEnemyDebuff: true  // Also copy 1 enemy debuff
    },
    desc: 'Gaze upon your true self.',
    lore: 'Crafted by a witch to torture her enemies. The mirror shows not what you are, but what you could become—in all ways, good and evil.',
    price: 900,
    dropFloor: 11
  },
  
  broken_hourglass: {
    id: 'broken_hourglass',
    name: 'Broken Hourglass',
    slot: 'acc',
    rarity: 'legendary',
    icon: '⏳',
    stats: {},
    buffs: { 
      extraTurnChance: 0.05  // 5% chance extra turn
    },
    curses: { 
      skipTurnChance: 0.05  // 5% chance skip turn
    },
    desc: 'Time bends but sometimes breaks.',
    lore: 'Shattered during the Time War, this hourglass still holds fragments of temporal magic. Time flows unpredictably around its bearer.',
    price: 1500,
    dropFloor: 14
  },
  
  pendant_of_greed: {
    id: 'pendant_of_greed',
    name: 'Pendant of Greed',
    slot: 'acc',
    rarity: 'rare',
    icon: '📿',
    stats: { hp: 50 },
    buffs: { 
      itemDropMult: 1.50  // +50% item drop
    },
    curses: { 
      sellPriceMult: 0.50  // Items sell for -50%
    },
    desc: 'Take everything. Sell nothing.',
    lore: 'A dragon\'s pendant, infused with its hoarding instinct. Items are drawn to you, but parting with them brings little reward.',
    price: 400,
    dropFloor: 5
  },
  
  ring_of_pain: {
    id: 'ring_of_pain',
    name: 'Ring of Pain',
    slot: 'acc',
    rarity: 'epic',
    icon: '💔',
    stats: { atk: 20 },
    buffs: { 
      dmgMult: 1.25  // +25% damage
    },
    curses: { 
      selfDmgPercent: 0.10  // Take 10% of damage dealt
    },
    desc: 'To hurt others, you must first hurt yourself.',
    lore: 'Forged by a masochist mage who found pleasure in pain. The ring channels suffering into power, demanding a blood price for every wound inflicted.',
    price: 650,
    dropFloor: 7
  },
  
  eye_of_madness: {
    id: 'eye_of_madness',
    name: 'Eye of Madness',
    slot: 'acc',
    rarity: 'legendary',
    icon: '👁️',
    stats: { mp: 30 },
    buffs: { 
      spellPowerMult: 1.50  // +50% spell power
    },
    curses: { 
      confusionChance: 0.10  // 10% chance to hit random target
    },
    desc: 'See beyond the veil. Lose your mind.',
    lore: 'The preserved eye of a seer who gazed into the void. The visions grant incredible magical insight but slowly erode the sanity of its bearer.',
    price: 1400,
    dropFloor: 13
  }
};

// Get all cursed items as array
export const getCursedItemsList = () => Object.values(CURSED_ITEMS);

// Get cursed item by ID
export const getCursedItem = (id) => CURSED_ITEMS[id] || null;

// Get cursed items by slot
export const getCursedItemsBySlot = (slot) => {
  return getCursedItemsList().filter(item => item.slot === slot);
};

// Get random cursed items for shop
export const getRandomCursedItems = (count, minFloor = 1) => {
  const eligible = getCursedItemsList().filter(item => item.dropFloor <= minFloor + 5);
  const shuffled = eligible.sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
};

// Count how many unique cursed items player owns
export const countOwnedCursedItems = (inventory) => {
  const cursedIds = new Set(getCursedItemsList().map(c => c.id));
  return inventory.filter(item => cursedIds.has(item.id)).length;
};

// Check if player owns specific cursed item
export const ownsCursedItem = (inventory, itemId) => {
  return inventory.some(item => item.id === itemId);
};

// Global export - REMOVED v38.0
// window.CURSED_ITEMS = CURSED_ITEMS;
