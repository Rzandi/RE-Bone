const ENEMIES_DB = [
    // ===== SURFACE RUINS (Floors 1-20) =====
    {
      name: "Tikus",
      hp: 20,
      atk: 4,
      exp: 10,
      biome: "surface",
      sprite: {
        idle: `<span class="pixel-sprite sprite-rat">
 ░▓░░
░▓▓▓░
░▓░▓░
  ░░░</span>`,
        attack: `<span class="pixel-sprite sprite-rat">
 ░▓░░▓▓
░▓▓▓░░
░▓░▓░
  ░░░</span>`,
        hurt: `<span class="pixel-sprite sprite-rat-hurt">
 ░▓░░
░███░
░▓░▓░
  ░░░</span>`
      },
      skills: ["smash"],
      passives: ["ethereal"],
    },
    {
      name: "Goblin Scout",
      hp: 25,
      atk: 5,
      exp: 12,
      biome: "surface",
      sprite: {
        idle: `<span class="pixel-sprite sprite-goblin">
 ▓▓▓
▓░▓░▓
 ▓░▓
░▓░▓░
 ▓ ▓</span>`,
        attack: `<span class="pixel-sprite sprite-goblin">
 ▓▓▓ ▓
▓░▓░▓
 ▓░▓
░▓░▓░
 ▓ ▓</span>`,
        hurt: `<span class="pixel-sprite sprite-goblin-hurt">
 ███
█░█░█
 █░█
░█░█░
 █ █</span>`
      },
      skills: ["bone_throw"],
      passives: [],
    },
    {
      name: "Wild Wolf",
      hp: 30,
      atk: 7,
      exp: 15,
      biome: "surface",
      sprite: {
        idle: `<span class="pixel-sprite sprite-wolf">
▓▓▓░
▓░▓▓
▓▓▓
░▓▓▓░
 ▓ ▓</span>`,
        attack: `<span class="pixel-sprite sprite-wolf">
▓▓▓░▓
▓░▓▓
▓▓▓
░▓▓▓░
 ▓ ▓</span>`,
        hurt: `<span class="pixel-sprite sprite-wolf-hurt">
███░
█░██
███
░███░
 █ █</span>`
      },
      skills: ["rend"],
      passives: [],
    },
    
    // ===== CRYSTAL CAVERNS (Floors 75-55) ===== (New v27.0)
    {
      name: "Crystal Golem",
      hp: 70,
      atk: 6,
      exp: 40,
      biome: "crystal", // New biome type
      sprite: {
        idle: `<span class="pixel-sprite sprite-golem">
 ▓▓▓▓
▓▓░░▓▓
 ▓▓▓
░▓▓▓░
 ▓ ▓</span>`,
        attack: `<span class="pixel-sprite sprite-golem">
 ▓▓▓▓
▓▓░░▓▓▓
 ▓▓▓
░▓▓▓░
 ▓ ▓</span>`,
        hurt: `<span class="pixel-sprite sprite-golem-hurt">
 ████
██░░██
 ███
░███░
 █ █</span>`
      },
      skills: ["smash", "shield_bash"],
      passives: ["thick_skin"],
    },
    {
      name: "Shard Wisp",
      hp: 35,
      atk: 10,
      exp: 35,
      biome: "crystal",
      sprite: {
        idle: `<span class="pixel-sprite sprite-wisp">
 ░░░
░▓░▓░
 ░▓░
  ░</span>`,
        attack: `<span class="pixel-sprite sprite-wisp">
 ░⚡░
░▓⚡▓░
 ░▓░
  ░</span>`,
        hurt: `<span class="pixel-sprite sprite-wisp-hurt">
 ▒▒▒
▒█▒█▒
 ▒█▒
  ▒</span>`
      },
      skills: ["ice_shard", "terror"],
      passives: ["ethereal"],
    },

    // ===== DEEP CAVERNS (Floors 21-40) =====
    {
      name: "Cave Troll",
      hp: 80,
      atk: 10,
      exp: 35,
      biome: "cavern",
      sprite: {
        idle: `<span class="pixel-sprite sprite-troll">
 ▓▓▓▓
▓░▓▓░▓
 ▓▓▓▓
▓▓░░▓▓
▓░  ░▓</span>`,
        attack: `<span class="pixel-sprite sprite-troll">
 ▓▓▓▓
▓░▓▓░▓▓
 ▓▓▓▓
▓▓░░▓▓
▓░  ░▓</span>`,
        hurt: `<span class="pixel-sprite sprite-troll-hurt">
 ████
█░██░█
 ████
██░░██
█░  ░█</span>`
      },
      skills: ["smash"],
      passives: ["thick_skin"],
    },
    {
      name: "Giant Spider",
      hp: 50,
      atk: 8,
      exp: 30,
      biome: "cavern",
      sprite: {
        idle: `<span class="pixel-sprite sprite-spider">
 ▓░░▓
░▓▓▓░
 ▓▓▓
▓░▓░▓
░ ▓ ░</span>`,
        attack: `<span class="pixel-sprite sprite-spider">
 ▓░░▓
░▓▓▓░▓
 ▓▓▓
▓░▓░▓
░ ▓ ░</span>`,
        hurt: `<span class="pixel-sprite sprite-spider-hurt">
 █░░█
░███░
 ███
█░█░█
░ █ ░</span>`
      },
      skills: ["rend"],
      passives: ["rot_touch"],
    },
    {
      name: "Crystal Golem",
      hp: 70,
      atk: 6,
      exp: 40,
      biome: "cavern",
      sprite: {
        idle: `<span class="pixel-sprite sprite-golem">
 ▓▓▓▓
▓▓░░▓▓
 ▓▓▓
░▓▓▓░
 ▓ ▓</span>`,
        attack: `<span class="pixel-sprite sprite-golem">
 ▓▓▓▓
▓▓░░▓▓▓
 ▓▓▓
░▓▓▓░
 ▓ ▓</span>`,
        hurt: `<span class="pixel-sprite sprite-golem-hurt">
 ████
██░░██
 ███
░███░
 █ █</span>`
      },
      skills: ["shield_bash"],
      passives: ["thick_skin"],
    },
    
    // ===== DARK DUNGEON (Floors 41-60) =====
    {
      name: "Ghoul",
      hp: 50,
      atk: 8,
      exp: 30,
      biome: "dungeon",
      sprite: {
        idle: `<span class="pixel-sprite sprite-ghoul">
 ▓▓▓▓
▓░▓░▓
 ▓▓▓
░▓▓▓░
▓░▓░▓</span>`,
        attack: `<span class="pixel-sprite sprite-ghoul">
 ▓▓▓▓
▓▓▓░▓▓
 ▓▓▓
░▓▓▓░
▓░▓░▓</span>`,
        hurt: `<span class="pixel-sprite sprite-ghoul-hurt">
 ████
█░█░█
 ███
░███░
█░█░█</span>`
      },
      skills: ["rend"],
      passives: ["rot_touch"],
    },
    {
      name: "Undead Knight",
      hp: 90,
      atk: 12,
      exp: 50,
      biome: "dungeon",
      sprite: {
        idle: `<span class="pixel-sprite sprite-knight">
  ▓▓
 ▓▓▓▓
▓░▓▓░▓
 ▓▓▓
 ▓ ▓</span>`,
        attack: `<span class="pixel-sprite sprite-knight">
  ▓▓ ⚔
 ▓▓▓▓
▓░▓▓░▓
 ▓▓▓
 ▓ ▓</span>`,
        hurt: `<span class="pixel-sprite sprite-knight-hurt">
  ██
 ████
█░██░█
 ███
 █ █</span>`
      },
      skills: ["shield_bash"],
      passives: ["thick_skin"],
    },
    {
      name: "Dark Mage",
      hp: 60,
      atk: 10,
      exp: 55,
      biome: "dungeon",
      sprite: {
        idle: `<span class="pixel-sprite sprite-darkmage">
  ▓▓
 ▓░░▓
 ░▓▓░
  ▓▓
 ▓ ▓</span>`,
        attack: `<span class="pixel-sprite sprite-darkmage">
  ▓▓
 ▓░░▓✨
 ░▓▓░
  ▓▓
 ▓ ▓</span>`,
        hurt: `<span class="pixel-sprite sprite-darkmage-hurt">
  ██
 █░░█
 ░██░
  ██
 █ █</span>`
      },
      skills: ["fireball"],
      passives: ["mana_leech"],
    },
    {
      name: "Gargoyle",
      hp: 75,
      atk: 11,
      exp: 52,
      biome: "dungeon",
      sprite: {
        idle: `<span class="pixel-sprite sprite-gargoyle">
 ▓░░▓
 ▓▓▓
▓░▓░▓
 ▓▓▓
▓░ ░▓</span>`,
        attack: `<span class="pixel-sprite sprite-gargoyle">
 ▓░░▓
 ▓▓▓▓
▓░▓░▓
 ▓▓▓
▓░ ░▓</span>`,
        hurt: `<span class="pixel-sprite sprite-gargoyle-hurt">
 █░░█
 ███
█░█░█
 ███
█░ ░█</span>`
      },
      skills: ["bone_throw"],
      passives: ["ethereal"],
    },
    
    // ===== ANCIENT CRYPT (Floors 61-80) =====
    {
      name: "Skeleton",
      hp: 40,
      atk: 6,
      exp: 20,
      biome: "crypt",
      sprite: {
        idle: `<span class="pixel-sprite sprite-skeleton">
 ▓▓▓
▓░▓░▓
 ▓▓▓
░▓░▓░
▓░░░▓</span>`,
        attack: `<span class="pixel-sprite sprite-skeleton">
 ▓▓▓  ▓
▓░▓░▓▓
 ▓▓▓
░▓░▓░
▓░░░▓</span>`,
        hurt: `<span class="pixel-sprite sprite-skeleton-hurt">
 ███
█░█░█
 ███
░█░█░
█░░░█</span>`
      },
      skills: ["shield_bash"],
      passives: ["thick_skin"],
    },
    {
      name: "Mummy Lord",
      hp: 120,
      atk: 15,
      exp: 70,
      biome: "crypt",
      sprite: {
        idle: `<span class="pixel-sprite sprite-mummy">
 ▓▓▓▓▓
▓░▓▓▓░▓
 ▓▓▓▓
░▓▓▓▓░
▓░   ░▓</span>`,
        attack: `<span class="pixel-sprite sprite-mummy">
 ▓▓▓▓▓
▓░▓▓▓░▓
 ▓▓▓▓
░▓▓▓▓░
▓░   ░▓</span>`,
        hurt: `<span class="pixel-sprite sprite-mummy-hurt">
 █████
█░███░█
 ████
░████░
█░   ░█</span>`
      },
      skills: ["terror"],
      passives: ["undying"],
    },
    {
      name: "Spectral Guardian",
      hp: 100,
      atk: 14,
      exp: 75,
      biome: "crypt",
      sprite: {
        idle: `<span class="pixel-sprite sprite-spectral">
 ░▓▓░
░▓░░▓░
 ░▓░
░░▓░░
 ░░░</span>`,
        attack: `<span class="pixel-sprite sprite-spectral">
 ░▓▓░
░▓░░▓░⚡
 ░▓░
░░▓░░
 ░░░</span>`,
        hurt: `<span class="pixel-sprite sprite-spectral-hurt">
 ░██░
░█░░█░
 ░█░
░░█░░
 ░░░</span>`
      },
      skills: ["ice_shard"],
      passives: ["ethereal"],
    },
    
    // ===== THE ABYSS (Floors 81-100) =====
    {
      name: "Void Walker",
      hp: 150,
      atk: 18,
      exp: 100,
      biome: "abyss",
      sprite: {
        idle: `<span class="pixel-sprite sprite-void">
 ░░▓░░
░▓▓▓▓░
 ▓░░▓
░░▓░░
 ░ ░</span>`,
        attack: `<span class="pixel-sprite sprite-void">
 ░░▓░░
░▓▓▓▓░
 ▓░░▓✨
░░▓░░
 ░ ░</span>`,
        hurt: `<span class="pixel-sprite sprite-void-hurt">
 ░░█░░
░████░
 █░░█
░░█░░
 ░ ░</span>`
      },
      skills: ["terror"],
      passives: ["ethereal", "mana_leech"],
    },
    {
      name: "Abyssal Demon",
      hp: 180,
      atk: 20,
      exp: 120,
      biome: "abyss",
      sprite: {
        idle: `<span class="pixel-sprite sprite-demon">
 ▓░░▓
▓▓▓▓▓▓
▓░▓▓░▓
 ▓▓▓
▓░▓░▓</span>`,
        attack: `<span class="pixel-sprite sprite-demon">
 ▓░░▓🔥
▓▓▓▓▓▓
▓░▓▓░▓
 ▓▓▓
▓░▓░▓</span>`,
        hurt: `<span class="pixel-sprite sprite-demon-hurt">
 █░░█
██████
█░██░█
 ███
█░█░█</span>`
      },
      skills: ["fireball", "rend"],
      passives: ["rot_touch"],
    },

];
const BOSSES_DB = {
    80: {
      name: "CRYPT LORD",
      hp: 250,
      atk: 16,
      exp: 200,
      sprite: {
        idle: `<span class="pixel-sprite sprite-boss-cryptlord">
  ▓▓▓▓▓▓
 ▓░▓▓▓░▓
 ▓▓▓▓▓▓
  ▓▓▓▓
 ▓░▓░▓
 ▓  ▓  ▓</span>`,
        attack: `<span class="pixel-sprite sprite-boss-cryptlord">
  ▓▓▓▓▓▓ ☠
 ▓░▓▓▓░▓
 ▓▓▓▓▓▓
  ▓▓▓▓
 ▓░▓░▓
 ▓  ▓  ▓</span>`,
        hurt: `<span class="pixel-sprite sprite-boss-cryptlord-hurt">
  ██████
 █░███░█
 ██████
  ████
 █░█░█
 █  █  █</span>`
      },
      skills: ["terror", "death_bolt"],
      passives: ["undying", "undead_mastery"],
    },
    
    // v27.0 Boss
    70: {
      name: "PRISM CONSTRUCT",
      hp: 150,
      atk: 15,
      exp: 130,
      sprite: {
        idle: `<span class="pixel-sprite sprite-boss-prism">
  ▄▄▄
 ▄▓▓▓▄
▄▓░░░▓▄
 ▀▓▓▓▀
  ▀▀▀</span>`,
        attack: `<span class="pixel-sprite sprite-boss-prism">
  ▄▄▄
 ▄▓▓▓▄⚡
▄▓░░░▓▄
 ▀▓▓▓▀
  ▀▀▀</span>`,
        hurt: `<span class="pixel-sprite sprite-boss-prism-hurt">
  ███
 █░░░█
█░░░░░█
 ▀███▀
  ▀▀▀</span>`
      },
      skills: ["ice_shard", "smash"],
      passives: ["thick_skin"],
    },
    
    60: {
      name: "SHADOW WARDEN",
      hp: 200,
      atk: 18,
      exp: 180,
      sprite: {
        idle: `<span class="pixel-sprite sprite-boss-shadow">
   ░▓▓░
  ▓▓▓▓▓
 ▓░▓▓▓░▓
  ▓▓▓▓
  ▓  ▓</span>`,
        attack: `<span class="pixel-sprite sprite-boss-shadow">
   ░▓▓░
  ▓▓▓▓▓✨
 ▓░▓▓▓░▓
  ▓▓▓▓
  ▓  ▓</span>`,
        hurt: `<span class="pixel-sprite sprite-boss-shadow-hurt">
   ░██░
  █████
 █░███░█
  ████
  █  █</span>`
      },
      skills: ["fireball", "ice_shard", "terror"],
      passives: ["mana_leech", "ethereal"],
    },
    40: {
      name: "GOBLIN KING",
      hp: 100,
      atk: 10,
      exp: 100,
      sprite: {
        idle: `<span class="pixel-sprite sprite-boss-goblin">
  ▓▓▓▓▓
 ▓░███░▓
 ▓▓▓▓▓▓
  ▓▓▓▓
 ▓░▓▓░▓
  ▓  ▓</span>`,
        attack: `<span class="pixel-sprite sprite-boss-goblin">
  ▓▓▓▓▓  ⚔
 ▓░███░▓
 ▓▓▓▓▓▓
  ▓▓▓▓
 ▓░▓▓░▓
  ▓  ▓</span>`,
        hurt: `<span class="pixel-sprite sprite-boss-goblin-hurt">
  █████
 █░███░█
 ██████
  ████
 █░██░█
  █  █</span>`
      },
      skills: ["smash", "rend"],
      passives: ["thick_skin"],
    },
    20: {
      name: "STONE TITAN",
      hp: 300,
      atk: 12,
      exp: 150,
      sprite: {
        idle: `<span class="pixel-sprite sprite-boss-titan">
  ▓▓▓▓▓▓
 ▓▓░░░▓▓
 ▓▓▓▓▓▓
  ▓▓▓▓
 ▓▓░░▓▓
  ▓  ▓</span>`,
        attack: `<span class="pixel-sprite sprite-boss-titan">
  ▓▓▓▓▓▓
 ▓▓░░░▓▓💥
 ▓▓▓▓▓▓
  ▓▓▓▓
 ▓▓░░▓▓
  ▓  ▓</span>`,
        hurt: `<span class="pixel-sprite sprite-boss-titan-hurt">
  ██████
 ██░░░██
 ██████
  ████
 ██░░██
  █  █</span>`
      },
      skills: ["smash", "shield_bash"],
      passives: ["thick_skin", "undying"],
    },
    1: {
      name: "HERO PARTY",
      hp: 400,
      atk: 20,
      exp: 500,
      sprite: {
        idle: `<span class="pixel-sprite sprite-boss-hero">
 ▓▓ ▓▓ ▓▓
▓░▓▓░▓▓░▓
 ▓▓ ▓▓ ▓▓
 ░▓ ░▓ ░▓
 ▓▓ ▓▓ ▓▓</span>`,
        attack: `<span class="pixel-sprite sprite-boss-hero">
 ▓▓ ▓▓ ▓▓
▓░▓▓░▓▓░▓⚔
 ▓▓ ▓▓ ▓▓✨
 ░▓ ░▓ ░▓
 ▓▓ ▓▓ ▓▓</span>`,
        hurt: `<span class="pixel-sprite sprite-boss-hero-hurt">
 ██ ██ ██
█░██░██░█
 ██ ██ ██
 ░█ ░█ ░█
 ██ ██ ██</span>`
      },
      skills: ["fireball", "heal", "smash"],
      passives: ["undying"],
      isFinal: true,
    },

};
window.ENEMIES_DB = ENEMIES_DB;
window.BOSSES_DB = BOSSES_DB;