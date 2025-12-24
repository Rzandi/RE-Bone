/* =========================================
   ENEMIES DATABASE (v36.2)
   Mapped by Biome ID
   ========================================= */

// --- SPRITE ASSETS (Restored) ---
const SPRITES = {
    wolf: {
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
  ▓ ▓</span>`
    },
    goblin: {
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
  ▓ ▓</span>`
    },
    golem: {
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
  ▓ ▓</span>`
    },
    spider: {
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
 ░ ▓ ░</span>`
    },
    skeleton: {
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
 ▓░░░▓</span>`
    },
    ghoul: {
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
 ▓░▓░▓</span>`
    },
    knight: {
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
  ▓ ▓</span>`
    },
    gargoyle: {
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
 ▓░ ░▓</span>`
    },
    mage: {
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
  ▓ ▓</span>`
    }
};

const BIOME_ENEMIES = {
    // ============================
    // 🌳 NATURE'S DEN
    // ============================
    swamp: [
        { name: "Toxic Slime", hp: 30, atk: 4, exp: 12, sprite: { idle: "🟢", attack: "🤢" }, skills: ["poison_spit"], passives: ["split"] },
        { name: "Mud Golem", hp: 50, atk: 6, exp: 15, sprite: SPRITES.golem, skills: ["smash"], passives: ["thick_skin"] }, // Restored Golem
        { name: "Plague Fly", hp: 20, atk: 8, exp: 10, sprite: { idle: "🪰", attack: "🦟" }, skills: ["bite"], passives: ["dodge_50"] }
    ],
    deep_forest: [
        { name: "Thorn Wolf", hp: 45, atk: 8, exp: 18, sprite: SPRITES.wolf, skills: ["rend", "howl"], passives: ["pack_tactics"] }, // Restored Wolf
        { name: "Elder Ent", hp: 80, atk: 5, exp: 25, sprite: { idle: "🌲", attack: "🍂" }, skills: ["entangle", "heal"], passives: ["regen"] },
        { name: "Giant Spider", hp: 40, atk: 12, exp: 15, sprite: SPRITES.spider, skills: ["blind"], passives: ["ethereal"] } // Restored Spider
    ],
    fungal_cave: [
        { name: "Spore Cap", hp: 35, atk: 5, exp: 16, sprite: { idle: "🍄", attack: "💨" }, skills: ["sleep_spore"], passives: ["toxic_cloud"] },
        { name: "Myconidar", hp: 60, atk: 7, exp: 22, sprite: { idle: "🧠", attack: "🧬" }, skills: ["mind_rot"], passives: ["hive_mind"] },
        { name: "Fungal Beast", hp: 70, atk: 9, exp: 24, sprite: { idle: "🐗", attack: "🩸" }, skills: ["charge"], passives: ["spore_burst"] }
    ],
    riverbank: [
        { name: "River Crab", hp: 40, atk: 6, exp: 14, sprite: { idle: "🦀", attack: "✂️" }, skills: ["snap"], passives: ["shell"] },
        { name: "Siren", hp: 30, atk: 10, exp: 20, sprite: { idle: "🧜", attack: "🎵" }, skills: ["lure", "scream"], passives: ["wet"] },
        { name: "Water Elemental", hp: 55, atk: 7, exp: 22, sprite: { idle: "💧", attack: "🌊" }, skills: ["crush"], passives: ["fluid"] }
    ],
    elf_village: [
        { name: "Corrupted Elf", hp: 50, atk: 10, exp: 25, sprite: { idle: "🧝", attack: "🗡️" }, skills: ["slash", "parry"], passives: ["precision"] },
        { name: "Ranger", hp: 40, atk: 12, exp: 25, sprite: SPRITES.goblin, skills: ["multishot"], passives: ["eagle_eye"] }, // Placeholder/Recolor? using Goblin structure for now as a small humanoid
        { name: "Druid Cultist", hp: 45, atk: 8, exp: 28, sprite: { idle: "🧙", attack: "🌿" }, skills: ["thorn_whip", "morph"], passives: ["thorns"] }
    ],

    // ============================
    // 🗡️ SHADOW GUILD
    // ============================
    sewers: [
        { name: "Sewer Rat", hp: 60, atk: 12, exp: 20, sprite: { idle: "🐀", attack: "🦷" }, skills: ["bite"], passives: ["disease"] },
        { name: "Sludge Monster", hp: 120, atk: 15, exp: 35, sprite: { idle: "💩", attack: "🤢" }, skills: ["suffocate"], passives: ["sticky"] },
        { name: "Outcast", hp: 80, atk: 14, exp: 25, sprite: SPRITES.goblin, skills: ["shank"], passives: ["desperate"] } // Reuse Goblin
    ],
    rooftops: [
        { name: "Assassin", hp: 90, atk: 25, exp: 45, sprite: { idle: "🐱‍👤", attack: "🗡️" }, skills: ["backstab", "vanish"], passives: ["stealth"] },
        { name: "Crow", hp: 50, atk: 12, exp: 15, sprite: { idle: "🐦", attack: "👀" }, skills: ["peck"], passives: ["flight"] },
        { name: "Gargoyle", hp: 150, atk: 18, exp: 50, sprite: SPRITES.gargoyle, skills: ["slam"], passives: ["stone_form"] } // Restored
    ],
    market: [
        { name: "Thief", hp: 70, atk: 15, exp: 30, sprite: { idle: "👿", attack: "💰" }, skills: ["steal"], passives: ["evade"] },
        { name: "Corrupt Guard", hp: 130, atk: 20, exp: 45, sprite: SPRITES.knight, skills: ["shield_bash"], passives: ["bribe"] }, // Restored Knight
        { name: "Mimic", hp: 100, atk: 22, exp: 60, sprite: { idle: "📦", attack: "🦷" }, skills: ["surprise"], passives: ["fake"] }
    ],
    dungeon: [
        { name: "Torturer", hp: 110, atk: 18, exp: 50, sprite: SPRITES.ghoul, skills: ["flay"], passives: ["cruelty"] }, // Restored Ghoul
        { name: "Chained Soul", hp: 60, atk: 20, exp: 40, sprite: { idle: "👻", attack: "😱" }, skills: ["wail"], passives: ["bound"] },
        { name: "Warden", hp: 180, atk: 25, exp: 80, sprite: SPRITES.mage, skills: ["lockdown"], passives: ["iron_will"] } // Restored Mage
    ],
    throne: [
        { name: "Shadow Guard", hp: 160, atk: 24, exp: 70, sprite: SPRITES.knight, skills: ["void_slash"], passives: ["loyalty"] }, // Restored Knight
        { name: "Court Jester", hp: 100, atk: 18, exp: 60, sprite: { idle: "🃏", attack: "🎭" }, skills: ["tricks"], passives: ["madness"] },
        { name: "Royal Shade", hp: 140, atk: 28, exp: 80, sprite: SPRITES.skeleton, skills: ["execution"], passives: ["ethereal"] } // Restored Skeleton
    ],

    // ============================
    // 🏰 LIGHT CASTLE
    // ============================
    // ============================
    // 🏰 LIGHT CASTLE (Tier 3)
    // Stats: HP 120-180, ATK 20-30
    // ============================
    courtyard: [
        { name: "Guard Dog", hp: 120, atk: 22, exp: 50, sprite: SPRITES.wolf, skills: ["bite"], passives: ["alert"] },
        { name: "Squire", hp: 150, atk: 20, exp: 55, sprite: { idle: "👶", attack: "🗡️" }, skills: ["thrust"], passives: ["brave"] },
        { name: "Statue", hp: 200, atk: 25, exp: 70, sprite: SPRITES.golem, skills: ["smash"], passives: ["construct"] }
    ],
    cathedral: [
        { name: "Priest", hp: 130, atk: 18, exp: 60, sprite: { idle: "✝️", attack: "✨" }, skills: ["heal", "smite"], passives: ["blessed"] },
        { name: "Light Wisp", hp: 100, atk: 30, exp: 55, sprite: { idle: "💡", attack: "⚡" }, skills: ["flash"], passives: ["ethereal"] },
        { name: "Glass Golem", hp: 180, atk: 20, exp: 75, sprite: SPRITES.golem, skills: ["shard_spray"], passives: ["reflect"] }
    ],
    barracks: [
        { name: "Paladin", hp: 220, atk: 28, exp: 80, sprite: SPRITES.knight, skills: ["stunning_blow"], passives: ["armor"] },
        { name: "Recruit", hp: 140, atk: 20, exp: 55, sprite: { idle: "👦", attack: "⚔️" }, skills: ["flurry"], passives: ["morale"] },
        { name: "Captain", hp: 300, atk: 35, exp: 120, sprite: SPRITES.knight, skills: ["rally"], passives: ["leader"] } // Elite-ish
    ],
    library: [
        { name: "Flying Tome", hp: 110, atk: 25, exp: 60, sprite: { idle: "📖", attack: "📄" }, skills: ["paper_cut"], passives: ["flight"] },
        { name: "Silence Warden", hp: 160, atk: 15, exp: 70, sprite: { idle: "🤫", attack: "🤐" }, skills: ["silence"], passives: ["aura"] },
        { name: "Scroll Mimic", hp: 140, atk: 35, exp: 80, sprite: { idle: "📜", attack: "🦷" }, skills: ["surprise"], passives: ["fake"] }
    ],
    sanctum: [
        { name: "Inquisitor", hp: 180, atk: 32, exp: 90, sprite: SPRITES.mage, skills: ["burn"], passives: ["purify"] },
        { name: "Divine Spark", hp: 100, atk: 45, exp: 70, sprite: { idle: "⚡", attack: "💥" }, skills: ["explode"], passives: ["volatile"] },
        { name: "Angel", hp: 250, atk: 40, exp: 150, sprite: { idle: "👼", attack: "🏹" }, skills: ["judgment"], passives: ["flight"] }
    ],

    // ============================
    // 🔮 ARCANE TOWER (Tier 4)
    // Stats: HP 250-400, ATK 40-60
    // ============================
    library_void: [
        { name: "Void Ray", hp: 250, atk: 45, exp: 120, sprite: { idle: "🦑", attack: "👁️" }, skills: ["gaze"], passives: ["flight"] },
        { name: "Lost Scholar", hp: 280, atk: 40, exp: 130, sprite: SPRITES.ghoul, skills: ["mad_babble"], passives: ["insane"] },
        { name: "Ink Blot", hp: 350, atk: 50, exp: 150, sprite: { idle: "⚫", attack: "✒️" }, skills: ["blind"], passives: ["fluid"] }
    ],
    lab: [
        { name: "Failed Experiment", hp: 400, atk: 55, exp: 160, sprite: { idle: "🧪", attack: "🤮" }, skills: ["acid"], passives: ["unstable"] },
        { name: "Homunculus", hp: 260, atk: 40, exp: 140, sprite: { idle: "👶", attack: "🦷" }, skills: ["gnaw"], passives: ["adaptive"] },
        { name: "Potion Mimic", hp: 300, atk: 70, exp: 180, sprite: { idle: "🍷", attack: "💥" }, skills: ["splash"], passives: ["fake"] }
    ],
    observatory: [
        { name: "Star Child", hp: 250, atk: 65, exp: 150, sprite: { idle: "⭐", attack: "✨" }, skills: ["beam"], passives: ["glowing"] },
        { name: "Nebula Cloud", hp: 500, atk: 30, exp: 200, sprite: { idle: "☁️", attack: "⚡" }, skills: ["shock"], passives: ["gas"] },
        { name: "Alien Observer", hp: 320, atk: 50, exp: 170, sprite: { idle: "👽", attack: "📡" }, skills: ["scan"], passives: ["dodge_50"] }
    ],
    construct: [
        { name: "Steam Golem", hp: 600, atk: 45, exp: 250, sprite: SPRITES.golem, skills: ["steam_vent"], passives: ["armored"] },
        { name: "Cog Drone", hp: 200, atk: 55, exp: 140, sprite: { idle: "⚙️", attack: "📏" }, skills: ["saw"], passives: ["flight"] },
        { name: "Scrap Heap", hp: 800, atk: 25, exp: 200, sprite: { idle: "🗑️", attack: "🧱" }, skills: ["avalanche"], passives: ["regen"] }
    ],
    pinnacle: [
        { name: "Mana Wyrm", hp: 400, atk: 70, exp: 300, sprite: { idle: "🐉", attack: "🔥" }, skills: ["breath"], passives: ["mana_absorb"] },
        { name: "Time Elemental", hp: 350, atk: 60, exp: 280, sprite: { idle: "⏳", attack: "⌛" }, skills: ["rewind"], passives: ["dodge_50"] },
        { name: "Archmage Shade", hp: 300, atk: 80, exp: 350, sprite: SPRITES.mage, skills: ["disintegrate"], passives: ["shield"] }
    ],

    // ============================
    // 🛡️ IRON FORT (Tier 5)
    // Stats: HP 600-1000, ATK 80-120
    // ============================
    forge: [
        { name: "Magma Slime", hp: 800, atk: 80, exp: 400, sprite: { idle: "🌋", attack: "🔥" }, skills: ["burn"], passives: ["split"] },
        { name: "Anvil Golem", hp: 1200, atk: 90, exp: 500, sprite: SPRITES.golem, skills: ["flatten"], passives: ["metal"] },
        { name: "Salamander", hp: 700, atk: 110, exp: 450, sprite: { idle: "🦎", attack: "🔥" }, skills: ["fire_breath"], passives: ["fire_heal"] }
    ],
    mine: [
        { name: "Deep Dwarf", hp: 900, atk: 85, exp: 420, sprite: { idle: "🧔", attack: "⛏️" }, skills: ["dig"], passives: ["greed"] },
        { name: "Rock Worm", hp: 1500, atk: 100, exp: 600, sprite: { idle: "🐛", attack: "🦷" }, skills: ["swallow"], passives: ["burrow"] },
        { name: "Crystal Bat", hp: 600, atk: 130, exp: 450, sprite: { idle: "🦇", attack: "💎" }, skills: ["screech"], passives: ["flight"] }
    ],
    armory: [
        { name: "Animated Armor", hp: 1000, atk: 100, exp: 500, sprite: SPRITES.knight, skills: ["cleave"], passives: ["invulnerable"] },
        { name: "Haunted Blade", hp: 500, atk: 150, exp: 480, sprite: { idle: "🗡️", attack: "☠️" }, skills: ["slice"], passives: ["ethereal"] },
        { name: "Weapon Master", hp: 1100, atk: 120, exp: 600, sprite: SPRITES.knight, skills: ["parry_counter"], passives: ["expert"] }
    ],
    walls: [
        { name: "Sniper", hp: 600, atk: 200, exp: 550, sprite: { idle: "🔭", attack: "🎯" }, skills: ["headshot"], passives: ["range"] },
        { name: "Siege Beast", hp: 2000, atk: 90, exp: 800, sprite: { idle: "🐘", attack: "🏚️" }, skills: ["batter"], passives: ["siege"] },
        { name: "Wall Guard", hp: 1200, atk: 100, exp: 600, sprite: SPRITES.gargoyle, skills: ["shield_wall"], passives: ["anchored"] }
    ],
    core: [
        { name: "Clockwork Soldier", hp: 1500, atk: 110, exp: 700, sprite: { idle: "🤖", attack: "🔫" }, skills: ["laser"], passives: ["explode_on_death"] },
        { name: "Security Drone", hp: 800, atk: 140, exp: 650, sprite: { idle: "🛸", attack: "⚡" }, skills: ["tase"], passives: ["flying"] },
        { name: "The Hand", hp: 2500, atk: 150, exp: 1000, sprite: SPRITES.golem, skills: ["crush"], passives: ["boss_minion"] }
    ],
    
    // ===== LEGACY FALLBACK (For Logic Checks) =====
    surface: [ { name: "Tikus", hp: 20, atk: 4, exp: 10, sprite: SPRITES.goblin, skills: ["bite"] } ]
};

// Default Legacy Array for backwards compat
const ENEMIES_DB = Object.values(BIOME_ENEMIES).flat(); 

const BOSSES_DB = {
    // Floor 20: First Boss (Easy)
    20: {
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
    
    // Floor 40: Second Boss (Medium)
    40: {
      name: "STONE TITAN",
      hp: 200,
      atk: 15,
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
 ███░░░██
  ██████
  ████
 ██░░██
  █  █</span>`
      },
      skills: ["smash", "shield_bash"],
      passives: ["thick_skin", "undying"],
    },
    
    // Floor 60: Third Boss (Hard)
    60: {
      name: "SHADOW WARDEN",
      hp: 300,
      atk: 20,
      exp: 200,
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
    
    // Floor 80: Fourth Boss (Very Hard)
    80: {
      name: "CRYPT LORD",
      hp: 400,
      atk: 25,
      exp: 300,
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
    
    // Floor 100: Final Boss (Extreme)
    100: {
      name: "HERO PARTY",
      hp: 600,
      atk: 35,
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

export { BIOME_ENEMIES, ENEMIES_DB, BOSSES_DB };