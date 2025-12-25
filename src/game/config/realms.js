/* =========================================
   REALMS CONFIG (v34.0)
   The 5 Major Regions of the World Map
   ========================================= */

export const REALMS = {
    nature_den: {
        id: 'nature_den',
        name: "Nature's Den",
        desc: "An ancient, suffocating woodland where nature aggressively reclaims the dead.",
        color: '#2ecc71',
        icon: '🌳',
        range: [1, 100], // v38.6 Epix Mode
        biomes: [
            { id: 'swamp', name: 'Toxic Swamp', effect: 'Poison' },
            { id: 'deep_forest', name: 'Deep Forest', effect: 'Fog' },
            { id: 'fungal_cave', name: 'Fungal Cave', effect: 'Spore' },
            { id: 'riverbank', name: 'Riverbank', effect: 'Slippery' },
            { id: 'elf_village', name: 'Ruined Village', effect: 'Ambush' }
        ],
        boss: {
            name: "Keeper of the Den",
            sprite: "druid_boss",
            hp: 2500, 
            unlockClass: "druid",
            drop: "wrath_of_nature"
        }
    },
    
    shadow_guild: {
        id: 'shadow_guild',
        name: "Shadow Guild",
        desc: "A subterranean labyrinth of thieves, assassins, and secrets better left buried.",
        color: '#9b59b6',
        icon: '🗡️',
        range: [101, 200],
        biomes: [
            { id: 'sewers', name: 'The Sewers', effect: 'Stench' },
            { id: 'rooftops', name: 'Midnight Rooftops', effect: 'Wind' },
            { id: 'market', name: 'Black Market', effect: 'Crowd' },
            { id: 'dungeon', name: 'Guild Dungeon', effect: 'Darkness' },
            { id: 'throne', name: 'Shadow Throne', effect: 'Silence' }
        ],
        boss: {
            name: "Grandmaster Rogue",
            sprite: "rogue_boss",
            hp: 5000,
            unlockClass: "shadow_assassin",
            drop: "nightfall_blade"
        }
    },

    light_castle: {
        id: 'light_castle',
        name: "Castle of Light",
        desc: "The blinding citadel of a fallen order, preserved in pristine, hollow silence.",
        color: '#f1c40f',
        icon: '🏰',
        range: [201, 300],
        biomes: [
            { id: 'courtyard', name: 'Grand Courtyard', effect: 'Blinding' },
            { id: 'cathedral', name: 'Crystal Cathedral', effect: 'Holy' },
            { id: 'barracks', name: 'Paladin Barracks', effect: 'Formation' },
            { id: 'library', name: 'Archives of Truth', effect: 'Silence' },
            { id: 'sanctum', name: 'Inner Sanctum', effect: 'Purge' }
        ],
        boss: {
            name: "High Lord Paladin",
            sprite: "paladin_boss",
            hp: 10000,
            unlockClass: "paladin",
            drop: "excalibur"
        }
    },

    arcane_tower: {
        id: 'arcane_tower',
        name: "Arcane Tower",
        desc: "A reality-bending spire that defies gravity, logic, and sanity.",
        color: '#3498db',
        icon: '🔮',
        range: [301, 400],
        biomes: [
            { id: 'library_void', name: 'Floating Library', effect: 'Gravity' },
            { id: 'lab', name: 'Alchemy Lab', effect: 'Explosive' },
            { id: 'observatory', name: 'Star Observatory', effect: 'Cosmic' },
            { id: 'construct', name: 'Golem Factory', effect: 'Metal' },
            { id: 'pinnacle', name: 'The Pinnacle', effect: 'ManaStorm' }
        ],
        boss: {
            name: "Archmage of Time",
            sprite: "mage_boss",
            hp: 18000,
            unlockClass: "mechanist", 
            drop: "chronos_staff"
        }
    },

    iron_fort: {
        id: 'iron_fort',
        name: "Iron Fortress",
        desc: "A colossal engine of perpetual war, churning smoke and steel.",
        color: '#e74c3c',
        icon: '🛡️',
        range: [401, 500],
        biomes: [
            { id: 'forge', name: 'The Great Forge', effect: 'Heat' },
            { id: 'mine', name: 'Deep Mines', effect: 'Collapse' },
            { id: 'armory', name: 'Infinite Armory', effect: 'Sharp' },
            { id: 'walls', name: 'Outer Walls', effect: 'Sniper' },
            { id: 'core', name: 'Command Core', effect: 'Alarm' }
        ],
        boss: {
            name: "Warlord King",
            sprite: "warrior_boss",
            hp: 30000,
            unlockClass: "berserker",
            drop: "ragnarok"
        }
    }
};

// window.REALMS = REALMS; // REMOVED v38.0
