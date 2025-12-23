/* =========================================
   EVOLUTION SYSTEM (v30.0)
   Power spikes at Level 5 and 10
   ========================================= */

const EVOLUTIONS = {
  // Level 5 Options (Tier 1) - Stat Multipliers / Utility
  5: [
    {
      id: "evo_str",
      name: "Strength Training",
      desc: "STR +10% (Multiplicative)",
      effect: { type: "mult_stat", stat: "str", val: 0.1 }
    },
    {
      id: "evo_vit",
      name: "Endurance Training",
      desc: "VIT +10% (Multiplicative)",
      effect: { type: "mult_stat", stat: "vit", val: 0.1 }
    },
    {
      id: "evo_int",
      name: "Mental Focus",
      desc: "INT +10% (Multiplicative)",
      effect: { type: "mult_stat", stat: "int", val: 0.1 }
    },
    {
      id: "evo_reflex",
      name: "Cat Reflexes",
      desc: "Dodge +5% (Flat)",
      effect: { type: "add_bonus", stat: "dodge", val: 0.05 }
    }
  ],

  // Level 10 Options (Tier 2) - Combat Mastery
  10: [
    {
      id: "evo_titan",
      name: "Titan's Grip",
      desc: "Final DMG +15%",
      effect: { type: "mult_stat", stat: "dmg", val: 0.15 }
    },
    {
      id: "evo_iron",
      name: "Iron Skin",
      desc: "Final DEF +15%",
      effect: { type: "mult_stat", stat: "def", val: 0.15 }
    },
    {
      id: "evo_vamp",
      name: "Bloodlust",
      desc: "Lifesteal +5%",
      effect: { type: "add_bonus", stat: "lifesteal", val: 0.05 }
    },
    {
      id: "evo_scholar",
      name: "Arcane Mastery",
      desc: "Max MP +20%",
      effect: { type: "mult_stat", stat: "mp", val: 0.2 }
    }
  ]
};

// window.EVOLUTIONS = EVOLUTIONS;

