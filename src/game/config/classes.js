const CLASSES_DB = {
    skeleton: {
      name: "Skeleton",
      desc: "Seimbang",
      icon: "💀",
      attr: { STR: 6, VIT: 6, INT: 4 }, // Buffed v36.4 (Was 5/5/2)
      skills: ["smash", "bone_throw", "shield_bash"],
      passives: ["undying", "scavenger"],
      sprite: {
        idle: `<span class="pixel-sprite sprite-class-skeleton">
 ▓▓▓
▓░▓░▓
 ▓▓▓
░▓░▓░
▓░░░▓</span>`
      }
    },
    ghoul: {
      name: "Ghoul",
      desc: "Tanky",
      icon: "🧟",
      attr: { STR: 7, VIT: 8, INT: 2 }, // Buffed v36.4 (Was 7/7/1)
      skills: ["rend", "cannibalize", "smash"],
      passives: ["thick_skin", "rot_touch"],
      sprite: {
        idle: `<span class="pixel-sprite sprite-class-ghoul">
 ▓▓▓▓
▓░▓░▓
 ▓▓▓
░▓▓▓░
▓░▓░▓</span>`
      }
    },
    phantom: {
      name: "Phantom",
      desc: "Magic",
      icon: "👻",
      attr: { STR: 3, VIT: 4, INT: 10 }, // Buffed v36.4 (Was 2/3/8)
      skills: ["fireball", "ice_shard", "terror"],
      passives: ["ethereal", "mana_leech"],
      sprite: {
        idle: `<span class="pixel-sprite sprite-class-phantom">
 ░▓░
░▓▓▓░
 ▓▓▓
░░▓░░
 ░░░</span>`
      }
    },
    vampire: {
      name: "Vampire",
      desc: "Lifesteal",
      icon: "🧛",
      attr: { STR: 7, VIT: 5, INT: 5 }, // Buffed v36.4 (Was 6/4/4)
      skills: ["blood_drain", "bat_swarm", "night_veil"],
      passives: ["vampirism", "blood_frenzy"],
      sprite: {
        idle: `<span class="pixel-sprite sprite-class-vampire">
 ▓▓▓▓▓
▓░▓▓▓░▓
 ▓▓▓▓
░░▓░░
▓░░░▓</span>`
      }
    },
    lich: {
      name: "Lich",
      desc: "Necromancer",
      attr: { STR: 2, VIT: 4, INT: 11 }, // Buffed v36.4 (Was 1/3/10)
      skills: ["summon_skeleton", "death_bolt", "soul_harvest"],
      passives: ["undead_mastery", "phylactery"],
      sprite: {
        idle: `<span class="pixel-sprite sprite-class-lich">
 ▓▓▓▓▓
▓░███░▓
 ▓▓▓▓
  ▓▓
 ▓░░▓</span>`
      }
    },
    wraith: {
      name: "Wraith",
      desc: "Phase Master",
      icon: "🧣",
      attr: { STR: 5, VIT: 3, INT: 8 }, // Buffed v36.4 (Was 4/2/7)
      skills: ["phase_strike", "haunting", "possession"],
      passives: ["intangible", "soul_siphon"],
      sprite: {
        idle: `<span class="pixel-sprite sprite-class-wraith">
 ░▓▓░
░░▓░░
 ░▓░
░░░░░
 ░░░</span>`
      }
    },
    
    // v27.0 New Classes
    dark_knight: {
      name: "Dark Knight",
      desc: "Blood Tank",
      icon: "👹",
      attr: { STR: 9, VIT: 8, INT: 2 },
      skills: ["soul_cleave", "abyssal_shield", "smash"], // Replaced frenzy with abyssal_shield for tankiness
      passives: ["blood_fueled", "thick_skin"],
      sprite: {
        idle: `<span class="pixel-sprite sprite-class-dark-knight">
 ▄▄▄
▄▓▓▓▄
 ▓▓▓
▄▓░▓▄
▄   ▄</span>`
      }
    },
    necro_priest: {
      name: "Necro Priest",
      desc: "Unholy Heal",
      icon: "⛪",
      attr: { STR: 2, VIT: 6, INT: 9 },
      skills: ["cursed_mending", "plague_ward", "death_bolt"], // Replaced generic heal with cursed_mending
      passives: ["grim_harvest", "mana_leech"],
      sprite: {
        idle: `<span class="pixel-sprite sprite-class-necro-priest">
 ▒▒▒
▒▓▓▓▒
 ▓▓▓
▒▓░▓▒
▒   ▒</span>`
      }
    },
    shadow_assassin: {
      name: "Shadow Assassin",
      desc: "Stealth Crit",
      icon: "🗡️",
      attr: { STR: 4, VIT: 3, INT: 8 }, // High DEX implicit
      skills: ["vanish", "shadow_shuriken", "backstab"], // Replaced generic bone_throw/rend with specialized kit
      passives: ["shadow_arts", "ethereal"],
      sprite: {
        idle: `<span class="pixel-sprite sprite-class-shadow-assassin">
 ▀▀▀
▀▓▓▓▀
 ▓▓▓
▀▓░▓▀
▀   ▀</span>`
      }
    },
    // v35.0 Traitor Classes
    paladin: {
      name: "Paladin",
      desc: "Holy Tank",
      icon: "🛡️",
      attr: { STR: 6, VIT: 9, INT: 4 }, // High VIT
      skills: ["smash", "judgement", "shield_bash"],
      passives: ["thick_skin", "divine_aura"],
      sprite: {
        idle: `<span class="pixel-sprite sprite-class-paladin">
 ▄▀▄
▄███▄
 ███
▄█░█▄
▄   ▄</span>`
      }
    },
    druid: {
      name: "Druid",
      desc: "Nature Morph",
      icon: "🐻",
      attr: { STR: 5, VIT: 6, INT: 8 }, // Balanced Magic
      skills: ["bear_form", "thorn_whip", "regrowth"], // v36.1: Added Thorn Whip for Dmg
      passives: ["nature_touch", "regenerator"],
      sprite: {
        idle: `<span class="pixel-sprite sprite-class-druid">
 ☘️
▄███▄
 ███
▄█░█▄
▄   ▄</span>`
      }
    },
    berserker: {
      name: "Berserker",
      desc: "Rage DPS",
      icon: "🪓",
      attr: { STR: 10, VIT: 5, INT: 1 }, // Pure STR
      skills: ["whirlwind", "enrage", "shout"],
      passives: ["rage_meter", "strong_arm"],
      sprite: {
        idle: `<span class="pixel-sprite sprite-class-berserker">
 ▀▄▀
▀▓▓▓▀
 ▓▓▓
▀▓░▓▀
▀   ▀</span>`
      }
    },
    mechanist: {
      name: "Mechanist",
      desc: "Tech Utility",
      icon: "⚙️",
      attr: { STR: 4, VIT: 5, INT: 9 }, // Tech is INT
      skills: ["rocket_salvo", "deploy_turret", "overclock"], // Fixed to use real skills
      passives: ["scavenger_pro", "automated_defense"],
      sprite: {
        idle: `<span class="pixel-sprite sprite-class-mechanist">
 ⚙️
▄▓▓▓▄
 ▓▓▓
▄▓░▓▄
▄   ▄</span>`
      }
    },

};
export { CLASSES_DB };