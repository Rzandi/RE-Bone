const CLASSES_DB = {
    skeleton: {
      name: "Skeleton",
      desc: "Seimbang",
      icon: "💀",
      attr: { STR: 6, VIT: 6, INT: 4, AGI: 3, LCK: 3 }, // v38.4: Added AGI/LCK
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
      attr: { STR: 7, VIT: 8, INT: 2, AGI: 2, LCK: 2 }, // v38.4: Slow tanky
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
      attr: { STR: 3, VIT: 4, INT: 10, AGI: 5, LCK: 4 }, // v38.4: Evasive caster
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
      attr: { STR: 7, VIT: 5, INT: 5, AGI: 4, LCK: 3 }, // v38.4: Agile predator
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
      attr: { STR: 2, VIT: 4, INT: 11, AGI: 2, LCK: 5 }, // v38.4: Lucky caster
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
      attr: { STR: 5, VIT: 3, INT: 8, AGI: 6, LCK: 3 }, // v38.4: Fastest class
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
      attr: { STR: 9, VIT: 8, INT: 2, AGI: 2, LCK: 1 }, // v38.4: Heavy slow
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
      attr: { STR: 2, VIT: 6, INT: 9, AGI: 3, LCK: 4 }, // v38.4: Lucky healer
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
      attr: { STR: 4, VIT: 3, INT: 8, AGI: 7, LCK: 3 }, // v38.4: Max agility
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
      attr: { STR: 6, VIT: 9, INT: 4, AGI: 2, LCK: 4 }, // v38.4: Protected luck
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
      attr: { STR: 5, VIT: 6, INT: 8, AGI: 4, LCK: 5 }, // v38.4: Nature luck
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
      attr: { STR: 10, VIT: 5, INT: 1, AGI: 3, LCK: 1 }, // v38.4: Pure rage
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
      attr: { STR: 4, VIT: 5, INT: 9, AGI: 3, LCK: 6 }, // v38.4: Tech luck
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