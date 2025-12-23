import { gameStore } from '../store.js';
import { DB } from '../config/database.js';
import { CONSTANTS } from '../config/constants.js';
import { RELICS } from '../config/relics.js';

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
        
        // v36.7: Initialize skill management
        s.unlockedSkills = [...c.skills]; // Start with base skills unlocked
        s.equippedSkills = [...c.skills].slice(0, 5); // Auto-equip first 5 for combat
        
        // Equipment
        s.inventory = [];
        s.relics = []; // v35.0: Relic Inventory
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
        
        // 1. Reset Modifiers
        // SAFEGUARD: If 's.evolutions' is missing (Legacy Save), we CANNOT reset multipliers 
        // because we don't know what Level 5/10 perks they picked.
        // In that case, we preserve multipliers and risk "infinite buff stacking" (less bad than losing perks).
        // New Saves will have 's.evolutions' tracked.
        
        const isLegacy = !s.evolutions; 
        
        s.bonuses = {
            str: 0, vit: 0, int: 0,
            flatDef: 0, dodge: 0, crit: 0,
            lifesteal: 0, block: 0, reflect: 0, reflectMagic: 0 // v35.3
        };

        if(!isLegacy) {
             // Clean Reset for modern saves
             s.multipliers = {
                str: 1, vit: 1, int: 1,
                hp: 1, mp: 1,
                def: 1, dmg: 1,
                gold: 1, exp: 1
            };
            
            // Re-apply Evolutions
            if(window.EVOLUTIONS && s.evolutions) {
                 const allEvos = [...(EVOLUTIONS[5]||[]), ...(EVOLUTIONS[10]||[])];
                 s.evolutions.forEach(id => {
                     const def = allEvos.find(e => e.id === id);
                     if(def && def.effect) this.applyEffect(def.effect);
                 });
            }
        } else {
             // Legacy: Reset specialized multipliers that buffs target? 
             if(s.multipliers) {
                 s.multipliers.gold = 1; 
                 s.multipliers.exp = 1;
             } else {
                 s.multipliers = { str:1, vit:1, int:1, hp:1, mp:1, def:1, dmg:1, gold:1, exp:1 };
             }
        }
        
        // 2. Apply Relics (Passive Effects)
        if (s.relics) {
            s.relics.forEach(rid => {
                const r = window.RELICS ? window.RELICS[rid] : null;
                if (r && r.effect) {
                    try { r.effect(s); } catch (e) { console.error("Relic Error", rid, e); }
                }
            });
        }
        
        // 2.5 Apply Set Bonuses (v36.2)
        const setCounts = {};
        for(let k in s.equip) {
            const it = s.equip[k];
            if(it && it.setBonus) {
                 setCounts[it.setBonus] = (setCounts[it.setBonus] || 0) + 1;
            }
            // Also Map Unique Effects to Bonuses for Combat/Stats
            if(it && it.uniqueEffect) {
                // simple toggle: bonuses.execute_30 = true
                s.bonuses[it.uniqueEffect] = true; 
                
                if (it.uniqueEffect === 'dodge_15') s.bonuses.dodge += 0.15;
                if (it.uniqueEffect === 'dodge_10') s.bonuses.dodge += 0.10; // Smoke bomb
                if (it.uniqueEffect === 'lifesteal_10') s.bonuses.lifesteal += 0.10;
                if (it.uniqueEffect === 'reflect_10') s.bonuses.reflect = (s.bonuses.reflect||0) + 0.10;
                if (it.uniqueEffect === 'reflect_magic_20') s.bonuses.reflectMagic = (s.bonuses.reflectMagic||0) + 0.20;
            }
        }

        if(window.SET_BONUSES) {
            for(let setKey in setCounts) {
                const count = setCounts[setKey];
                const setDef = window.SET_BONUSES[setKey];
                if(setDef) {
                    if(count >= 2 && setDef.two) this.applyEffect(setDef.two);
                    if(count >= 3 && setDef.three) this.applyEffect(setDef.three);
                }
            }
        }
        
        // 2.5 Apply Status Effects (Buffs)
        if (s.status) {
            // Filter expired
            s.status = s.status.filter(b => b.turn > 0);
            
            s.status.forEach(eff => {
                if (eff.id === 'buff_str') s.bonuses.str = (s.bonuses.str || 0) + eff.val;
                if (eff.id === 'buff_vit') s.bonuses.vit = (s.bonuses.vit || 0) + eff.val;
                if (eff.id === 'buff_int') s.bonuses.int = (s.bonuses.int || 0) + eff.val;
                
                if (eff.id === 'buff_def') s.bonuses.flatDef += eff.val;
                if (eff.id === 'buff_dodge') s.bonuses.dodge += (eff.val / 100); 
                
                // v36.2: Reflect All (Paladin)
                if (eff.id === 'refl_all') s.bonuses.reflect = (s.bonuses.reflect || 0) + (eff.val / 100);

                // If Legacy, we reset gold/exp mults above, so this matches.
                if (eff.id === 'buff_gold') s.multipliers.gold += (eff.val / 100); 
                if (eff.id === 'buff_exp') s.multipliers.exp += (eff.val / 100);
            });
        }
        
        // 3. Calculate Attributes (Base + Level + Bonus)
        const levelBonus = s.level - 1;
        const bonusStr = s.bonuses.str || 0;
        const bonusVit = s.bonuses.vit || 0;
        const bonusInt = s.bonuses.int || 0;

        s.str = Math.floor((s.baseStats.STR + levelBonus + bonusStr) * s.multipliers.str);
        s.vit = Math.floor((s.baseStats.VIT + levelBonus + bonusVit) * s.multipliers.vit);
        s.int = Math.floor((s.baseStats.INT + levelBonus + bonusInt) * s.multipliers.int);
        
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
    
    // v35.0: Relic Logic
    addRelic(id) {
        if (!this.state.relics.includes(id)) {
            this.state.relics.push(id);
            // gameStore.log(`Relic obtained: ${id}`, "rare");
            this.recalc();
            if(window.SoundManager) window.SoundManager.play('relic');
        }
    },
    
    // --- INVENTORY MANAGEMENT ---
    handleItemClick(arg1, arg2) {
        const s = this.state;
        let item, idx;
        
        // Overload handling: (idx) or (item, idx)
        if (typeof arg1 === 'number') {
            idx = arg1;
            item = s.inventory[idx];
        } else {
            item = arg1;
            idx = arg2;
        }

        if (!item) return;
        
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
        
        // v36.2: Handle Buffs
        if(it.buff) {
            this.addStatus(it.buff);
        }

        // v36.2: Handle Direct Gold Items (if any)
        if(it.gold) {
            this.gainGold(it.gold);
        }

        s.inventory.splice(idx, 1);
        if(window.SoundManager) window.SoundManager.play("ui");
        
        // v36.4.3: If in combat, using item consumes turn (trigger enemy turn)
        if (gameStore.state.activePanel === 'combat' && gameStore.state.combat?.enemy) {
            if (window.CombatManager) {
                setTimeout(() => {
                    window.CombatManager.enemyTurn();
                }, 800); // Small delay for player to see heal/buff effect
            }
        }
    },

    addStatus(buff) {
        const s = this.state;
        const existing = s.status.find(b => b.id === buff.id);
        if(existing) {
            existing.turn = Math.max(existing.turn, buff.turn);
            existing.val = buff.val; // Refresh value?
            gameStore.log(`${buff.id.replace('buff_', '').toUpperCase()} Refreshed!`, "buff");
        } else {
            // Clone to avoid ref issues
            s.status.push({ ...buff }); 
            // gameStore.log(`${buff.id} Applied`, "buff"); // Optional logging
            // Map generic IDs to readable names for log? 
            let name = buff.id;
            if(name.startsWith('buff_')) name = name.substring(5).toUpperCase();
            gameStore.log(`${name} Up!`, "buff");
        }
        this.recalc();
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
    // --- COMBAT ---
    takeDamage(amount) {
        const s = this.state;
        
        // 1. Invulnerability Check
        if (s.invulnTurns > 0) {
            gameStore.log("Invulnerable!", "combat");
            return;
        }

        // 2. Shield Logic (Summons, Forcefields)
        let remain = amount;
        
        // Prioritize Shields (Oldest first? Or newest? Usually first applied)
        // We use a filter to find shields, modify them, and filter out empty ones later if needed.
        // Actually, let's just iterate.
        if (s.status) {
             s.status.forEach(eff => {
                 if (remain <= 0) return;
                 
                 // Special Shield Types
                 if (eff.type === 'shield' && eff.val > 0) {
                     const absorb = Math.min(remain, eff.val);
                     eff.val -= absorb;
                     remain -= absorb;
                     gameStore.log(`Shield absorbed ${absorb} dmg!`, "buff");
                     gameStore.triggerVfx({ type: 'block', val: absorb, target: 'player' });
                 }
             });
             
             // Cleanup empty shields
             s.status = s.status.filter(eff => {
                 if (eff.type === 'shield' && eff.val <= 0) {
                     gameStore.log(`${eff.id.replace('summon_', '')} destroyed!`, "debuff");
                     return false; 
                 }
                 return true;
             });
        }
        
        if (remain <= 0) return; // Fully blocked

        // 3. HP Damage
        s.hp = Math.max(0, s.hp - remain);
        
        // VISUAL FEEDBACK
        gameStore.triggerShake("small");
        gameStore.triggerVfx({ type: 'damage', val: `-${remain}`, target: 'player' }); 

        if (s.hp <= 0) {
             gameStore.log("You have died!", "boss");
             if(window.Game) window.Game.handleDefeat();
        }
    },
    
    // v35.0: True Damage (Ignores Shields/Invuln, used for Blood Magic costs)
    takeTrueDamage(amount) {
        const s = this.state;
        s.hp = Math.max(0, s.hp - amount);
        
        gameStore.triggerVfx({ type: 'damage', val: `-${amount}`, target: 'player' });
        
        if (s.hp <= 0) {
             gameStore.log("You sacrificed too much life...", "system");
             if(window.Game) window.Game.handleDefeat();
        }
    },
    
    handleLevelUp() {
        const s = this.state;
        if (s.exp >= s.nextExp) {
            s.level++;
            s.exp -= s.nextExp; // Overflow
            s.nextExp = Math.floor(s.nextExp * 1.5);
            s.sp = (s.sp || 0) + 2; // v36.7: +2 SP per level
            
            gameStore.log(`Level Up! Lv.${s.level} (+2 SP)`, "buff");
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
        
        // v36.3: Track Evolution History for Recalc Persistence
        if (!s.evolutions) s.evolutions = [];
        if (!s.evolutions.includes(id)) s.evolutions.push(id);

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

        // Legacy/Evolution Style
        if(eff.type) {
            switch(eff.type) {
                case 'mult_stat':
                    if(!s.multipliers[eff.stat]) s.multipliers[eff.stat] = 1;
                    s.multipliers[eff.stat] += eff.val;
                    break;
                case 'add_bonus':
                    if(!s.bonuses[eff.stat]) s.bonuses[eff.stat] = 0;
                    s.bonuses[eff.stat] += eff.val;
                    break;
                default:
                    console.warn("Unknown effect type:", eff.type);
            }
            return;
        }

        // v36.2: Set Bonus / Object Style
        // Iterate checks for Multipliers vs Bonuses
        const multipliers = ['dmg', 'hp', 'mp', 'def', 'gold', 'exp', 'str', 'vit', 'int']; 
        // Note: str/vit/int are usually Base Stats, but here we treat them as multipliers OR flat bonuses?
        // In items.js, "int: 5" on an item logic is flat. 
        // In Set Bonuses, "int: 5" implies Flat Bonus.
        // In Recalc, we added logic: s.str = (base + level + bonusStr) * mult. 
        // So we should map str/vit/int to s.bonuses for flat, and s.multipliers for percentages.
        // Set Bonuses usually give Flat stats or Percent DMG/Dodge. 
        // Let's rely on naming convention or strict mapping.
        
        for (let key in eff) {
            if (key === 'desc' || key === 'name') continue;

            const val = eff[key];
            
            // Explicit Multipliers (percentages)
            if (['strMult', 'vitMult', 'intMult', 'dmg', 'gold', 'exp'].includes(key)) {
                 s.multipliers[key.replace('Mult', '')] += val;
            }
            // Flat Stats (Bonuses)
            else if (['str', 'vit', 'int', 'lifesteal', 'dodge', 'crit', 'block', 'reflect'].includes(key)) {
                 s.bonuses[key] = (s.bonuses[key] || 0) + val;
            }
            // Special/Boolean Flags
            else {
                // e.g. burnOnHit, phaseOnDodge, hpPerKill
                // Store in bonuses for Logic checks (Combat.js)
                if (typeof val === 'boolean' && val === true) s.bonuses[key] = true;
                else if (typeof val === 'number') s.bonuses[key] = (s.bonuses[key] || 0) + val;
                else s.bonuses[key] = val; // String or other
            }
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
        
        // 1. Tree Requirement (Parent Skill)
        if (node.req && !s.unlockedSkills.includes(node.req)) return false;
        
        // 2. Stat Requirement (from SKILLS_DB)
        const skillDef = DB.SKILLS[nodeId];
        if (skillDef && skillDef.req) {
            const r = skillDef.req;
             // Check stats (Base + Bonuses logic? Usually derived stats)
             // Using Player.state (which has finalized str, vit, int)
            if (r.str && s.str < r.str) return false;
            if (r.vit && s.vit < r.vit) return false;
            if (r.int && s.int < r.int) return false;
        }
        
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
    },

    // --- PERMANENT STAT GROWTH ---
    gainStat(stat, val) {
        const s = this.state;
        stat = stat.toLowerCase();
        
        if (stat === 'str') s.baseStats.STR += val;
        else if (stat === 'vit') s.baseStats.VIT += val;
        else if (stat === 'int') s.baseStats.INT += val;
        else if (stat === 'maxhp') s.baseStats.VIT += Math.ceil(val / CONSTANTS.HP_PER_VIT || 5);
        else if (stat === 'maxmp') s.baseStats.INT += Math.ceil(val / CONSTANTS.MP_PER_INT || 5);
        else if (stat === 'def') s.bonuses.flatDef = (s.bonuses.flatDef || 0) + val;
        else if (stat === 'dodge') s.bonuses.dodge = (s.bonuses.dodge || 0) + val;
        else if (stat === 'crit') s.bonuses.crit = (s.bonuses.crit || 0) + val;
        else if (stat === 'luck') s.luck = (s.luck || 0) + val;
        else if (stat === 'atk') s.baseStats.STR += val; // Fallback to STR for ATK
        
        this.recalc();
        if(window.UI && UI.refresh) UI.refresh();
    },

    gainExp(amount) {
        const s = this.state;
        s.exp += amount;
        gameStore.log(`+${amount} XP`, "exp");
        this.handleLevelUp();
    },

    heal(amount) {
        const s = this.state;
        const oldHp = s.hp;
        s.hp = Math.min(s.hp + amount, s.maxHp);
        const healed = s.hp - oldHp;
        if (healed > 0) {
            gameStore.triggerVfx({ type: 'heal', val: healed });
            // gameStore.log(`Healed ${healed} HP`, "heal");
        }
    },

    gainGold(amount) {
        const s = this.state;
        const mult = s.multipliers.gold || 1;
        
        // Apply Multiplier
        const finalAmount = Math.floor(amount * mult);
        s.gold += finalAmount;
        
        gameStore.log(`+${finalAmount} Gold`, "gold"); // Assuming "gold" style exists or falls back
        if(window.SoundManager) window.SoundManager.play("coin"); // Setup for sound if exists
    }
};

// Expose for debugging/legacy
window.PlayerLogic = Player;
