import { gameStore } from '../store.js';
import { Player } from '../logic/Player.js';

const SAVE_KEY = 'rebone_save_v32';

const META_KEY = 'rebone_meta_v32';

export const SaveManager = {
    saveGame() {
        gameStore.state.isLoading = true;
        // Simulate async delay for visual feedback (optional but feels better)
        setTimeout(() => {
            try {
                // Save RUN data
                const runData = JSON.stringify(gameStore.state);
                localStorage.setItem(SAVE_KEY, runData);
                
                // Save META data explicitly too
                this.saveMeta();
                
                gameStore.log("Game Saved.", "system");
            } catch (e) {
                console.error("Save failed", e);
                gameStore.log("Save failed!", "system");
            } finally {
                gameStore.state.isLoading = false;
            }
        }, 500); // 500ms delay for visual feedback
        return true;
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
            
            if (!gameStore.state.merchantGemStock) gameStore.state.merchantGemStock = [];
            
            // v37.0: Repair Gems & Synthesis Data
            if (!gameStore.state.gems) gameStore.state.gems = [];
            if (!gameStore.state.synthesisFailures) gameStore.state.synthesisFailures = {};
            if (typeof gameStore.state.essence !== 'number') gameStore.state.essence = 0;

            // v38.0: Unify Souls Currency (Migrate run souls to meta)
            if (typeof gameStore.state.souls === 'number' && gameStore.state.souls > 0) {
                 gameStore.state.meta.souls = (gameStore.state.meta.souls || 0) + gameStore.state.souls;
                 gameStore.state.souls = 0; 
                 this.saveMeta();
                 // console.log("Migrated legacy souls to meta:", gameStore.state.meta.souls);
            }
            // Ensure meta souls exist
            if (typeof gameStore.state.meta.souls !== 'number') gameStore.state.meta.souls = 0;
            
            // v37.0: Ensure socket data structure exists on items
            
            // v37.0: Ensure socket data structure exists on items
            // Sockets should already be saved with inventory items, but verify
            if (gameStore.state.inventory) {
                gameStore.state.inventory.forEach(item => {
                    // Items with sockets will have them preserved
                    // No action needed, just log if needed
                });
            }
            
            // v37.3: Repair Stat Point data for legacy saves
            if (typeof gameStore.state.statPt !== 'number') gameStore.state.statPt = 0;
            if (!gameStore.state.baseStats) {
                gameStore.state.baseStats = { STR: 5, VIT: 5, INT: 5 };
            }
            
            // v38.4: Ensure runTime exists
            if (typeof gameStore.state.runTime !== 'number') gameStore.state.runTime = 0;
            
            // 1. Repair Multipliers
            Player.recalc();
            
            // 2. Repair Evolution Options (Functions are lost in JSON)
            if (gameStore.state.activePanel === 'evo' || gameStore.state.activePanel === 'evolution') {
                // Re-calculating options will restore the 'effect' functions from DB
                Player.checkEvolution();
            }
            
            // 3. Repair History/Lore (For saves pre-v36)
            if (!gameStore.state.history) {
                 gameStore.state.history = { events: [], lore: [] };
             } else {
                 if(!gameStore.state.history.events) gameStore.state.history.events = [];
                 if(!gameStore.state.history.lore) gameStore.state.history.lore = [];
             }
             
            // 4. World Map Repair (v34 Node Map)
            if (!gameStore.state.world) {
                gameStore.state.world = { unlockedRealms: [], activeRealm: null, nodeMap: [], currentNode: null };
            } else {
                if (!Array.isArray(gameStore.state.world.nodeMap)) gameStore.state.world.nodeMap = [];
                if (!gameStore.state.world.unlockedRealms) gameStore.state.world.unlockedRealms = [];
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
            
            // v37.0 Phase 3: Repair Black Market data
            if (!gameStore.state.mysteryBoxPity) gameStore.state.mysteryBoxPity = {};
            if (!gameStore.state.blackMarket) gameStore.state.blackMarket = { purchases: 0, lastRep: 0 };
            if (!gameStore.state.cursedItemsOwned) gameStore.state.cursedItemsOwned = [];
            if (!gameStore.state.triggeredCurseEvents) gameStore.state.triggeredCurseEvents = [];
            if (!gameStore.state.curseModifiers) gameStore.state.curseModifiers = {};
            
            // v37.0 Phase 4: Repair Economy data
            if (!gameStore.state.economy) {
                gameStore.state.economy = {
                    totalGoldSpent: 0,
                    totalGoldEarned: 0,
                    itemPurchases: {},
                    itemStock: {},
                    activeEvent: null,
                    eventDuration: 0,
                    merchantReputation: 0,
                    eventsThisSession: 0,
                    permanentDeflation: 0,
                    inflation50Warned: false
                };
            } else {
                // Repair corrupted data
                const e = gameStore.state.economy;
                if (typeof e.totalGoldSpent !== 'number') e.totalGoldSpent = 0;
                if (typeof e.totalGoldEarned !== 'number') e.totalGoldEarned = 0;
                if (!e.itemPurchases) e.itemPurchases = {};
                if (!e.itemStock) e.itemStock = {};
            }
            
            // v38.8: Repair Gatekeeper Boss state
            if (!gameStore.state.gatekeeper) {
                gameStore.state.gatekeeper = {
                    defeated: {},
                    pendingCapUnlock: null,
                    limitBreakShards: 0,
                    voidEssence: 0
                };
            } else {
                // Repair corrupted data
                const g = gameStore.state.gatekeeper;
                if (!g.defeated) g.defeated = {};
                if (typeof g.limitBreakShards !== 'number') g.limitBreakShards = 0;
                if (typeof g.voidEssence !== 'number') g.voidEssence = 0;
            }
            
            gameStore.log("Game Loaded.", "system");
            gameStore.state.isLoading = false; // v38.3: Reset loading state
            return true;
        } catch (e) {
            console.error("Load failed", e);
            gameStore.log("Load failed!", "system");
            gameStore.state.isLoading = false; // v38.3: Reset even on error
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
       // console.log("Auto-save disabled for Roguelike Mode");
    },

  // Cloud Save (Export to String)
  exportSaveString() {
    try {
      // v38.3: Save current state before export - handle circular refs
      let runData;
      try {
        runData = JSON.stringify(gameStore.state);
      } catch (jsonErr) {
        console.error("JSON stringify failed for gameStore.state:", jsonErr);
        // Fallback: save minimal data
        runData = JSON.stringify({
          level: gameStore.state.level || 1,
          className: gameStore.state.className || 'Skeleton',
          floor: gameStore.state.floor || 1,
          gold: gameStore.state.gold || 0,
          fallback: true
        });
      }
      
      localStorage.setItem(SAVE_KEY, runData);
      this.saveMeta();
      
      const allData = {
        save: localStorage.getItem(SAVE_KEY) || runData,
        meta: localStorage.getItem(META_KEY),
        achievements: localStorage.getItem('rebone_achievements'),
        settings: localStorage.getItem('rebone_settings'),
        timestamp: Date.now(),
        version: "v38.3"
      };
      
      console.log("Exporting save data:", allData.save ? "Has Save" : "No Save", allData.meta ? "Has Meta" : "No Meta");
      
      // v38.3 FIX: Use proper UTF-8 to Base64 encoding for Unicode characters (emoji support)
      const jsonString = JSON.stringify(allData);
      const encoded = this.utf8ToBase64(jsonString);
      
      console.log("Export successful, string length:", encoded.length);
      return encoded;
    } catch (e) {
      console.error("Export Failed:", e);
      return "ERROR:" + e.message;
    }
  },
  
  // v38.3: UTF-8 safe Base64 encoding (supports emoji/unicode)
  utf8ToBase64(str) {
    // Use TextEncoder to properly encode UTF-8
    const bytes = new TextEncoder().encode(str);
    let binary = '';
    bytes.forEach(byte => binary += String.fromCharCode(byte));
    return btoa(binary);
  },
  
  // v38.3: UTF-8 safe Base64 decoding
  base64ToUtf8(base64) {
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    return new TextDecoder().decode(bytes);
  },

  // Cloud Save (Import from String)
  importSaveString(str) {
    try {
      // v38.3 FIX: Use UTF-8 safe decoding for unicode/emoji support
      const decoded = this.base64ToUtf8(str);
      const data = JSON.parse(decoded);
      
      if (!data.version || !data.meta) throw new Error("Invalid Save Data");
      
      if(data.save) localStorage.setItem(SAVE_KEY, data.save);
      if(data.meta) localStorage.setItem(META_KEY, data.meta);
      if(data.achievements) localStorage.setItem('rebone_achievements', data.achievements);
      if(data.settings) localStorage.setItem('rebone_settings', data.settings);
      
      return true;
    } catch (e) {
      console.error("Import Failed", e);
      return false;
    }
  }
};

// Expose for debugging - REMOVED for v38.0 strict mode
// window.SaveManager = SaveManager;
