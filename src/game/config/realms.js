/* =========================================
   REALMS CONFIG (v34.0)
   The 5 Major Regions of the World Map
   ========================================= */

export const REALMS = {
    nature_den: {
        id: 'nature_den',
        name: "Nature's Den",
        desc: "A sprawling ancient forest reclaimed by the wild.",
        color: '#2ecc71',
        icon: '🌳',
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
            hp: 2500, // Balanced Tier 1 (was 5000)
            unlockClass: "druid",
            drop: "wrath_of_nature"
        }
    },
    
    shadow_guild: {
        id: 'shadow_guild',
        name: "Shadow Guild",
        desc: "A labyrinth of alleys and hidden passages.",
        color: '#9b59b6',
        icon: '🗡️',
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
            hp: 5000, // Balanced Tier 2 (was 4500)
            unlockClass: "shadow_assassin",
            drop: "nightfall_blade"
        }
    },

    light_castle: {
        id: 'light_castle',
        name: "Castle of Light",
        desc: "The pristine citadel of the Holy Order.",
        color: '#f1c40f',
        icon: '🏰',
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
            hp: 10000, // Balanced Tier 3 (was 8000)
            unlockClass: "paladin",
            drop: "excalibur"
        }
    },

    arcane_tower: {
        id: 'arcane_tower',
        name: "Arcane Tower",
        desc: "A defiance of gravity and logic.",
        color: '#3498db',
        icon: '🔮',
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
            hp: 18000, // Balanced Tier 4 (was 4000)
            unlockClass: "mechanist", 
            drop: "chronos_staff"
        }
    },

    iron_fort: {
        id: 'iron_fort',
        name: "Iron Fortress",
        desc: "A machine of perpetual war.",
        color: '#e74c3c',
        icon: '🛡️',
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
            hp: 30000, // Balanced Tier 5 (was 10000)
            unlockClass: "berserker",
            drop: "ragnarok"
        }
    }
};

window.REALMS = REALMS; // Expose globally
