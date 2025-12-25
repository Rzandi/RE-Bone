import { LEGENDARY_ITEMS } from './legendary_items.js';



export const ITEMS_DB = {
    /* =========================================
       COMMON TIERS (White)
       Start of the journey. Basic gear and raw materials.
       ========================================= */
    // Materials
    scrap_metal: { name: "Scrap Metal", slot: "mat", price: 2, desc: "Used for crafting", rarity: "common" },
    magic_dust: { name: "Magic Dust", slot: "mat", price: 5, desc: "Glowing dust", rarity: "common" },
    tough_leather: { name: "Tough Leather", slot: "mat", price: 3, desc: "Cured hide", rarity: "common" },
    swamp_moss: { name: "Swamp Moss", slot: "mat", price: 8, desc: "Sticky and toxic.", rarity: "common" },
    sewer_rat_tail: { name: "Rat Tail", slot: "mat", price: 2, desc: "Disgusting.", rarity: "common" },
    holy_water_vial: { name: "Holy Water Vial", slot: "mat", price: 12, desc: "Blessed water container.", rarity: "common" },
    steel_plate: { name: "Steel Plate", slot: "mat", price: 10, desc: "Heavy plating.", rarity: "common" },

    // Consumables
    rotten_meat: { name: "Rotten Meat", slot: "con", val: 20, price: 2, desc: "Heal 20 (Gross)", rarity: "common" },
    health_potion: { name: "Health Potion", slot: "con", val: 100, price: 50, desc: "Heal 100 HP", rarity: "common" },
    mana_potion: { name: "Mana Potion", slot: "con", mp: 50, price: 50, desc: "Restore 50 MP", rarity: "common" },
    
    // Equipment
    rusty_knife: { name: "Rusty Knife", slot: "weapon", atk: 3, price: 10, desc: "Better than fists.", rarity: "common" },
    iron_sword: { name: "Iron Sword", slot: "weapon", atk: 8, price: 50, desc: "Standard issue.", rarity: "common" },
    leather_armor: { name: "Leather Armor", slot: "armor", def: 2, hp: 10, price: 15, desc: "Basic protection.", rarity: "common" },
    smoke_bomb: { name: "Smoke Bomb", slot: "acc", def: 0, agi: 2, price: 80, desc: "Emergency escape. +2 AGI", rarity: "common", uniqueEffect: "dodge_10" },

    // Books
    book_smash: { name: "Book: Smash", slot: "skill_book", skillId: "smash", price: 50, rarity: "common", desc: "Learn Smash" },
    book_bone_throw: { name: "Book: Bone Throw", slot: "skill_book", skillId: "bone_throw", price: 60, rarity: "common", desc: "Learn Bone Throw" },
    book_shield_bash: { name: "Book: Shield Bash", slot: "skill_book", skillId: "shield_bash", price: 80, rarity: "common", desc: "Learn Shield Bash" },

    book_shield_bash: { name: "Book: Shield Bash", slot: "skill_book", skillId: "shield_bash", price: 80, rarity: "common", desc: "Learn Shield Bash" },
    
    // Crafting Exclusives (or drops)
    bone_sword: { name: "Bone Sword", slot: "weapon", atk: 15, price: 100, desc: "Crafted from scrap.", rarity: "rare" },

    /* =========================================
    // Materials
    ironwood_log: { name: "Ironwood Log", slot: "mat", price: 15, desc: "Hard as steel.", rarity: "uncommon" },
    shadow_cloth: { name: "Shadow Cloth", slot: "mat", price: 10, desc: "Absorbs light.", rarity: "uncommon" },
    mana_crystal: { name: "Mana Crystal", slot: "mat", price: 15, desc: "Humming with power.", rarity: "uncommon" },
    gearbox: { name: "Gearbox", slot: "mat", price: 20, desc: "Intricate mechanism.", rarity: "uncommon" },

    // Equipment
    steel_axe: { name: "Steel Axe", slot: "weapon", atk: 12, price: 120, desc: "Sharp and heavy.", rarity: "uncommon" },
    chainmail: { name: "Chainmail", slot: "armor", def: 5, hp: 20, price: 80, desc: "Interlinked rings.", rarity: "uncommon" },
    bark_shield: { name: "Bark Shield", slot: "acc", def: 5, hp: 30, price: 100, desc: "Nature's guard.", rarity: "uncommon" },
    rogue_hood: { name: "Rogue Hood", slot: "armor", def: 3, hp: 20, agi: 3, price: 120, desc: "Hides your face. +3 AGI", rarity: "uncommon", uniqueEffect: "dodge_5" },
    blessed_robe: { name: "Blessed Robe", slot: "armor", def: 5, hp: 30, int: 5, price: 150, desc: "Woven with light.", rarity: "uncommon" },
    wizard_hat: { name: "Wizard Hat", slot: "armor", def: 2, mp: 50, int: 8, price: 180, desc: "Classic look.", rarity: "uncommon" },

    /* =========================================
       RARE TIERS (Blue)
       Powerful items with specialized stats or effects.
       ========================================= */
    // Materials
    dark_essence: { name: "Dark Essence", slot: "mat", price: 10, desc: "Rare material", rarity: "rare" },
    venom_sac: { name: "Venom Sac", slot: "mat", price: 25, desc: "Deadly poison.", rarity: "rare" },
    light_essence: { name: "Light Essence", slot: "mat", price: 20, desc: "Pure radiance.", rarity: "rare" },
    golem_core: { name: "Golem Core", slot: "mat", price: 30, desc: "Pulsing logic stone.", rarity: "rare" },
    lava_rock: { name: "Lava Rock", slot: "mat", price: 30, desc: "Still hot.", rarity: "rare" },
    
    // Consumables (Elixirs)
    mana_shard: { name: "Mana Shard", slot: "con", mp: 20, price: 10, desc: "+20 MP (Instant)", rarity: "rare" },
    elixir_strength: { name: "Elixir of Strength", slot: "con", buff: { id: "buff_str", turn: 10, val: 5 }, price: 150, desc: "+5 STR (10 Turns)", rarity: "rare" },
    elixir_protection: { name: "Elixir of Iron", slot: "con", buff: { id: "buff_def", turn: 10, val: 5 }, price: 150, desc: "+5 DEF (10 Turns)", rarity: "rare" },
    warp_scroll: { name: "Warp Scroll", slot: "con", price: 100, desc: "Teleport (Not Implemented)", rarity: "rare" },

    // Equipment
    plate_mail: { name: "Plate Mail", slot: "armor", def: 10, hp: 50, price: 200, desc: "Heavy protection.", rarity: "rare" },
    druid_staff: { name: "Druid Staff", slot: "weapon", atk: 10, int: 5, price: 150, desc: "Channel nature.", rarity: "rare" },
    venom_dagger: { name: "Venom Dagger", slot: "weapon", atk: 8, price: 150, desc: "Dripping with poison.", rarity: "rare", uniqueEffect: "poison_hit" },
    paladin_shield: { name: "Paladin Shield", slot: "acc", def: 10, hp: 50, price: 250, desc: "Holy defense.", rarity: "rare" },
    spell_wand: { name: "Spell Wand", slot: "weapon", atk: 5, int: 15, price: 220, desc: "Crackling with energy.", rarity: "rare" },
    spiked_shield: { name: "Spiked Shield", slot: "acc", def: 8, atk: 5, price: 200, desc: "Offensive defense.", rarity: "rare", uniqueEffect: "reflect_10" },
    
    // Legacy Rares (Preserved)
    bone_sword: { name: "Bone Sword", slot: "weapon", atk: 6, price: 30, desc: "ATK+6", rarity: "rare" },
    bone_mail: { name: "Bone Mail", slot: "armor", def: 4, hp: 15, price: 40, desc: "DEF+4, HP+15", rarity: "rare" },
    silver_ring: { name: "Silver Ring", slot: "acc", atk: 3, int: 3, luck: 2, price: 50, desc: "ATK+3, INT+3, +2 LCK", rarity: "rare" },

    // Books
    book_fireball: { name: "Book: Fireball", slot: "skill_book", skillId: "fireball", price: 100, rarity: "rare", desc: "Learn Fireball" },
    book_heal: { name: "Book: Mend", slot: "skill_book", skillId: "heal", price: 80, rarity: "rare", desc: "Learn Mend" },
    book_frenzy: { name: "Book: Frenzy", slot: "skill_book", skillId: "frenzy", price: 80, rarity: "rare", desc: "Learn Frenzy" },
    book_rend: { name: "Book: Rend", slot: "skill_book", skillId: "rend", price: 90, rarity: "rare", desc: "Learn Rend" },
    book_ice_shard: { name: "Book: Ice Shard", slot: "skill_book", skillId: "ice_shard", price: 100, rarity: "rare", desc: "Learn Ice Shard" },
    book_hex: { name: "Book: Hex", slot: "skill_book", skillId: "hex", price: 120, rarity: "rare", desc: "Learn Hex" },
    book_cursed_mending: { name: "Book: Dark Heal", slot: "skill_book", skillId: "cursed_mending", price: 130, rarity: "rare", desc: "Learn Dark Heal" },
    book_shadow_shuriken: { name: "Book: Shuriken", slot: "skill_book", skillId: "shadow_shuriken", price: 100, rarity: "rare", desc: "Learn Shuriken" },

    /* =========================================
       EPIC TIERS (Purple)
       Heroic gear suitable for late game.
       ========================================= */
    // Materials
    assassin_token: { name: "Assassin Token", slot: "mat", price: 50, desc: "Proof of a kill.", rarity: "epic" },
    paladin_medal: { name: "Paladin Medal", slot: "mat", price: 40, desc: "Honorary badge.", rarity: "epic" },
    void_dust: { name: "Void Dust", slot: "mat", price: 50, desc: "From nether realms.", rarity: "epic" },
    
    // Consumables
    elixir_exp: { name: "Elixir of Insight", slot: "con", buff: { id: "buff_exp", turn: 20, val: 20 }, price: 300, desc: "+20% EXP (20 Turns)", rarity: "epic" },
    potion_greed: { name: "Potion of Greed", slot: "con", buff: { id: "buff_gold", turn: 20, val: 50 }, price: 300, desc: "+50% Gold (20 Turns)", rarity: "epic" },
    scroll_haste: { name: "Scroll of Haste", slot: "con", buff: { id: "buff_dodge", turn: 5, val: 20 }, price: 200, desc: "+20% Dodge (5 Turns)", rarity: "epic" },

    // Equipment
    shadow_blade: { name: "Shadow Blade", slot: "weapon", atk: 15, agi: 3, price: 1000, desc: "Silent killer. +3 AGI", rarity: "epic" },
    paladin_hammer: { name: "Paladin Hammer", slot: "weapon", atk: 20, vit: 5, price: 1200, desc: "Smite evil.", rarity: "epic" },
    heavy_hammer: { name: "Heavy Hammer", slot: "weapon", atk: 25, price: 1200, desc: "Crushes armor.", rarity: "epic" },
    
    // Legacy Epics
    dragonbone_axe: { name: "Dragonbone Axe", slot: "weapon", atk: 10, int: 3, price: 800, desc: "ATK+10, INT+3", rarity: "epic" },
    obsidian_plate: { name: "Obsidian Plate", slot: "armor", def: 8, hp: 25, price: 900, desc: "DEF+8, HP+25", rarity: "epic" },
    arcane_amulet: { name: "Arcane Amulet", slot: "acc", int: 8, mp: 15, luck: 5, price: 800, desc: "INT+8, MP+15, +5 LCK", rarity: "epic" },

    // Books
    book_terror: { name: "Book: Terror", slot: "skill_book", skillId: "terror", price: 120, rarity: "epic", desc: "Learn Terror" },
    book_blood_drain: { name: "Book: Blood Drain", slot: "skill_book", skillId: "blood_drain", price: 150, rarity: "epic", desc: "Learn Blood Drain" },
    book_summon_skeleton: { name: "Book: Raise Dead", slot: "skill_book", skillId: "summon_skeleton", price: 200, rarity: "epic", desc: "Learn Summon" },
    book_phase_strike: { name: "Book: Phase Strike", slot: "skill_book", skillId: "phase_strike", price: 180, rarity: "epic", desc: "Learn Phase Strike" },
    book_backstab: { name: "Book: Backstab", slot: "skill_book", skillId: "backstab", price: 150, rarity: "epic", desc: "Learn Backstab" },
    book_void_slash: { name: "Book: Void Slash", slot: "skill_book", skillId: "void_slash", price: 180, rarity: "epic", desc: "Learn Void Slash" },
    book_abyssal_shield: { name: "Book: Abyss Shield", slot: "skill_book", skillId: "abyssal_shield", price: 200, rarity: "epic", desc: "Learn Shield" },

    /* =========================================
       LEGENDARY TIERS (Orange)
       World treasures.
       ========================================= */
    // Fragments
    fragment_dragon: { name: "Dragon Fragment", slot: "mat", price: 2500, rarity: "legend", desc: "Fragment of a dragon's soul" },
    fragment_void: { name: "Void Fragment", slot: "mat", price: 2500, rarity: "legend", desc: "Shard of the void" },
    
    /* =========================================
       ENEMY-THEMED LOOT (v36.3)
       Thematic drops from specific enemy types
       ========================================= */
    // Beast/Wolf themed
    beast_fang: { name: "Beast Fang", slot: "mat", price: 15, desc: "Crafting material. Sharp predator tooth.", rarity: "uncommon" },
    claw_gauntlet: { name: "Claw Gauntlet", slot: "weapon", atk: 10, price: 120, desc: "+10 ATK. Rend like a beast.", rarity: "uncommon" },
    wolf_pelt: { name: "Wolf Pelt", slot: "armor", def: 4, hp: 25, price: 100, desc: "+4 DEF, +25 HP. Warm fur armor.", rarity: "uncommon" },
    fang_necklace: { name: "Fang Necklace", slot: "acc", atk: 5, price: 80, desc: "+5 ATK. Trophy of the hunt.", rarity: "uncommon" },
    
    // Skeleton/Bone themed
    bone_dagger: { name: "Bone Dagger", slot: "weapon", atk: 7, price: 60, desc: "+7 ATK. Sharp skeletal blade.", rarity: "common" },
    skull_helm: { name: "Skull Helm", slot: "armor", def: 5, hp: 20, price: 90, desc: "+5 DEF, +20 HP. Intimidating headgear.", rarity: "uncommon" },
    rib_cage: { name: "Rib Cage", slot: "armor", def: 6, hp: 30, price: 120, desc: "+6 DEF, +30 HP. Bone armor plating.", rarity: "rare" },
    bone_ring: { name: "Bone Ring", slot: "acc", atk: 4, def: 2, price: 70, desc: "+4 ATK, +2 DEF. Skeletal power.", rarity: "uncommon" },
    
    // Poison/Slime themed
    poison_dagger: { name: "Poison Dagger", slot: "weapon", atk: 6, price: 100, desc: "+6 ATK. Poisons enemies on hit.", rarity: "uncommon", uniqueEffect: "poison_hit" },
    slimy_boots: { name: "Slimy Boots", slot: "armor", def: 2, hp: 15, agi: 2, price: 60, desc: "+2 DEF, +15 HP, +2 AGI, +5% Dodge. Slippery movement.", rarity: "common", uniqueEffect: "dodge_5" },
    toxic_ring: { name: "Toxic Ring", slot: "acc", def: 2, price: 80, desc: "+2 DEF. Grants poison immunity.", rarity: "uncommon" },
    
    // Spider themed
    spider_silk: { name: "Spider Silk", slot: "mat", price: 20, desc: "Crafting material. Strong webbing.", rarity: "rare" },
    web_cloak: { name: "Web Cloak", slot: "armor", def: 3, hp: 20, price: 100, desc: "+3 DEF, +20 HP. Spider silk weave.", rarity: "uncommon" },
    spider_ring: { name: "Spider Ring", slot: "acc", atk: 3, price: 70, desc: "+3 ATK. Eight-legged luck.", rarity: "uncommon" },
    
    // Thief/Rogue themed
    thief_ring: { name: "Thief's Ring", slot: "acc", atk: 4, luck: 4, price: 90, desc: "+4 ATK, +4 LCK. Stolen from the rich.", rarity: "uncommon" },
    
    // Golem/Stone themed
    stone_gauntlet: { name: "Stone Gauntlet", slot: "weapon", atk: 12, def: 3, price: 150, desc: "+12 ATK, +3 DEF. Rocky crushing fists.", rarity: "rare" },
    rock_shield: { name: "Rock Shield", slot: "acc", def: 12, hp: 40, price: 200, desc: "+12 DEF, +40 HP. Nearly unbreakable.", rarity: "rare" },
    earth_ring: { name: "Earth Ring", slot: "acc", def: 5, hp: 25, price: 120, desc: "+5 DEF, +25 HP. Grounded power.", rarity: "rare" },
    
    // Nature/Elf themed
    nature_cloak: { name: "Nature Cloak", slot: "armor", def: 4, hp: 25, int: 5, price: 140, desc: "+4 DEF, +25 HP, +5 INT. Forest's embrace.", rarity: "rare" },
    leaf_ring: { name: "Leaf Ring", slot: "acc", int: 5, price: 100, desc: "+5 INT. Verdant energy.", rarity: "uncommon" },
    
    // Mage/Wizard themed
    arcane_ring: { name: "Arcane Ring", slot: "acc", int: 8, mp: 30, price: 180, desc: "+8 INT, +30 MP. Pulsing with mana.", rarity: "rare" },
    mage_robe: { name: "Mage Robe", slot: "armor", def: 3, int: 10, mp: 50, price: 200, desc: "+3 DEF, +10 INT, +50 MP. Enchanted fabric.", rarity: "rare" },
    
    // Knight themed
    knight_ring: { name: "Knight's Ring", slot: "acc", def: 6, hp: 30, price: 150, desc: "+6 DEF, +30 HP. Valiant defender's mark.", rarity: "rare" },
    
    // Pest/Rat themed
    diseased_cloth: { name: "Diseased Cloth", slot: "mat", price: 5, desc: "Crafting material. Smells awful.", rarity: "common" },
    torn_cloak: { name: "Torn Cloak", slot: "armor", def: 1, hp: 10, price: 20, desc: "+1 DEF, +10 HP. Better than nothing.", rarity: "common" },
    diseased_ring: { name: "Diseased Ring", slot: "acc", price: 15, desc: "Cursed trinket. No stats.", rarity: "common" },
    
    // Water/Elemental themed
    tide_ring: { name: "Tide Ring", slot: "acc", int: 6, mp: 40, price: 130, desc: "+6 INT, +40 MP. Ocean's power.", rarity: "rare" },
    aqua_cloak: { name: "Aqua Cloak", slot: "armor", def: 4, int: 6, price: 150, desc: "+4 DEF, +6 INT. Water flows around you.", rarity: "rare" },
    water_staff: { name: "Water Staff", slot: "weapon", atk: 8, int: 10, price: 170, desc: "+8 ATK, +10 INT. Channel the tides.", rarity: "rare" },
    
    // Fire themed (EPIC)
    flame_sword: { name: "Flame Sword", slot: "weapon", atk: 16, price: 250, desc: "+16 ATK. Burning blade deals fire damage.", rarity: "epic", uniqueEffect: "fire_dmg" },
    inferno_robe: { name: "Inferno Robe", slot: "armor", def: 6, int: 12, price: 280, desc: "+6 DEF, +12 INT. Wreathed in flames.", rarity: "epic" },
    fire_ring: { name: "Fire Ring", slot: "acc", int: 8, atk: 5, price: 200, desc: "+5 ATK, +8 INT. Molten core within.", rarity: "epic" },
    
    // Shadow/Void themed (EPIC)
    shadow_blade: { name: "Shadow Blade", slot: "weapon", atk: 15, agi: 5, price: 240, desc: "+15 ATK, +5 AGI, +10% Crit chance. Cuts through light.", rarity: "epic", uniqueEffect: "crit_10" },
    dark_cloak: { name: "Dark Cloak", slot: "armor", def: 5, hp: 35, agi: 4, price: 220, desc: "+5 DEF, +35 HP, +4 AGI, +10% Dodge. Absorbs shadows.", rarity: "epic", uniqueEffect: "dodge_10" },
    void_ring: { name: "Void Ring", slot: "acc", int: 10, price: 250, desc: "+10 INT. Endless darkness.", rarity: "epic" },
    
    // Items from legendary_items.js go here (Usually Soul Weapons or Boss Drops)
    ...LEGENDARY_ITEMS, 

    /* =========================================
       MYTHIC TIERS (Red)
       God-tier items. ONLY available in Ascension/Soul Shop.
       ========================================= */
       // Godslayer: Massive damage, but dangerous.
    godslayer: { 
       name: "GODSLAYER", 
       slot: "weapon", 
       atk: 250, 
       price: 9999, 
       rarity: "mythic", 
       desc: "v30.0 MYTHIC. ATK +250. It hums with the screams of dead gods." 
    },
    // Aegis of Ages: Massive HP/DEF
    aegis_ages: {
       name: "Aegis of Ages", 
       slot: "armor", 
       def: 100,
       hp: 500,
       price: 9999, 
       rarity: "mythic", 
       desc: "v30.0 MYTHIC. DEF +100, HP +500. Time itself cannot erode this." 
    },
    // Infinity Ring: All stats
    infinity_ring: {
       name: "Infinity Ring", 
       slot: "acc",
       atk: 50,
       def: 50,
       hp: 200,
       mp: 200,
       price: 9999, 
       rarity: "mythic", 
       desc: "v30.0 MYTHIC. Start of the endless cycle."
    },

    // v38.4: AGI/LUCK Focused Items
    swift_boots: { name: "Swift Boots", slot: "armor", def: 3, agi: 6, price: 300, desc: "+3 DEF, +6 AGI. Light as a feather.", rarity: "rare" },
    lucky_charm: { name: "Lucky Charm", slot: "acc", luck: 8, price: 350, desc: "+8 LCK. Fortune smiles upon you.", rarity: "rare" },
    assassin_dagger: { name: "Assassin Dagger", slot: "weapon", atk: 12, agi: 8, crit: 0.05, price: 500, desc: "+12 ATK, +8 AGI, +5% Crit. Swift death.", rarity: "epic" },
    fortune_amulet: { name: "Fortune Amulet", slot: "acc", luck: 12, price: 600, desc: "+12 LCK. Riches await.", rarity: "epic" },
    wind_cloak: { name: "Wind Cloak", slot: "armor", def: 4, agi: 10, price: 700, desc: "+4 DEF, +10 AGI. Move like the wind.", rarity: "epic" },
    gamblers_ring: { name: "Gambler's Ring", slot: "acc", luck: 15, crit: 0.10, price: 800, desc: "+15 LCK, +10% Crit. High risk, high reward.", rarity: "epic" },

    // --- REALM BOSS ARTIFACTS (Soul Weapons) ---
    wrath_of_nature: { name: "Wrath of Nature", type: "weapon", rarity: "mythic", atk: 120, str: 20, vit: 20, desc: "Living wood that pulses with rage. (Thorns +100%)", uniqueEffect: "thorns_boost", slot: "weapon" },
    nightfall_blade: { name: "Nightfall Blade", type: "weapon", rarity: "mythic", atk: 110, agi: 30, crit: 0.25, desc: "A blade made of solidified shadow. (Execute < 30% HP)", uniqueEffect: "execute_30", slot: "weapon" },
    excalibur: { name: "Excalibur", type: "weapon", rarity: "mythic", atk: 130, str: 25, def: 20, desc: "The holy sword. (Smite on Hit)", uniqueEffect: "smite_on_hit", slot: "weapon" },
    chronos_staff: { name: "Chronos Staff", type: "weapon", rarity: "mythic", atk: 100, int: 50, mp: 100, desc: "Warps time itself. (Extra Turn Chance)", uniqueEffect: "extra_turn_10", slot: "weapon" },
    ragnarok: { name: "Ragnarok", type: "weapon", rarity: "mythic", atk: 150, str: 40, desc: "The end of all things. (Splash Damage)", uniqueEffect: "splash_50", slot: "weapon" },

    // =========================================
    // v38.8: GATEKEEPER BOSS REWARDS
    // =========================================
    
    // --- Crafting Materials ---
    limit_break_shard: { 
        name: "Limit Break Shard", 
        slot: "mat", 
        price: 0, 
        rarity: "mythic", 
        desc: "A shard of transcendence. Dropped by Gatekeeper Bosses. Collect 4 to craft Void Set items.",
        cannotSell: true
    },
    void_essence: { 
        name: "Void Essence", 
        slot: "mat", 
        price: 0, 
        rarity: "mythic", 
        desc: "Pure emptiness given form. Dropped by THE VOID. Required to unlock the Void Set.",
        cannotSell: true
    },

    // --- THE VOID SET (Mythic with Curses) ---
    void_edge: { 
        name: "Void Edge", 
        slot: "weapon", 
        atk: 100, 
        price: 0, 
        rarity: "mythic", 
        desc: "ATK +100, 20% Lifesteal. CURSE: -15% Max HP. Forged from nothingness.",
        uniqueEffect: "lifesteal_20",
        curse: { maxHp: -0.15 }
    },
    abyssal_plate: { 
        name: "Abyssal Plate", 
        slot: "armor", 
        def: 50,
        hp: 200, 
        price: 0, 
        rarity: "mythic", 
        desc: "DEF +50, HP +200, 30% Damage Reduction. CURSE: -30% Healing.",
        uniqueEffect: "dr_30",
        curse: { healingReduction: -0.30 }
    },
    chaos_ring: { 
        name: "Chaos Ring", 
        slot: "acc", 
        crit: 0.15,
        agi: 20, 
        price: 0, 
        rarity: "mythic", 
        desc: "+15% Crit, +20 AGI. CURSE: -10% ATK. The ring whispers madness.",
        curse: { atk: -0.10 }
    },
    null_shard: { 
        name: "Null Shard", 
        slot: "gem", 
        price: 0, 
        rarity: "mythic", 
        desc: "Immune to 1 status effect per fight. CURSE: -5% All Stats. A piece of oblivion.",
        uniqueEffect: "status_immunity_1",
        curse: { allStats: -0.05 }
    }
};