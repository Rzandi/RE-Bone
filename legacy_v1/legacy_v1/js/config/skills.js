const PASSIVES_DB = {
    undying: { name: "Undying", desc: "10% Chance survive 1HP" },
    scavenger: { name: "Scavenger", desc: "More Drops" },
    thick_skin: { name: "Thick Skin", desc: "DEF +1" },
    rot_touch: { name: "Rot Touch", desc: "Atk applies Poison" },
    ethereal: { name: "Ethereal", desc: "+10% Evasion" },
    mana_leech: { name: "Mana Leech", desc: "+1 MP on Hit" },
    mana_leech: { name: "Mana Leech", desc: "+1 MP on Hit" },
    // New Passives for new classes
    vampirism: { name: "Vampirism", desc: "20% Lifesteal on all attacks" },
    blood_frenzy: { name: "Blood Frenzy", desc: "ATK increases as HP decreases" },
    undead_mastery: { name: "Undead Mastery", desc: "+DMG per floor descended" },
    phylactery: { name: "Phylactery", desc: "1x Auto-Revive per run" },
    intangible: { name: "Intangible", desc: "30% Dodge chance" },
    soul_siphon: { name: "Soul Siphon", desc: "+MP when enemy uses skill" },
    
    // v30.2 Expanded Passives (Balanced v30.6)
    // Format: stats: { str, vit, int, def, hp, mp, atk (%), dodge, crit, critDmg }
    
    stone_skin: { 
        name: "Stone Skin", 
        desc: "DEF +5, Dodge -10%", 
        stats: { def: 5, dodge: -10 } 
    },
    glass_cannon: { 
        name: "Glass Cannon", 
        desc: "ATK +20%, MaxHP -15%", 
        stats: { atk: 0.20, hpMult: -0.15 } 
    },
    swift_foot: { 
        name: "Swift Foot", 
        desc: "Dodge +15%, DEF -3", 
        stats: { dodge: 15, def: -3 } 
    },
    treasure_hunter: { 
        name: "Treasure Hunter", 
        desc: "Gold +25%, EXP -10%", 
        stats: { gold: 0.25, exp: -0.10 } 
    },
    lucky_strike: { 
        name: "Lucky Strike", 
        desc: "Crit Dmg +50%, Crit Chance -5%", 
        stats: { critDmg: 0.50, crit: -5 } 
    },
    regenerator: { 
        name: "Regenerator", 
        desc: "Heal 3 HP/turn, MaxHP -10%", 
        stats: { hpRegen: 3, hpMult: -0.10 } 
    },
    thorns: { 
        name: "Thorns", 
        desc: "Reflect 15% Dmg, DEF -2", 
        stats: { reflect: 0.15, def: -2 } 
    },
    magic_barrier: { 
        name: "Magic Barrier", 
        desc: "Mag Res +15%, Phys Res -10%", 
        stats: { magRes: 0.15, physRes: -0.10 } // Custom handling needed
    },
    executioner: { 
        name: "Executioner", 
        desc: "+30% Dmg vs Low HP, Speed -5%", 
        stats: { execute: 0.30, dodge: -5 } 
    },
    iron_will: { 
        name: "Iron Will", 
        desc: "Stun Immune, Dodge -20%", 
        stats: { immuneStun: true, dodge: -20 } 
    },
    
    // v27.0 New Passives
    blood_fueled: { name: "Blood Fueled", desc: "+1 ATK per 10% missing HP" },
    grim_harvest: { name: "Grim Harvest", desc: "+2 MP on Magic Dmg" },
    shadow_arts: { name: "Shadow Arts", desc: "+20% Crit Rate" },

};
const SKILLS_DB = {
    smash: {
      name: "Smash",
      cost: 2,
      type: "phys",
      power: 1.5,
      desc: "Basic Dmg",
    },
    bone_throw: {
      name: "Bone Throw",
      cost: 3,
      type: "phys",
      power: 1.2,
      desc: "Ranged Dmg",
      req: { str: 5 } // v30.2 Requirement
    },
    shield_bash: {
      name: "Shield Bash",
      cost: 5,
      type: "phys",
      power: 1.0,
      status: { id: "shock", turn: 1, val: 0 },
      desc: "Stun",
      req: { vit: 10 }
    },
    rend: {
      name: "Rend",
      cost: 4,
      type: "phys",
      power: 1.2,
      status: { id: "bleed", turn: 3, val: 2 },
      desc: "Bleed",
      req: { str: 10 }
    },
    cannibalize: {
      name: "Cannibalize",
      cost: 6,
      type: "heal",
      power: 0.8,
      desc: "Big Heal",
      req: { vit: 15 }
    },
    frenzy: {
      name: "Frenzy",
      cost: 5,
      type: "buff",
      desc: "ATK UP, DEF DOWN",
      req: { str: 15 }
    },
    fireball: {
      name: "Fireball",
      cost: 6,
      type: "mag",
      power: 1.8,
      status: { id: "burn", turn: 3, val: 3 },
      desc: "Burn",
      req: { int: 10 }
    },
    ice_shard: {
      name: "Ice Shard",
      cost: 5,
      type: "mag",
      power: 1.2,
      status: { id: "chill", turn: 3, val: 0 },
      desc: "Slow",
    },
    terror: {
      name: "Terror",
      cost: 8,
      type: "debuff",
      status: { id: "weak", turn: 3, val: 0 },
      desc: "Weaken",
    },
    heal: {
      name: "Mend",
      cost: 5,
      type: "heal",
      power: 0.5,
      desc: "Heal",
    },
    // Vampire Skills
    blood_drain: {
      name: "Blood Drain",
      cost: 4,
      type: "phys",
      power: 1.3,
      lifesteal: 0.5,  // 50% of damage healed
      desc: "ATK + Heal",
    },
    bat_swarm: {
      name: "Bat Swarm",
      cost: 6,
      type: "phys",
      power: 0.8,
      hits: 3,  // Multi-hit
      lifesteal: 0.3,
      desc: "3-Hit Lifesteal",
    },
    night_veil: {
      name: "Night Veil",
      cost: 8,
      type: "heal",
      power: 1.0,
      invuln: 1,  // 1 turn invulnerability
      desc: "Heal + Invuln",
    },
    // Lich Skills
    summon_skeleton: {
      name: "Summon Skeleton",
      cost: 7,
      type: "summon",
      hp: 30,
      desc: "Summon Tank",
    },
    death_bolt: {
      name: "Death Bolt",
      cost: 8,
      type: "mag",
      power: 2.2,
      desc: "High Magic DMG",
    },
    soul_harvest: {
      name: "Soul Harvest",
      cost: 5,
      type: "mag",
      power: 1.0,  // Scales with kills
      killBonus: 0.1,  // +10% per kill
      desc: "Scales with Kills",
    },
    // Wraith Skills
    phase_strike: {
      name: "Phase Strike",
      cost: 6,
      type: "phys",
      power: 1.5,
      ignoreDef: true,  // Ignore enemy DEF
      desc: "Ignore DEF",
    },
    haunting: {
      name: "Haunting",
      cost: 5,
      type: "debuff",
      status: { id: "fear", turn: 3, val: 0 },  // ATK debuff
      desc: "Fear (ATK Down)",
    },
    possession: {
      name: "Possession",
      cost: 10,
      type: "special",
      desc: "Control Enemy 1 Turn",
    },
    
    // v27.0 New Skills
    soul_cleave: {
      name: "Soul Cleave",
      cost: 15, // High MP cost
      hpCost: 10, // Cost HP as well (handled in effect)
      type: "phys",
      power: 2.5,
      desc: "Cost 10 HP. Massive Dmg",
      effect: (user, target) => {
        // Self damage mechanic
        user.takeTrueDamage(10);
        return { txt: "SACRIFICE!", type: "physical" };
      }
    },
    plague_ward: {
      name: "Plague Ward",
      cost: 20,
      type: "buff",
      status: { id: "plague_ward", turn: 3, val: 50 }, // Reflect 50%
      shield: 10,
      desc: "Shield + Reflect Poison",
    },
    vanish: {
      name: "Vanish",
      cost: 25,
      type: "buff",
      status: { id: "stealth", turn: 2, val: 0 },
      nextHitCrit: true,
      desc: "Stealth + Next Crit",
    },
    
    // v30.3 New Class Skills
    shadow_shuriken: {
       name: "Shadow Shuriken",
       cost: 4,
       type: "phys",
       power: 1.0,
       hits: 2,
       desc: "Double Hit Ranged",
       req: { str: 5, int: 5 }
    },
    backstab: {
       name: "Backstab",
       cost: 10,
       type: "phys",
       power: 2.0,
       desc: "High dmg, ignored if frontal?", // Simplified logic
       req: { str: 15 }
    },
    hex: {
       name: "Hex",
       cost: 8,
       type: "debuff",
       status: { id: "curse", turn: 4, val: 0 }, // Curse: Take more dmg
       desc: "Curse Target",
       req: { int: 15 }
    },
    cursed_mending: {
       name: "Cursed Mending",
       cost: 10,
       type: "heal",
       power: 1.5,
       status: { id: "weak", turn: 2, val: 0 }, // Self-weaken or target weaken?
       // Let's make it simple: Heal self but apply random debuff? 
       // Or just high heal.
       desc: "Great Heal + Weaken Self", 
       req: { int: 10 }
    },
    void_slash: {
       name: "Void Slash",
       cost: 12,
       type: "mag", // Magic slash
       power: 1.8,
       ignoreDef: true,
       desc: "Ignore DEF Magic Dmg",
       req: { str: 10, int: 10 }
    },
    abyssal_shield: {
       name: "Abyssal Shield",
       cost: 15,
       type: "buff",
       shield: 30, // Big shield
       desc: "Gain 30 Shield",
       req: { vit: 20 }
    }

};
window.PASSIVES_DB = PASSIVES_DB;
window.SKILLS_DB = SKILLS_DB;