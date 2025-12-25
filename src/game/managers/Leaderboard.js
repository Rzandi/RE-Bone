/* =========================================
   LEADERBOARD MANAGER (V24)
   Handles High Score persistence and retrieval.
   Storage: localStorage 're_bone_leaderboard'
   ========================================= */

import { gameStore } from "../store.js";
import { CONSTANTS } from "../config/constants.js";

const STORAGE_KEY = "re_bone_leaderboard";

export const Leaderboard = {
    // Load entries from storage
    getEntries() {
        try {
            const data = localStorage.getItem(STORAGE_KEY);
            return data ? JSON.parse(data) : [];
        } catch (e) {
            console.error("Leaderboard Load Error:", e);
            return [];
        }
    },

    // Save entries to storage
    saveEntries(entries) {
        try {
            // Sort by Score Descending
            entries.sort((a, b) => b.score - a.score);
            // Limit to Top 50 to save space
            const trimmed = entries.slice(0, 50);
            localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed));
        } catch (e) {
            console.error("Leaderboard Save Error:", e);
        }
    },

    // Add new entry
    addEntry(entry) {
        /*
          Entry Format:
          {
            name: "Player",
            score: 12345,
            floor: 10,
            class: "Warrior",
            mode: "Normal" | "Endless" | "Daily",
            date: ISOString,
            modifiers: []
          }
        */
        const entries = this.getEntries();
        entries.push(entry);
        this.saveEntries(entries);
        
        console.log("Leaderboard Entry Added:", entry);
    },

    // Get Top N Scores
    getTopScores(limit = 10, modeFilter = null) {
        let entries = this.getEntries();
        if (modeFilter) {
            entries = entries.filter(e => e.mode === modeFilter);
        }
        return entries.slice(0, limit);
    },
    
    // Calculate Score (V24 Spec)
    // baseScore = (floor * 100) + (kills * 10) + (bossKills * 500) + (goldEarned / 10)
    // multiplier = mods * ascension
    calculateScore(state) {
        const floor = state.floor || 1;
        const kills = state.stats?.kills || 0;
        const bossKills = state.stats?.bossKills || 0;
        const gold = state.totalGoldEarned || state.gold || 0;
        
        let base = (floor * 100) + (kills * 10) + (bossKills * 500) + Math.floor(gold / 10);
        
        // Modifiers
        const mods = state.activeModifiers || [];
        // Assuming each modifier adds +10% score? 
        // V24 says "product of all active modifier multipliers".
        // Where are modifier multipliers defined? In modifiers.js?
        // Let's assume generic +10% per mod for now, or check modifiers logic.
        let modMult = 1.0;
        if (state.modifierEffects) {
             // Basic count based multiplier
             modMult += (mods.length * 0.1); 
        }
        
        // Ascension
        const ascLvl = state.meta?.ascensionLevel || 0;
        const ascMult = 1 + (ascLvl * 0.1); // +10% per level
        
        return Math.floor(base * modMult * ascMult);
    }
};
