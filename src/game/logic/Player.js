import { gameStore } from '../store.js';
import { DB } from '../config/database.js';
import { CONSTANTS } from '../config/constants.js';

/* =========================================
   PLAYER LOGIC (Vue Version)
   Manipulates gameStore directly.
   ========================================= */

export const Player = {
    // Shortcuts to State
    get state() { return gameStore.state; },
    
    init(clsKey) {
        const s = this.state;
        const c = DB.CLASSES[clsKey] || DB.CLASSES["skeleton"];
        
        // Core Stats
        s.className = c.name;
        s.level = 1;
        s.exp = 0;
        s.nextExp = 50;
        s.gold = 0;
        
        // Attributes (Base)
        s.baseStats = { ...c.attr };
        // Calculated Attributes will be derived in recalc()
        
        // Skills
        s.skills = [...c.skills];
        s.passives = [...c.passives];
        s.activeSkills = [...c.skills].slice(0, 4); // Auto-equip first 4
        s.learnedSkills = [...c.skills];
        
        // Equipment
        s.inventory = [];
        s.equip = { weapon: null, armor: null, acc: null };
        s.status = [];
        s.invulnTurns = 0;
        
        // Add Starter Item
        this.addItem("rotten_meat");
        
        this.recalc();
        // Heal to full
        s.hp = s.maxHp;
        s.mp = s.maxMp;
        s.sp = 0; // Skill Points
        s.unlockedSkills = [...c.skills]; // Start with base skills unlocked
        
        gameStore.log(`Welcome, ${s.className}!`, "system");
    },
    
    recalc() {
        const s = this.state;
        
        // 1. Reset Multipliers
        s.multipliers = { str: 1, vit: 1, int: 1, hp: 1, mp: 1, def: 1, dmg: 1 };
        s.bonuses = { dodge: 0, lifesteal: 0, crit: 0, flatDef: 0 };
        
        // 2. Apply Passives
        s.passives.forEach(pid => {
            const p = DB.PASSIVES[pid];
            if (p && p.stats) {
                if (p.stats.def) s.bonuses.flatDef += p.stats.def;
                if (p.stats.atk) s.multipliers.dmg += p.stats.atk;
                if (p.stats.hpMult) s.multipliers.hp += p.stats.hpMult;
                if (p.stats.dodge) s.bonuses.dodge += (p.stats.dodge / 100);
                if (p.stats.crit) s.bonuses.crit += (p.stats.crit / 100);
            }
        });
        
        // 3. Calculate Attributes (Base + Level)
        const levelBonus = s.level - 1;
        s.str = Math.floor((s.baseStats.STR + levelBonus) * s.multipliers.str);
        s.vit = Math.floor((s.baseStats.VIT + levelBonus) * s.multipliers.vit);
        s.int = Math.floor((s.baseStats.INT + levelBonus) * s.multipliers.int);
        
        // 4. Calculate Max Status
        // HP
        let equipHp = 0;
        for (let k in s.equip) if (s.equip[k]?.hp) equipHp += s.equip[k].hp;
        let finalMaxHp = CONSTANTS.BASE_HP + (s.vit * CONSTANTS.HP_PER_VIT) + equipHp;
        s.maxHp = Math.floor(finalMaxHp * s.multipliers.hp);
        
        // MP
        let equipMp = 0;
        for (let k in s.equip) if (s.equip[k]?.mp) equipMp += s.equip[k].mp;
        let finalMaxMp = CONSTANTS.BASE_MP + (s.int * CONSTANTS.MP_PER_INT) + equipMp;
        s.maxMp = Math.floor(finalMaxMp * s.multipliers.mp);
        
        // Cap Current
        if (s.hp > s.maxHp) s.hp = s.maxHp;
        if (s.mp > s.maxMp) s.mp = s.maxMp;
        
        // 5. Derived Stats (For UI & Combat)
        let calcAtk = Math.floor(s.str * s.multipliers.str * 1.5);
        for (let k in s.equip) if (s.equip[k]?.atk) calcAtk += s.equip[k].atk;
        s.atk = Math.floor(calcAtk * s.multipliers.dmg);
        
        s.def = s.bonuses.flatDef;
        for (let k in s.equip) if (s.equip[k]?.def) s.def += s.equip[k].def;
        s.def = Math.floor(s.def * s.multipliers.def); // Add armor mult from iron skin etc if exists
        
        s.dodge = s.bonuses.dodge;
        s.crit = s.bonuses.crit;
    },
    
    addItem(id) {
        const t = DB.ITEMS[id];
        if (t) {
            this.state.inventory.push({ ...t, id });
            // gameStore.log(`Got ${t.name}`, "item");
        }
    },
    
    // --- INVENTORY MANAGEMENT ---
    handleItemClick(item, idx) {
        const s = this.state;
        
        // 1. Salvage Mode
        if (s.salvageMode) {
            if(window.Crafting) {
                if(confirm(`Salvage ${item.name}?`)) Crafting.salvage(idx);
            }
            return;
        }
        
        // 2. Inspect Mode (Oracle)
        if (s.inspectMode) {
            if(window.Gemini) {
                Gemini.generateLore(item.name);
                gameStore.log("Consulting the Oracle...", "system");
            }
            return;
        }
        
        // 3. Normal Use/Equip
        if (item.slot === 'consumable' || item.slot === 'con') {
            this.useItem(idx);
        } else {
            this.equipItem(idx);
        }
    },
    
    useItem(idx) {
        const s = this.state;
        const it = s.inventory[idx];
        if(!it) return;
        
        if(it.val) {
             s.hp = Math.min(s.hp + it.val, s.maxHp);
             gameStore.log(`Healed ${it.val} HP`, "heal");
        }
        if(it.mp) s.mp = Math.min(s.mp + it.mp, s.maxMp);
        
        s.inventory.splice(idx, 1);
        if(window.SoundManager) window.SoundManager.play("ui");
    },
    
    equipItem(idx) {
        const s = this.state;
        const it = s.inventory[idx];
        if(!it) return;
        
        // Swap
        const old = s.equip[it.slot];
        if(old) s.inventory.push(old);
        
        s.equip[it.slot] = it;
        s.inventory.splice(idx, 1);
        
        gameStore.log(`Equipped ${it.name}`, "system");
        if(window.SoundManager) window.SoundManager.play("ui");
        this.recalc();
    },

    unequipItem(slot) {
        const s = this.state;
        if(s.equip[slot]) {
            s.inventory.push(s.equip[slot]);
            s.equip[slot] = null;
            this.recalc();
        }
    },
    
    toggleInspect() {
        const s = this.state;
        s.inspectMode = !s.inspectMode;
        s.salvageMode = false; // Mutually exclusive
        gameStore.log(s.inspectMode ? "Oracle Eyes Opened 👁️" : "Oracle Eyes Closed", "system");
    },
    
    autoSortInventory() {
         const s = this.state;
         const val = { legend: 4, epic: 3, rare: 2, common: 1 };
         s.inventory.sort((a,b) => (val[b.rarity]||0) - (val[a.rarity]||0));
         gameStore.log("Inventory Sorted", "system");
    },
    
    // --- COMBAT ---
    takeDamage(amount) {
        const s = this.state;
        if (s.invulnTurns > 0) {
            gameStore.log("Invulnerable!", "combat");
            return;
        }
        
        s.hp = Math.max(0, s.hp - amount);
        
        // VISUAL FEEDBACK
        if(amount > 0) {
            gameStore.triggerShake("small");
            gameStore.triggerVfx({ type: 'damage', val: `-${amount}`, target: 'player' });
        }
        
        if (s.hp <= 0) {
             // Handle Death via Game Logic (circular dep? use event?)
             // Ideally Player just dies, and Game observes it.
             // For now, simple log.
             gameStore.log("You have died!", "boss");
             // Emit event for Game.js to catch?
             // Or call Game.handleDefeat() if available (legacy bridge)
             if(window.Game) window.Game.handleDefeat();
        }
    },
    
    handleLevelUp() {
        const s = this.state;
        if (s.exp >= s.nextExp) {
            s.level++;
            s.exp -= s.nextExp; // Overflow
            s.nextExp = Math.floor(s.nextExp * 1.5);
            
            gameStore.log(`Level Up! Lv.${s.level}`, "buff");
            if(window.SoundManager) window.SoundManager.play("level_up");
            gameStore.triggerShake("medium");
            this.recalc();
            s.hp = s.maxHp;
            s.mp = s.maxMp;
            
            // Check Evolution
            this.checkEvolution();
        }
    },

    checkEvolution() {
        const s = this.state;
        const lv = s.level;
        let options = [];

        // 1. Stat/Perk Allocations (Level 5, 10, etc)
        if (DB.EVOLUTIONS[lv]) {
            options = DB.EVOLUTIONS[lv];
        } 
        // 2. Class Evolutions (constants)
        else if (CONSTANTS.CLASS_EVO_LEVELS.includes(lv)) {
            const baseClass = s.className.toLowerCase().split(' ')[0]; // rough detection or use a baseClass field
            // Use 'skeleton' as fallback or detection
            const tree = DB.CLASS_TREES[baseClass] || DB.CLASS_TREES['skeleton'];
            if (tree && tree[lv]) {
                options = tree[lv];
            }
        }

        if (options.length > 0) {
            s.evolutionOptions = options;
            s.activePanel = 'evolution';
        }
    },

    selectEvolution(id) {
        const s = this.state;
        const list = s.evolutionOptions || [];
        const choice = list.find(o => o.id === id);
        
        if (!choice) return;

        gameStore.log(`Evolved: ${choice.name}`, "system");

        // Apply Effects (Serializable Data Driven)
        if (choice.effect) {
             this.applyEffect(choice.effect);
        }
        
        // Apply Stats/Skills (Class Evo)
        if (choice.stats) {
            // It's a class change
            s.className = choice.name;
            s.baseStats = { ...choice.stats };
            // s.sprite = choice.sprite; // Todo: Update sprite in store
        }
        if (choice.skills) {
             // Add new skills
             choice.skills.forEach(sk => {
                 if(!s.learnedSkills.includes(sk)) s.learnedSkills.push(sk);
             });
        }
        if (choice.passivePool) {
             choice.passivePool.forEach(p => {
                 if(!s.passives.includes(p)) s.passives.push(p);
             });
        }

        // Close Panel
        s.evolutionOptions = [];
        s.activePanel = 'menu-view'; // Or back to where they were?
        this.recalc();
    },

    applyEffect(eff) {
        const s = this.state;
        switch(eff.type) {
            case 'mult_stat':
                // e.g. multipliers.str += 0.1
                if(!s.multipliers[eff.stat]) s.multipliers[eff.stat] = 1;
                s.multipliers[eff.stat] += eff.val;
                break;
            case 'add_bonus':
                // e.g. bonuses.dodge += 0.05
                if(!s.bonuses[eff.stat]) s.bonuses[eff.stat] = 0;
                s.bonuses[eff.stat] += eff.val;
                break;
            default:
                console.warn("Unknown effect type:", eff.type);
        }
    },

    buyItem(itemId, price) {
        const s = this.state;
        if (s.gold >= price) {
            s.gold -= price;
            this.addItem(itemId);
            gameStore.log(`Bought item for ${price} G`, "shop");
            return true;
        } else {
             gameStore.log("Not enough gold!", "system");
             return false;
        }
    },

    // --- SKILL MANAGEMENT (Legacy Port) ---

    canUnlock(treeKey, nodeId) {
        const s = this.state;
        if (s.sp < 1) return false;
        if (s.unlockedSkills.includes(nodeId)) return false; 
        
        // We need access to SKILL_TREES. Using window global or need import.
        // Assuming DB.SKILL_TREES exists from database.js import
        const tree = DB.SKILL_TREES[treeKey];
        if(!tree) return false;

        const node = tree.nodes[nodeId];
        if (s.sp < node.cost) return false;
        
        if (node.req && !s.unlockedSkills.includes(node.req)) return false;
        
        return true;
    },

    unlockSkill(treeKey, nodeId) {
        if (this.canUnlock(treeKey, nodeId)) {
            const s = this.state;
            const tree = DB.SKILL_TREES[treeKey];
            const node = tree.nodes[nodeId];
            
            s.sp -= node.cost;
            s.unlockedSkills.push(nodeId);
            
            // Auto-learn if not passive?
            // "Learning" means adding to 'learnedSkills' so it appears in library
             if(!s.learnedSkills.includes(nodeId)) {
                s.learnedSkills.push(nodeId);
            }

            // If passive, add to passives list
            // How to distinguish? DB needs check. 
            // For now, assume active unless specific prefix or data check.
            // Simplified: The UI handles "Passives" vs "Actives" based on DB.SKILLS vs DB.PASSIVES?
            // The Logic just unlocks the ID.
            
            gameStore.log(`Learned Skill: ${node.name}!`, "system");
            if(window.SoundManager) window.SoundManager.play("loot");
            this.recalc();
        }
    },

    equipSkill(skillId, slotIdx) {
        const s = this.state;
        if (slotIdx < 0 || slotIdx >= 4) return;
        
        // Remove from old slot if exists
        const oldIdx = s.activeSkills.indexOf(skillId);
        if (oldIdx !== -1) s.activeSkills[oldIdx] = null;
        
        s.activeSkills[slotIdx] = skillId;
        gameStore.log(`Equipped: ${DB.SKILLS[skillId]?.name}`, "system");
        if(window.SoundManager) window.SoundManager.play("ui");
    },

    unequipSkill(slotIdx) {
        const s = this.state;
        if (slotIdx < 0 || slotIdx >= 4) return;
        s.activeSkills[slotIdx] = null;
        if(window.SoundManager) window.SoundManager.play("ui");
    }
};

// Expose for debugging/legacy
window.PlayerLogic = Player;
