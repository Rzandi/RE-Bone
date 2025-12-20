const CLASSES_DB = {
    skeleton: {
      name: "Skeleton",
      desc: "Seimbang",
      icon: "💀",
      attr: { STR: 5, VIT: 5, INT: 2 },
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
      attr: { STR: 7, VIT: 7, INT: 1 },
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
      attr: { STR: 2, VIT: 3, INT: 8 },
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
      attr: { STR: 6, VIT: 4, INT: 4 },
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
      attr: { STR: 1, VIT: 3, INT: 10 },
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
      attr: { STR: 4, VIT: 2, INT: 7 },
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
      skills: ["soul_cleave", "smash", "frenzy"],
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
      skills: ["plague_ward", "death_bolt", "heal"],
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
      skills: ["vanish", "bone_throw", "rend"],
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

};
export { CLASSES_DB };