const CLASS_TREES = {
  skeleton: {
    // TIER 1 (Level 20)
    20: [
      {
        id: "skel_warrior",
        name: "Skeleton Warrior",
        desc: "Melee Specialist. High STR/VIT.",
        stats: { str: 5, vit: 5, int: 0 },
        skills: ["smash", "shield_bash", "frenzy"],
        passivePool: ["thick_skin", "blood_fueled", "undying"],
        sprite: `<span class="pixel-sprite sprite-class-skeleton">
 ⚔️
▓▓▓
▓░▓░▓
 ▓▓▓
▓ ▓</span>`
      },
      {
        id: "skel_archer",
        name: "Skeleton Archer",
        desc: "Ranged Specialist. Balanced.",
        stats: { str: 3, vit: 3, int: 4 },
        skills: ["bone_throw", "vanish", "fireball"], // Fireball as 'Explosive Shot' RP
        passivePool: ["scavenger", "shadow_arts", "intangible"],
        sprite: `<span class="pixel-sprite sprite-class-skeleton">
 🏹
▓▓▓
▓░▓░▓
 ▓▓▓
▓ ▓</span>`
      },
      {
        id: "skel_mage",
        name: "Skeleton Mage",
        desc: "Magic Specialist. High INT.",
        stats: { str: 1, vit: 2, int: 7 },
        skills: ["fireball", "ice_shard", "terror"],
        passivePool: ["mana_leech", "grim_harvest", "ethereal"],
        sprite: `<span class="pixel-sprite sprite-class-skeleton">
 🔮
▓▓▓
▓░▓░▓
 ▓▓▓
▓ ▓</span>`
      }
    ],

    // TIER 2 (Level 50) - Linear upgrades based on previous? 
    // For simplicity, we offer all 3 advanced versions, user picks roleplay-wise
    50: [
      {
        id: "skel_knight",
        name: "Death Knight",
        desc: "Tank. Massive Defense.",
        stats: { str: 10, vit: 15, int: 5 },
        sprite: `<span class="pixel-sprite sprite-class-skeleton">
🛡️💀🛡️
 ▓▓▓
▓░▓░▓
 ▓▓▓
▓ ▓</span>`
      },
      {
        id: "skel_assassin",
        name: "Bone Assassin",
        desc: "High Crit & Speed.",
        stats: { str: 8, vit: 8, int: 14 },
        sprite: `<span class="pixel-sprite sprite-class-skeleton">
🗡️💀🗡️
 ▓▓▓
▓░▓░▓
 ▓▓▓
▓ ▓</span>`
      },
      {
        id: "skel_lich",
        name: "Archmage",
        desc: "Master of Spells.",
        stats: { str: 5, vit: 5, int: 20 },
        sprite: `<span class="pixel-sprite sprite-class-skeleton">
🔥💀❄️
 ▓▓▓
▓░▓░▓
 ▓▓▓
▓ ▓</span>`
      }
    ],

    // TIER 3 (Level 80)
    80: [
      {
        id: "skel_overlord",
        name: "Bone Overlord",
        desc: "Ruler of the Dead. Godlike STR.",
        stats: { str: 30, vit: 20, int: 10 },
        sprite: `<span class="pixel-sprite sprite-class-skeleton">
👑
💀
▓▓▓
▓ ▓</span>`
      },
      {
        id: "skel_reaper",
        name: "Grim Reaper",
        desc: "Harvester of Souls. Instant Kill Chance.",
        stats: { str: 20, vit: 10, int: 30 },
        sprite: `<span class="pixel-sprite sprite-class-skeleton">
💀
👘
▓▓▓
▓ ▓</span>`
      },
      {
        id: "skel_demilich",
        name: "Demi-Lich",
        desc: "Ascended Caster. Infinite MP.",
        stats: { str: 5, vit: 15, int: 40 },
        sprite: `<span class="pixel-sprite sprite-class-skeleton">
✨💀✨
 ▓▓▓
 ▓▓▓
 ▓ ▓</span>`
      }
    ]
  },
  
  ghoul: {
    // TIER 1 (Level 20)
    20: [
      {
        id: "ghoul_brute",
        name: "Ghoul Brute",
        desc: "Max HP & Defense focus.",
        stats: { str: 4, vit: 8, int: 0 },
        skills: ["smash", "shield_bash", "cannibalize"],
        passivePool: ["thick_skin", "regenerator", "stone_skin"],
        sprite: `<span class="pixel-sprite sprite-class-ghoul">
🛡️
🧟
▓▓▓
▓ ▓</span>`
      },
      {
        id: "ghoul_crawler",
        name: "Rot Crawler",
        desc: "Poison Specialist.",
        stats: { str: 5, vit: 5, int: 3 },
        skills: ["rend", "bone_throw", "plague_ward"],
        passivePool: ["rot_touch", "scavenger", "swift_foot"],
        sprite: `<span class="pixel-sprite sprite-class-ghoul">
🤢
🧟
▓▓▓
▓ ▓</span>`
      },
      {
        id: "ghoul_devourer",
        name: "Flesh Devourer",
        desc: "Lifesteal focus.",
        stats: { str: 7, vit: 4, int: 1 },
        skills: ["cannibalize", "rend", "blood_drain"],
        passivePool: ["vampirism", "blood_frenzy", "executioner"],
        sprite: `<span class="pixel-sprite sprite-class-ghoul">
🍖
🧟
▓▓▓
▓ ▓</span>`
      }
    ],
    // TIER 2 (Level 50)
    50: [
      {
        id: "ghoul_abomination",
        name: "Abomination",
        desc: "Unstoppable Tank.",
        stats: { str: 10, vit: 20, int: 0 },
        skills: ["shield_bash", "frenzy", "abyssal_shield"],
        passivePool: ["thick_skin", "iron_will", "thorns"],
        sprite: `<span class="pixel-sprite sprite-class-ghoul">
⛓️🧟⛓️
 ▓▓▓
▓░▓░▓
 ▓▓▓
▓ ▓</span>`
      },
      {
        id: "ghoul_plague",
        name: "Plague Bearer",
        desc: "Walking Disease.",
        stats: { str: 10, vit: 10, int: 10 },
        skills: ["plague_ward", "hex", "terror"],
        passivePool: ["rot_touch", "magic_barrier", "regenerator"],
        sprite: `<span class="pixel-sprite sprite-class-ghoul">
🤮🧟🤮
 ▓▓▓
▓░▓░▓
 ▓▓▓
▓ ▓</span>`
      },
      {
        id: "ghoul_wendigo",
        name: "Wendigo",
        desc: "Insatiable Hunger.",
        stats: { str: 15, vit: 10, int: 5 },
        skills: ["cannibalize", "blood_drain", "soul_cleave"],
        passivePool: ["vampirism", "blood_fueled", "undying"],
        sprite: `<span class="pixel-sprite sprite-class-ghoul">
🩸🧟🩸
 ▓▓▓
▓░▓░▓
 ▓▓▓
▓ ▓</span>`
      }
    ],
    // TIER 3 (Level 80)
    80: [
      {
        id: "ghoul_behemoth",
        name: "Undying Behemoth",
        desc: "Immortal Titan.",
        stats: { str: 20, vit: 40, int: 0 },
        skills: ["abyssal_shield", "smash", "void_slash"],
        passivePool: ["thick_skin", "iron_will", "phylactery"],
        sprite: `<span class="pixel-sprite sprite-class-ghoul">
🏔️
🧟
▓▓▓
▓ ▓</span>`
      },
      {
        id: "ghoul_pestilence",
        name: "Lord of Decay",
        desc: "Everything Rots.",
        stats: { str: 15, vit: 15, int: 30 },
        skills: ["plague_ward", "hex", "cursed_mending"],
        passivePool: ["rot_touch", "god_of_rot", "magic_barrier"], // god_of_rot not defined, fallback to rot_touch?
        sprite: `<span class="pixel-sprite sprite-class-ghoul">
☠️
🧟
▓▓▓
▓ ▓</span>`
      },
      {
        id: "ghoul_ravenous",
        name: "Ravenous God",
        desc: "Consume The World.",
        stats: { str: 35, vit: 20, int: 5 },
        skills: ["soul_cleave", "cannibalize", "void_slash"],
        passivePool: ["vampirism", "blood_frenzy", "executioner"],
        sprite: `<span class="pixel-sprite sprite-class-ghoul">
🪐
👄
▓▓▓
▓ ▓</span>`
      }
    ]
  },

  phantom: {
    // TIER 1 (Level 20)
    20: [
      {
        id: "phantom_spirit",
        name: "Vengeful Spirit",
        desc: "High Magic Damage.",
        stats: { str: 0, vit: 2, int: 8 },
        skills: ["ice_shard", "terror", "vanish"],
        passivePool: ["ethereal", "mana_leech", "glass_cannon"],
        sprite: `<span class="pixel-sprite sprite-class-phantom">
⚡👻⚡
 ░▓░
 ▓▓▓
 ░░░</span>`
      },
      {
        id: "phantom_shade",
        name: "Night Shade",
        desc: "Stealth & Crit.",
        stats: { str: 4, vit: 2, int: 5 },
        skills: ["vanish", "shadow_shuriken", "backstab"],
        passivePool: ["shadow_arts", "swift_foot", "lucky_strike"],
        sprite: `<span class="pixel-sprite sprite-class-phantom">
🌑👻🌑
 ░▓░
 ▓▓▓
 ░░░</span>`
      },
      {
        id: "phantom_poltergeist",
        name: "Poltergeist",
        desc: "Evasion Tank.",
        stats: { str: 2, vit: 5, int: 5 },
        skills: ["haunting", "terror", "phase_strike"],
        passivePool: ["intangible", "ethereal", "thorns"],
        sprite: `<span class="pixel-sprite sprite-class-phantom">
📦👻🪑
 ░▓░
 ▓▓▓
 ░░░</span>`
      }
    ],
    // TIER 2 (Level 50)
    50: [
      {
        id: "phantom_banshee",
        name: "Screaming Banshee",
        desc: "Sonic Magic Destruction.",
        stats: { str: 0, vit: 5, int: 20 },
        skills: ["terror", "hex", "death_bolt"],
        passivePool: ["glass_cannon", "grim_harvest", "magic_barrier"],
        sprite: `<span class="pixel-sprite sprite-class-phantom">
📢👻📢
 ░▓░
 ▓▓▓
 ░░░</span>`
      },
      {
        id: "phantom_specter",
        name: "Void Specter",
        desc: "Unseen Killer.",
        stats: { str: 10, vit: 5, int: 15 },
        skills: ["vanish", "phase_strike", "backstab"],
        passivePool: ["intangible", "shadow_arts", "executioner"],
        sprite: `<span class="pixel-sprite sprite-class-phantom">
⚫👻⚫
 ░▓░
 ▓▓▓
 ░░░</span>`
      },
      {
        id: "phantom_wraith",
        name: "Dread Wraith",
        desc: "Untouchable.",
        stats: { str: 5, vit: 10, int: 15 },
        skills: ["abyssal_shield", "haunting", "soul_siphon"],
        passivePool: ["ethereal", "iron_will", "regenerator"],
        sprite: `<span class="pixel-sprite sprite-class-phantom">
🛡️👻🛡️
 ░▓░
 ▓▓▓
 ░░░</span>`
      }
    ],
    // TIER 3 (Level 80)
    80: [
      {
        id: "phantom_ethereal",
        name: "Ethereal Lord",
        desc: "Pure Magic Energy.",
        stats: { str: 0, vit: 10, int: 50 },
        skills: ["void_slash", "death_bolt", "ice_shard"],
        passivePool: ["mana_leech", "grim_harvest", "glass_cannon"],
        sprite: `<span class="pixel-sprite sprite-class-phantom">
✨
👻
▓▓▓
░░░</span>`
      },
      {
        id: "phantom_nightmare",
        name: "Living Nightmare",
        desc: "Terror Incarnate.",
        stats: { str: 20, vit: 10, int: 30 },
        skills: ["terror", "hex", "soul_cleave"],
        passivePool: ["shadow_arts", "lucky_strike", "executioner"],
        sprite: `<span class="pixel-sprite sprite-class-phantom">
👿
👻
▓▓▓
░░░</span>`
      },
      {
        id: "phantom_null",
        name: "The Void",
        desc: "Existence Erasure.",
        stats: { str: 10, vit: 20, int: 30 },
        skills: ["void_slash", "phase_strike", "vanish"],
        passivePool: ["intangible", "swift_foot", "ethereal"],
        sprite: `<span class="pixel-sprite sprite-class-phantom">
🕳️
👻
▓▓▓
░░░</span>`
      }
    ]
  },

  vampire: {
    // TIER 1 (Lv 20)
    20: [
      { id: "vamp_lord", name: "Vampire Lord", desc: "Leadership & Strength", stats: { str: 6, vit: 4, int: 2 }, sprite: `<span class="pixel-sprite sprite-class-vampire">👑🧛</span>`, skills: ["smash", "blood_drain", "frenzy"], passivePool: ["vampirism", "thick_skin", "blood_fueled"] },
      { id: "vamp_beast", name: "Feral Vampire", desc: "Speed & Multi-hit", stats: { str: 4, vit: 4, int: 4 }, sprite: `<span class="pixel-sprite sprite-class-vampire">🐺🧛</span>`, skills: ["bat_swarm", "rend", "vanish"], passivePool: ["swift_foot", "scavenger", "blood_frenzy"] },
      { id: "vamp_mage", name: "Blood Mage", desc: "Magic Lifesteal", stats: { str: 2, vit: 2, int: 8 }, sprite: `<span class="pixel-sprite sprite-class-vampire">🩸🧛</span>`, skills: ["blood_drain", "hex", "fireball"], passivePool: ["mana_leech", "grim_harvest", "magic_barrier"] }
    ],
    // TIER 2 (Lv 50)
    50: [
      { id: "vamp_ancient", name: "Ancient Vampire", desc: "Timeless Power", stats: { str: 10, vit: 10, int: 10 }, sprite: `<span class="pixel-sprite sprite-class-vampire">📜🧛</span>`, skills: ["soul_cleave", "blood_drain", "terror"], passivePool: ["vampirism", "iron_will", "regenerator"] },
      { id: "vamp_night", name: "Night Stalker", desc: "Shadow & Stealth", stats: { str: 8, vit: 6, int: 16 }, sprite: `<span class="pixel-sprite sprite-class-vampire">🌑🧛</span>`, skills: ["vanish", "backstab", "shadow_shuriken"], passivePool: ["shadow_arts", "lucky_strike", "executioner"] },
      { id: "vamp_count", name: "Blood Count", desc: "Ruler of the Night", stats: { str: 12, vit: 12, int: 6 }, sprite: `<span class="pixel-sprite sprite-class-vampire">🏰🧛</span>`, skills: ["summon_skeleton", "blood_drain", "abyssal_shield"], passivePool: ["phylactery", "undead_mastery", "blood_fueled"] }
    ],
    // TIER 3 (Lv 80)
    80: [
      { id: "vamp_dracula", name: "True Dracula", desc: "King of Vampires", stats: { str: 25, vit: 25, int: 25 }, sprite: `<span class="pixel-sprite sprite-class-vampire">🐲🧛</span>`, skills: ["soul_cleave", "bat_swarm", "void_slash"], passivePool: ["god_of_blood", "vampirism", "undying"] },
      { id: "vamp_nosferatu", name: "Nosferatu", desc: "Eternal Hunger", stats: { str: 20, vit: 30, int: 20 }, sprite: `<span class="pixel-sprite sprite-class-vampire">🧟🧛</span>`, skills: ["cannibalize", "blood_drain", "plague_ward"], passivePool: ["regenerator", "thick_skin", "vampirism"] },
      { id: "vamp_god", name: "Blood God", desc: "Divine Power", stats: { str: 30, vit: 30, int: 30 }, sprite: `<span class="pixel-sprite sprite-class-vampire">🩸🤴</span>`, skills: ["void_slash", "soul_cleave", "cursed_mending"], passivePool: ["intangible", "magic_barrier", "iron_will"] }
    ]
  },

  lich: {
    // TIER 1 (Lv 20)
    20: [
      { id: "lich_necro", name: "Necromancer", desc: "Summoner Focus", stats: { str: 0, vit: 4, int: 8 }, sprite: `<span class="pixel-sprite sprite-class-lich">💀🧙</span>`, skills: ["summon_skeleton", "hex", "death_bolt"], passivePool: ["undead_mastery", "mana_leech", "scavenger"] },
      { id: "lich_frost", name: "Frost Lich", desc: "Ice Magic Focus", stats: { str: 0, vit: 2, int: 10 }, sprite: `<span class="pixel-sprite sprite-class-lich">❄️🧙</span>`, skills: ["ice_shard", "abyssal_shield", "phase_strike"], passivePool: ["glass_cannon", "grim_harvest", "magic_barrier"] },
      { id: "lich_bone", name: "Bone Master", desc: "Bone Magic Focus", stats: { str: 4, vit: 4, int: 4 }, sprite: `<span class="pixel-sprite sprite-class-lich">🦴🧙</span>`, skills: ["bone_throw", "shield_bash", "plague_ward"], passivePool: ["thick_skin", "reflect", "stone_skin"] }
    ],
    // TIER 2 (Lv 50)
    50: [
      { id: "lich_king", name: "Lich King", desc: "Command the dead", stats: { str: 10, vit: 15, int: 15 }, sprite: `<span class="pixel-sprite sprite-class-lich">👑💀</span>`, skills: ["summon_skeleton", "terror", "soul_harvest"], passivePool: ["undead_mastery", "phylactery", "iron_will"] },
      { id: "lich_kel", name: "Kel'Thuzad", desc: "Arch-Lich Power", stats: { str: 5, vit: 5, int: 30 }, sprite: `<span class="pixel-sprite sprite-class-lich">❄️👑</span>`, skills: ["ice_shard", "void_slash", "hex"], passivePool: ["grim_harvest", "soul_siphon", "glass_cannon"] },
      { id: "lich_elder", name: "Elder Lich", desc: "Ancient Knowledge", stats: { str: 0, vit: 10, int: 30 }, sprite: `<span class="pixel-sprite sprite-class-lich">📚💀</span>`, skills: ["death_bolt", "fireball", "cursed_mending"], passivePool: ["mana_leech", "magic_barrier", "regenerator"] }
    ],
    // TIER 3 (Lv 80)
    80: [
      { id: "lich_god", name: "God of Death", desc: "Absolute End", stats: { str: 20, vit: 20, int: 60 }, sprite: `<span class="pixel-sprite sprite-class-lich">🪐💀</span>`, skills: ["void_slash", "soul_harvest", "terror"], passivePool: ["god_of_death", "grim_harvest", "soul_siphon"] },
      { id: "lich_void", name: "Void Lich", desc: "Emptiness", stats: { str: 10, vit: 10, int: 80 }, sprite: `<span class="pixel-sprite sprite-class-lich">🕳️💀</span>`, skills: ["void_slash", "phase_strike", "vanish"], passivePool: ["intangible", "magic_barrier", "glass_cannon"] },
      { id: "lich_scourge", name: "The Scourge", desc: "Infinite Armies", stats: { str: 30, vit: 30, int: 40 }, sprite: `<span class="pixel-sprite sprite-class-lich">⚔️💀</span>`, skills: ["summon_skeleton", "plague_ward", "abyssal_shield"], passivePool: ["undead_mastery", "phylactery", "thorns"] }
    ]
  },

  wraith: {
    // TIER 1 (Lv 20)
    20: [
      { id: "wraith_void", name: "Void Walker", desc: "Phase Master", stats: { str: 2, vit: 2, int: 8 }, sprite: `<span class="pixel-sprite sprite-class-wraith">🌌👻</span>`, skills: ["phase_strike", "vanish", "night_veil"], passivePool: ["intangible", "ethereal", "swift_foot"] },
      { id: "wraith_blade", name: "Spectral Blade", desc: "Melee Ghost", stats: { str: 8, vit: 2, int: 2 }, sprite: `<span class="pixel-sprite sprite-class-wraith">🗡️👻</span>`, skills: ["phase_strike", "rend", "shadow_shuriken"], passivePool: ["blood_frenzy", "lucky_strike", "executioner"] },
      { id: "wraith_haunt", name: "Poltergeist", desc: "Debuff Focus", stats: { str: 2, vit: 6, int: 4 }, sprite: `<span class="pixel-sprite sprite-class-wraith">🏚️👻</span>`, skills: ["haunting", "hex", "terror"], passivePool: ["thorns", "magic_barrier", "regenerator"] }
    ],
    // TIER 2 (Lv 50)
    50: [
      { id: "wraith_assassin", name: "Phase Assassin", desc: "Cannot be hit", stats: { str: 15, vit: 5, int: 10 }, sprite: `<span class="pixel-sprite sprite-class-wraith">🐱‍👤👻</span>`, skills: ["shadow_shuriken", "backstab", "vanish"], passivePool: ["shadow_arts", "swift_foot", "intangible"] },
      { id: "wraith_lord", name: "Wraith Lord", desc: "Ruler of Shadows", stats: { str: 10, vit: 10, int: 10 }, sprite: `<span class="pixel-sprite sprite-class-wraith">👑👻</span>`, skills: ["terror", "soul_siphon", "void_slash"], passivePool: ["soul_siphon", "magic_barrier", "undying"] },
      { id: "wraith_horror", name: "Eldritch Horror", desc: "Sanity Damage", stats: { str: 5, vit: 5, int: 20 }, sprite: `<span class="pixel-sprite sprite-class-wraith">🦑👻</span>`, skills: ["hex", "haunting", "cursed_mending"], passivePool: ["thorns", "rot_touch", "regenerator"] }
    ],
    // TIER 3 (Lv 80)
    80: [
      { id: "wraith_entropy", name: "Entropy", desc: "Universal Decay", stats: { str: 20, vit: 20, int: 60 }, sprite: `<span class="pixel-sprite sprite-class-wraith">⚛️👻</span>`, skills: ["void_slash", "hex", "death_bolt"], passivePool: ["god_of_void", "soul_siphon", "glass_cannon"] },
      { id: "wraith_oblivion", name: "Oblivion", desc: "Total Nothingness", stats: { str: 60, vit: 0, int: 40 }, sprite: `<span class="pixel-sprite sprite-class-wraith">🚫👻</span>`, skills: ["soul_cleave", "void_slash", "vanish"], passivePool: ["intangible", "executioner", "lucky_strike"] },
      { id: "wraith_phantom", name: "Phantom god", desc: "Ghost God", stats: { str: 40, vit: 40, int: 20 }, sprite: `<span class="pixel-sprite sprite-class-wraith">⛪👻</span>`, skills: ["phase_strike", "backstab", "shadow_shuriken"], passivePool: ["shadow_arts", "swift_foot", "ethereal"] }
    ]
  },



  dark_knight: {
    // TIER 1 (Lv 20)
    20: [
      { id: "dk_chaos", name: "Chaos Knight", desc: "Unpredictable Dmg", stats: { str: 6, vit: 4, int: 4 }, sprite: `<span class="pixel-sprite sprite-class-dk">⚔️👿</span>`, skills: ["smash", "void_slash", "frenzy"], passivePool: ["lucky_strike", "thorns", "blood_frenzy"] },
      { id: "dk_abyss", name: "Abyssal Guard", desc: "Tanky Magic", stats: { str: 4, vit: 8, int: 2 }, sprite: `<span class="pixel-sprite sprite-class-dk">🛡️👿</span>`, skills: ["abyssal_shield", "shield_bash", "plague_ward"], passivePool: ["thick_skin", "magic_barrier", "iron_will"] },
      { id: "dk_doom", name: "Doom Bringer", desc: "Execute Low HP", stats: { str: 8, vit: 2, int: 4 }, sprite: `<span class="pixel-sprite sprite-class-dk">☠️👿</span>`, skills: ["soul_cleave", "rend", "terror"], passivePool: ["executioner", "blood_fueled", "scavenger"] }
    ],
    // TIER 2 (Lv 50)
    50: [
      { id: "dk_hell", name: "Hell Knight", desc: "Fire & Chaos", stats: { str: 15, vit: 10, int: 10 }, sprite: `<span class="pixel-sprite sprite-class-dk">🔥👿</span>`, skills: ["fireball", "void_slash", "abyssal_shield"], passivePool: ["thorns", "glass_cannon", "blood_frenzy"] },
      { id: "dk_void", name: "Void Sentinel", desc: "Phasing Tank", stats: { str: 10, vit: 20, int: 5 }, sprite: `<span class="pixel-sprite sprite-class-dk">🌌👿</span>`, skills: ["phase_strike", "abyssal_shield", "soul_siphon"], passivePool: ["intangible", "magic_barrier", "regenerator"] },
      { id: "dk_death", name: "Death Herald", desc: "Pure Dmg", stats: { str: 20, vit: 5, int: 10 }, sprite: `<span class="pixel-sprite sprite-class-dk">🐎👿</span>`, skills: ["soul_cleave", "void_slash", "cursed_mending"], passivePool: ["executioner", "lucky_strike", "god_of_war"] }
    ],
    // TIER 3 (Lv 80)
    80: [
      { id: "dk_archon", name: "Chaos Archon", desc: "Lord of Chaos", stats: { str: 40, vit: 20, int: 20 }, sprite: `<span class="pixel-sprite sprite-class-dk">👑👿</span>`, skills: ["void_slash", "frenzy", "soul_cleave"], passivePool: ["blood_frenzy", "lucky_strike", "thorns"] },
      { id: "dk_champion", name: "Abyssal Champion", desc: "Unbreakable", stats: { str: 20, vit: 50, int: 10 }, sprite: `<span class="pixel-sprite sprite-class-dk">🏆👿</span>`, skills: ["abyssal_shield", "plague_ward", "cannibalize"], passivePool: ["thick_skin", "iron_will", "regenerator"] },
      { id: "dk_lord", name: "Doom Lord", desc: "The End", stats: { str: 50, vit: 10, int: 20 }, sprite: `<span class="pixel-sprite sprite-class-dk">🪐👿</span>`, skills: ["soul_cleave", "void_slash", "death_bolt"], passivePool: ["executioner", "blood_fueled", "vampirism"] }
    ]
  },

  necro_priest: {
    // TIER 1 (Lv 20)
    20: [
      { id: "priest_cult", name: "Cultist", desc: "Heal & Curse", stats: { str: 2, vit: 6, int: 6 }, sprite: `<span class="pixel-sprite sprite-class-priest">📿💀</span>`, skills: ["mend", "hex", "bone_throw"], passivePool: ["regenerator", "mana_leech", "rot_touch"] },
      { id: "priest_heal", name: "Dark Healer", desc: "Sustain Focus", stats: { str: 0, vit: 8, int: 6 }, sprite: `<span class="pixel-sprite sprite-class-priest">🩺💀</span>`, skills: ["cursed_mending", "plague_ward", "shield_bash"], passivePool: ["magic_barrier", "thick_skin", "phylactery"] },
      { id: "priest_shadow", name: "Shadow Priest", desc: "Damage Focus", stats: { str: 0, vit: 4, int: 10 }, sprite: `<span class="pixel-sprite sprite-class-priest">🌑💀</span>`, skills: ["terror", "death_bolt", "ice_shard"], passivePool: ["glass_cannon", "grim_harvest", "shadow_arts"] }
    ],
    // TIER 2 (Lv 50)
    50: [
      { id: "priest_high", name: "High Priest", desc: "Leader of Cult", stats: { str: 5, vit: 15, int: 15 }, sprite: `<span class="pixel-sprite sprite-class-priest">🎩💀</span>`, skills: ["cursed_mending", "summon_skeleton", "frenzy"], passivePool: ["undead_mastery", "regenerator", "phylactery"] },
      { id: "priest_prophet", name: "Doom Prophet", desc: "Foretell Death", stats: { str: 5, vit: 10, int: 20 }, sprite: `<span class="pixel-sprite sprite-class-priest">📜💀</span>`, skills: ["terror", "hex", "soul_harvest"], passivePool: ["lucky_strike", "executioner", "soul_siphon"] },
      { id: "priest_bishop", name: "Cardinal Sin", desc: "Unholy Power", stats: { str: 10, vit: 20, int: 5 }, sprite: `<span class="pixel-sprite sprite-class-priest">✝️💀</span>`, skills: ["abyssal_shield", "plague_ward", "mend"], passivePool: ["iron_will", "thorns", "stone_skin"] }
    ],
    // TIER 3 (Lv 80)
    80: [
      { id: "priest_pope", name: "Black Pope", desc: "Avatar of Sin", stats: { str: 10, vit: 30, int: 40 }, sprite: `<span class="pixel-sprite sprite-class-priest">⛪💀</span>`, skills: ["summon_skeleton", "cursed_mending", "void_slash"], passivePool: ["god_of_death", "regenerator", "magic_barrier"] },
      { id: "priest_saint", name: "Fallen Saint", desc: "Corrupted Light", stats: { str: 20, vit: 40, int: 20 }, sprite: `<span class="pixel-sprite sprite-class-priest">👼💀</span>`, skills: ["abyssal_shield", "soul_cleave", "mend"], passivePool: ["undying", "thick_skin", "phylactery"] },
      { id: "priest_deity", name: "Old God", desc: "Beyond Worship", stats: { str: 10, vit: 10, int: 60 }, sprite: `<span class="pixel-sprite sprite-class-priest">🦑💀</span>`, skills: ["hex", "terror", "soul_harvest"], passivePool: ["soul_siphon", "grim_harvest", "intangible"] }
    ]
  },

  shadow_assassin: {
    // TIER 1 (Lv 20)
    20: [
      { id: "sin_ninja", name: "Bone Ninja", desc: "Speed & Shurikens", stats: { str: 4, vit: 2, int: 6 }, sprite: `<span class="pixel-sprite sprite-class-sin">🥷💀</span>`, skills: ["shadow_shuriken", "vanish", "bone_throw"], passivePool: ["swift_foot", "dodge", "lucky_strike"] },
      { id: "sin_rogue", name: "Rogue", desc: "Backstabber", stats: { str: 6, vit: 4, int: 2 }, sprite: `<span class="pixel-sprite sprite-class-sin">🗡️💀</span>`, skills: ["backstab", "rend", "vanish"], passivePool: ["executioner", "scavenger", "shadow_arts"] },
      { id: "sin_stalker", name: "Stalker", desc: "Tracking Prey", stats: { str: 4, vit: 4, int: 4 }, sprite: `<span class="pixel-sprite sprite-class-sin">👀💀</span>`, skills: ["phase_strike", "terror", "hex"], passivePool: ["scavenger", "treasure_hunter", "blood_frenzy"] }
    ],
    // TIER 2 (Lv 50)
    50: [
      { id: "sin_master", name: "Shadow Master", desc: "Unseen Death", stats: { str: 15, vit: 5, int: 15 }, sprite: `<span class="pixel-sprite sprite-class-sin">🎓💀</span>`, skills: ["shadow_shuriken", "vanish", "void_slash"], passivePool: ["shadow_arts", "intangible", "assassination"] },
      { id: "sin_shadow", name: "Living Shadow", desc: "Become Darkness", stats: { str: 10, vit: 10, int: 15 }, sprite: `<span class="pixel-sprite sprite-class-sin">🌑💀</span>`, skills: ["phase_strike", "abyssal_shield", "terror"], passivePool: ["ethereal", "magic_barrier", "soul_siphon"] },
      { id: "sin_night", name: "Night Blade", desc: "Sharpest Edge", stats: { str: 25, vit: 5, int: 5 }, sprite: `<span class="pixel-sprite sprite-class-sin">🌙💀</span>`, skills: ["backstab", "soul_cleave", "rend"], passivePool: ["executioner", "lucky_strike", "blood_frenzy"] }
    ],
    // TIER 3 (Lv 80)
    80: [
      { id: "sin_god", name: "God of Shadows", desc: "One with Dark", stats: { str: 30, vit: 20, int: 30 }, sprite: `<span class="pixel-sprite sprite-class-sin">👥💀</span>`, skills: ["void_slash", "shadow_shuriken", "phase_strike"], passivePool: ["intangible", "shadow_arts", "god_of_death"] },
      { id: "sin_void", name: "Void Walker", desc: "Where am I?", stats: { str: 20, vit: 20, int: 40 }, sprite: `<span class="pixel-sprite sprite-class-sin">🕳️💀</span>`, skills: ["vanish", "abyssal_shield", "soul_harvest"], passivePool: ["ethereal", "swift_foot", "mana_leech"] },
      { id: "sin_death", name: "Angel of Death", desc: "Instant Kill", stats: { str: 50, vit: 10, int: 20 }, sprite: `<span class="pixel-sprite sprite-class-sin">👼💀</span>`, skills: ["soul_cleave", "backstab", "terror"], passivePool: ["executioner", "lucky_strike", "glass_cannon"] }
    ]
  },

  // ============================
  // v35.0 TRAITOR CLASS EVOLUTIONS
  // ============================

  paladin: {
    // TIER 1 (Lv 20)
    20: [
        { id: "pal_crusader", name: "Crusader", desc: "Holy Warrior", stats: { str: 6, vit: 6, int: 4 }, sprite: `<span class="pixel-sprite">⚔️🛡️</span>`, skills: ["smash", "judgement", "shield_bash"], passivePool: ["divine_aura", "thick_skin", "smite_master"] },
        { id: "pal_guardian", name: "Guardian", desc: "Unbreakable Wall", stats: { str: 2, vit: 10, int: 4 }, sprite: `<span class="pixel-sprite">🛡️🧱</span>`, skills: ["divine_shield", "shield_bash", "mend"], passivePool: ["divine_aura", "retribution", "thorns"] },
        { id: "pal_cleric", name: "Cleric", desc: "Battle Healer", stats: { str: 2, vit: 6, int: 8 }, sprite: `<span class="pixel-sprite">🩹✨</span>`, skills: ["consecrate", "mend", "judgement"], passivePool: ["nature_touch", "mana_leech", "int_boost"] }
    ],
    // TIER 2 (Lv 50)
    50: [
        { id: "pal_templar", name: "Templar", desc: "Wrath of God", stats: { str: 10, vit: 10, int: 10 }, sprite: `<span class="pixel-sprite">🏰⚔️</span>`, skills: ["judgement", "soul_cleave", "frenzy"], passivePool: ["god_of_war", "executioner", "divine_aura"] },
        { id: "pal_justicar", name: "Justicar", desc: "Lawbringer", stats: { str: 15, vit: 10, int: 5 }, sprite: `<span class="pixel-sprite">⚖️🔨</span>`, skills: ["executing_strike", "shield_bash", "terror"], passivePool: ["retribution", "thorns_aura", "justice"] },
        { id: "pal_saint", name: "Living Saint", desc: "Holy Avatar", stats: { str: 5, vit: 15, int: 20 }, sprite: `<span class="pixel-sprite">👼✨</span>`, skills: ["divine_shield", "consecrate", "revive"], passivePool: ["undying", "phylactery", "pure_heart"] }
    ],
    // TIER 3 (Lv 80)
    80: [
        { id: "pal_god", name: "God of Light", desc: "The Sun Itself", stats: { str: 30, vit: 30, int: 30 }, sprite: `<span class="pixel-sprite">☀️👑</span>`, skills: ["judgement", "supernova", "divine_shield"], passivePool: ["god_of_light", "invincible", "retribution"] },
        { id: "pal_aegis", name: "Aegis", desc: "Indestructible", stats: { str: 10, vit: 60, int: 10 }, sprite: `<span class="pixel-sprite">🛡️♾️</span>`, skills: ["divine_shield", "abyssal_shield", "reflect_all"], passivePool: ["thorns_aura", "iron_will", "titan_skin"] },
        { id: "pal_judge", name: "Supreme Judge", desc: "Final Verdict", stats: { str: 50, vit: 20, int: 10 }, sprite: `<span class="pixel-sprite">👨‍⚖️⚡</span>`, skills: ["executing_strike", "soul_harvest", "void_slash"], passivePool: ["executioner", "lucky_strike", "truth"] }
    ]
  },

  druid: {
    // TIER 1 (Lv 20)
    20: [
        { id: "dru_bear", name: "Bear Form", desc: "Tank Transformation", stats: { str: 5, vit: 10, int: 0 }, sprite: `<span class="pixel-sprite">🐻</span>`, skills: ["bear_form", "smash", "cannibalize"], passivePool: ["thick_skin", "regenerator", "nature_touch"] },
        { id: "dru_wolf", name: "Wolf Form", desc: "DPS Transformation", stats: { str: 8, vit: 4, int: 2 }, sprite: `<span class="pixel-sprite">🐺</span>`, skills: ["rend", "frenzy", "bite"], passivePool: ["swift_foot", "lucky_strike", "blood_frenzy"] },
        { id: "dru_tree", name: "Treekin", desc: "Rooted Support", stats: { str: 2, vit: 8, int: 8 }, sprite: `<span class="pixel-sprite">🌳</span>`, skills: ["entangle", "regrowth", "thorns"], passivePool: ["thorns_aura", "nature_touch", "photosynthesis"] }
    ],
    // TIER 2 (Lv 50)
    50: [
        { id: "dru_behemoth", name: "Behemoth", desc: "Giant Beast", stats: { str: 20, vit: 20, int: 5 }, sprite: `<span class="pixel-sprite">🐘</span>`, skills: ["bear_form", "stomp", "earthquake"], passivePool: ["iron_will", "thick_skin", "rage_meter"] },
        { id: "dru_stalker", name: "Night Stalker", desc: "Invisible Hunter", stats: { str: 25, vit: 5, int: 5 }, sprite: `<span class="pixel-sprite">🐆</span>`, skills: ["vanish", "backstab", "executing_strike"], passivePool: ["shadow_arts", "assassination", "scavenger"] },
        { id: "dru_ancient", name: "Ancient Treant", desc: "Forest Lord", stats: { str: 5, vit: 20, int: 20 }, sprite: `<span class="pixel-sprite">🌲👑</span>`, skills: ["entangle", "consecrate", "summon_treant"], passivePool: ["regrowth", "thorns_aura", "wisdom"] }
    ],
    // TIER 3 (Lv 80)
    80: [
        { id: "dru_gaia", name: "Gaia's Avatar", desc: "Nature Incarnate", stats: { str: 30, vit: 40, int: 30 }, sprite: `<span class="pixel-sprite">🌍</span>`, skills: ["earthquake", "tsunami", "rebirth"], passivePool: ["god_of_nature", "immortal", "nature_touch"] },
        { id: "dru_fenrir", name: "Fenrir", desc: "World Eater", stats: { str: 60, vit: 20, int: 10 }, sprite: `<span class="pixel-sprite">🌖🐺</span>`, skills: ["devour", "executing_strike", "howl"], passivePool: ["god_of_war", "blood_frenzy", "scavenger_pro"] },
        { id: "dru_storm", name: "Storm Crow", desc: "Weather Master", stats: { str: 10, vit: 10, int: 60 }, sprite: `<span class="pixel-sprite">⛈️🐦</span>`, skills: ["lighting_storm", "whirlwind", "flight"], passivePool: ["swift_foot", "dodge_master", "static"] }
    ]
  },

  berserker: {
    // TIER 1 (Lv 20)
    20: [
        { id: "ber_barbarian", name: "Barbarian", desc: "Raw Strength", stats: { str: 10, vit: 5, int: 0 }, sprite: `<span class="pixel-sprite">🏋️</span>`, skills: ["smash", "whirlwind", "shout"], passivePool: ["rage_meter", "strong_arm", "thick_skin"] },
        { id: "ber_slayer", name: "Slayer", desc: "Kill Speed", stats: { str: 12, vit: 2, int: 0 }, sprite: `<span class="pixel-sprite">👺</span>`, skills: ["rend", "executing_strike", "frenzy"], passivePool: ["lucky_strike", "executioner", "blood_frenzy"] },
        { id: "ber_viking", name: "Viking", desc: "Durable Fighter", stats: { str: 8, vit: 8, int: 0 }, sprite: `<span class="pixel-sprite">🛶</span>`, skills: ["shield_bash", "whirlwind", "battle_cry"], passivePool: ["scavenger", "iron_will", "undying"] }
    ],
    // TIER 2 (Lv 50)
    50: [
        { id: "ber_chieftain", name: "Chieftain", desc: "War Leader", stats: { str: 20, vit: 15, int: 5 }, sprite: `<span class="pixel-sprite">⛺👑</span>`, skills: ["enrage", "rally", "whirlwind"], passivePool: ["leadership", "rage_meter", "god_of_war"] },
        { id: "ber_destroyer", name: "Destroyer", desc: "Armor Breaker", stats: { str: 30, vit: 5, int: 0 }, sprite: `<span class="pixel-sprite">🔨💥</span>`, skills: ["sunder", "executing_strike", "ground_slam"], passivePool: ["ignore_def", "crit_dmg", "blood_fueled"] },
        { id: "ber_juggernaut", name: "Juggernaut", desc: "Unstoppable", stats: { str: 15, vit: 25, int: 0 }, sprite: `<span class="pixel-sprite">🚂</span>`, skills: ["charge", "iron_skin", "whirlwind"], passivePool: ["immune_cc", "thick_skin", "thorns_aura"] }
    ],
    // TIER 3 (Lv 80)
    80: [
        { id: "ber_kratos", name: "God of War", desc: "Spartan Rage", stats: { str: 70, vit: 20, int: 0 }, sprite: `<span class="pixel-sprite">😡⛓️</span>`, skills: ["god_smash", "blade_storm", "revive"], passivePool: ["god_of_war", "undying_rage", "blood_frenzy"] },
        { id: "ber_asura", name: "Asura", desc: "Six Arms", stats: { str: 50, vit: 30, int: 10 }, sprite: `<span class="pixel-sprite">👐👹</span>`, skills: ["flurry", "hundred_fists", "meditate"], passivePool: ["multi_hit", "counter_attack", "zen"] },
        { id: "ber_titan", name: "Titan", desc: "World Breaker", stats: { str: 40, vit: 50, int: 0 }, sprite: `<span class="pixel-sprite">🌋</span>`, skills: ["meteor", "fissure", "roar"], passivePool: ["titan_grip", "colossal", "intimidate"] }
    ]
  },

  mechanist: {
    // TIER 1 (Lv 20)
    20: [
        { id: "mech_gunner", name: "Gunner", desc: "Ranged DPS", stats: { str: 4, vit: 4, int: 8 }, sprite: `<span class="pixel-sprite">🔫</span>`, skills: ["rocket_salvo", "aimed_shot", "reload"], passivePool: ["eagle_eye", "lucky_strike", "quick_hands"] },
        { id: "mech_tinker", name: "Tinkerer", desc: "Utility & Buffs", stats: { str: 2, vit: 4, int: 10 }, sprite: `<span class="pixel-sprite">🔧</span>`, skills: ["overclock", "repair", "flashbang"], passivePool: ["scavenger_pro", "greed", "invention"] },
        { id: "mech_eng", name: "Engineer", desc: "Turrets", stats: { str: 2, vit: 6, int: 8 }, sprite: `<span class="pixel-sprite">🏗️</span>`, skills: ["deploy_turret", "fortify", "wrench_whack"], passivePool: ["automated_defense", "metal_plating", "builder"] }
    ],
    // TIER 2 (Lv 50)
    50: [
        { id: "mech_sniper", name: "Deadeye", desc: "One Shot", stats: { str: 5, vit: 5, int: 25 }, sprite: `<span class="pixel-sprite">🎯</span>`, skills: ["headshot", "vanish", "rocket_salvo"], passivePool: ["glass_cannon", "assassination", "eagle_eye"] },
        { id: "mech_pilot", name: "Mech Pilot", desc: "Robo Suit", stats: { str: 10, vit: 15, int: 15 }, sprite: `<span class="pixel-sprite">🤖</span>`, skills: ["missile_barrage", "flamethrower", "eject"], passivePool: ["iron_will", "battery", "armor_clad"] },
        { id: "mech_alchemist", name: "Mad Scientist", desc: "Potions & Bombs", stats: { str: 2, vit: 10, int: 25 }, sprite: `<span class="pixel-sprite">🧪💥</span>`, skills: ["acid_bomb", "elixir", "transmute"], passivePool: ["poison_master", "gold_alchemy", "madness"] }
    ],
    // TIER 3 (Lv 80)
    80: [
        { id: "mech_nova", name: "Nova Core", desc: "Energy Being", stats: { str: 10, vit: 20, int: 60 }, sprite: `<span class="pixel-sprite">⚛️</span>`, skills: ["laser_beam", "black_hole", "overclock"], passivePool: ["infinite_energy", "shield_gen", "zap"] },
        { id: "mech_tank", name: "Walking Tank", desc: "Heavy Artillery", stats: { str: 30, vit: 50, int: 10 }, sprite: `<span class="pixel-sprite">🚜💣</span>`, skills: ["nuke", "bunker", "artillery"], passivePool: ["thick_skin", "impenetrable", "explosive"] },
        { id: "mech_cyber", name: "Cyber God", desc: "Digital Ascendancy", stats: { str: 20, vit: 20, int: 50 }, sprite: `<span class="pixel-sprite">💾👑</span>`, skills: ["hack", "download", "glitch"], passivePool: ["dodge_code", "rewrite", "upload"] }
    ]
  }
};

export { EVOLUTIONS, CLASS_TREES };
