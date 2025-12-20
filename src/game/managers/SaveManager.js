import { gameStore } from '../store.js';
import { Player } from '../logic/Player.js';

const SAVE_KEY = 'rebone_save_v32';

const META_KEY = 'rebone_meta_v32';

export const SaveManager = {
    saveGame() {
        try {
            // Save RUN data
            const runData = JSON.stringify(gameStore.state);
            localStorage.setItem(SAVE_KEY, runData);
            
            // Save META data explicitly too
            this.saveMeta();
            
            gameStore.log("Game Saved.", "system");
            return true;
        } catch (e) {
            console.error("Save failed", e);
            gameStore.log("Save failed!", "system");
            return false;
        }
    },
    
    saveMeta() {
        try {
            if(gameStore.state.meta) {
                 const metaData = JSON.stringify(gameStore.state.meta);
                 localStorage.setItem(META_KEY, metaData);
            }
        } catch(e) {
            console.error("Meta Save failed", e);
        }
    },

    loadGame() {
        try {
            // Load META first (always persistent)
            this.loadMeta();
            
            const data = localStorage.getItem(SAVE_KEY);
            if (!data) return false;
            
            const loaded = JSON.parse(data);
            
            // Restore State (Preserving Reactivity)
            // Be careful not to overwrite 'meta' with old run data if structure changed,
            // but we initialized 'meta' in store.js.
            // If the loaded run data contains 'meta', it might overwrite our freshly loaded meta.
            // So we should backup meta, load run, then restore meta if needed?
            // Actually, if we play, meta updates in-memory. If we save, it saves to both.
            // So loading run + meta should be consistent.
            
            Object.assign(gameStore.state, loaded);
            
            // Force re-load Meta from disk just in case the run data had stale meta
            this.loadMeta(); 
            
            // --- STATE REPAIR ---
            
            // 1. Repair Multipliers
            Player.recalc();
            
            // 2. Repair Evolution Options (Functions are lost in JSON)
            if (gameStore.state.activePanel === 'evolution') {
                // Re-calculating options will restore the 'effect' functions from DB
                Player.checkEvolution();
            }
            
            // 3. Repair Combat State (Timeouts are lost)
            if (gameStore.state.activePanel === 'combat') {
                // If it was enemy turn, reset to player turn to prevent softlock
                // (Since the setTimeout for enemyTurn() is gone)
                if (gameStore.state.combat.turn === 'enemy') {
                    gameStore.state.combat.turn = 'player';
                    gameStore.log("Combat State Restored. Player Turn.", "system");
                }
            }
            
            gameStore.log("Game Loaded.", "system");
            return true;
        } catch (e) {
            console.error("Load failed", e);
            gameStore.log("Load failed!", "system");
            return false;
        }
    },
    
    loadMeta() {
        try {
             const m = localStorage.getItem(META_KEY);
             if(m && gameStore.state.meta) {
                 const metaObj = JSON.parse(m);
                 Object.assign(gameStore.state.meta, metaObj);
             }
        } catch(e) {
            console.error("Meta Load Error", e);
        }
    },

    hasSave() {
        return !!localStorage.getItem(SAVE_KEY);
    },

    clearSave() {
        localStorage.removeItem(SAVE_KEY);
        gameStore.log("Save Data Wiped.", "system");
    },
    
    wipeSave() {
        this.clearSave();
        // Optional: Reload page or trigger game over UI update
    },
    
    // Auto-save hook
    intervalId: null,
    
    initAutoSave(intervalMs = 60000) {
        if (this.intervalId) clearInterval(this.intervalId);
        
        // ROGUELIKE MODE: Disable Interval Auto-save
        // Only save on specific events (Floor Change, Sanctuary)
        /*
        this.intervalId = setInterval(() => {
            if (gameStore.state.activePanel !== 'title') {
                this.saveGame();
            }
        }, intervalMs);
        */
       console.log("Auto-save disabled for Roguelike Mode");
    }
};

// Expose for debugging
window.SaveManager = SaveManager;
