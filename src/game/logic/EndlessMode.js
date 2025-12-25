/* =========================================
   ENDLESS MODE MANAGER (V24)
   Spec: implement_plan_v24.md
   ========================================= */

import { gameStore } from "../store.js";
import { Game } from "../core/game.js";
import { DB } from "../config/database.js";
import { REALMS } from "../config/realms.js";
import { ENDLESS_BOSSES } from "../config/endless_bosses.js";

export const EndlessMode = {
    // Current Realm State
    get isActive() {
        return (Game.state.floor || 1) > 500;
    },

    // Realm Configuration (V24 Spec)
    REALMS: [
        { id: 'nature', name: 'Corrupted Nature', range: [1, 20], color: '#2a4a2a' },
        { id: 'shadow', name: 'Abyssal Shadow', range: [21, 40], color: '#2a2a4a' },
        { id: 'fire',   name: 'Hellfire Citadel', range: [41, 60], color: '#4a2a2a' },
        { id: 'ice',    name: 'Frozen Pinnacle', range: [61, 80], color: '#2a4a4a' },
        { id: 'storm',  name: 'Storm Fortress', range: [81, 100], color: '#4a4a2a' }
    ],

    // 1. Get Scaling Factor
    // Factory Formula: Base 9.0x (Epic Cap) + 10% per floor
    getScalingFactor(floor) {
        if (floor <= 500) return { hp: 1, dmg: 1, gold: 1, exp: 1 };
        
        const endlessFloor = floor - 500;
        // Epic Mode ends at 9.0x (1 + 400*0.02)
        // Endless adds +0.10 (10%) per floor on top of that
        const scale = 9.0 + (endlessFloor * 0.10);
        
        // Ascension Bonus (V24: +20% per level)
        const ascensionLvl = gameStore.state.ascensionLevel || 0;
        const ascBonus = 1 + (ascensionLvl * 0.2);
        
        const finalScale = scale * ascBonus;

        return {
            hp: finalScale,
            dmg: finalScale,
            gold: 1 + (endlessFloor * 0.03), // +3% Gold
            exp: 1 + (endlessFloor * 0.02)   // +2% XP
        };
    },

    // 2. Get Current Realm (Cycling 500 Floors)
    getRealm(floor) {
        if (floor <= 500) return null; // Use normal map logic
        
        const relFloor = (floor - 501) % 500; // 0-499 cycle
        // 0-99: Nature
        // 100-199: Shadow
        // ...
        
        return this.REALMS[Math.floor(relFloor / 100)] || this.REALMS[0];
    },

    // 3. Score Calculation
    // Base = (Floor*100) + (Kills*10) + (Bosses*500) + (Gold/10)
    calculateScore() {
        const floor = Game.state.floor || 1;
        const kills = gameStore.state.stats?.kills || 0;
        const bosses = gameStore.state.stats?.bossKills || 0;
        const gold = gameStore.state.totalGoldEarned || gameStore.state.gold || 0;
        
        let base = (floor * 100) + (kills * 10) + (bosses * 500) + Math.floor(gold / 10);
        
        // Multipliers
        // Modifiers?
        const modCount = gameStore.state.activeModifiers?.length || 0;
        const modMult = 1 + (modCount * 0.1); // Placeholder 10% per mod
        
        const ascLvl = gameStore.state.ascensionLevel || 0;
        const ascMult = 1 + (ascLvl * 0.1);
        
        return Math.floor(base * modMult * ascMult);
    },
    
    // 4. Check for Checkpoint
    // Spec: Every 50 floors (550, 600, 650...)
    isCheckpoint(floor) {
        return floor > 500 && floor % 50 === 0;
    },

    getBiome(floor) {
        if (floor <= 500) return null;
        
        // Get Active Realm Config
        const realmDef = this.getRealm(floor);
        
        const mapIds = {
            'nature': 'nature_den',
            'shadow': 'shadow_guild',
            'fire': 'iron_fort',   
            'ice': 'arcane_tower', 
            'storm': 'light_castle' 
        };
        
        const rKey = mapIds[realmDef.id] || 'nature_den';
        const realmConfig = REALMS[rKey];
        
        if (!realmConfig || !realmConfig.biomes) return null;
        
        // Rotate every 20 floors (matches 100 floor Realm)
        // relFloor 0-99 within realm.
        const relFloor = (floor - 501) % 100; 
        const biomeIdx = Math.floor(relFloor / 20) % realmConfig.biomes.length;
        
        return realmConfig.biomes[biomeIdx];
    },

    // 6. Get Endless Boss
    getBoss(floor) {
        if (ENDLESS_BOSSES[floor]) {
             return ENDLESS_BOSSES[floor];
        }
        
        // Mini-Boss every 10 floors?
        if (floor % 10 === 0) {
             const base = DB.BOSSES ? DB.BOSSES[100] : null; // Fallback to Warlord
             // Ideally scale a random boss
             return { ...base, name: "Endless Guardian", isBoss: true };
        }
        
        return null;
    }
};
