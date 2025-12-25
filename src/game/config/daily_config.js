/* =========================================
   DAILY CHALLENGE CONFIG
   Generates consistent challenge settings based on date.
   ========================================= */

import { RUN_MODIFIERS, checkModifierConflicts } from './modifiers.js';
import { DB } from './database.js';
import { gameStore } from '../store.js'; // v38.8: For unlocked class check

const SEED_SALT = "RE_BONE_DAILY_V38";

// 1. Generate Daily Seed from Date
export const getDailySeed = () => {
    const d = new Date();
    // Use local date keys to ensure everyone in same timezone (or use UTC?)
    // Using UTC ensures global sync.
    const dateStr = `${d.getUTCFullYear()}-${d.getUTCMonth()+1}-${d.getUTCDate()}-${SEED_SALT}`;
    
    let hash = 0;
    for (let i = 0; i < dateStr.length; i++) {
        const char = dateStr.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // Convert to 32bit integer
    }
    return Math.abs(hash);
};

// 2. Simple Seeded PRNG (Linear Congruential Generator or Sine-based)
// Using a predictable sequence generator
const createRNG = (seed) => {
    let s = seed;
    return () => {
        // Mulberry32
        let t = s += 0x6D2B79F5;
        t = Math.imul(t ^ (t >>> 15), t | 1);
        t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
};

// 3. Generate Today's Config
export const getDailyConfig = () => {
    const seed = getDailySeed();
    const rng = createRNG(seed);
    
    // --- Select Modifiers ---
    // Rules:
    // - 1 to 3 modifiers
    // - Higher chance for 2 modifiers
    // - Must not conflict (too badly)
    
    const countRoll = rng();
    let modCount = 1;
    if (countRoll > 0.3) modCount = 2;
    if (countRoll > 0.8) modCount = 3; // Hard days
    
    const allMods = Object.keys(RUN_MODIFIERS);
    let selectedMods = [];
    let attempts = 0;
    
    while(selectedMods.length < modCount && attempts < 20) {
        attempts++;
        const idx = Math.floor(rng() * allMods.length);
        const modId = allMods[idx];
        
        // Skip if already selected
        if(selectedMods.includes(modId)) continue;
        
        // Check conflicts with existing selection
        const testSet = [...selectedMods, modId];
        const conflicts = checkModifierConflicts(testSet);
        
        // If conflict exists, skip (unless we want chaos?)
        // Let's safe-guard: Conflict function returns warnings.
        // If warning suggests "Impossible", block.
        // Current conflicts are just "Dangerous", so maybe allow them?
        // Let's just avoid duplicate logic.
        
        selectedMods.push(modId);
    }
    
    // --- Select Class ---
    // v38.8 FIX: Only select from unlocked classes
    const allClassKeys = Object.keys(DB.CLASSES);
    const unlockedClasses = gameStore.state.meta?.unlockedClasses || ['skeleton']; // Default to skeleton if none
    
    // Filter to only include unlocked classes
    const availableClasses = allClassKeys.filter(cls => unlockedClasses.includes(cls));
    
    // Use available classes, or fallback to skeleton if none available
    const classPool = availableClasses.length > 0 ? availableClasses : ['skeleton'];
    
    const clsIdx = Math.floor(rng() * classPool.length);
    const heroClass = classPool[clsIdx];
    
    // --- Daily Bonus ---
    // Maybe extra gold or souls?
    const bonusGold = Math.floor(rng() * 200);
    
    return {
        seed,
        date: new Date().toLocaleDateString(),
        modifiers: selectedMods,
        heroClass: heroClass,
        bonusGold: bonusGold
    };
};
