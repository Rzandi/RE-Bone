/* =========================================
   CRAFTING RECIPES DATABASE
   ========================================= */

const RECIPES = {
  // Consumables
  potion_small: {
    id: "rotten_meat",
    name: "Rotten Meat (x2)",
    inputs: { rotten_meat: 1, magic_dust: 1 }, // Upgrade? Or craft new?
    output: "rotten_meat",
    count: 2,
    desc: "Craft extra food from dust"
  },
  
  // Upgrades (Basic -> Rare)
  bone_sword: {
    id: "bone_sword",
    name: "Bone Sword",
    inputs: { rusty_knife: 1, scrap_metal: 3 },
    output: "bone_sword",
    count: 1,
    desc: "Reforge rusty knife"
  },
  
  // Rare Materials
  dark_essence: {
    id: "dark_essence",
    name: "Dark Essence",
    inputs: { magic_dust: 5 },
    output: "dark_essence",
    count: 1,
    desc: "Condense 5 Magic Dust"
  },
  
  // Equipment
  leather_armor: {
    id: "leather_armor",
    name: "Leather Armor",
    inputs: { tough_leather: 3 },
    output: "leather_armor",
    count: 1,
    desc: "Stitch leather armor"
  },  
  // Legendary Crafting (v28.0)
  dragon_claw: {
    id: "dragon_claw",
    name: "Dragon Claw",
    inputs: { fragment_dragon: 3, scrap_metal: 20, dark_essence: 5 },
    output: "dragon_claw",
    count: 1,
    desc: "Legendary Weapon"
  },
  aegis_shield: {
    id: "aegis_shield",
    name: "Aegis Shield",
    inputs: { fragment_void: 3, scrap_metal: 20, dark_essence: 5 }, // Using Void fragment for now?
    output: "aegis_shield",
    count: 1,
    desc: "Legendary Shield"
  }
};

export { RECIPES };
