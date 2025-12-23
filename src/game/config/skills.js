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
    
    
    // v35.0 Traitor Passives
    divine_aura: { name: "Divine Aura", desc: "Start combat with 10 Shield" },
    retribution: { name: "Retribution", desc: "Reflect 20% Damage" },
    
    nature_touch: { name: "Nature's Touch", desc: "Heal 5 HP per turn" },
    thorns_aura: { name: "Thorns", desc: "Enemies take 3 DMG when hitting you" },
    
    rage_meter: { name: "Inner Rage", desc: "+1 ATK each time you are hit" },
    undying_rage: { name: "Undying Rage", desc: "Survive fatal hit with 1 HP (Once)" },
    
    scavenger_pro: { name: "Scrap Master", desc: "2x Gold Drops" },
    automated_defense: { name: "Auto-Def", desc: "Gain 5 Shield every 3 turns" },

    // --- NEW TRAITOR PASSIVES (Evolution Linked) ---
    smite_master: { name: "Smite Master", desc: "Smite deals +50% Dmg" },
    justice: { name: "Justice", desc: "Reflect 50% of Dmg taken" },
    pure_heart: { name: "Pure Heart", desc: "Heal 10 HP/turn" },
    invincible: { name: "Invincible", desc: "Start combat with Invuln (1 turn)" },
    titan_skin: { name: "Titan Skin", desc: "DEF +20" },
    truth: { name: "Truth", desc: "Ignore 50% Enemy DEF" },
    god_of_light: { name: "God of Light", desc: "Revive once with 50% HP" },
    
    photosynthesis: { name: "Photosynthesis", desc: "Heal 2 HP/turn in Sun" },
    wisdom: { name: "Wisdom", desc: "MP Cost -20%" },
    god_of_nature: { name: "God of Nature", desc: "+100% Healing Power" },
    immortal: { name: "Immortal", desc: "Cannot die from Dot" },
    static: { name: "Static", desc: "Stun attackers (10% chance)" },
    dodge_master: { name: "Dodge Master", desc: "+25% Dodge" },
    
    strong_arm: { name: "Strong Arm", desc: "Throw Dmg +50%" },
    leadership: { name: "Leadership", desc: "Allies +20% Stats" },
    ignore_def: { name: "Sunder", desc: "Attacks ignore 20% DEF" },
    crit_dmg: { name: "Lethal", desc: "+50% Crit Dmg" },
    titan_grip: { name: "Titan Grip", desc: "ATK +30%" },
    colossal: { name: "Colossal", desc: "MaxHP +500" },
    intimidate: { name: "Intimidate", desc: "Start combat with Terror" },
    multi_hit: { name: "Multi-Hit", desc: "Attacks hit twice (50% dmg)" },
    counter_attack: { name: "Counter", desc: "Counter hit when dodged" },
    zen: { name: "Zen", desc: "MP Regen +5" },
    
    eagle_eye: { name: "Eagle Eye", desc: "Crit Chance +10%" },
    quick_hands: { name: "Quick Hands", desc: "Skill Cost -1" },
    greed: { name: "Greed", desc: "Gold +50%" },
    invention: { name: "Invention", desc: "Items are 20% stronger" },
    metal_plating: { name: "Plating", desc: "Start with 20 Shield" },
    builder: { name: "Builder", desc: "Turrets have +50% HP" },
    battery: { name: "Battery", desc: "Start with Max MP" },
    armor_clad: { name: "Clad", desc: "DEF +10, Speed -5" },
    poison_master: { name: "Toxin", desc: "Poison lasts 2x longer" },
    gold_alchemy: { name: "Alchemy", desc: "Kills give 1 Gold" },
    madness: { name: "Madness", desc: "Random Buff/Debuff per turn" },
    infinite_energy: { name: "Inf. Energy", desc: "MP costs 0 (Cooldowns added)" },
    shield_gen: { name: "Shield Gen", desc: "+10 Shield/turn" },
    zap: { name: "Zap", desc: "Thorns (Lightning)" },
    impenetrable: { name: "Wall", desc: "Dmg taken capped at 50" },
    explosive: { name: "Explosive", desc: "Attacks explode (AoE)" },
    dodge_code: { name: "Glitch Dodge", desc: "50% Dodge" },
    rewrite: { name: "Rewrite", desc: "Reroll bad RNG" },
    upload: { name: "Upload", desc: "Ascend to AI" },
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
    
    // v36.6.5 CDR Passive
    haste: { name: "Haste", desc: "-20% Skill Cooldowns", stats: { cdr: 0.20 } },

    // God Tier Passives (restored)
    god_of_death: { name: "God of Death", desc: "Execute enemies under 20% HP", stats: { execute: 0.20 } },
    god_of_blood: { name: "God of Blood", desc: "+50% Lifesteal, +500 HP", stats: { lifesteal: 0.50, hp: 500 } },
    god_of_rot: { name: "God of Rot", desc: "Poison deals triple damage", stats: { poisonMult: 3 } },
    god_of_void: { name: "God of Void", desc: "Ignore 100% DEF, +20% Magic Dmg", stats: { ignoreDef: 1.0, mag: 0.2 } },
    god_of_war: { name: "God of War", desc: "+100% Physical Dmg, +1000 HP", stats: { phys: 1.0, hp: 1000 } },

};
const SKILLS_DB = {
    smash: {
      name: "Smash",
      cost: 2,
      cooldown: 2,
      type: "phys",
      power: 1.5,
      desc: "Basic Dmg",
    },
    bone_throw: {
      name: "Bone Throw",
      cost: 3,
      cooldown: 2,
      type: "phys",
      power: 1.2,
      desc: "Ranged Dmg",
      req: { str: 2 } // v36.1: Lowered for Necro Priest Cultist (Starts 2 STR)
    },
    shield_bash: {
      name: "Shield Bash",
      cost: 5,
      cooldown: 3,
      type: "phys",
      power: 1.0,
      status: { id: "shock", turn: 1, val: 0 },
      desc: "Stun",
      req: { vit: 5 },
      upgradePath: [
        { type: 'power', value: 0.15 },
        { type: 'ailment', value: 1 },
        { type: 'power', value: 0.15 },
        { type: 'cd', value: -1 }
      ] // v36.1: Lowered for Skeleton (Starts 5 VIT)
    },
    rend: {
      name: "Rend",
      cost: 4,
      cooldown: 2,
      type: "phys",
      power: 1.2,
      status: { id: "bleed", turn: 3, val: 2 },
      desc: "Bleed",
      req: { str: 7 } // v36.1: Lowered for Ghoul (Starts 7 STR)
    },
    cannibalize: {
      name: "Cannibalize",
      cost: 6,
      cooldown: 4,
      type: "heal",
      power: 0.8,
      desc: "Big Heal",
      req: { vit: 7 } // v36.1: Lowered for Ghoul (Starts 7 VIT)
    },
    frenzy: {
      name: "Frenzy",
      cost: 5,
      cooldown: 3,
      type: "buff",
      desc: "ATK UP, DEF DOWN",
      req: { str: 15 }
    },
    fireball: {
      name: "Fireball",
      cost: 6,
      cooldown: 3,
      type: "mag",
      power: 1.8,
      status: { id: "burn", turn: 3, val: 3 },
      desc: "Burn",
      req: { int: 8 },
      upgradePath: [
        { type: 'power', value: 0.2 },
        { type: 'power', value: 0.2 },
        { type: 'power', value: 0.2 },
        { type: 'cd', value: -1 },
        { type: 'ailment', value: 1 },
        { type: 'power', value: 0.2 },
        { type: 'power', value: 0.2 },
        { type: 'cd', value: -1 }
      ] // v36.1: Lowered for Phantom (Starts 8 INT)
    },
    blizzard: {
      name: "Blizzard",
      cost: 10,
      cooldown: 4,
      type: "mag",
      power: 1.0,
      hits: 3,
      status: { id: "chill", turn: 2, val: 0 },
      desc: "Slow",
    },
    ice_shard: {
      name: "Ice Shard",
      cost: 5,
      cooldown: 2,
      type: "mag",
      power: 1.2,
      status: { id: "chill", turn: 3, val: 0 },
      desc: "Slow",
    },
    terror: {
      name: "Terror",
      cost: 8,
      cooldown: 3,
      type: "debuff",
      status: { id: "weak", turn: 3, val: 0 },
      desc: "Weaken",
    },
    heal: {
      name: "Mend",
      cost: 5,
      cooldown: 3,
      type: "heal",
      power: 0.5,
      desc: "Heal",
      upgradePath: [
        { type: 'power', value: 0.3 },
        { type: 'power', value: 0.3 },
        { type: 'cd', value: -1 },
        { type: 'power', value: 0.3 },
        { type: 'cd', value: -1 }
      ]
    },
    // Vampire Skills
    blood_drain: {
      name: "Blood Drain",
      cost: 4,
      cooldown: 2,
      type: "phys",
      power: 1.3,
      lifesteal: 0.5,  // 50% of damage healed
      desc: "ATK + Heal",
    },
    bat_swarm: {
      name: "Bat Swarm",
      cost: 6,
      cooldown: 3,
      type: "phys",
      power: 0.8,
      hits: 3,  // Multi-hit
      lifesteal: 0.3,
      desc: "3-Hit Lifesteal",
    },
    night_veil: {
      name: "Night Veil",
      cost: 8,
      cooldown: 5,
      type: "heal",
      power: 1.0,
      invuln: 1,  // 1 turn invulnerability
      desc: "Heal + Invuln",
    },
    // Lich Skills
    summon_skeleton: {
      name: "Summon Skeleton",
      cost: 7,
      cooldown: 5,
      type: "summon",
      hp: 30,
      desc: "Summon Aid",
    },
    death_coil: {
      name: "Death Coil",
      cost: 8,
      cooldown: 3,
      type: "mag",
      power: 2.0,
      lifesteal: 0.5,
      desc: "High Magic DMG",
    },
    soul_harvest: {
      name: "Soul Harvest",
      cost: 5,
      cooldown: 4,
      type: "mag",
      power: 1.0,  // Scales with kills
      killBonus: 0.1,  // +10% per kill
      desc: "Scales with Kills",
    },
    // Wraith Skills
    phase_strike: {
      name: "Phase Strike",
      cost: 6,
      cooldown: 3,
      type: "phys",
      power: 1.5,
      ignoreDef: true,  // Ignore enemy DEF
      desc: "Ignore DEF",
    },
    haunting: {
      name: "Haunting",
      cost: 5,
      cooldown: 2,
      type: "debuff",
      status: { id: "fear", turn: 3, val: 0 },  // ATK debuff
      desc: "Fear (ATK Down)",
    },
    possession: {
      name: "Possession",
      cost: 10,
      cooldown: 5,
      type: "special",
      desc: "Control Enemy 1 Turn",
    },
    
    // v27.0 New Skills
    soul_cleave: {
      name: "Soul Cleave",
      cost: 15, // High MP cost
      hpCost: 10, // Cost HP as well (handled in effect)
      cooldown: 4,
      type: "phys",
      power: 2.5,
      desc: "Cost 10 HP. Massive Dmg",
      req: { str: 9 }, // v36.1: Lowered for DK (Starts 9 STR)
      effect: (user, target) => {
        // Self damage mechanic
        user.takeTrueDamage(10);
        return { txt: "SACRIFICE!", type: "physical" };
      }
    },
    plague_ward: { // Used by Necro Priest
      name: "Plague Ward",
      cost: 20,
      cooldown: 5,
      type: "buff",
      status: { id: "plague_ward", turn: 3, val: 50 }, // Reflect 50%
      shield: 10,
      desc: "Shield + Reflect Poison",
      req: { int: 9 } // v36.1: Lowered for NP (Starts 9 INT)
    },
    vanish: {
       name: "Vanish",
       cost: 10, // Cost Reduced 25 -> 10
       cooldown: 4,
       type: "buff",
       status: { id: "stealth", turn: 2, val: 0 },
       nextHitCrit: true,
       desc: "Stealth + Next Crit",
       req: { int: 8 } // v36.1: Fixed for Shadow Assassin (Int 8)
    },
    
    // v30.3 New Class Skills
    arcane_missiles: {
      name: "Arcane Missiles",
      cost: 6,
      cooldown: 2,
      type: "mag",
      power: 0.6,
      hits: 4,
      desc: "4-Hit Barrage",
      req: { str: 4, int: 5 } // v36.1: Fixed for Shadow Assassin (Str 4)
    },
    shadow_shuriken: {
       name: "Shadow Shuriken",
       cost: 4,
       cooldown: 2,
       type: "phys",
       power: 1.0,
       hits: 2,
       desc: "Double Hit Ranged",
       req: { str: 4, int: 5 } // v36.1: Fixed for Shadow Assassin (Str 4)
    },
    backstab: {
       name: "Backstab",
       cost: 10,
       cooldown: 3,
       type: "phys",
       power: 2.0,
       desc: "High dmg, ignored if frontal?", // Simplified logic
       req: { str: 4 } // v36.1: Fixed for Shadow Assassin (Str 4)
    },
    hex: {
       name: "Hex",
       cost: 8,
       cooldown: 3,
       type: "debuff",
       status: { id: "curse", turn: 4, val: 0 }, // Curse: Take more dmg
       desc: "Curse Target",
       req: { int: 15 }
    },
    cursed_mending: {
       name: "Cursed Mending",
       cost: 10,
       cooldown: 4,
       type: "heal",
       power: 1.5,
       status: { id: "weak", turn: 2, val: 0 }, // Self-weaken or target weaken?
       // Let's make it simple: Heal self but apply random debuff? 
       // Or just high heal.
       desc: "Great Heal + Weaken Self", 
       req: { int: 9 } // v36.1: For Necro Priest (Int 9)
    },
    void_slash: {
       name: "Void Slash",
       cost: 12,
       cooldown: 3,
       type: "mag", // Magic slash
       power: 1.8,
       ignoreDef: true,
       desc: "Ignore DEF Magic Dmg",
       req: { str: 5, int: 5 } // v36.1: Lowered for Dark Knight (T1 Chaos Knight)
    },
    abyssal_shield: {
       name: "Abyssal Shield",
       cost: 15,
       cooldown: 5,
       type: "buff",
       shield: 30, // Big shield
       desc: "Gain 30 Shield",
       req: { vit: 8 } // v36.1: For Dark Knight (Vit 8)
    },

    // ============================
    // v35.0 TRAITOR CLASS SKILLS 
    // ============================

    // PALADIN (Faith / Holy)
    judgement: {
        name: "Judgement",
        cost: 6,
        cooldown: 2,
        type: "phys", 
        power: 1.8,
        desc: "Holy Smash",
        status: { id: "smite", turn: 3, val: 5 }, 
        req: { str: 5 } // v36.1: Fixed req (was Int 5, Paladin has Int 4)
    },
    divine_shield: {
        name: "Divine Shield",
        cost: 15,
        cooldown: 5,
        type: "buff",
        invuln: 1, 
        desc: "Immune 1 Turn",
        req: { vit: 15 }
    },
    consecrate: {
        name: "Consecrate",
        cost: 8,
        cooldown: 3,
        type: "heal",
        power: 0.5,
        status: { id: "regen", turn: 3, val: 5 }, 
        desc: "Regen Area",
        req: { int: 10 }
    },

    // DRUID (Nature / Shapeshift)
    thorn_whip: { 
        name: "Thorn Whip",
        cost: 2,
        cooldown: 1,
        type: "mag", 
        power: 1.2,
        desc: "Nature Dmg",
        req: { int: 5 }
    },
    lich_form: {
      name: "Lich Form",
      cost: 10,
      cooldown: 6,
      type: "buff",
      desc: "Transform",
    },
    bear_form: {
        name: "Bear Form",
        cost: 10,
        cooldown: 4,
        type: "buff",
        status: { id: "bear_form", turn: 3, val: 20 }, 
        shield: 20,
        desc: "+20 DEF & Shield",
        req: { vit: 6 } // v36.1: Lowered for Druid (Starts 6 VIT)
    },
    rage: {
        name: "Rage",
        cost: 5,
        cooldown: 3,
        type: "buff",
        status: { id: "rage", turn: 3, val: 10 }, 
        desc: "Root Enemy",
        req: { int: 8 }
    },
    energy_blast: {
        name: "Energy Blast",
        cost: 6,
        cooldown: 2,
        type: "mag",
        power: 1.8,
        desc: "Tech Dmg",
        req: { int: 5 }
    },

    // BERSERKER (Rage / Physical)
    whirlwind: {
        name: "Whirlwind",
        cost: 10,
        cooldown: 4,
        type: "phys",
        power: 0.7,
        hits: 5, 
        desc: "Spin to Win!",
        req: { str: 10 } // v36.1: Fixed req (was Str 15, Berserker has Str 10)
    },
    enrage: {
        name: "Enrage",
        cost: 0, 
        hpCost: 20, 
        type: "buff",
        status: { id: "enrage", turn: 3, val: 50 }, 
        desc: "-20 HP, +50% ATK",
        effect: (user) => { user.takeTrueDamage(20); return { txt: "RAGE!", type: "buff" }; }
    },
    execute: {
        name: "Execute",
        cost: 8,
        cooldown: 3,
        type: "phys",
        power: 3.0,
        desc: "High Dmg Finisher",
        req: { str: 20 }
    },

    // MECHANIST (Tech / Summons)
    deploy_turret: {
        name: "Deploy Turret",
        cost: 15,
        cooldown: 6,
        type: "summon",
        hp: 50,
        desc: "Auto-Attack Turret",
        req: { int: 9 } // v36.1: Lowered for Mechanist (Starts 9 INT)
    },
    overcharge: {
        name: "Overcharge",
        cost: 20,
        cooldown: 5,
        type: "buff",
        status: { id: "overcharge", turn: 2, val: 50 }, 
        desc: "Speed Boost",
        req: { int: 15 }
    },
    rejuvenation: {
        name: "Rejuvenation",
        cost: 12,
        cooldown: 4,
        type: "heal",
        power: 1.2,
        status: { id: "regen", turn: 3, val: 3 },
        desc: "Explosive Dmg",
        req: { int: 9 } // v36.1: Fixed req (was Str 10, Mech has Str 4, Int 9)
    },

    // --- LEGACY SECTION REMOVED (Merged into Main) ---
    // Previous duplicates (shadow_shuriken, backstab, etc.) removed to prevent overwrites.
    
    // --- PALADIN EXTRA SKILLS ---
    revive: { name: "Revive", cost: 20, type: "heal", power: 1.0, desc: "Heal + Cleanse", req: { int: 20 } },
    supernova: { name: "Supernova", cost: 25, type: "mag", power: 3.0, status: { id: "blind", turn: 3, val: 0 }, desc: "Massive Holy Dmg", req: { int: 30 } },
    reflect_all: { name: "Reflect All", cost: 15, type: "buff", status: { id: "refl_all", turn: 3, val: 100 }, desc: "Reflect 100% Dmg", req: { vit: 30 } },

    // --- DRUID EXTRA SKILLS ---
    bite: { name: "Bite", cost: 4, type: "phys", power: 1.2, lifesteal: 0.2, desc: "Lifesteal Bite", req: { str: 5 } },
    stomp: { name: "War Stomp", cost: 8, type: "phys", power: 1.0, status: { id: "stun", turn: 1, val: 0 }, desc: "AoE Stun", req: { str: 15 } },
    earthquake: { name: "Earthquake", cost: 15, type: "phys", power: 2.0, desc: "Massive Earth Dmg", req: { str: 20 } },
    summon_treant: { name: "Summon Treant", cost: 12, type: "summon", hp: 50, desc: "Summon Tank Tree", req: { int: 15 } },
    tsunami: { name: "Tsunami", cost: 20, type: "mag", power: 2.5, desc: "Water Dmg Wave", req: { int: 25 } },
    rebirth: { name: "Rebirth", cost: 30, type: "buff", desc: "Auto-Revive Buff", req: { int: 30 } },
    devour: { name: "Devour", cost: 10, type: "phys", power: 2.0, lifesteal: 1.0, desc: "Eat Enemy", req: { str: 40 } },
    howl: { name: "Feral Howl", cost: 5, type: "debuff", status: { id: "fear", turn: 3, val: 0 }, desc: "Fear AoE", req: { str: 10 } },
    lighting_storm: { name: "Lightning Storm", cost: 18, type: "mag", power: 2.2, desc: "Thunder Dmg", req: { int: 40 } },
    flight: { name: "Flight", cost: 8, type: "buff", desc: "Evasion Up", req: { int: 20 } },

    // --- BERSERKER EXTRA SKILLS ---
    shout: { name: "Shout", cost: 3, type: "debuff", status: { id: "weak", turn: 2, val: 0 }, desc: "Weaken", req: { str: 5 } },
    battle_cry: { name: "Battle Cry", cost: 5, type: "buff", desc: "ATK Up", req: { str: 8 } },
    rally: { name: "Rally", cost: 10, type: "heal", power: 0.5, desc: "Group Heal", req: { vit: 10 } },
    sunder: { name: "Sunder", cost: 6, type: "phys", power: 1.3, status: { id: "vuln", turn: 3, val: 0 }, desc: "Reduce DEF", req: { str: 15 } },
    ground_slam: { name: "Ground Slam", cost: 8, type: "phys", power: 1.5, desc: "AoE Dmg", req: { str: 18 } },
    charge: { name: "Charge", cost: 5, type: "phys", power: 1.2, status: { id: "stun", turn: 1, val: 0 }, desc: "Stun Hit", req: { str: 12 } },
    iron_skin: { name: "Iron Skin", cost: 8, type: "buff", shield: 15, desc: "Gain Armor", req: { vit: 15 } },
    god_smash: { name: "God Smash", cost: 15, type: "phys", power: 6.0, desc: "Ultimate Hit", req: { str: 50 } },
    blade_storm: { name: "Blade Storm", cost: 20, type: "phys", power: 1.5, hits: 5, desc: "5-Hit AoE", req: { str: 40 } },
    flurry: { name: "Flurry", cost: 6, type: "phys", power: 0.8, hits: 4, desc: "Fast Hits", req: { str: 30 } },
    hundred_fists: { name: "100 Fists", cost: 12, type: "phys", power: 0.5, hits: 10, desc: "10-Hit Combo", req: { str: 45 } },
    meditate: { name: "Meditate", cost: 0, type: "heal", power: 10.0, desc: "Self Heal", req: { vit: 20 } },
    meteor: { name: "Meteor", cost: 25, type: "mag", power: 8.0, desc: "Planetary Impact", req: { str: 60 } },
    fissure: { name: "Fissure", cost: 15, type: "phys", power: 4.0, desc: "Split Earth", req: { str: 35 } },
    roar: { name: "Titan Roar", cost: 10, type: "debuff", status: { id: "stun", turn: 3, val: 0 }, desc: "AoE Stun", req: { str: 40 } },

    // --- MECHANIST EXTRA SKILLS ---
    aimed_shot: { name: "Aimed Shot", cost: 4, type: "phys", power: 1.4, desc: "Accurate Hit", req: { str: 4 } }, // v36.1: Fixed for Gunner
    reload: { name: "Reload", cost: 0, type: "buff", desc: "Restore MP?", req: { int: 5 } }, 
    repair: { name: "Repair", cost: 5, type: "heal", power: 1.0, desc: "Fix Self", req: { int: 8 } },
    flashbang: { name: "Flashbang", cost: 6, type: "debuff", status: { id: "blind", turn: 2, val: 0 }, desc: "Blind Enemy", req: { int: 6 } },
    fortify: { name: "Fortify", cost: 8, type: "buff", shield: 10, desc: "Shield Up", req: { vit: 8 } },
    wrench_whack: { name: "Wrench", cost: 2, type: "phys", power: 1.1, desc: "Bonk", req: { str: 2 } }, // v36.1: Fixed for Engineer
    headshot: { name: "Headshot", cost: 8, type: "phys", power: 2.5, desc: "Critical Hit", req: { str: 10 } },
    missile_barrage: { name: "Missiles", cost: 12, type: "phys", power: 0.8, hits: 4, desc: "4 Rockets", req: { int: 15 } },
    flamethrower: { name: "Flamethrower", cost: 10, type: "mag", power: 1.0, status: { id: "burn", turn: 4, val: 5 }, desc: "AoE Burn", req: { int: 12 } },
    eject: { name: "Eject", cost: 5, type: "buff", desc: "Escape/Heal", req: { int: 10 } },
    acid_bomb: { name: "Acid Bomb", cost: 8, type: "debuff", status: { id: "corrode", turn: 3, val: 5 }, desc: "Acid DoT", req: { int: 12 } },
    elixir: { name: "Elixir", cost: 6, type: "heal", power: 1.5, desc: "Drink Potion", req: { int: 10 } },
    transmute: { name: "Transmute", cost: 10, type: "special", desc: "Gold Dmg?", req: { int: 20 } },
    laser_beam: { name: "Laser Beam", cost: 15, type: "mag", power: 4.0, ignoreDef: true, desc: "Pierce Beam", req: { int: 35 } },
    black_hole: { name: "Black Hole", cost: 30, type: "mag", power: 7.0, desc: "Implosion", req: { int: 50 } },
    nuke: { name: "Tactical Nuke", cost: 40, type: "phys", power: 20.0, desc: "GAME OVER", req: { str: 50 } },
    bunker: { name: "Bunker", cost: 15, type: "buff", invuln: 3, desc: "Invuln 3 Turns", req: { vit: 40 } },
    artillery: { name: "Artillery", cost: 12, type: "phys", power: 4.0, desc: "Long Range", req: { str: 30 } },
    hack: { name: "Hack", cost: 10, type: "debuff", status: { id: "stun", turn: 3, val: 0 }, desc: "Stun Robot", req: { int: 40 } },
    download: { name: "Download", cost: 10, type: "buff", desc: "Download RAM (MP)", req: { int: 45 } },
    glitch: { name: "Glitch", cost: 20, type: "special", desc: "Random Effect", req: { int: 50 } }
};

