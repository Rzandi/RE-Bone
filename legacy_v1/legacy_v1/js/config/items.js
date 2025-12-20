const ITEMS_DB = {
    // MATERIALS (v28.0) - Consolidated
    scrap_metal: {
      name: "Scrap Metal",
      slot: "mat",
      val: 0,
      price: 2,
      desc: "Used for crafting",
      rarity: "common"
    },
    magic_dust: {
      name: "Magic Dust",
      slot: "mat",
      val: 0,
      price: 5,
      desc: "Glowing dust",
      rarity: "common"
    },
    tough_leather: {
      name: "Tough Leather",
      slot: "mat",
      val: 0,
      price: 3,
      desc: "Cured hide",
      rarity: "common"
    },
    dark_essence: {
      name: "Dark Essence",
      slot: "mat",
      val: 0,
      price: 10,
      desc: "Rare material",
      rarity: "rare"
    },
    
    // LEGENDARY FRAGMENTS (<10% Drop) (v28.0)
    fragment_dragon: { name: "Dragon Fragment", slot: "mat", price: 100, rarity: "legend", desc: "Fragment of a dragon's soul" },
    fragment_void: { name: "Void Fragment", slot: "mat", price: 100, rarity: "legend", desc: "Shard of the void" },

    // MYTHIC ITEMS (v30.0 Ascension Only)
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

    // Common Tier
    rotten_meat: {
      name: "Daging Busuk",
      slot: "con",
      val: 20,
      price: 5,
      desc: "Heal 20",
      rarity: "common",
    },



    // Potions & Consumables (v30.7 Merchant Update)
    health_potion: {
      name: "Health Potion",
      slot: "con",
      val: 100,
      price: 50,
      desc: "Heal 100 HP",
      rarity: "common"
    },
    mana_potion: {
      name: "Mana Potion",
      slot: "con",
      mp: 50,
      price: 50,
      desc: "Restore 50 MP",
      rarity: "common"
    },
    elixir_strength: {
        name: "Elixir of Strength",
        slot: "con",
        buff: { id: "buff_str", turn: 10, val: 5 },
        price: 150,
        desc: "+5 STR (10 Turns)",
        rarity: "rare"
    },
    elixir_protection: {
        name: "Elixir of Iron",
        slot: "con",
        buff: { id: "buff_def", turn: 10, val: 5 },
        price: 150,
        desc: "+5 DEF (10 Turns)",
        rarity: "rare"
    },
    scroll_haste: {
        name: "Scroll of Haste",
        slot: "con",
        buff: { id: "buff_dodge", turn: 5, val: 20 },
        price: 200,
        desc: "+20% Dodge (5 Turns)",
        rarity: "epic"
    },

    rusty_knife: {
      name: "Pisau Karat",
      slot: "weapon",
      atk: 3,
      price: 10,
      desc: "ATK+3",
      rarity: "common",
    },
    leather_armor: {
      name: "Leather Armor",
      slot: "armor",
      def: 2,
      hp: 10,
      price: 15,
      desc: "DEF+2, HP+10",
      rarity: "common",
    },
    
    // Rare Tier
    mana_shard: {
      name: "Kristal Mana",
      slot: "con",
      mp: 20,
      price: 10,
      desc: "+20 MP",
      rarity: "rare",
    },
    bone_sword: {
      name: "Pedang Tulang",
      slot: "weapon",
      atk: 6,
      price: 30,
      desc: "ATK+6",
      rarity: "rare",
    },
    bone_mail: {
      name: "Zirah Tulang",
      slot: "armor",
      def: 4,
      hp: 15,
      price: 40,
      desc: "DEF+4, HP+15",
      rarity: "rare",
    },
    silver_ring: {
      name: "Silver Ring",
      slot: "acc",
      atk: 3,
      int: 3,
      price: 50,
      desc: "ATK+3, INT+3",
      rarity: "rare",
    },
    
    // Epic Tier
    dragonbone_axe: {
      name: "Dragonbone Axe",
      slot: "weapon",
      atk: 10,
      int: 3,
      price: 150,
      desc: "ATK+10, INT+3",
      rarity: "epic",
    },
    obsidian_plate: {
      name: "Obsidian Plate",
      slot: "armor",
      def: 8,
      hp: 25,
      price: 180,
      desc: "DEF+8, HP+25",
      rarity: "epic",
    },
    arcane_amulet: {
      name: "Arcane Amulet",
      slot: "acc",
      int: 8,
      mp: 15,
      price: 200,
      desc: "INT+8, MP+15",
      rarity: "epic",
    },
    
    // Legendary - Reference to legendary_items.js
    // Loaded separately for organization
    ...LEGENDARY_ITEMS, // v30.0 Activated

    // SKILL BOOKS (v30.0)
    book_smash: { name: "Book: Smash", slot: "skill_book", skillId: "smash", price: 50, rarity: "common", desc: "Learn Smash" },
    book_fireball: { name: "Book: Fireball", slot: "skill_book", skillId: "fireball", price: 100, rarity: "rare", desc: "Learn Fireball" },
    book_heal: { name: "Book: Mend", slot: "skill_book", skillId: "heal", price: 80, rarity: "rare", desc: "Learn Mend" },
    book_frenzy: { name: "Book: Frenzy", slot: "skill_book", skillId: "frenzy", price: 80, rarity: "rare", desc: "Learn Frenzy" },
    
    // v30.2 Skill Books Expanded
    book_bone_throw: { name: "Book: Bone Throw", slot: "skill_book", skillId: "bone_throw", price: 60, rarity: "common", desc: "Learn Bone Throw" },
    book_shield_bash: { name: "Book: Shield Bash", slot: "skill_book", skillId: "shield_bash", price: 80, rarity: "common", desc: "Learn Shield Bash" },
    book_rend: { name: "Book: Rend", slot: "skill_book", skillId: "rend", price: 90, rarity: "rare", desc: "Learn Rend" },
    book_ice_shard: { name: "Book: Ice Shard", slot: "skill_book", skillId: "ice_shard", price: 100, rarity: "rare", desc: "Learn Ice Shard" },
    book_terror: { name: "Book: Terror", slot: "skill_book", skillId: "terror", price: 120, rarity: "epic", desc: "Learn Terror" },
    book_blood_drain: { name: "Book: Blood Drain", slot: "skill_book", skillId: "blood_drain", price: 150, rarity: "epic", desc: "Learn Blood Drain" },
    book_summon_skeleton: { name: "Book: Raise Dead", slot: "skill_book", skillId: "summon_skeleton", price: 200, rarity: "epic", desc: "Learn Summon" },
    book_phase_strike: { name: "Book: Phase Strike", slot: "skill_book", skillId: "phase_strike", price: 180, rarity: "epic", desc: "Learn Phase Strike" },
    
    // v30.3 New Books
    book_shadow_shuriken: { name: "Book: Shuriken", slot: "skill_book", skillId: "shadow_shuriken", price: 100, rarity: "rare", desc: "Learn Shuriken" },
    book_backstab: { name: "Book: Backstab", slot: "skill_book", skillId: "backstab", price: 150, rarity: "epic", desc: "Learn Backstab" },
    book_hex: { name: "Book: Hex", slot: "skill_book", skillId: "hex", price: 120, rarity: "rare", desc: "Learn Hex" },
    book_cursed_mending: { name: "Book: Dark Heal", slot: "skill_book", skillId: "cursed_mending", price: 130, rarity: "rare", desc: "Learn Dark Heal" },
    book_void_slash: { name: "Book: Void Slash", slot: "skill_book", skillId: "void_slash", price: 180, rarity: "epic", desc: "Learn Void Slash" },
    book_abyssal_shield: { name: "Book: Abyss Shield", slot: "skill_book", skillId: "abyssal_shield", price: 200, rarity: "epic", desc: "Learn Shield" },

};
window.ITEMS_DB = ITEMS_DB;