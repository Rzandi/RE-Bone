/* =========================================
   EVOLUTION SYSTEM (v30.0)
   Power spikes at Level 5 and 10
   ========================================= */

const EVOLUTIONS = {
  // Level 10 Options (Tier 1) - Stat Multipliers / Utility
  10: [
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
    },
    // v38.4: AGI and LUCK evolutions
    {
      id: "evo_agi",
      name: "Quick Feet",
      desc: "AGI +3 (Base)",
      effect: { type: "add_base", stat: "AGI", val: 3 }
    },
    {
      id: "evo_luck",
      name: "Fortune's Favor",
      desc: "LUCK +3 (Base)",
      effect: { type: "add_base", stat: "LCK", val: 3 }
    }
  ],

  // Level 20 Options (Tier 2) - Combat Mastery
  20: [
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
    // TIER 1 (Level 30) - v38.3: +30% stats, requirements, uniquePassive
    30: [
      {
        id: "skel_warrior",
        name: "Skeleton Warrior",
        desc: "Melee Specialist. High STR/VIT. +Unique Passive",
        requirements: { str: 20, vit: 15 },
        stats: { str: 7, vit: 7, int: 0, agi: 1, luck: 1 }, // v38.4: Added AGI/LUCK
        skills: ["smash", "shield_bash", "frenzy"],
        passivePool: ["thick_skin", "blood_fueled", "undying"],
        uniquePassive: "berserker_rage",
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
        desc: "Ranged Specialist. Balanced. +Unique Passive",
        requirements: { str: 10, vit: 10, int: 15, agi: 10 }, // v38.4: Added AGI req
        stats: { str: 4, vit: 4, int: 5, agi: 3, luck: 2 }, // v38.4: Added AGI/LUCK
        skills: ["bone_throw", "vanish", "fireball"],
        passivePool: ["scavenger", "shadow_arts", "intangible"],
        uniquePassive: "eagle_eye",
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
        desc: "Magic Specialist. High INT. +Unique Passive",
        requirements: { int: 25 },
        stats: { str: 1, vit: 3, int: 9, agi: 1, luck: 3 }, // v38.4: Added AGI/LUCK
        skills: ["fireball", "ice_shard", "terror"],
        passivePool: ["mana_leech", "grim_harvest", "ethereal"],
        uniquePassive: "arcane_mastery",
        sprite: `<span class="pixel-sprite sprite-class-skeleton">
 🔮
▓▓▓
▓░▓░▓
 ▓▓▓
▓ ▓</span>`
      }
    ],

    // TIER 2 (Level 60) - v38.3: +30% stats, requirements, uniquePassive
    60: [
      {
        id: "skel_knight",
        name: "Death Knight",
        desc: "Tank. Massive Defense. +Unique Passive",
        requirements: { str: 40, vit: 50 },
        stats: { str: 13, vit: 20, int: 7 }, // v38.3: +30% from 10/15/5
        skills: ["void_slash", "abyssal_shield", "soul_siphon"],
        passivePool: ["iron_will", "thorns", "undying"],
        uniquePassive: "death_grip",
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
        desc: "High Crit & Speed. +Unique Passive",
        requirements: { str: 35, int: 40, agi: 25 }, // v38.4: Added AGI req
        stats: { str: 10, vit: 10, int: 18, agi: 8, luck: 3 }, // v38.4: High AGI path
        skills: ["backstab", "vanish", "shadow_shuriken"],
        passivePool: ["executioner", "lucky_strike", "swift_foot"],
        uniquePassive: "death_mark",
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
        desc: "Master of Spells. +Unique Passive",
        requirements: { int: 60 },
        stats: { str: 7, vit: 7, int: 26 }, // v38.3: +30% from 5/5/20
        skills: ["death_bolt", "hex", "soul_harvest"],
        passivePool: ["glass_cannon", "soul_siphon", "magic_barrier"],
        uniquePassive: "spell_echo",
        sprite: `<span class="pixel-sprite sprite-class-skeleton">
🔥💀❄️
 ▓▓▓
▓░▓░▓
 ▓▓▓
▓ ▓</span>`
      }
    ],

    // TIER 3 (Level 90) - v38.3: +30% stats, requirements, uniquePassive
    90: [
      {
        id: "skel_overlord",
        name: "Bone Overlord",
        desc: "Ruler of the Dead. Godlike STR. +Unique Passive",
        requirements: { str: 80, vit: 60 },
        stats: { str: 39, vit: 26, int: 13 }, // v38.3: +30% from 30/20/10
        skills: ["void_slash", "soul_cleave", "frenzy"],
        passivePool: ["god_of_war", "undying", "blood_frenzy"],
        uniquePassive: "army_of_dead",
        sprite: `<span class="pixel-sprite sprite-class-skeleton">
👑
💀
▓▓▓
▓ ▓</span>`
      },
      {
        id: "skel_reaper",
        name: "Grim Reaper",
        desc: "Harvester of Souls. Instant Kill Chance. +Unique Passive",
        requirements: { str: 50, int: 80 },
        stats: { str: 26, vit: 13, int: 39 }, // v38.3: +30% from 20/10/30
        skills: ["soul_harvest", "death_bolt", "terror"],
        passivePool: ["grim_harvest", "executioner", "intangible"],
        uniquePassive: "death_sentence",
        sprite: `<span class="pixel-sprite sprite-class-skeleton">
💀
👘
▓▓▓
▓ ▓</span>`
      },
      {
        id: "skel_demilich",
        name: "Demi-Lich",
        desc: "Ascended Caster. Infinite MP. +Unique Passive",
        requirements: { int: 100 },
        stats: { str: 7, vit: 20, int: 52 }, // v38.3: +30% from 5/15/40
        skills: ["void_slash", "soul_harvest", "hex"],
        passivePool: ["phylactery", "mana_leech", "ethereal"],
        uniquePassive: "infinite_mana",
        sprite: `<span class="pixel-sprite sprite-class-skeleton">
✨💀✨
 ▓▓▓
 ▓▓▓
 ▓ ▓</span>`
      }
    ]
  },
  
  ghoul: {
    // TIER 1 (Level 20) - v38.3: +30% stats, requirements, uniquePassive
    20: [
      {
        id: "ghoul_brute",
        name: "Ghoul Brute",
        desc: "Max HP & Defense focus. +Unique Passive",
        requirements: { vit: 25 },
        stats: { str: 5, vit: 10, int: 0 }, // +30%
        skills: ["smash", "shield_bash", "cannibalize"],
        passivePool: ["thick_skin", "regenerator", "stone_skin"],
        uniquePassive: "unstoppable",
        sprite: `<span class="pixel-sprite sprite-class-ghoul">
🛡️
🧟
▓▓▓
▓ ▓</span>`
      },
      {
        id: "ghoul_crawler",
        name: "Rot Crawler",
        desc: "Poison Specialist. +Unique Passive",
        requirements: { str: 15, int: 10, agi: 8 }, // v38.4: Added AGI
        stats: { str: 7, vit: 7, int: 4, agi: 3, luck: 1 }, // v38.4: Fast crawler
        skills: ["rend", "bone_throw", "plague_ward"],
        passivePool: ["rot_touch", "scavenger", "swift_foot"],
        uniquePassive: "toxic_blood",
        sprite: `<span class="pixel-sprite sprite-class-ghoul">
🤢
🧟
▓▓▓
▓ ▓</span>`
      },
      {
        id: "ghoul_devourer",
        name: "Flesh Devourer",
        desc: "Lifesteal focus. +Unique Passive",
        requirements: { str: 20, vit: 10, luck: 8 }, // v38.4: Added LUCK
        stats: { str: 9, vit: 5, int: 1, agi: 1, luck: 4 }, // v38.4: Lucky hunter
        skills: ["cannibalize", "rend", "blood_drain"],
        passivePool: ["vampirism", "blood_frenzy", "executioner"],
        uniquePassive: "endless_hunger",
        sprite: `<span class="pixel-sprite sprite-class-ghoul">
🍖
🧟
▓▓▓
▓ ▓</span>`
      }
    ],
    // TIER 2 (Level 50) - v38.3: +30% stats, requirements, uniquePassive
    50: [
      {
        id: "ghoul_abomination",
        name: "Abomination",
        desc: "Unstoppable Tank. +Unique Passive",
        requirements: { vit: 60, str: 30 },
        stats: { str: 13, vit: 26, int: 0 }, // +30%
        skills: ["shield_bash", "frenzy", "abyssal_shield"],
        passivePool: ["thick_skin", "iron_will", "thorns"],
        uniquePassive: "stitched_horror",
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
        desc: "Walking Disease. +Unique Passive",
        requirements: { vit: 40, int: 40 },
        stats: { str: 13, vit: 13, int: 13 }, // +30%
        skills: ["plague_ward", "hex", "terror"],
        passivePool: ["rot_touch", "magic_barrier", "regenerator"],
        uniquePassive: "pandemic",
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
        desc: "Insatiable Hunger. +Unique Passive",
        requirements: { str: 50, vit: 35 },
        stats: { str: 20, vit: 13, int: 7 }, // +30%
        skills: ["cannibalize", "blood_drain", "soul_cleave"],
        passivePool: ["vampirism", "blood_fueled", "undying"],
        uniquePassive: "consume_all",
        sprite: `<span class="pixel-sprite sprite-class-ghoul">
🩸🧟🩸
 ▓▓▓
▓░▓░▓
 ▓▓▓
▓ ▓</span>`
      }
    ],
    // TIER 3 (Level 80) - v38.3: +30% stats, requirements, uniquePassive
    80: [
      {
        id: "ghoul_behemoth",
        name: "Undying Behemoth",
        desc: "Immortal Titan. +Unique Passive",
        requirements: { vit: 100, str: 50 },
        stats: { str: 26, vit: 52, int: 0 }, // +30%
        skills: ["abyssal_shield", "smash", "void_slash"],
        passivePool: ["thick_skin", "iron_will", "phylactery"],
        uniquePassive: "mountain_flesh",
        sprite: `<span class="pixel-sprite sprite-class-ghoul">
🏔️
🧟
▓▓▓
▓ ▓</span>`
      },
      {
        id: "ghoul_pestilence",
        name: "Lord of Decay",
        desc: "Everything Rots. +Unique Passive",
        requirements: { vit: 60, int: 70 },
        stats: { str: 20, vit: 20, int: 39 }, // +30%
        skills: ["plague_ward", "hex", "cursed_mending"],
        passivePool: ["rot_touch", "magic_barrier", "regenerator"],
        uniquePassive: "god_of_rot",
        sprite: `<span class="pixel-sprite sprite-class-ghoul">
☠️
🧟
▓▓▓
▓ ▓</span>`
      },
      {
        id: "ghoul_ravenous",
        name: "Ravenous God",
        desc: "Consume The World. +Unique Passive",
        requirements: { str: 90, vit: 50 },
        stats: { str: 46, vit: 26, int: 7 }, // +30%
        skills: ["soul_cleave", "cannibalize", "void_slash"],
        passivePool: ["vampirism", "blood_frenzy", "executioner"],
        uniquePassive: "world_eater",
        sprite: `<span class="pixel-sprite sprite-class-ghoul">
🪐
👄
▓▓▓
▓ ▓</span>`
      }
    ]
  },

  phantom: {
    // TIER 1 (Level 20) - v38.3: +30% stats, requirements, uniquePassive
    20: [
      {
        id: "phantom_spirit",
        name: "Vengeful Spirit",
        desc: "High Magic Damage. +Unique Passive",
        requirements: { int: 22 },
        stats: { str: 0, vit: 3, int: 10 }, // +30%
        skills: ["ice_shard", "terror", "vanish"],
        passivePool: ["ethereal", "mana_leech", "glass_cannon"],
        uniquePassive: "spectral_wrath",
        sprite: `<span class="pixel-sprite sprite-class-phantom">
⚡👻⚡
 ░▓░
 ▓▓▓
 ░░░</span>`
      },
      {
        id: "phantom_shade",
        name: "Night Shade",
        desc: "Stealth & Crit. +Unique Passive",
        requirements: { str: 12, int: 15, agi: 12 }, // v38.4: Added AGI for stealth
        stats: { str: 5, vit: 3, int: 7, agi: 5, luck: 2 }, // v38.4: Stealthy
        skills: ["vanish", "shadow_shuriken", "backstab"],
        passivePool: ["shadow_arts", "swift_foot", "lucky_strike"],
        uniquePassive: "cloak_of_shadows",
        sprite: `<span class="pixel-sprite sprite-class-phantom">
🌑👻🌑
 ░▓░
 ▓▓▓
 ░░░</span>`
      },
      {
        id: "phantom_poltergeist",
        name: "Poltergeist",
        desc: "Evasion Tank. +Unique Passive",
        requirements: { vit: 15, int: 15, agi: 10 }, // v38.4: Added AGI for evasion
        stats: { str: 3, vit: 7, int: 7, agi: 4, luck: 1 }, // v38.4: Evasive
        skills: ["haunting", "terror", "phase_strike"],
        passivePool: ["intangible", "ethereal", "thorns"],
        uniquePassive: "telekinesis",
        sprite: `<span class="pixel-sprite sprite-class-phantom">
📦👻🪑
 ░▓░
 ▓▓▓
 ░░░</span>`
      }
    ],
    // TIER 2 (Level 50) - v38.3: +30% stats, requirements, uniquePassive
    50: [
      {
        id: "phantom_banshee",
        name: "Screaming Banshee",
        desc: "Sonic Magic Destruction. +Unique Passive",
        requirements: { int: 55 },
        stats: { str: 0, vit: 7, int: 26 }, // +30%
        skills: ["terror", "hex", "death_bolt"],
        passivePool: ["glass_cannon", "grim_harvest", "magic_barrier"],
        uniquePassive: "death_wail",
        sprite: `<span class="pixel-sprite sprite-class-phantom">
📢👻📢
 ░▓░
 ▓▓▓
 ░░░</span>`
      },
      {
        id: "phantom_specter",
        name: "Void Specter",
        desc: "Unseen Killer. +Unique Passive",
        requirements: { str: 35, int: 45 },
        stats: { str: 13, vit: 7, int: 20 }, // +30%
        skills: ["vanish", "phase_strike", "backstab"],
        passivePool: ["intangible", "shadow_arts", "executioner"],
        uniquePassive: "phase_assassin",
        sprite: `<span class="pixel-sprite sprite-class-phantom">
⚫👻⚫
 ░▓░
 ▓▓▓
 ░░░</span>`
      },
      {
        id: "phantom_wraith",
        name: "Dread Wraith",
        desc: "Untouchable. +Unique Passive",
        requirements: { vit: 40, int: 45 },
        stats: { str: 7, vit: 13, int: 20 }, // +30%
        skills: ["abyssal_shield", "haunting", "soul_siphon"],
        passivePool: ["ethereal", "iron_will", "regenerator"],
        uniquePassive: "dread_aura",
        sprite: `<span class="pixel-sprite sprite-class-phantom">
🛡️👻🛡️
 ░▓░
 ▓▓▓
 ░░░</span>`
      }
    ],
    // TIER 3 (Level 80) - v38.3: +30% stats, requirements, uniquePassive
    80: [
      {
        id: "phantom_ethereal",
        name: "Ethereal Lord",
        desc: "Pure Magic Energy. +Unique Passive",
        requirements: { int: 90 },
        stats: { str: 0, vit: 13, int: 65 }, // +30%
        skills: ["void_slash", "death_bolt", "ice_shard"],
        passivePool: ["mana_leech", "grim_harvest", "glass_cannon"],
        uniquePassive: "pure_energy",
        sprite: `<span class="pixel-sprite sprite-class-phantom">
✨
👻
▓▓▓
░░░</span>`
      },
      {
        id: "phantom_nightmare",
        name: "Living Nightmare",
        desc: "Terror Incarnate. +Unique Passive",
        requirements: { str: 55, int: 70 },
        stats: { str: 26, vit: 13, int: 39 }, // +30%
        skills: ["terror", "hex", "soul_cleave"],
        passivePool: ["shadow_arts", "lucky_strike", "executioner"],
        uniquePassive: "nightmare_realm",
        sprite: `<span class="pixel-sprite sprite-class-phantom">
👿
👻
▓▓▓
░░░</span>`
      },
      {
        id: "phantom_null",
        name: "The Void",
        desc: "Existence Erasure. +Unique Passive",
        requirements: { str: 40, int: 75 },
        stats: { str: 13, vit: 26, int: 39 }, // +30%
        skills: ["void_slash", "phase_strike", "vanish"],
        passivePool: ["intangible", "swift_foot", "ethereal"],
        uniquePassive: "void_existence",
        sprite: `<span class="pixel-sprite sprite-class-phantom">
🕳️
👻
▓▓▓
░░░</span>`
      }
    ]
  },

  vampire: {
    // TIER 1 (Lv 20) - v38.3: +30% stats, requirements, uniquePassive
    20: [
      { id: "vamp_lord", name: "Vampire Lord", desc: "Leadership & Strength. +Unique Passive", requirements: { str: 18, vit: 12 }, stats: { str: 8, vit: 5, int: 3, agi: 1, luck: 2 }, uniquePassive: "noble_blood", sprite: `<span class="pixel-sprite sprite-class-vampire">👑🧛</span>`, skills: ["smash", "blood_drain", "frenzy"], passivePool: ["vampirism", "thick_skin", "blood_fueled"] },
      { id: "vamp_beast", name: "Feral Vampire", desc: "Speed & Multi-hit. +Unique Passive", requirements: { str: 12, int: 12, agi: 15 }, stats: { str: 5, vit: 5, int: 5, agi: 6, luck: 1 }, uniquePassive: "beast_form", sprite: `<span class="pixel-sprite sprite-class-vampire">🐺🧛</span>`, skills: ["bat_swarm", "rend", "vanish"], passivePool: ["swift_foot", "scavenger", "blood_frenzy"] },
      { id: "vamp_mage", name: "Blood Mage", desc: "Magic Lifesteal. +Unique Passive", requirements: { int: 22, luck: 10 }, stats: { str: 3, vit: 3, int: 10, agi: 1, luck: 3 }, uniquePassive: "blood_magic", sprite: `<span class="pixel-sprite sprite-class-vampire">🩸🧛</span>`, skills: ["blood_drain", "hex", "fireball"], passivePool: ["mana_leech", "grim_harvest", "magic_barrier"] }
    ],
    // TIER 2 (Lv 50) - v38.3: +30% stats, requirements, uniquePassive
    50: [
      { id: "vamp_ancient", name: "Ancient Vampire", desc: "Timeless Power. +Unique Passive", requirements: { str: 35, vit: 35, int: 35, luck: 15 }, stats: { str: 13, vit: 13, int: 13, agi: 3, luck: 5 }, uniquePassive: "immortal_blood", sprite: `<span class="pixel-sprite sprite-class-vampire">📜🧛</span>`, skills: ["soul_cleave", "blood_drain", "terror"], passivePool: ["vampirism", "iron_will", "regenerator"] },
      { id: "vamp_night", name: "Night Stalker", desc: "Shadow & Stealth. +Unique Passive", requirements: { str: 30, int: 50, agi: 30 }, stats: { str: 10, vit: 8, int: 21, agi: 8, luck: 3 }, uniquePassive: "hunter_instinct", sprite: `<span class="pixel-sprite sprite-class-vampire">🌑🧛</span>`, skills: ["vanish", "backstab", "shadow_shuriken"], passivePool: ["shadow_arts", "lucky_strike", "executioner"] },
      { id: "vamp_count", name: "Blood Count", desc: "Ruler of Night. +Unique Passive", requirements: { str: 40, vit: 40 }, stats: { str: 16, vit: 16, int: 8 }, uniquePassive: "castle_master", sprite: `<span class="pixel-sprite sprite-class-vampire">🏰🧛</span>`, skills: ["summon_skeleton", "blood_drain", "abyssal_shield"], passivePool: ["phylactery", "undead_mastery", "blood_fueled"] }
    ],
    // TIER 3 (Lv 80) - v38.3: +30% stats, requirements, uniquePassive
    80: [
      { id: "vamp_dracula", name: "True Dracula", desc: "King of Vampires. +Unique Passive", requirements: { str: 70, vit: 70, int: 70 }, stats: { str: 33, vit: 33, int: 33 }, uniquePassive: "true_immortal", sprite: `<span class="pixel-sprite sprite-class-vampire">🐲🧛</span>`, skills: ["soul_cleave", "bat_swarm", "void_slash"], passivePool: ["god_of_blood", "vampirism", "undying"] },
      { id: "vamp_nosferatu", name: "Nosferatu", desc: "Eternal Hunger. +Unique Passive", requirements: { vit: 80, str: 55 }, stats: { str: 26, vit: 39, int: 26 }, uniquePassive: "eternal_thirst", sprite: `<span class="pixel-sprite sprite-class-vampire">🧟🧛</span>`, skills: ["cannibalize", "blood_drain", "plague_ward"], passivePool: ["regenerator", "thick_skin", "vampirism"] },
      { id: "vamp_god", name: "Blood God", desc: "Divine Power. +Unique Passive", requirements: { str: 80, vit: 80, int: 80 }, stats: { str: 39, vit: 39, int: 39 }, uniquePassive: "crimson_divinity", sprite: `<span class="pixel-sprite sprite-class-vampire">🩸🤴</span>`, skills: ["void_slash", "soul_cleave", "cursed_mending"], passivePool: ["intangible", "magic_barrier", "iron_will"] }
    ]
  },

  lich: {
    // TIER 1 (Lv 20) - v38.3: +30% stats, requirements, uniquePassive
    20: [
      { id: "lich_necro", name: "Necromancer", desc: "Summoner Focus. +Unique Passive", requirements: { int: 22 }, stats: { str: 0, vit: 5, int: 10 }, uniquePassive: "raise_dead", sprite: `<span class="pixel-sprite sprite-class-lich">💀🧙</span>`, skills: ["summon_skeleton", "hex", "death_bolt"], passivePool: ["undead_mastery", "mana_leech", "scavenger"] },
      { id: "lich_frost", name: "Frost Lich", desc: "Ice Magic Focus. +Unique Passive", requirements: { int: 25 }, stats: { str: 0, vit: 3, int: 13 }, uniquePassive: "frozen_soul", sprite: `<span class="pixel-sprite sprite-class-lich">❄️🧙</span>`, skills: ["ice_shard", "abyssal_shield", "phase_strike"], passivePool: ["glass_cannon", "grim_harvest", "magic_barrier"] },
      { id: "lich_bone", name: "Bone Master", desc: "Bone Magic Focus. +Unique Passive", requirements: { str: 12, vit: 12, int: 12 }, stats: { str: 5, vit: 5, int: 5 }, uniquePassive: "bone_armor", sprite: `<span class="pixel-sprite sprite-class-lich">🦴🧙</span>`, skills: ["bone_throw", "shield_bash", "plague_ward"], passivePool: ["thick_skin", "reflect", "stone_skin"] }
    ],
    // TIER 2 (Lv 50) - v38.3: +30% stats, requirements, uniquePassive
    50: [
      { id: "lich_king", name: "Lich King", desc: "Command the Dead. +Unique Passive", requirements: { vit: 45, int: 50 }, stats: { str: 13, vit: 20, int: 20 }, uniquePassive: "army_commander", sprite: `<span class="pixel-sprite sprite-class-lich">👑💀</span>`, skills: ["summon_skeleton", "terror", "soul_harvest"], passivePool: ["undead_mastery", "phylactery", "iron_will"] },
      { id: "lich_kel", name: "Kel'Thuzad", desc: "Arch-Lich Power. +Unique Passive", requirements: { int: 70 }, stats: { str: 7, vit: 7, int: 39 }, uniquePassive: "frost_dominion", sprite: `<span class="pixel-sprite sprite-class-lich">❄️👑</span>`, skills: ["ice_shard", "void_slash", "hex"], passivePool: ["grim_harvest", "soul_siphon", "glass_cannon"] },
      { id: "lich_elder", name: "Elder Lich", desc: "Ancient Knowledge. +Unique Passive", requirements: { vit: 35, int: 65 }, stats: { str: 0, vit: 13, int: 39 }, uniquePassive: "arcane_tome", sprite: `<span class="pixel-sprite sprite-class-lich">📚💀</span>`, skills: ["death_bolt", "fireball", "cursed_mending"], passivePool: ["mana_leech", "magic_barrier", "regenerator"] }
    ],
    // TIER 3 (Lv 80) - v38.3: +30% stats, requirements, uniquePassive
    80: [
      { id: "lich_god", name: "God of Death", desc: "Absolute End. +Unique Passive", requirements: { int: 100 }, stats: { str: 26, vit: 26, int: 78 }, uniquePassive: "death_incarnate", sprite: `<span class="pixel-sprite sprite-class-lich">🪐💀</span>`, skills: ["void_slash", "soul_harvest", "terror"], passivePool: ["god_of_death", "grim_harvest", "soul_siphon"] },
      { id: "lich_void", name: "Void Lich", desc: "Emptiness. +Unique Passive", requirements: { int: 110 }, stats: { str: 13, vit: 13, int: 104 }, uniquePassive: "reality_warp", sprite: `<span class="pixel-sprite sprite-class-lich">🕳️💀</span>`, skills: ["void_slash", "phase_strike", "vanish"], passivePool: ["intangible", "magic_barrier", "glass_cannon"] },
      { id: "lich_scourge", name: "The Scourge", desc: "Infinite Armies. +Unique Passive", requirements: { str: 70, vit: 70, int: 85 }, stats: { str: 39, vit: 39, int: 52 }, uniquePassive: "endless_legion", sprite: `<span class="pixel-sprite sprite-class-lich">⚔️💀</span>`, skills: ["summon_skeleton", "plague_ward", "abyssal_shield"], passivePool: ["undead_mastery", "phylactery", "thorns"] }
    ]
  },

  wraith: {
    // TIER 1 (Lv 20) - v38.3/38.4: Wraith = AGI Focus Class
    20: [
      { id: "wraith_void", name: "Void Walker", desc: "Phase Master. +Unique Passive", requirements: { int: 22, agi: 15 }, stats: { str: 3, vit: 3, int: 10, agi: 5, luck: 2 }, uniquePassive: "phase_shift", sprite: `<span class="pixel-sprite sprite-class-wraith">🌌👻</span>`, skills: ["phase_strike", "vanish", "night_veil"], passivePool: ["intangible", "ethereal", "swift_foot"] },
      { id: "wraith_blade", name: "Spectral Blade", desc: "Melee Ghost. +Unique Passive", requirements: { str: 22, agi: 18 }, stats: { str: 10, vit: 3, int: 3, agi: 6, luck: 1 }, uniquePassive: "ghost_blade", sprite: `<span class="pixel-sprite sprite-class-wraith">🗡️👻</span>`, skills: ["phase_strike", "rend", "shadow_shuriken"], passivePool: ["blood_frenzy", "lucky_strike", "executioner"] },
      { id: "wraith_haunt", name: "Poltergeist", desc: "Debuff Focus. +Unique Passive", requirements: { vit: 18, int: 12, agi: 12 }, stats: { str: 3, vit: 8, int: 5, agi: 4, luck: 1 }, uniquePassive: "haunted_presence", sprite: `<span class="pixel-sprite sprite-class-wraith">🏚️👻</span>`, skills: ["haunting", "hex", "terror"], passivePool: ["thorns", "magic_barrier", "regenerator"] }
    ],
    // TIER 2 (Lv 50) - v38.4: High AGI requirements
    50: [
      { id: "wraith_assassin", name: "Phase Assassin", desc: "Cannot be Hit. +Unique Passive", requirements: { str: 45, int: 35, agi: 40 }, stats: { str: 20, vit: 7, int: 13, agi: 12, luck: 4 }, uniquePassive: "untouchable", sprite: `<span class="pixel-sprite sprite-class-wraith">🐱‍👤👻</span>`, skills: ["shadow_shuriken", "backstab", "vanish"], passivePool: ["shadow_arts", "swift_foot", "intangible"] },
      { id: "wraith_lord", name: "Wraith Lord", desc: "Ruler of Shadows. +Unique Passive", requirements: { str: 35, vit: 35, int: 35, agi: 25 }, stats: { str: 13, vit: 13, int: 13, agi: 8, luck: 3 }, uniquePassive: "shadow_reign", sprite: `<span class="pixel-sprite sprite-class-wraith">👑👻</span>`, skills: ["terror", "soul_siphon", "void_slash"], passivePool: ["soul_siphon", "magic_barrier", "undying"] },
      { id: "wraith_horror", name: "Eldritch Horror", desc: "Sanity Damage. +Unique Passive", requirements: { int: 55, luck: 20 }, stats: { str: 7, vit: 7, int: 26, agi: 3, luck: 6 }, uniquePassive: "mind_shatter", sprite: `<span class="pixel-sprite sprite-class-wraith">🦑👻</span>`, skills: ["hex", "haunting", "cursed_mending"], passivePool: ["thorns", "rot_touch", "regenerator"] }
    ],
    // TIER 3 (Lv 80) - v38.3: +30% stats, requirements, uniquePassive
    80: [
      { id: "wraith_entropy", name: "Entropy", desc: "Universal Decay. +Unique Passive", requirements: { int: 100 }, stats: { str: 26, vit: 26, int: 78 }, uniquePassive: "entropy_field", sprite: `<span class="pixel-sprite sprite-class-wraith">⚛️👻</span>`, skills: ["void_slash", "hex", "death_bolt"], passivePool: ["god_of_void", "soul_siphon", "glass_cannon"] },
      { id: "wraith_oblivion", name: "Oblivion", desc: "Total Nothingness. +Unique Passive", requirements: { str: 100 }, stats: { str: 78, vit: 0, int: 52 }, uniquePassive: "erase_existence", sprite: `<span class="pixel-sprite sprite-class-wraith">🚫👻</span>`, skills: ["soul_cleave", "void_slash", "vanish"], passivePool: ["intangible", "executioner", "lucky_strike"] },
      { id: "wraith_phantom", name: "Phantom God", desc: "Ghost God. +Unique Passive", requirements: { str: 80, vit: 80 }, stats: { str: 52, vit: 52, int: 26 }, uniquePassive: "spectral_godhood", sprite: `<span class="pixel-sprite sprite-class-wraith">⛪👻</span>`, skills: ["phase_strike", "backstab", "shadow_shuriken"], passivePool: ["shadow_arts", "swift_foot", "ethereal"] }
    ]
  },



  dark_knight: {
    // TIER 1 (Lv 20) - v38.3: +30% stats, requirements, uniquePassive
    20: [
      { id: "dk_chaos", name: "Chaos Knight", desc: "Unpredictable Dmg. +Unique Passive", requirements: { str: 18, int: 12 }, stats: { str: 8, vit: 5, int: 5 }, uniquePassive: "chaos_strike", sprite: `<span class="pixel-sprite sprite-class-dk">⚔️👿</span>`, skills: ["smash", "void_slash", "frenzy"], passivePool: ["lucky_strike", "thorns", "blood_frenzy"] },
      { id: "dk_abyss", name: "Abyssal Guard", desc: "Tanky Magic. +Unique Passive", requirements: { vit: 22 }, stats: { str: 5, vit: 10, int: 3 }, uniquePassive: "void_armor", sprite: `<span class="pixel-sprite sprite-class-dk">🛡️👿</span>`, skills: ["abyssal_shield", "shield_bash", "plague_ward"], passivePool: ["thick_skin", "magic_barrier", "iron_will"] },
      { id: "dk_doom", name: "Doom Bringer", desc: "Execute Low HP. +Unique Passive", requirements: { str: 22 }, stats: { str: 10, vit: 3, int: 5 }, uniquePassive: "doom_blade", sprite: `<span class="pixel-sprite sprite-class-dk">☠️👿</span>`, skills: ["soul_cleave", "rend", "terror"], passivePool: ["executioner", "blood_fueled", "scavenger"] }
    ],
    // TIER 2 (Lv 50) - v38.3: +30% stats, requirements, uniquePassive
    50: [
      { id: "dk_hell", name: "Hell Knight", desc: "Fire & Chaos. +Unique Passive", requirements: { str: 45, int: 35 }, stats: { str: 20, vit: 13, int: 13 }, uniquePassive: "hellfire", sprite: `<span class="pixel-sprite sprite-class-dk">🔥👿</span>`, skills: ["fireball", "void_slash", "abyssal_shield"], passivePool: ["thorns", "glass_cannon", "blood_frenzy"] },
      { id: "dk_void", name: "Void Sentinel", desc: "Phasing Tank. +Unique Passive", requirements: { vit: 55, str: 35 }, stats: { str: 13, vit: 26, int: 7 }, uniquePassive: "void_bulwark", sprite: `<span class="pixel-sprite sprite-class-dk">🌌👿</span>`, skills: ["phase_strike", "abyssal_shield", "soul_siphon"], passivePool: ["intangible", "magic_barrier", "regenerator"] },
      { id: "dk_death", name: "Death Herald", desc: "Pure Dmg. +Unique Passive", requirements: { str: 55 }, stats: { str: 26, vit: 7, int: 13 }, uniquePassive: "death_charge", sprite: `<span class="pixel-sprite sprite-class-dk">🐎👿</span>`, skills: ["soul_cleave", "void_slash", "cursed_mending"], passivePool: ["executioner", "lucky_strike", "god_of_war"] }
    ],
    // TIER 3 (Lv 80) - v38.3: +30% stats, requirements, uniquePassive
    80: [
      { id: "dk_archon", name: "Chaos Archon", desc: "Lord of Chaos. +Unique Passive", requirements: { str: 85, int: 55 }, stats: { str: 52, vit: 26, int: 26 }, uniquePassive: "chaos_incarnate", sprite: `<span class="pixel-sprite sprite-class-dk">👑👿</span>`, skills: ["void_slash", "frenzy", "soul_cleave"], passivePool: ["blood_frenzy", "lucky_strike", "thorns"] },
      { id: "dk_champion", name: "Abyssal Champion", desc: "Unbreakable. +Unique Passive", requirements: { vit: 100, str: 55 }, stats: { str: 26, vit: 65, int: 13 }, uniquePassive: "void_champion", sprite: `<span class="pixel-sprite sprite-class-dk">🏆👿</span>`, skills: ["abyssal_shield", "plague_ward", "cannibalize"], passivePool: ["thick_skin", "iron_will", "regenerator"] },
      { id: "dk_apocalypse", name: "Apocalypse", desc: "World Ender. +Unique Passive", requirements: { str: 100, int: 65 }, stats: { str: 78, vit: 13, int: 39 }, uniquePassive: "world_ender", sprite: `<span class="pixel-sprite sprite-class-dk">🌋👿</span>`, skills: ["soul_cleave", "void_slash", "terror"], passivePool: ["executioner", "god_of_war", "blood_frenzy"] }
    ]
  },

  necro_priest: {
    // TIER 1 (Lv 20) - v38.3: +30% stats, requirements, uniquePassive
    20: [
      { id: "priest_cult", name: "Cultist", desc: "Heal & Curse. +Unique Passive", requirements: { vit: 18, int: 18 }, stats: { str: 3, vit: 8, int: 8 }, uniquePassive: "dark_blessing", sprite: `<span class="pixel-sprite sprite-class-priest">📿💀</span>`, skills: ["mend", "hex", "bone_throw"], passivePool: ["regenerator", "mana_leech", "rot_touch"] },
      { id: "priest_heal", name: "Dark Healer", desc: "Sustain Focus. +Unique Passive", requirements: { vit: 22 }, stats: { str: 0, vit: 10, int: 8 }, uniquePassive: "unholy_mending", sprite: `<span class="pixel-sprite sprite-class-priest">🩺💀</span>`, skills: ["cursed_mending", "plague_ward", "shield_bash"], passivePool: ["magic_barrier", "thick_skin", "phylactery"] },
      { id: "priest_shadow", name: "Shadow Priest", desc: "Damage Focus. +Unique Passive", requirements: { int: 25 }, stats: { str: 0, vit: 5, int: 13 }, uniquePassive: "mind_flay", sprite: `<span class="pixel-sprite sprite-class-priest">🌑💀</span>`, skills: ["terror", "death_bolt", "ice_shard"], passivePool: ["glass_cannon", "grim_harvest", "shadow_arts"] }
    ],
    // TIER 2 (Lv 50) - v38.3: +30% stats, requirements, uniquePassive
    50: [
      { id: "priest_high", name: "High Priest", desc: "Leader of Cult. +Unique Passive", requirements: { vit: 45, int: 45 }, stats: { str: 7, vit: 20, int: 20 }, uniquePassive: "cult_leader", sprite: `<span class="pixel-sprite sprite-class-priest">🎩💀</span>`, skills: ["cursed_mending", "summon_skeleton", "frenzy"], passivePool: ["undead_mastery", "regenerator", "phylactery"] },
      { id: "priest_prophet", name: "Doom Prophet", desc: "Foretell Death. +Unique Passive", requirements: { int: 55 }, stats: { str: 7, vit: 13, int: 26 }, uniquePassive: "death_oracle", sprite: `<span class="pixel-sprite sprite-class-priest">📜💀</span>`, skills: ["terror", "hex", "soul_harvest"], passivePool: ["lucky_strike", "executioner", "soul_siphon"] },
      { id: "priest_bishop", name: "Cardinal Sin", desc: "Unholy Power. +Unique Passive", requirements: { str: 35, vit: 55 }, stats: { str: 13, vit: 26, int: 7 }, uniquePassive: "cardinal_sin", sprite: `<span class="pixel-sprite sprite-class-priest">✝️💀</span>`, skills: ["abyssal_shield", "plague_ward", "mend"], passivePool: ["iron_will", "thorns", "stone_skin"] }
    ],
    // TIER 3 (Lv 80) - v38.3: +30% stats, requirements, uniquePassive
    80: [
      { id: "priest_pope", name: "Black Pope", desc: "Avatar of Sin. +Unique Passive", requirements: { vit: 70, int: 90 }, stats: { str: 13, vit: 39, int: 52 }, uniquePassive: "unholy_avatar", sprite: `<span class="pixel-sprite sprite-class-priest">⛪💀</span>`, skills: ["summon_skeleton", "cursed_mending", "void_slash"], passivePool: ["god_of_death", "regenerator", "magic_barrier"] },
      { id: "priest_saint", name: "Fallen Saint", desc: "Corrupted Light. +Unique Passive", requirements: { str: 55, vit: 85 }, stats: { str: 26, vit: 52, int: 26 }, uniquePassive: "corrupted_halo", sprite: `<span class="pixel-sprite sprite-class-priest">👼💀</span>`, skills: ["abyssal_shield", "soul_cleave", "mend"], passivePool: ["undying", "thick_skin", "phylactery"] },
      { id: "priest_deity", name: "Old God", desc: "Beyond Worship. +Unique Passive", requirements: { int: 100 }, stats: { str: 13, vit: 13, int: 78 }, uniquePassive: "eldritch_presence", sprite: `<span class="pixel-sprite sprite-class-priest">🦑💀</span>`, skills: ["hex", "terror", "soul_harvest"], passivePool: ["soul_siphon", "grim_harvest", "intangible"] }
    ]
  },

  shadow_assassin: {
    // TIER 1 (Lv 20) - v38.3: +30% stats, requirements, uniquePassive
    20: [
      { id: "sin_ninja", name: "Bone Ninja", desc: "Speed & Shurikens. +Unique Passive", requirements: { str: 12, int: 18 }, stats: { str: 5, vit: 3, int: 8 }, uniquePassive: "shadow_step", sprite: `<span class="pixel-sprite sprite-class-sin">🥷💀</span>`, skills: ["shadow_shuriken", "vanish", "bone_throw"], passivePool: ["swift_foot", "dodge", "lucky_strike"] },
      { id: "sin_rogue", name: "Rogue", desc: "Backstabber. +Unique Passive", requirements: { str: 18 }, stats: { str: 8, vit: 5, int: 3 }, uniquePassive: "ambush", sprite: `<span class="pixel-sprite sprite-class-sin">🗡️💀</span>`, skills: ["backstab", "rend", "vanish"], passivePool: ["executioner", "scavenger", "shadow_arts"] },
      { id: "sin_stalker", name: "Stalker", desc: "Tracking Prey. +Unique Passive", requirements: { str: 12, vit: 12, int: 12 }, stats: { str: 5, vit: 5, int: 5 }, uniquePassive: "predator", sprite: `<span class="pixel-sprite sprite-class-sin">👀💀</span>`, skills: ["phase_strike", "terror", "hex"], passivePool: ["scavenger", "treasure_hunter", "blood_frenzy"] }
    ],
    // TIER 2 (Lv 50) - v38.3: +30% stats, requirements, uniquePassive
    50: [
      { id: "sin_master", name: "Shadow Master", desc: "Unseen Death. +Unique Passive", requirements: { str: 45, int: 45 }, stats: { str: 20, vit: 7, int: 20 }, uniquePassive: "true_invisibility", sprite: `<span class="pixel-sprite sprite-class-sin">🎓💀</span>`, skills: ["shadow_shuriken", "vanish", "void_slash"], passivePool: ["shadow_arts", "intangible", "assassination"] },
      { id: "sin_shadow", name: "Living Shadow", desc: "Become Darkness. +Unique Passive", requirements: { str: 35, int: 45 }, stats: { str: 13, vit: 13, int: 20 }, uniquePassive: "one_with_dark", sprite: `<span class="pixel-sprite sprite-class-sin">🌑💀</span>`, skills: ["phase_strike", "abyssal_shield", "terror"], passivePool: ["ethereal", "magic_barrier", "soul_siphon"] },
      { id: "sin_night", name: "Night Blade", desc: "Sharpest Edge. +Unique Passive", requirements: { str: 65 }, stats: { str: 33, vit: 7, int: 7 }, uniquePassive: "killing_edge", sprite: `<span class="pixel-sprite sprite-class-sin">🌙💀</span>`, skills: ["backstab", "soul_cleave", "rend"], passivePool: ["executioner", "lucky_strike", "blood_frenzy"] }
    ],
    // TIER 3 (Lv 80) - v38.3: +30% stats, requirements, uniquePassive
    80: [
      { id: "sin_god", name: "God of Shadows", desc: "One with Dark. +Unique Passive", requirements: { str: 75, int: 75 }, stats: { str: 39, vit: 26, int: 39 }, uniquePassive: "shadow_deity", sprite: `<span class="pixel-sprite sprite-class-sin">👥💀</span>`, skills: ["void_slash", "shadow_shuriken", "phase_strike"], passivePool: ["intangible", "shadow_arts", "god_of_death"] },
      { id: "sin_void", name: "Void Walker", desc: "Where am I?. +Unique Passive", requirements: { int: 90, str: 55 }, stats: { str: 26, vit: 26, int: 52 }, uniquePassive: "dimension_shift", sprite: `<span class="pixel-sprite sprite-class-sin">🕳️💀</span>`, skills: ["vanish", "abyssal_shield", "soul_harvest"], passivePool: ["ethereal", "swift_foot", "mana_leech"] },
      { id: "sin_death", name: "Angel of Death", desc: "Instant Kill. +Unique Passive", requirements: { str: 100 }, stats: { str: 65, vit: 13, int: 26 }, uniquePassive: "death_touch", sprite: `<span class="pixel-sprite sprite-class-sin">👼💀</span>`, skills: ["soul_cleave", "backstab", "terror"], passivePool: ["executioner", "lucky_strike", "glass_cannon"] }
    ]
  },

  // ============================
  // v35.0 TRAITOR CLASS EVOLUTIONS
  // ============================

  paladin: {
    // TIER 1 (Lv 20) - v38.3: +30% stats, requirements, uniquePassive
    20: [
        { id: "pal_crusader", name: "Crusader", desc: "Holy Warrior. +Unique Passive", requirements: { str: 18, vit: 18 }, stats: { str: 8, vit: 8, int: 5 }, uniquePassive: "holy_fervor", sprite: `<span class="pixel-sprite">⚔️🛡️</span>`, skills: ["smash", "judgement", "shield_bash"], passivePool: ["divine_aura", "thick_skin", "smite_master"] },
        { id: "pal_guardian", name: "Guardian", desc: "Unbreakable Wall. +Unique Passive", requirements: { vit: 25 }, stats: { str: 3, vit: 13, int: 5 }, uniquePassive: "divine_barrier", sprite: `<span class="pixel-sprite">🛡️🧱</span>`, skills: ["divine_shield", "shield_bash", "mend"], passivePool: ["divine_aura", "retribution", "thorns"] },
        { id: "pal_cleric", name: "Cleric", desc: "Battle Healer. +Unique Passive", requirements: { vit: 18, int: 22 }, stats: { str: 3, vit: 8, int: 10 }, uniquePassive: "holy_light", sprite: `<span class="pixel-sprite">🩹✨</span>`, skills: ["consecrate", "mend", "judgement"], passivePool: ["nature_touch", "mana_leech", "int_boost"] }
    ],
    // TIER 2 (Lv 50) - v38.3: +30% stats, requirements, uniquePassive
    50: [
        { id: "pal_templar", name: "Templar", desc: "Wrath of God. +Unique Passive", requirements: { str: 35, vit: 35, int: 35 }, stats: { str: 13, vit: 13, int: 13 }, uniquePassive: "righteous_fury", sprite: `<span class="pixel-sprite">🏰⚔️</span>`, skills: ["judgement", "soul_cleave", "frenzy"], passivePool: ["god_of_war", "executioner", "divine_aura"] },
        { id: "pal_justicar", name: "Justicar", desc: "Lawbringer. +Unique Passive", requirements: { str: 45, vit: 35 }, stats: { str: 20, vit: 13, int: 7 }, uniquePassive: "swift_justice", sprite: `<span class="pixel-sprite">⚖️🔨</span>`, skills: ["executing_strike", "shield_bash", "terror"], passivePool: ["retribution", "thorns_aura", "justice"] },
        { id: "pal_saint", name: "Living Saint", desc: "Holy Avatar. +Unique Passive", requirements: { vit: 45, int: 55 }, stats: { str: 7, vit: 20, int: 26 }, uniquePassive: "blessed_aura", sprite: `<span class="pixel-sprite">👼✨</span>`, skills: ["divine_shield", "consecrate", "revive"], passivePool: ["undying", "phylactery", "pure_heart"] }
    ],
    // TIER 3 (Lv 80) - v38.3: +30% stats, requirements, uniquePassive
    80: [
        { id: "pal_god", name: "God of Light", desc: "The Sun Itself. +Unique Passive", requirements: { str: 80, vit: 80, int: 80 }, stats: { str: 39, vit: 39, int: 39 }, uniquePassive: "divine_radiance", sprite: `<span class="pixel-sprite">☀️👑</span>`, skills: ["judgement", "supernova", "divine_shield"], passivePool: ["god_of_light", "invincible", "retribution"] },
        { id: "pal_aegis", name: "Aegis", desc: "Indestructible. +Unique Passive", requirements: { vit: 110 }, stats: { str: 13, vit: 78, int: 13 }, uniquePassive: "eternal_shield", sprite: `<span class="pixel-sprite">🛡️♾️</span>`, skills: ["divine_shield", "abyssal_shield", "reflect_all"], passivePool: ["thorns_aura", "iron_will", "titan_skin"] },
        { id: "pal_judge", name: "Supreme Judge", desc: "Final Verdict. +Unique Passive", requirements: { str: 100, vit: 55 }, stats: { str: 65, vit: 26, int: 13 }, uniquePassive: "final_judgment", sprite: `<span class="pixel-sprite">👨‍⚖️⚡</span>`, skills: ["executing_strike", "soul_harvest", "void_slash"], passivePool: ["executioner", "lucky_strike", "truth"] }
    ]
  },

  druid: {
    // TIER 1 (Lv 20) - v38.3: +30% stats, requirements, uniquePassive
    20: [
        { id: "dru_bear", name: "Bear Form", desc: "Tank Transformation. +Unique Passive", requirements: { vit: 25 }, stats: { str: 7, vit: 13, int: 0 }, uniquePassive: "ursine_might", sprite: `<span class="pixel-sprite">🐻</span>`, skills: ["bear_form", "smash", "cannibalize"], passivePool: ["thick_skin", "regenerator", "nature_touch"] },
        { id: "dru_wolf", name: "Wolf Form", desc: "DPS Transformation. +Unique Passive", requirements: { str: 22 }, stats: { str: 10, vit: 5, int: 3 }, uniquePassive: "pack_hunter", sprite: `<span class="pixel-sprite">🐺</span>`, skills: ["rend", "frenzy", "bite"], passivePool: ["swift_foot", "lucky_strike", "blood_frenzy"] },
        { id: "dru_tree", name: "Treekin", desc: "Rooted Support. +Unique Passive", requirements: { vit: 22, int: 22 }, stats: { str: 3, vit: 10, int: 10 }, uniquePassive: "root_network", sprite: `<span class="pixel-sprite">🌳</span>`, skills: ["entangle", "regrowth", "thorns"], passivePool: ["thorns_aura", "nature_touch", "photosynthesis"] }
    ],
    // TIER 2 (Lv 50) - v38.3: +30% stats, requirements, uniquePassive
    50: [
        { id: "dru_behemoth", name: "Behemoth", desc: "Giant Beast. +Unique Passive", requirements: { str: 55, vit: 55 }, stats: { str: 26, vit: 26, int: 7 }, uniquePassive: "colossal_form", sprite: `<span class="pixel-sprite">🐘</span>`, skills: ["bear_form", "stomp", "earthquake"], passivePool: ["iron_will", "thick_skin", "rage_meter"] },
        { id: "dru_stalker", name: "Night Stalker", desc: "Invisible Hunter. +Unique Passive", requirements: { str: 65 }, stats: { str: 33, vit: 7, int: 7 }, uniquePassive: "apex_predator", sprite: `<span class="pixel-sprite">🐆</span>`, skills: ["vanish", "backstab", "executing_strike"], passivePool: ["shadow_arts", "assassination", "scavenger"] },
        { id: "dru_ancient", name: "Ancient Treant", desc: "Forest Lord. +Unique Passive", requirements: { vit: 55, int: 55 }, stats: { str: 7, vit: 26, int: 26 }, uniquePassive: "ancient_wisdom", sprite: `<span class="pixel-sprite">🌲👑</span>`, skills: ["entangle", "consecrate", "summon_treant"], passivePool: ["regrowth", "thorns_aura", "wisdom"] }
    ],
    // TIER 3 (Lv 80) - v38.3: +30% stats, requirements, uniquePassive
    80: [
        { id: "dru_gaia", name: "Gaia's Avatar", desc: "Nature Incarnate. +Unique Passive", requirements: { str: 70, vit: 90, int: 70 }, stats: { str: 39, vit: 52, int: 39 }, uniquePassive: "nature_incarnate", sprite: `<span class="pixel-sprite">🌍</span>`, skills: ["earthquake", "tsunami", "rebirth"], passivePool: ["god_of_nature", "immortal", "nature_touch"] },
        { id: "dru_fenrir", name: "Fenrir", desc: "World Eater. +Unique Passive", requirements: { str: 110 }, stats: { str: 78, vit: 26, int: 13 }, uniquePassive: "ragnarok", sprite: `<span class="pixel-sprite">🌖🐺</span>`, skills: ["devour", "executing_strike", "howl"], passivePool: ["god_of_war", "blood_frenzy", "scavenger_pro"] },
        { id: "dru_storm", name: "Storm Crow", desc: "Weather Master. +Unique Passive", requirements: { int: 110 }, stats: { str: 13, vit: 13, int: 78 }, uniquePassive: "storm_lord", sprite: `<span class="pixel-sprite">⛈️🐦</span>`, skills: ["lighting_storm", "whirlwind", "flight"], passivePool: ["swift_foot", "dodge_master", "static"] }
    ]
  },

  berserker: {
    // TIER 1 (Lv 20) - v38.3: +30% stats, requirements, uniquePassive
    20: [
        { id: "ber_barbarian", name: "Barbarian", desc: "Raw Strength. +Unique Passive", requirements: { str: 25 }, stats: { str: 13, vit: 7, int: 0 }, uniquePassive: "primal_rage", sprite: `<span class="pixel-sprite">🏋️</span>`, skills: ["smash", "whirlwind", "shout"], passivePool: ["rage_meter", "strong_arm", "thick_skin"] },
        { id: "ber_slayer", name: "Slayer", desc: "Kill Speed. +Unique Passive", requirements: { str: 28 }, stats: { str: 16, vit: 3, int: 0 }, uniquePassive: "bloodlust", sprite: `<span class="pixel-sprite">👺</span>`, skills: ["rend", "executing_strike", "frenzy"], passivePool: ["lucky_strike", "executioner", "blood_frenzy"] },
        { id: "ber_viking", name: "Viking", desc: "Durable Fighter. +Unique Passive", requirements: { str: 22, vit: 22 }, stats: { str: 10, vit: 10, int: 0 }, uniquePassive: "valhalla", sprite: `<span class="pixel-sprite">🛶</span>`, skills: ["shield_bash", "whirlwind", "battle_cry"], passivePool: ["scavenger", "iron_will", "undying"] }
    ],
    // TIER 2 (Lv 50) - v38.3: +30% stats, requirements, uniquePassive
    50: [
        { id: "ber_chieftain", name: "Chieftain", desc: "War Leader. +Unique Passive", requirements: { str: 55, vit: 45 }, stats: { str: 26, vit: 20, int: 7 }, uniquePassive: "warlord", sprite: `<span class="pixel-sprite">⛺👑</span>`, skills: ["enrage", "rally", "whirlwind"], passivePool: ["leadership", "rage_meter", "god_of_war"] },
        { id: "ber_destroyer", name: "Destroyer", desc: "Armor Breaker. +Unique Passive", requirements: { str: 75 }, stats: { str: 39, vit: 7, int: 0 }, uniquePassive: "sundering_blow", sprite: `<span class="pixel-sprite">🔨💥</span>`, skills: ["sunder", "executing_strike", "ground_slam"], passivePool: ["ignore_def", "crit_dmg", "blood_fueled"] },
        { id: "ber_juggernaut", name: "Juggernaut", desc: "Unstoppable. +Unique Passive", requirements: { str: 45, vit: 65 }, stats: { str: 20, vit: 33, int: 0 }, uniquePassive: "unstoppable_force", sprite: `<span class="pixel-sprite">🚂</span>`, skills: ["charge", "iron_skin", "whirlwind"], passivePool: ["immune_cc", "thick_skin", "thorns_aura"] }
    ],
    // TIER 3 (Lv 80) - v38.3: +30% stats, requirements, uniquePassive
    80: [
        { id: "ber_kratos", name: "God of War", desc: "Spartan Rage. +Unique Passive", requirements: { str: 120 }, stats: { str: 91, vit: 26, int: 0 }, uniquePassive: "spartan_rage", sprite: `<span class="pixel-sprite">😡⛓️</span>`, skills: ["god_smash", "blade_storm", "revive"], passivePool: ["god_of_war", "undying_rage", "blood_frenzy"] },
        { id: "ber_asura", name: "Asura", desc: "Six Arms. +Unique Passive", requirements: { str: 100, vit: 70 }, stats: { str: 65, vit: 39, int: 13 }, uniquePassive: "six_arms", sprite: `<span class="pixel-sprite">👐👹</span>`, skills: ["flurry", "hundred_fists", "meditate"], passivePool: ["multi_hit", "counter_attack", "zen"] },
        { id: "ber_titan", name: "Titan", desc: "World Breaker. +Unique Passive", requirements: { str: 90, vit: 100 }, stats: { str: 52, vit: 65, int: 0 }, uniquePassive: "world_breaker", sprite: `<span class="pixel-sprite">🌋</span>`, skills: ["meteor", "fissure", "roar"], passivePool: ["titan_grip", "colossal", "intimidate"] }
    ]
  },

  mechanist: {
    // TIER 1 (Lv 20) - v38.3: +30% stats, requirements, uniquePassive
    20: [
        { id: "mech_gunner", name: "Gunner", desc: "Ranged DPS. +Unique Passive", requirements: { int: 22 }, stats: { str: 5, vit: 5, int: 10 }, uniquePassive: "locked_on", sprite: `<span class="pixel-sprite">🔫</span>`, skills: ["rocket_salvo", "aimed_shot", "reload"], passivePool: ["eagle_eye", "lucky_strike", "quick_hands"] },
        { id: "mech_tinker", name: "Tinkerer", desc: "Utility & Buffs. +Unique Passive", requirements: { int: 25 }, stats: { str: 3, vit: 5, int: 13 }, uniquePassive: "gadgeteer", sprite: `<span class="pixel-sprite">🔧</span>`, skills: ["overclock", "repair", "flashbang"], passivePool: ["scavenger_pro", "greed", "invention"] },
        { id: "mech_eng", name: "Engineer", desc: "Turrets. +Unique Passive", requirements: { vit: 18, int: 22 }, stats: { str: 3, vit: 8, int: 10 }, uniquePassive: "turret_master", sprite: `<span class="pixel-sprite">🏗️</span>`, skills: ["deploy_turret", "fortify", "wrench_whack"], passivePool: ["automated_defense", "metal_plating", "builder"] }
    ],
    // TIER 2 (Lv 50) - v38.3: +30% stats, requirements, uniquePassive
    50: [
        { id: "mech_sniper", name: "Deadeye", desc: "One Shot. +Unique Passive", requirements: { int: 65 }, stats: { str: 7, vit: 7, int: 33 }, uniquePassive: "headhunter", sprite: `<span class="pixel-sprite">🎯</span>`, skills: ["headshot", "vanish", "rocket_salvo"], passivePool: ["glass_cannon", "assassination", "eagle_eye"] },
        { id: "mech_pilot", name: "Mech Pilot", desc: "Robo Suit. +Unique Passive", requirements: { str: 35, vit: 45, int: 45 }, stats: { str: 13, vit: 20, int: 20 }, uniquePassive: "pilot_mode", sprite: `<span class="pixel-sprite">🤖</span>`, skills: ["missile_barrage", "flamethrower", "eject"], passivePool: ["iron_will", "battery", "armor_clad"] },
        { id: "mech_alchemist", name: "Mad Scientist", desc: "Potions & Bombs. +Unique Passive", requirements: { int: 65 }, stats: { str: 3, vit: 13, int: 33 }, uniquePassive: "mad_genius", sprite: `<span class="pixel-sprite">🧪💥</span>`, skills: ["acid_bomb", "elixir", "transmute"], passivePool: ["poison_master", "gold_alchemy", "madness"] }
    ],
    // TIER 3 (Lv 80) - v38.3: +30% stats, requirements, uniquePassive
    80: [
        { id: "mech_nova", name: "Nova Core", desc: "Energy Being. +Unique Passive", requirements: { int: 110 }, stats: { str: 13, vit: 26, int: 78 }, uniquePassive: "fusion_core", sprite: `<span class="pixel-sprite">⚛️</span>`, skills: ["laser_beam", "black_hole", "overclock"], passivePool: ["infinite_energy", "shield_gen", "zap"] },
        { id: "mech_tank", name: "Walking Tank", desc: "Heavy Artillery. +Unique Passive", requirements: { str: 70, vit: 100 }, stats: { str: 39, vit: 65, int: 13 }, uniquePassive: "heavy_armor", sprite: `<span class="pixel-sprite">🚜💣</span>`, skills: ["nuke", "bunker", "artillery"], passivePool: ["thick_skin", "impenetrable", "explosive"] },
        { id: "mech_cyber", name: "Cyber God", desc: "Digital Ascendancy. +Unique Passive", requirements: { str: 55, int: 100 }, stats: { str: 26, vit: 26, int: 65 }, uniquePassive: "digital_god", sprite: `<span class="pixel-sprite">💾👑</span>`, skills: ["hack", "download", "glitch"], passivePool: ["dodge_code", "rewrite", "upload"] }
    ]
  }
};

export { EVOLUTIONS, CLASS_TREES };