const SKILL_TREES = {
    st_basic: {
        id: "st_basic",
        name: "Basic Skills",
        nodes: {
            // Tier 1
            smash: { id: "smash", name: "Smash", desc: "Basic Attack", cost: 1, icon: "⚔️" },
            bone_throw: { id: "bone_throw", name: "Bone Throw", desc: "Ranged Attack", cost: 1, icon: "🦴" },
            
            // Tier 2
            shield_bash: { id: "shield_bash", name: "Shield Bash", desc: "Stun Enemy", cost: 2, icon: "🛡️", req: "smash" },
            rend: { id: "rend", name: "Rend", desc: "Bleed Damage", cost: 2, icon: "🩸", req: "smash" },
            
            // Tier 3
            frenzy: { id: "frenzy", name: "Frenzy", desc: "Buff ATK", cost: 3, icon: "🔥", req: "shield_bash" },
            cannibalize: { id: "cannibalize", name: "Cannibalize", desc: "Heal HP", cost: 3, icon: "🍖", req: "rend" },
            
            // Tier 4
            fireball: { id: "fireball", name: "Fireball", desc: "Magic Burn", cost: 4, icon: "🔥", req: "bone_throw" },
            ice_shard: { id: "ice_shard", name: "Ice Shard", desc: "Magic Slow", cost: 4, icon: "❄️", req: "bone_throw" },
            
            // Tier 5
            terror: { id: "terror", name: "Terror", desc: "Weaken Enemy", cost: 5, icon: "😱", req: "ice_shard" },
            heal: { id: "heal", name: "Mend", desc: "Restore HP", cost: 5, icon: "💖", req: "cannibalize" }
        }
    }
};

export { PASSIVES_DB, SKILLS_DB, SKILL_TREES };