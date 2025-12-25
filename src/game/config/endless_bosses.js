/* =========================================
   ENDLESS MODE BOSSES (V24 Spec)
   Unique bosses encountered in the Abyss.
   ========================================= */

export const ENDLESS_BOSSES = {
    125: {
        name: "The Amalgam",
        sprite: "amalgam_boss",
        hp: 50000, 
        atk: 300,
        exp: 5000,
        drop: "chaos_orb", // Placeholder
        desc: "A twisted fusion of all realm guardians.",
        lore: "It speaks with a thousand voices, screaming in unison."
    },
    150: {
        name: "Time Warden",
        sprite: "time_boss",
        hp: 75000,
        atk: 450,
        exp: 8000,
        drop: "hourglass_relic",
        desc: "A being that exists outside of time itself.",
        lore: "Seconds bleed into hours in its presence."
    },
    175: {
        name: "The Void",
        sprite: "void_boss",
        hp: 100000,
        atk: 600,
        exp: 12000,
        drop: "void_essence",
        desc: "Pure nothingness given form and hunger.",
        lore: "It is not dark. It is the absence of light."
    },
    200: {
        name: "PRIMORDIAL",
        sprite: "primordial_boss",
        hp: 200000,
        atk: 999,
        exp: 50000,
        drop: "creation_spark",
        desc: "The first being. The source of all undeath.",
        lore: "Before the dungeon, before the realms... there was only HIM."
    }
};
