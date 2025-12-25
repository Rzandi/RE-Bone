import { gameStore } from '../store.js';
import { DB } from '../config/database.js';
import { CONSTANTS } from '../config/constants.js';
import { RELICS } from '../config/relics.js';
import { Game } from '../core/game.js';
import { SoundManager } from '../managers/sound.js';
import { Crafting } from '../managers/crafting.js';
import { Gemini } from '../managers/gemini.js';
import { SocketManager } from '../managers/SocketManager.js';
import { BlackMarketManager } from '../managers/BlackMarketManager.js';

/* =========================================
   PLAYER LOGIC (Vue Version)
   Manipulates gameStore directly.
   ========================================= */

export const Player = {
    // Shortcuts to State
    get state() { return gameStore.state; },
    
    // v38.0: Add getters/setters for commonly used properties
    get hp() { return gameStore.state.hp; },
    set hp(val) { gameStore.state.hp = val; },
    
    get mp() { return gameStore.state.mp; },
    set mp(val) { gameStore.state.mp = val; },
    
    get maxHp() { return gameStore.state.maxHp; },
    set maxHp(val) { gameStore.state.maxHp = val; },
    
    get maxMp() { return gameStore.state.maxMp; },
    set maxMp(val) { gameStore.state.maxMp = val; },
    
    get gold() { return gameStore.state.gold; },
    set gold(val) { gameStore.state.gold = val; },
    
    get level() { return gameStore.state.level; },
    set level(val) { gameStore.state.level = val; },
    
    get exp() { return gameStore.state.exp; },
    set exp(val) { gameStore.state.exp = val; },
    
    get nextExp() { return gameStore.state.nextExp; },
    set nextExp(val) { gameStore.state.nextExp = val; },
    
    get sp() { return gameStore.state.sp; },
    set sp(val) { gameStore.state.sp = val; },
    
    get statPt() { return gameStore.state.statPt; },
    set statPt(val) { gameStore.state.statPt = val; },
    
    get atk() { return gameStore.state.atk; },
    set atk(val) { gameStore.state.atk = val; },
    
    get def() { return gameStore.state.def; },
    set def(val) { gameStore.state.def = val; },
    
    get inventory() { return gameStore.state.inventory; },
    set inventory(val) { gameStore.state.inventory = val; },
    
    get relics() { return gameStore.state.relics; },
    set relics(val) { gameStore.state.relics = val; },
    
    get status() { return gameStore.state.status; },
    set status(val) { gameStore.state.status = val; },
    
    get passives() { return gameStore.state.passives; },
    set passives(val) { gameStore.state.passives = val; },
    
    get invulnTurns() { return gameStore.state.invulnTurns; },
    set invulnTurns(val) { gameStore.state.invulnTurns = val; },
    
    get attr() { return gameStore.state.attr; },
    set attr(val) { gameStore.state.attr = val; },
    
    get equip() { return gameStore.state.equip; },
    set equip(val) { gameStore.state.equip = val; },

    // v38.0: Dynamic Inventory Limit
    get inventoryLimit() {
        let base = 20; 
        if (gameStore.state.meta && gameStore.state.meta.upgrades) {
             const startBonus = gameStore.state.meta.upgrades.inventory_slot || 0;
             base += (startBonus * 5);
        }
        return base;
    },
    
    init(clsKey) {
        const s = this.state;
        const c = DB.CLASSES[clsKey] || DB.CLASSES["skeleton"];
        
        // Core Stats
        s.className = c.name;
        s.level = 1;
        s.exp = 0;
        s.nextExp = 50;
        s.gold = 0;
        s.levelCap = 100; // v38.7: Epic Mode Level Cap
        
        // Attributes (Base)
        s.baseStats = { ...c.attr };
        // Calculated Attributes will be derived in recalc()
        
        // Skills
        s.skills = [...c.skills];
        s.passives = [...c.passives];
        s.activeSkills = [...c.skills].slice(0, 4); // Auto-equip first 4
        s.learnedSkills = [...c.skills];

        // v38.0: Apply Ascension Upgrades (Start Stats & Perks)
        if (s.meta && s.meta.upgrades) {
            const upg = s.meta.upgrades;
            // 1. Start Stats
            if (upg.str_plus) s.baseStats.STR += (upg.str_plus * 5);
            if (upg.vit_plus) s.baseStats.VIT += (upg.vit_plus * 5);
            if (upg.int_plus) s.baseStats.INT += (upg.int_plus * 5);
            // v38.4: AGI/LCK Ascension
            if (upg.agi_plus) s.baseStats.AGI = (s.baseStats.AGI || 0) + (upg.agi_plus * 3);
            if (upg.luck_plus) s.baseStats.LCK = (s.baseStats.LCK || 0) + (upg.luck_plus * 3);
            
            // v38.8: Combat Stats
            if (upg.crit_chance) s.bonusCrit = Math.min(100, (upg.crit_chance * 1)); // +1% each, max 100%
            if (upg.crit_dmg) s.bonusCritDmg = (upg.crit_dmg * 0.10); // +10% each
            
            // v38.8: Regen per explore (stored for Game.js to use)
            s.exploreHpRegen = upg.hp_regen || 0; // % of maxHP
            s.exploreMpRegen = upg.mp_regen || 0; // % of maxMP
            
            // v38.8: Starting Gold
            if (upg.start_gold) s.gold = (upg.start_gold * 100);
            
            // v38.8: Starting Potions
            if (upg.start_potion) {
                for (let i = 0; i < upg.start_potion; i++) {
                    this.addItem("health_potion");
                }
            }

            // 2. Purchased Perks (Permanent Passives)
            for (let key in upg) {
                if (key.startsWith('perk_')) {
                    const pid = key.replace('perk_', '');
                    // Avoid duplicates
                    if (!s.passives.includes(pid)) s.passives.push(pid);
                }
            }
        }
        
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
        
        // v37.1: Init Sprite
        if (c.sprite && c.sprite.idle) {
            s.sprite = c.sprite.idle;
        } else {
            s.sprite = "❓";
        }

        
        this.recalc();
        // Heal to full
        s.hp = s.maxHp;
        s.mp = s.maxMp;
        s.sp = 0; // Skill Points (for unlocking skills)
        s.statPt = 0; // v37.3: Free Stat Points (for allocating to STR/VIT/INT)
        s.unlockedSkills = [...c.skills]; // Start with base skills unlocked
        
        // v38.4: Apply startCurses modifier - add random cursed items
        if (s.modifierEffects?.startCurses > 0) {
            try {
                const { getRandomCursedItems } = require('../config/cursed_items.js');
                const cursedItems = getRandomCursedItems(s.modifierEffects.startCurses, 1);
                cursedItems.forEach(item => {
                    // Add cursed item to inventory (equipped automatically since they're powerful)
                    s.inventory.push({ ...item, uid: `cursed_${Date.now()}_${Math.random()}` });
                    gameStore.log(`☠️ CURSED: ${item.name} added to inventory!`, 'curse');
                });
            } catch (e) {
                console.warn('Failed to load cursed items for startCurses:', e);
            }
        }
        
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
            agi: 0, luck: 0, // v38.4: AGI/LUCK bonuses
            flatDef: 0, dodge: 0, crit: 0,
            lifesteal: 0, block: 0, reflect: 0, reflectMagic: 0, // v35.3
            spellPower: 0, critDmg: 0, cooldownReduction: 0 // v37.0: Advanced gem stats
        };

        if(!isLegacy) {
             // Clean Reset for modern saves
             s.multipliers = {
                str: 1, vit: 1, int: 1,
                agi: 1, luck: 1, // v38.4: AGI/LUCK multipliers
                hp: 1, mp: 1,
                def: 1, dmg: 1,
                gold: 1, exp: 1,
                // v38.9: Cursed Relic Multipliers
                healingReceived: 1,
                damageTaken: 1,
                magicDmg: 1,
                cooldown: 1,
                dropRate: 1,
                atkSpeed: 1,
                mpRegen: 1,
                hpRegenMult: 1 // For Flesh Rot or similar?
            };
            
            // Re-apply Evolutions
            if(DB.EVOLUTIONS && s.evolutions) {
                 const allEvos = [...(DB.EVOLUTIONS[5]||[]), ...(DB.EVOLUTIONS[10]||[])];
                 s.evolutions.forEach(id => {
                     const def = allEvos.find(e => e.id === id);
                     if(def && def.effect) this.applyEffect(def.effect);
                 });
            }

            // v38.0: Apply Ascension Boosts (EXP / Gold)
            if (s.meta && s.meta.upgrades) {
                const upg = s.meta.upgrades;
                if (upg.exp_boost) s.multipliers.exp += (upg.exp_boost * 0.10); // +10% per lvl
                if (upg.gold_boost) s.multipliers.gold += (upg.gold_boost * 0.20); // +20% per lvl
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
                const r = RELICS ? RELICS[rid] : null;
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

        if(DB.SET_BONUSES) {
            for(let setKey in setCounts) {
                const count = setCounts[setKey];
                const setDef = DB.SET_BONUSES[setKey];
                if(setDef) {
                    if(count >= 2 && setDef.two) this.applyEffect(setDef.two);
                    if(count >= 3 && setDef.three) this.applyEffect(setDef.three);
                }
            }
        }
        

        
        // v38.9: Apply Passive Skills (Static Stats)
        // This unifies Combat passives into the main Player Stats for display in StatsPanel
        if (s.passives && DB.PASSIVES) {
            s.passives.forEach(pid => {
                const passive = DB.PASSIVES[pid];
                if (passive && passive.stats) {
                    for (let statKey in passive.stats) {
                        const val = passive.stats[statKey];
                        
                        // 1. Multipliers
                        const multMap = {
                            'strMult': 'str', 'vitMult': 'vit', 'intMult': 'int',
                            'atkMult': 'dmg', 'defMult': 'def', 'hpMult': 'hp', 'mpMult': 'mp',
                            'goldMult': 'gold', 'expMult': 'exp',
                            'critDmgMult': 'critDmg', // Actually typically bonus, but let's handle consistent
                            'mag': 'magicDmg', // Mapping 'mag' (Combat term) to 'magicDmg' (Player term)
                        };

                        if (multMap[statKey]) {
                            const target = multMap[statKey];
                            if(target === 'critDmg') s.bonuses.critDmgMult = (s.bonuses.critDmgMult || 1) + val; // wait, critDmg is usually flat %
                            // Let's stick to s.multipliers for consistency if it fits
                            else s.multipliers[target] += val;
                        }
                        // 2. Flat Bonuses / Percentages treated as bonuses
                        else if (['crit', 'dodge', 'lifesteal', 'reflect', 'block', 'hitChance', 'curseAura'].includes(statKey)) {
                             s.bonuses[statKey] = (s.bonuses[statKey] || 0) + val;
                        }
                        // 3. Special Stats stored in bonuses for Logic Checks
                        else {
                             s.bonuses[statKey] = (s.bonuses[statKey] || 0) + val;
                        }
                    }
                }
            });
        }
        
        // v38.8: Apply Void Set Curses (Negative Stat Modifiers)
        s.bonuses.cursedHealing = 0; // Reset curse healing penalty
        s.bonuses.cursedMaxHp = 0;   // Reset curse maxHp penalty
        s.bonuses.cursedAtk = 0;     // Reset curse atk penalty
        s.bonuses.cursedAllStats = 0; // Reset curse all stats penalty
        
        for(let slotKey in s.equip) {
            const eqItem = s.equip[slotKey];
            if (eqItem && eqItem.curse) {
                const curse = eqItem.curse;
                // Apply curse penalties (will be used later in stat calc)
                if (curse.maxHp) s.bonuses.cursedMaxHp += curse.maxHp;       // e.g. -0.15
                if (curse.healing) s.bonuses.cursedHealing += curse.healing; // e.g. -0.30
                if (curse.atk) s.bonuses.cursedAtk += curse.atk;             // e.g. -0.10
                if (curse.allStats) s.bonuses.cursedAllStats += curse.allStats; // e.g. -0.05
            }
        }
        
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
        
        // 2.6 Apply Passive Skills (v37.2 Fix)
        if (s.passives) {
            s.passives.forEach(pid => {
                const passive = DB.PASSIVES ? DB.PASSIVES[pid] : null;
                if (passive && passive.stats) {
                    const st = passive.stats;
                    
                    // Multipliers
                    if (st.hpMult) s.multipliers.hp += st.hpMult;
                    if (st.atk) s.multipliers.dmg += st.atk; // "atk": 0.20 means +20% dmg
                    if (st.def) s.bonuses.flatDef += st.def; // Flat Def
                    if (st.hp) s.bonuses.flatHp = (s.bonuses.flatHp || 0) + st.hp; // Flat HP (Need to handle in step 4)
                    
                    // Secondary
                    if (st.dodge) s.bonuses.dodge += (st.dodge / 100); // DB uses 15 for 15%
                    if (st.crit) s.bonuses.crit += (st.crit / 100);
                    if (st.critDmg) s.bonuses.critDmg += st.critDmg; // DB uses 0.50
                    if (st.lifesteal) s.bonuses.lifesteal += st.lifesteal;
                    if (st.reflect) s.bonuses.reflect = (s.bonuses.reflect || 0) + st.reflect;
                    if (st.gold) s.multipliers.gold += st.gold;
                    if (st.exp) s.multipliers.exp += st.exp;
                    
                    // Special
                    if (st.execute) s.bonuses.execute = st.execute;
                    if (st.cdr) s.bonuses.cooldownReduction += st.cdr;
                }
            });
        }
        
        if (s.bonuses.noExp) s.multipliers.exp = 0; // v38.9: Force 0 EXP (Midas Curse override)
        
        // 3. Calculate Attributes (Base + Level + Bonus)
        const levelBonus = s.level - 1;
        const bonusStr = s.bonuses.str || 0;
        const bonusVit = s.bonuses.vit || 0;
        const bonusInt = s.bonuses.int || 0;
        const bonusAgi = s.bonuses.agi || 0;
        const bonusLuck = s.bonuses.luck || 0;

        s.str = Math.floor((s.baseStats.STR + levelBonus + bonusStr) * s.multipliers.str);
        s.vit = Math.floor((s.baseStats.VIT + levelBonus + bonusVit) * s.multipliers.vit);
        s.int = Math.floor((s.baseStats.INT + levelBonus + bonusInt) * s.multipliers.int);
        
        // v38.4: AGI and LUCK (no level bonus, only base + equipment/passives)
        // Legacy save protection: default to 3 if missing
        const baseAgi = s.baseStats.AGI ?? 3;
        const baseLck = s.baseStats.LCK ?? 3;
        s.agi = Math.max(0, Math.floor((baseAgi + bonusAgi) * (s.multipliers.agi || 1)));
        s.luck = Math.max(0, Math.floor((baseLck + bonusLuck) * (s.multipliers.luck || 1)));
        
        // Sync s.attr for compatibility
        s.attr = {
            STR: s.str,
            VIT: s.vit,
            INT: s.int,
            AGI: s.agi,
            LCK: s.luck
        };
        
        // 4. Calculate Max Status
        // HP
        let equipHp = 0;
        for (let k in s.equip) if (s.equip[k]?.hp) equipHp += s.equip[k].hp;
        let finalMaxHp = CONSTANTS.BASE_HP + (s.vit * CONSTANTS.HP_PER_VIT) + equipHp + (s.bonuses.flatHp || 0);
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
        
        // v38.4: Apply AGI/LUCK from equipment to bonuses
        for (let k in s.equip) {
            if (s.equip[k]?.agi) s.bonuses.agi = (s.bonuses.agi || 0) + s.equip[k].agi;
            if (s.equip[k]?.luck) s.bonuses.luck = (s.bonuses.luck || 0) + s.equip[k].luck;
        }
        
        // v37.0: Apply Socket Bonuses from Gems
        if (SocketManager) {
            for (let slot in s.equip) {
                const item = s.equip[slot];
                if (item && item.sockets) {
                    const socketBonuses = SocketManager.getSocketBonuses(item);
                    
                    // Apply socket bonuses to player stats
                    for (let stat in socketBonuses) {
                        const value = socketBonuses[stat];
                        
                        // Flat combat stats
                        if (stat === 'atk') calcAtk += value;
                        if (stat === 'def') s.bonuses.flatDef = (s.bonuses.flatDef || 0) + value;
                        if (stat === 'hp') s.maxHp += value;
                        if (stat === 'mp') s.maxMp += value;
                        if (stat === 'int') s.bonuses.int = (s.bonuses.int || 0) + value;
                        
                        // v38.4: AGI/LUCK from gems
                        if (stat === 'agi') s.bonuses.agi = (s.bonuses.agi || 0) + value;
                        if (stat === 'luck') s.bonuses.luck = (s.bonuses.luck || 0) + value;
                        
                        // Percentage/special stats (lifesteal, crit, spellPower, etc)
                        if (['lifesteal', 'crit', 'dodge', 'block', 'spellPower', 'critDmg', 'cooldownReduction', 'regen'].includes(stat)) {
                            s.bonuses[stat] = (s.bonuses[stat] || 0) + value;
                        }
                    }
                }
            }
            // Re-calculate s.int if gem bonuses affected it (since s.bonuses.int was modified)
            s.int = Math.floor((s.baseStats.INT + levelBonus + (s.bonuses.int || 0)) * s.multipliers.int);
        }
        
        // v37.0 Phase 3: Apply curse effects from equipped cursed items
        if (BlackMarketManager) {
            const equippedItems = Object.values(s.equip).filter(Boolean);
            const curseEffects = BlackMarketManager.getCurseEffects(equippedItems);
            const buffEffects = BlackMarketManager.getBuffEffects(equippedItems);
            
            // Apply curse multiplicative penalties
            s.maxHp = Math.max(1, Math.floor(s.maxHp * curseEffects.maxHpMult));
            s.maxMp = Math.max(0, Math.floor(s.maxMp * (curseEffects.maxMpMult || 1.0)));
            
            // Apply buff multipliers (ATK, DEF from cursed items)
            calcAtk = Math.max(0, calcAtk * buffEffects.atkMult);
            
            // Store curse/buff data for combat use
            s.curseEffects = curseEffects;
            s.cursedBuffs = buffEffects;
        }
        
        s.atk = Math.floor(calcAtk * s.multipliers.dmg);
        
        s.def = s.bonuses.flatDef;
        for (let k in s.equip) if (s.equip[k]?.def) s.def += s.equip[k].def;
        s.def = Math.floor(s.def * s.multipliers.def); // Add armor mult from iron skin etc if exists
        
        // v37.0 Phase 3: Apply curse DEF penalty after base DEF calc
        if (s.curseEffects) {
            s.def = Math.floor(s.def * s.curseEffects.defMult);
        }
        
        s.dodge = s.bonuses.dodge;
        s.crit = s.bonuses.crit;
        
        // v38.4: Re-calculate AGI/LUCK with equipment bonuses (they're added in step 5 above)
        const finalBonusAgi = s.bonuses.agi || 0;
        const finalBonusLuck = s.bonuses.luck || 0;
        const equipBaseAgi = s.baseStats.AGI ?? 3;
        const equipBaseLck = s.baseStats.LCK ?? 3;
        s.agi = Math.max(0, Math.floor((equipBaseAgi + finalBonusAgi) * (s.multipliers.agi || 1)));
        s.luck = Math.max(0, Math.floor((equipBaseLck + finalBonusLuck) * (s.multipliers.luck || 1)));
        
        // Update s.attr with final values
        s.attr.AGI = s.agi;
        s.attr.LCK = s.luck;
        
        // v38.4: Apply AGI to dodge and LUCK to crit
        s.dodge += (s.agi * CONSTANTS.DODGE_PER_AGI);
        s.crit += (s.luck * CONSTANTS.CRIT_PER_LUCK);
        
        // v37.0 Phase 3: Apply dodge/crit bonuses from cursed items
        if (s.cursedBuffs) {
            s.dodge += s.cursedBuffs.dodge || 0;
            s.crit += s.cursedBuffs.critRate || 0;
        }
        
        // v38.4: Apply Run Modifier effects
        if (s.modifierEffects) {
            const mods = s.modifierEffects;
            
            // HP multiplier (Glass Cannon, Frail, etc.)
            if (mods.hpMult && mods.hpMult !== 1) {
                s.maxHp = Math.max(1, Math.floor(s.maxHp * mods.hpMult));
                if (s.hp > s.maxHp) s.hp = s.maxHp;
            }
            
            // DEF multiplier (Berserker sets to 0, Frail reduces)
            if (mods.defMult !== undefined && mods.defMult !== 1) {
                s.def = Math.floor(s.def * mods.defMult);
            }
            
            // DMG multiplier (Glass Cannon, Berserker boost)
            if (mods.dmgMult && mods.dmgMult !== 1) {
                s.atk = Math.floor(s.atk * mods.dmgMult);
            }
        }
    },
    
    addItem(itemOrId) {
        // v38.0: Check Limit
        if (this.state.inventory.length >= this.inventoryLimit) {
            gameStore.log("Inventory Full! Upgrade in Soul Forge.", "error");
            if(SoundManager) SoundManager.play('error');
            return false;
        }

        // Handle both string ID and object item
        if (typeof itemOrId === 'object' && itemOrId !== null) {
            // Direct object - push to inventory
            this.state.inventory.push({ ...itemOrId });
            // gameStore.log(`Got ${itemOrId.name}`, "item");
        } else if (typeof itemOrId === 'string') {
            // String ID - lookup in database
            const t = DB.ITEMS[itemOrId];
            if (t) {
                this.state.inventory.push({ ...t, id: itemOrId });
                // gameStore.log(`Got ${t.name}`, "item");
            }
        }
    },
    
    // v35.0: Relic Logic
    addRelic(id) {
        if (!this.state.relics.includes(id)) {
            this.state.relics.push(id);
            // gameStore.log(`Relic obtained: ${id}`, "rare");
            this.recalc();
            this.recalc();
            if(SoundManager) SoundManager.play('relic');
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
            if(Crafting) {
                if(confirm(`Salvage ${item.name}?`)) Crafting.salvage(idx);
            }
            return;
        }
        
        // 2. Inspect Mode (Oracle)
        if (s.inspectMode) {
            if(Gemini) {
                Gemini.generateLore(item.name);
                gameStore.log("Consulting the Oracle...", "system");
            }
            return;
        }
        
        // 3. Gem Check - Gems cannot be equipped directly
        if (item.type === 'gem' || item.slot === 'gem') {
            gameStore.log("💎 Gems must be socketed into equipment! Open an equipped item to socket gems.", "system");
            if(SoundManager) SoundManager.play("error");
            return;
        }
        
        // 4. Material Check - Materials cannot be used
        if (item.slot === 'mat' || item.type === 'material') {
            gameStore.log("📦 Materials are for crafting/socketing only.", "system");
            return;
        }
        
        // 5. Normal Use/Equip
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
        
        // v38.4: Check for No Healing modifier
        if(it.val && s.modifierEffects?.healingDisabled) {
            gameStore.log(`❌ Healing disabled by modifier!`, "error");
            if(SoundManager) SoundManager.play("error");
            return; // Block healing item use
        }
        
        // v38.9: Cursed Relic - Demonic Tutor (No Potions)
        if (s.bonuses && s.bonuses.noPotions) {
             gameStore.log(`🚫 The Demonic Tutor forbids potions!`, "curse");
             if(SoundManager) SoundManager.play("error");
             return;
        }
        
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
        if(SoundManager) SoundManager.play("ui");
        
        // v36.4.3: If in combat, using item consumes turn (trigger enemy turn)
        if (gameStore.state.activePanel === 'combat' && gameStore.state.combat?.enemy) {
            // Need Combat Import? Or keep global check?
            // Since Combat.js imports Player.js, importing Combat here works but circle...
            // Let's rely on global fallback or assume Combat logic handles it via event?
            // Actually, Player.useItem calling Combat.enemyTurn is tight coupling.
            // Better: Events.emit("player_action_complete");
            // For now, removing window.CombatManager check as it's dead.
            // Replacing with:
            // if(window.CombatManager) window.CombatManager.enemyTurn();
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
    
    savePreset(name) {
        const s = this.state;
        const preset = {
            name: name,
            equip: { ...s.equip },
            skills: [ ...s.activeSkills ]
        };
        // Save to GameStore meta?
        if(!s.meta.presets) s.meta.presets = [];
        s.meta.presets.push(preset);
        gameStore.log(`Preset '${name}' saved.`);
        if(SoundManager) SoundManager.play("ui");
    },
    
    equipItem(idx) {
        const s = this.state;
        const it = s.inventory[idx];
        if(!it) return;
        

        


        
        // v38.4: Check for No Equipment modifier (Ascetic)
        if(s.modifierEffects?.noEquipment) {
            gameStore.log(`❌ Equipment disabled by Ascetic modifier!`, "error");
            if(SoundManager) SoundManager.play("error");
            return;
        }
        
        // Swap
        const old = s.equip[it.slot];
        if(old) s.inventory.push(old);
        
        s.equip[it.slot] = it;
        s.inventory.splice(idx, 1);
        
        gameStore.log(`Equipped ${it.name}`, "system");
        if(SoundManager) SoundManager.play("ui");
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
    
    // v38.3: Discard item by index
    discardItem(idx) {
        const s = this.state;
        if (idx < 0 || idx >= s.inventory.length) {
            gameStore.log("Invalid item index!", "error");
            return false;
        }
        
        const item = s.inventory[idx];
        if (!item) return false;
        
        // Remove item from inventory
        s.inventory.splice(idx, 1);
        gameStore.log(`Discarded ${item.name}.`, "system");
        
        if (SoundManager) SoundManager.play('ui_back');
        return true;
    },
    
    // --- COMBAT ---
    // --- COMBAT ---
    takeDamage(amount) {
        const s = this.state;
        
        // 1. Invulnerability Check
        if (s.invulnTurns > 0) {
            gameStore.log("Invulnerable!", "combat");
            gameStore.triggerVfx({ type: 'block', val: 'INVULN', target: 'player' });
            return;
        }

        let finalDamage = amount;

        // v38.9: Cursed Relic - Reckless Amulet / Broken Mirror (Damage Taken Increase)
        if (s.multipliers?.damageTaken && s.multipliers.damageTaken !== 1) {
             finalDamage = Math.floor(finalDamage * s.multipliers.damageTaken);
             gameStore.log(`Damage amplified by ${((s.multipliers.damageTaken - 1) * 100).toFixed(0)}%!`, "debuff");
        }
        
        // 2. Shield Logic (Summons, Forcefields)
        let remain = finalDamage;
        
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
            // v38.0: UNIQUE EFFECT - Auto Revive (Phoenix Feather)
            // v38.6: Enforce Hardcore No-Rez
            const canResurrect = s.bonuses.auto_revive && !s.bonuses._autoReviveUsed && !s.modifierEffects?.noResurrection;
            
            if (canResurrect) {
                s.bonuses._autoReviveUsed = true;
                s.hp = Math.floor(s.maxHp * 0.3); // Revive with 30% HP
                gameStore.log("🔥 PHOENIX REBIRTH! Revived with 30% HP!", "buff");
                gameStore.triggerVfx({ type: 'heal', val: s.hp, target: 'player' });
                if (SoundManager) SoundManager.play('levelup');
                return;
            } else if (s.bonuses.auto_revive && s.modifierEffects?.noResurrection) {
                 gameStore.log("💀 Hardcore Mode prevented Resurrection!", "error");
            }
            
             gameStore.log("You have died!", "boss");
             if(Game) Game.handleDefeat();
        }
    },
    
    // v35.0: True Damage (Ignores Shields/Invuln, used for Blood Magic costs)
    takeTrueDamage(amount) {
        const s = this.state;
        s.hp = Math.max(0, s.hp - amount);
        
        gameStore.triggerVfx({ type: 'damage', val: `-${amount}`, target: 'player' });
        
        if (s.hp <= 0) {
             gameStore.log("You sacrificed too much life...", "system");
             if(Game) Game.handleDefeat();
        }
    },
    
    handleLevelUp() {
        const s = this.state;
        const cap = s.levelCap || 100;
        
        // Check Cap
        if (s.level >= cap) {
             s.exp = s.nextExp - 1; // Cap EXP
             return;
        }

        if (s.exp >= s.nextExp) {
            s.level++;
            s.exp -= s.nextExp; // Overflow
            
            // v38.7: Polynomial Curve for Epic Mode (Level^2.6)
            // Replaces legacy 1.5x exponential which was impossible for 500 floors
            // Formula: Base(50) * (Level ^ 2.6)
            s.nextExp = Math.floor(50 * Math.pow(s.level, 2.6));
            s.sp = (s.sp || 0) + 2; // +2 SP for skills
            s.statPt = (s.statPt || 0) + 3; // v37.3: +3 Stat Points per level
            
            gameStore.log(`Level Up! Lv.${s.level} (+2 SP, +3 Stat Points)`, "buff");
            if(SoundManager) SoundManager.play("level_up");
            gameStore.triggerShake("medium");
            this.recalc();
            s.hp = s.maxHp;
            s.mp = s.maxMp;
            
            // v38.3 FIX: Check evolution FIRST, queue if needed
            const evoOptions = this.getEvolutionOptions(s.level);
            if (evoOptions && evoOptions.length > 0) {
                s.evolutionOptions = evoOptions;
                s.pendingEvolution = true; // Flag to show after stat allocation
                gameStore.log(`🆙 Evolution available at Lv.${s.level}!`, "buff");
            }
            
            // v37.3: Show stat allocation panel if has unspent points
            if (s.statPt > 0) {
                s.activePanel = 'stat-allocation';
            } else if (s.pendingEvolution) {
                // No stat points but has evolution - show evolution directly
                s.activePanel = 'evolution';
            }
        }
    },
    
    // v38.3: Get evolution options for a level
    getEvolutionOptions(lv) {
        let options = [];
        const s = this.state;
        
        // 1. Stat/Perk Evolutions (Level 5, 10) - no requirements
        if (DB.EVOLUTIONS && DB.EVOLUTIONS[lv]) {
            options = DB.EVOLUTIONS[lv];
        }
        // 2. Class Evolutions (Level 20, 50, 80) - check requirements
        else if (CONSTANTS.CLASS_EVO_LEVELS && CONSTANTS.CLASS_EVO_LEVELS.includes(lv)) {
            const baseClass = (s.baseClass || s.className || 'skeleton').toLowerCase().split(' ')[0];
            const tree = DB.CLASS_TREES ? (DB.CLASS_TREES[baseClass] || DB.CLASS_TREES['skeleton']) : null;
            if (tree && tree[lv]) {
                // v38.3: Filter by stat requirements and mark locked ones
                options = tree[lv].map(opt => {
                    const meetsReq = this.meetsRequirements(opt.requirements);
                    return {
                        ...opt,
                        locked: !meetsReq,
                        lockReason: meetsReq ? null : this.getRequirementText(opt.requirements)
                    };
                });
                
                // v38.3 EDGE CASE: If ALL evolutions are locked, unlock the easiest one
                const allLocked = options.every(opt => opt.locked);
                if (allLocked && options.length > 0) {
                    // Find option with lowest total required stats
                    let easiest = options[0];
                    let lowestReq = Infinity;
                    
                    options.forEach(opt => {
                        const totalReq = (opt.requirements?.str || 0) + 
                                        (opt.requirements?.vit || 0) + 
                                        (opt.requirements?.int || 0);
                        if (totalReq < lowestReq) {
                            lowestReq = totalReq;
                            easiest = opt;
                        }
                    });
                    
                    // Force unlock the easiest option
                    easiest.locked = false;
                    easiest.lockReason = null;
                    gameStore.log("⚠️ No class met requirements - easiest option unlocked!", "warning");
                }
            }
        }
        
        return options;
    },
    
    // v38.3: Check if player meets stat requirements
    meetsRequirements(req) {
        if (!req) return true; // No requirements
        const s = this.state;
        if (req.str && (s.str || 0) < req.str) return false;
        if (req.vit && (s.vit || 0) < req.vit) return false;
        if (req.int && (s.int || 0) < req.int) return false;
        // v38.4: AGI/LCK requirements
        if (req.agi && (s.agi || 0) < req.agi) return false;
        if (req.luck && (s.luck || 0) < req.luck) return false;
        return true;
    },
    
    // v38.3: Get human-readable requirement text
    getRequirementText(req) {
        if (!req) return "";
        const parts = [];
        if (req.str) parts.push(`STR ${req.str}`);
        if (req.vit) parts.push(`VIT ${req.vit}`);
        if (req.int) parts.push(`INT ${req.int}`);
        // v38.4: AGI/LCK requirements
        if (req.agi) parts.push(`AGI ${req.agi}`);
        if (req.luck) parts.push(`LCK ${req.luck}`);
        return `Requires: ${parts.join(', ')}`;
    },
    
    // v37.3: Allocate stat point to a specific stat
    allocateStat(stat) {
        const s = this.state;
        if ((s.statPt || 0) <= 0) {
            gameStore.log("No stat points available!", "error");
            return false;
        }
        
        stat = stat.toUpperCase();
        
        // v38.4: Added AGI and LCK to valid stats
        if (!['STR', 'VIT', 'INT', 'AGI', 'LCK'].includes(stat)) {
            gameStore.log("Invalid stat!", "error");
            return false;
        }
        
        // Allocate to base stats
        s.baseStats[stat] = (s.baseStats[stat] || 0) + 1;
        s.statPt--;
        
        gameStore.log(`+1 ${stat}!`, "buff");
        if(SoundManager) SoundManager.play("ui");
        
        this.recalc();
        return true;
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
            if (choice.sprite) s.sprite = choice.sprite;
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
        
        // v38.3: Apply Unique Passive from Evolution
        if (choice.uniquePassive) {
            if(!s.passives.includes(choice.uniquePassive)) {
                s.passives.push(choice.uniquePassive);
                gameStore.log(`Gained unique passive: ${choice.uniquePassive}`, "skill");
            }
        }

        // Close Panel
        s.evolutionOptions = [];
        s.pendingEvolution = false; // v38.3: Clear pending flag
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
                // v38.4: Add base stat (for AGI/LCK evolutions)
                case 'add_base':
                    if(!s.baseStats[eff.stat]) s.baseStats[eff.stat] = 0;
                    s.baseStats[eff.stat] += eff.val;
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
            // Flat Stats (Bonuses) - v37.0: Added spellPower, critDmg, cooldownReduction
            else if (['str', 'vit', 'int', 'lifesteal', 'dodge', 'crit', 'block', 'reflect', 
                      'spellPower', 'critDmg', 'cooldownReduction'].includes(key)) {
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
            if(SoundManager) SoundManager.play("loot");
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
        if(SoundManager) SoundManager.play("ui");
    },

    unequipSkill(slotIdx) {
        const s = this.state;
        if (slotIdx < 0 || slotIdx >= 4) return;
        s.activeSkills[slotIdx] = null;
        if(SoundManager) SoundManager.play("ui");
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
        this.updateApp();
    },

    // Callback for UI updates
    updateApp() { 
        // Force Vue reactivity if needed (usually handled by store)
        // Only if using legacy UI.refresh
        // if(window.UI && UI.refresh) UI.refresh();
    },

    gainExp(amount) {
        const s = this.state;
        const cap = s.levelCap || 100;
        
        if (s.level >= cap) {
            gameStore.log("Max Level Reached!", "warning");
            return;
        }

        s.exp += amount;
        gameStore.log(`+${amount} XP`, "exp");
        this.handleLevelUp();
    },

    heal(amount) {
        const s = this.state;
        let healAmount = amount;
        
        // v38.8: Check CHAOS_AURA passive (50% healing reduction)
        // Import Combat dynamically to avoid circular dependency
        try {
            const combat = gameStore.state.combat;
            if (combat && combat.enemy && combat.enemy.passives && 
                combat.enemy.passives.includes('chaos_aura')) {
                healAmount = Math.floor(healAmount * 0.5);
                gameStore.log(`🌀 CHAOS AURA reduces healing by 50%!`, "debuff");
            }
        } catch (e) { /* Ignore if Combat not available */ }
        
        // v38.8: Apply Void Set curse healing penalty
        if (s.bonuses && s.bonuses.cursedHealing) {
            const reduction = Math.abs(s.bonuses.cursedHealing);
            healAmount = Math.floor(healAmount * (1 - reduction));
        }
        
        // v38.9: Cursed Relic - Blighted Root (Healing Reduction)
        if (s.multipliers.healingReceived) {
             healAmount = Math.floor(healAmount * s.multipliers.healingReceived);
        }
        
        const oldHp = s.hp;
        s.hp = Math.min(s.hp + healAmount, s.maxHp);
        const healed = s.hp - oldHp;
        if (healed > 0) {
            gameStore.triggerVfx({ type: 'heal', val: healed });
            // gameStore.log(`Healed ${healed} HP`, "heal");
        }
    },

    gainGold(amt) {
        const s = this.state;
        const val = Math.floor(amt * (s.multipliers.gold || 1));
        s.gold += val;
        gameStore.log(`+${val} Gold`, "gold");
        if(SoundManager) SoundManager.play("coin"); // Setup for sound if exists
    }
};

// Expose for debugging/legacy
// Global Export REMOVED
// window.PlayerLogic = Player;
