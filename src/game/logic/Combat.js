import { gameStore } from '../store.js';
import { Player as PlayerLogic } from './Player.js';
import { DB } from '../config/database.js';
import { CONSTANTS } from '../config/constants.js';
import { RARITY_TIERS, LUCKY_DROP_MESSAGES } from '../config/loot_config.js';
import { Formulas } from '../config/formulas.js';
import { LootManager } from '../managers/loot.js';
import { SocketManager } from '../managers/SocketManager.js';
import { SoundManager } from '../managers/sound.js';
import { ProgressionManager } from '../managers/progression.js';
import { getEnemySkill } from '../config/enemy_skills.js';
import { Game } from '../core/game.js';
import { Biomes } from '../config/biomes.js';

/* =========================================
   COMBAT LOGIC (Vue Version)
   ========================================= */

export const Combat = {
    get state() { return gameStore.state; },
    get enemy() { return gameStore.state.combat.enemy; },
    set enemy(val) { gameStore.state.combat.enemy = val; },
    
    init() {},

    startCombat(enemyData, isBoss = false, isElite = false) {
        // 1. Clear Buttons IMMEDIATELY to prevent "Explore" buttons from sticking
        gameStore.state.buttons = [];
        this.state.activePanel = 'combat';

        try {
            // 2. Setup Enemy
            // deep clone enemy to avoid mutating DB
            const enemy = JSON.parse(JSON.stringify(enemyData));
            enemy.maxHp = enemy.hp; // Ensure MaxHP is set
            enemy.isBoss = isBoss;
            enemy.isElite = isElite;
            enemy.status = [];
            
            // v36.4.3: Initialize MP system (base 50 MP, +10 per skill)
            const skillCount = enemy.skills ? enemy.skills.length : 0;
            enemy.maxMp = 50 + (skillCount * 10);
            enemy.mp = enemy.maxMp;
            
            // v36.4.3: Initialize cooldown tracking
            enemy.cooldowns = {}; // { skillId: turnsRemaining }
            
            // v37.3: Reset player skill cooldowns on new combat start (fixes flee bug)
            if (PlayerLogic.state.skillCooldowns) {
                PlayerLogic.state.skillCooldowns = {};
            }
            
            this.state.combat.enemy = enemy;
            this.state.combat.enemy = enemy;
            
            // v38.0: Initialize Biome Mods
            const currentNode = gameStore.state.world.currentNode;
            this.state.combat.biomeMods = (Biomes && currentNode) ? Biomes.getCombatMods(currentNode.biome) : {};
            
            // v38.1: Biome Aggro Check (Ambush / Alarm)
            if (this.state.combat.biomeMods.enemyAggro) {
                gameStore.log("⚠️ AMBUSH! Enemy attacks first!", "error");
                this.state.combat.turn = 'enemy';
                setTimeout(() => this.enemyTurn(), 800);
            } else {
                this.state.combat.turn = 'player';
            }
            
            // v35.3: RELIC - Cursed Skull (-20% Enemy HP)
            if (PlayerLogic.state.bonuses.curseAura) {
                 const reduction = Math.floor(enemy.maxHp * PlayerLogic.state.bonuses.curseAura);
                 enemy.maxHp -= reduction;
                 enemy.hp = enemy.maxHp;
                 gameStore.log(`Relic: Cursed Skull reduced enemy HP by ${reduction}!`, "buff");
            }
            
            // v38.0: Initialize Biome Mods - MOVED UP
            // const currentNode = gameStore.state.world.currentNode;
            // this.state.combat.biomeMods = (Biomes && currentNode) ? Biomes.getCombatMods(currentNode.biome) : {};
            
            // v38.3: Combat Start Passive Effects
            const startShield = this.getPassiveBonus('startShield');
            if (startShield > 0) {
                PlayerLogic.state.shield = (PlayerLogic.state.shield || 0) + startShield;
                gameStore.log(`🛡️ Passive Shield: +${startShield}!`, "buff");
            }
            
            if (this.hasPassiveEffect('startStealth')) {
                PlayerLogic.state.status = PlayerLogic.state.status || [];
                PlayerLogic.state.status.push({ id: 'stealth', turn: 2, val: 0 });
                gameStore.log(`👻 Cloak of Shadows: Stealthed!`, "buff");
            }
            
            // v38.9: Cursed Relic - Void Pact (Start 0 MP)
            if (PlayerLogic.state.bonuses.startEmptyMp) {
                 PlayerLogic.state.mp = 0;
                 gameStore.log("🌌 Void Pact: MP drained to 0!", "debuff");
            }
            
            // v38.9: Cursed Relic - Flesh Rot (HP Decay Loop)
            // Ideally this should be a Status Effect, but we can hack a loop or use 'turn'
            // For now, let's inject a "Rot" status that never expires.
            if (PlayerLogic.state.bonuses.hpDecay) {
                 PlayerLogic.state.status = PlayerLogic.state.status || [];
                 // Check if already applied
                 const hasRot = PlayerLogic.state.status.find(s => s.id === 'flesh_rot');
                 if(!hasRot) {
                     PlayerLogic.state.status.push({ 
                         id: 'flesh_rot', 
                         turn: 999, // Permanent
                         val: PlayerLogic.state.bonuses.hpDecay // Percent
                     });
                     // Note: We need to implement the effect of 'flesh_rot' in Player.damage / turn update?
                     // Or add a combat turn listener.
                     // Combat.js doesn't have a "Player Turn Start" hook easily exposed for custom status logic 
                     // unless it's in processStatusEffects.
                     // Let's assume processStatusEffects handles it if we name it well, or we mod processStatusEffects.
                 }
            }
            
            // v38.0: Initialize Buttons
            this.setCombatButtons();
            
            // v38.8: Apply enemy start-of-combat passives (Gatekeeper Bosses)
            this.applyEnemyCombatStartPassives();
            
            gameStore.log(`Encounter: ${enemy.name}`, "combat");
        } catch (err) {
            console.error("Start Combat Error:", err);
            gameStore.log("Error starting combat.", "error");
            this.state.activePanel = 'menu-view';
        }
    },

    setCombatButtons() {
        const fleeChance = this.getFleeChance();
        
        gameStore.state.buttons = [
            { txt: "⚔️ ATTACK", fn: () => this.playerAttack() },
            { 
               txt: "✨ SKILL", 
               fn: () => {
                   if(this.state.combat.biomeMods?.silence) {
                       gameStore.log("🚫 Silenced! Cannot use skills!", "error");
                       return;
                   }
                   Game.skillState();
               },
               key: "s"
            },
            {
                txt: "🎒 ITEM",
                fn: () => Game.invState() 
            },
            { 
                txt: `🏃 FLEE (${fleeChance}%)`, 
                col: fleeChance > 50 ? "#fff" : "#888",
                fn: () => this.attemptFlee() 
            },
        ];
    },

    getFleeChance() {
        if (!this.enemy || !this.enemy.maxHp) return 0;
        
        // v38.4: Nerfed base flee chance (was 50, now uses CONSTANTS)
        let baseChance = CONSTANTS.BASE_FLEE_CHANCE * 100; // 20%
        let diff = PlayerLogic.state.level - gameStore.state.floor;
        let chance = baseChance + (diff * 5);
        
        // v38.4: AGI bonus to flee (+0.5% per AGI point)
        const agi = PlayerLogic.state.agi || 0;
        chance += (agi * CONSTANTS.FLEE_PER_AGI * 100);
        
        // v38.0: Biome Speed Mod
        const mods = this.state.combat.biomeMods || {};
        if (mods.speed) {
             chance = Math.max(0, chance * (1 + mods.speed));
        }
        
        // v38.4: Cap at MAX_FLEE_CHANCE (70%)
        return Math.max(0, Math.min(CONSTANTS.MAX_FLEE_CHANCE * 100, chance));
    },

    attemptFlee() {
        // v38.8: Check INEVITABLE passive - cannot flee from this enemy
        if (this.enemy && this.enemy._cannotFlee) {
            gameStore.log("⚠️ INEVITABLE! You cannot flee from this battle!", "error");
            return;
        }
        
        if (Math.random() * 100 < this.getFleeChance()) {
            gameStore.log("🏃 Escaped successfully!", "buff");
            gameStore.state.combat.enemy = null;
            gameStore.state.activePanel = 'menu-view';
            gameStore.state.buttons = []; // Clear combat buttons
            if(SoundManager) SoundManager.play("ui_back");
        } else {
            gameStore.log("🚫 Failed to escape!", "error");
            this.state.combat.turn = 'enemy';
            setTimeout(() => this.enemyTurn(), 600);
        }
    },


    playerAttack() {
        // Prevent spam / double actions
        const now = Date.now();
        const p = PlayerLogic.state;
        
        // v38.9: Reduce throttle based on Attack Speed
        const speedMult = p.multipliers.atkSpeed || 1;
        const throttle = Math.max(100, Math.floor(500 / speedMult)); // Cap at 100ms
        
        if (this.lastAttackTime && (now - this.lastAttackTime < throttle)) return; // Dynamic Throttle
        if (this.state.combat.turn !== 'player') return;

        this.lastAttackTime = now;

        const e = this.enemy;
        if (!e) return;

        // Failsafe: If enemy is already dead (0 HP) but still here, trigger victory
        if (e.hp <= 0) {
            this.handleVictory();
            return;
        }

        
        // const p = PlayerLogic.state; // Already declared at top of function
        
        // v36.6: Decrement player skill cooldowns at turn start
        if (p.skillCooldowns && Object.keys(p.skillCooldowns).length > 0) {
            Object.keys(p.skillCooldowns).forEach(skillId => {
                p.skillCooldowns[skillId]--;
                if (p.skillCooldowns[skillId] <= 0) {
                    delete p.skillCooldowns[skillId];
                }
            });
        }

        // Lock turn immediately to prevent double-clicks
        this.state.combat.turn = 'enemy_waiting';

        // 1. Accuracy Check (Biome Mods + Player Stats/Relics)
        const mods = this.state.combat.biomeMods || {};
        const baseAcc = 0.95;
        // v38.9: Include Player Accuracy Bonus (e.g. Berserker Eye penalty)
        const hitChance = baseAcc + (mods.accuracy || 0) + (p.bonuses.hitChance || 0);
        
        if (Math.random() > hitChance) {
             gameStore.log("⚠️ Missed! (Environment Factor)", "error");
             this.state.combat.turn = 'enemy';
             setTimeout(() => this.enemyTurn(), 600);
             return;
        }
        
        // v38.8: Check enemy ETHEREAL passive (30% dodge)
        if (this.checkEnemyEthereal()) {
            this.state.combat.turn = 'enemy';
            setTimeout(() => this.enemyTurn(), 600);
            return;
        }

        // 2. Calculate Damage
        let bonusDmg = this.getDamageBonus(); 
        if (p.passives.includes("undead_mastery")) {
             let floorsDescended = 100 - this.state.floor; 
             bonusDmg += Math.floor(floorsDescended / 10);
        }

        // v38.9: Cursed Relic - Giant Slayer Contract
        if (e.isBoss && p.bonuses.bossDmg) {
             bonusDmg += Math.floor(calcAtk * p.bonuses.bossDmg);
             // gameStore.log("Giant Slayer Bonus!", "buff");
        }
        if (!e.isBoss && !e.isElite && p.bonuses.minionDmg) {
             // minionDmg is negative (e.g. -0.3)
             bonusDmg += Math.floor(calcAtk * p.bonuses.minionDmg); 
        }

        let calcAtk = Formulas.calculatePlayerDamage(p);
        
        let dmg = calcAtk + bonusDmg;
        
        // v38.9: Chaos Dice Variance (Cursed Relic)
        if (p.bonuses.highVariance) {
             // Normal Variance might be +/- 10% (0.9 - 1.1) in Formulas, but let's override or amplify.
             // Chaos Dice: +/- 50% (0.5 - 1.5)
             const variance = 0.5 + Math.random(); // 0.5 to 1.5
             dmg = Math.floor(dmg * variance);
             // gameStore.log(`Chaos Roll: x${variance.toFixed(2)}`, "system");
        }
        
        // v38.3: Apply Unique Passive Stat Bonuses
        const allDmgBonus = this.getPassiveBonus('allDmg');
        const lowHpAtkBonus = this.getPassiveBonus('lowHpAtkBonus');
        const skillPower = this.getPassiveBonus('skillPower');
        
        // Magic damage bonus - REMOVED (Handled by Player.recalc -> s.multipliers.magicDmg)
        // if (magBonus > 0) ...
        
        // v38.9: Cursed Relic - Mind Parasite (Magic DMG Multiplier)
        // Currently applies to ALL damage if Player has magic weapon? 
        // For now, let's treat it as a universal Magic multiplier if we had "Spell" tag.
        // But since this is basic attack, valid for Spellblades.
        if (p.multipliers.magicDmg && p.multipliers.magicDmg !== 1) {
             // Only apply if it's a magic weapon? Or just flat bonus? 
             // Simplification: Apply to all attacks for now (Magic Sword fantasy) or check Weapon Type.
             // let isMagic = p.equip.weapon && p.equip.weapon.type === 'staff';
             // if(isMagic) dmg = Math.floor(dmg * p.multipliers.magicDmg);
             
             // BETTER: Mind Parasite says "Direct Dmg Spells". 
             // Basic Attack is NOT a Spell.
             // So this block should technically be in Game.castSkill?
             // But let's leave a TODO here or apply if using 'staff'.
             const w = p.equip.weapon;
             if(w && (w.type === 'staff' || w.type === 'wand' || w.type === 'tome')) {
                 dmg = Math.floor(dmg * p.multipliers.magicDmg);
             }
        }
        // All damage bonus
        if (allDmgBonus > 0) {
            dmg = Math.floor(dmg * (1 + allDmgBonus));
        }
        // Low HP attack bonus (berserker_rage, spartan_rage, etc)
        const hpPercent = p.hp / p.maxHp;
        if (lowHpAtkBonus > 0 && hpPercent < 0.30) {
            dmg = Math.floor(dmg * (1 + lowHpAtkBonus));
            gameStore.log(`🔥 Low HP Rage! +${Math.floor(lowHpAtkBonus * 100)}% damage!`, "buff");
        }
        
        // v35.3: RELIC - Assassin Cloak (First Strike)
        if (p.bonuses.firstStrike && e.hp === e.maxHp) {
            dmg = Math.floor(dmg * 2);
            gameStore.log("Relic: Assassin Cloak triggered (Double Damage)!", "buff");
            gameStore.triggerVfx({ type: 'critical', val: "ASSASSINATE", target: 'enemy' });
        }

        // v36.2: RELIC/ITEM - Execute (Nightfall Blade)
        if (p.bonuses.execute_30 && e.hp < (e.maxHp * 0.30)) {
            dmg = e.hp; // Instant Kill
            gameStore.log("Nightfall Execute!", "crit");
            gameStore.triggerVfx({ type: 'critical', val: "EXECUTE", target: 'enemy' });
        }

        // v38.3: Apply passive crit bonus
        const passiveCritBonus = this.getPassiveBonus('crit');
        let isCrit = Math.random() < ((p.crit || 0) + passiveCritBonus); 
        if (isCrit) {
            // v38.2 Fix: Use centralized formula (includes Cursed Item multipliers)
            const critMultiplier = Formulas.calculateCritDamage(p);
            // v38.3: Passive crit multiplier bonus
            // v38.9: REMOVED (Handled by Player.recalc -> s.bonuses.critDmgMult or s.multipliers.critDmg)
            // const passiveCritMult = this.getPassiveBonus('critMult');
            // const finalCritMult = critMultiplier + passiveCritMult;
            dmg = Math.floor(dmg * critMultiplier);
        }
        
        // v38.0: Biome Mods (Enemy Def)
        if (mods.enemyDef) {
             const defMult = 1 / (1 + mods.enemyDef);
             dmg = Math.floor(dmg * defMult);
        }
        
        // DEBUG LOGGING
        // gameStore.log(`[Combat] Attack: Dmg=${dmg}`, "combat");
        
        // v38.8: Apply enemy passive damage reduction (Barrier, Void Shield, Adaptive)
        dmg = this.applyEnemyPassiveDamageReduction(dmg);

        e.hp -= dmg;
        
        // v38.8: Track damage for THE_END passive
        if (e._passiveState) {
            e._passiveState.playerDamageDealt = (e._passiveState.playerDamageDealt || 0) + dmg;
        }
        
        gameStore.log(`You hit for ${dmg} damage!${isCrit ? ' (CRIT!)' : ''}`, isCrit ? "crit" : "damage");
        
        // v36.2: Unique Effects (On Hit)
        if (p.bonuses.smite_on_hit) {
            const smiteDmg = 20; // Flat or scaling?
            e.hp -= smiteDmg;
            gameStore.log(`Excalibur Smite: ${smiteDmg}!`, "buff");
             gameStore.triggerVfx({ type: 'damage', val: smiteDmg, target: 'enemy' });
        }
        if (p.bonuses.poison_regen) {
            // Apply Poison to Enemy
            this.applyStatusToEnemy({ id: 'poison', turn: 3, val: 5 }); // 5% DoT
            // Regen Self
             PlayerLogic.heal(5);
        }
        
        // v38.0: UNIQUE EFFECT - Poison Hit (Poison/Venom Dagger)
        if (p.bonuses.poison_hit) {
            // 50% chance to poison on hit
            if (Math.random() < 0.5) {
                const poisonDmg = Math.max(1, Math.floor(e.maxHp * 0.05)); // 5% of enemy maxHP
                this.applyStatusToEnemy({ id: 'poison', turn: 3, val: poisonDmg });
                gameStore.log(`☠️ Poison applied! (${poisonDmg} dmg/turn for 3 turns)`, "buff");
            }
        }
        
        // v38.0: UNIQUE EFFECT - Fire Damage (Flame Sword)
        if (p.bonuses.fire_damage || p.bonuses.fire_dmg) {
            const burnDmg = Math.max(1, Math.floor(e.maxHp * 0.08)); // 8% of enemy maxHP
            this.applyStatusToEnemy({ id: 'burn', turn: 2, val: burnDmg });
            gameStore.log(`🔥 Burn applied! (${burnDmg} dmg/turn for 2 turns)`, "buff");
        }
        
        // v38.0: UNIQUE EFFECT - Phase Damage (Ghost Blade) - Ignore 50% defense
        if (p.bonuses.phase_damage) {
            const bonusDmg = Math.floor(dmg * 0.25); // 25% bonus damage
            e.hp -= bonusDmg;
            gameStore.log(`👻 Phase damage: +${bonusDmg}!`, "buff");
            gameStore.triggerVfx({ type: 'damage', val: bonusDmg, target: 'enemy' });
        }
        
        // v38.0: UNIQUE EFFECT - Thorns Boost (Wrath of Nature) - Store for damage reflection
        if (p.bonuses.thorns_boost) {
            p.bonuses.thorns = (p.bonuses.thorns || 0.1) * 2; // Double thorns damage
        }
        
        // v38.0: UNIQUE EFFECT - Rage Low HP (Berserker Ring)
        if (p.bonuses.rage_low_hp) {
            const hpPct = p.hp / p.maxHp;
            if (hpPct < 0.3) {
                const rageDmg = Math.floor(dmg * 0.5); // +50% dmg when below 30% HP
                e.hp -= rageDmg;
                gameStore.log(`😡 RAGE! +${rageDmg} bonus damage!`, "buff");
            }
        }
        
        // v38.0: UNIQUE EFFECT - Extra Turn (Chronos Staff, Time Warp)
        if ((p.bonuses.extra_turn || p.bonuses.extra_turn_10) && Math.random() < 0.10) {
            this._extraTurnQueued = true;
            gameStore.log(`⏰ Time warp! Extra turn!`, "buff");
        }
        
        // v38.0: UNIQUE EFFECT - Splash Damage (Ragnarok) - Future multi-enemy support
        if (p.bonuses.splash_50 || p.bonuses.splash_100) {
            const splashPct = p.bonuses.splash_100 ? 1.0 : 0.5;
            // Store for potential future multi-enemy combat
            gameStore.log(`💥 Splash damage ready! (${splashPct * 100}% to nearby enemies)`, "buff");
        }
        
        // v36.2: PASSIVE - Rot Touch (Poison on Hit)
        if (p.passives.includes('rot_touch')) {
            this.applyStatusToEnemy({ id: 'poison', turn: 3 });
        }
        // v36.2: PASSIVE - Mana Leech (+1 MP)
        if (p.passives.includes('mana_leech')) {
            PlayerLogic.state.mp = Math.min(PlayerLogic.state.mp + 1, PlayerLogic.state.maxMp);
        }
        // v36.2: PASSIVE - Static (Stun Chance)
        if (p.passives.includes('static') && Math.random() < 0.10) {
            this.applyStatusToEnemy({ id: 'stun', turn: 1 });
            gameStore.log("Static Charge STUNNED the enemy!", "buff");
        }

        // SOUND HOOK
        if(SoundManager) {
            SoundManager.play(isCrit ? 'crit' : 'hit');
        }
        
        // Trigger VFX (Safety Check)
        try {
             gameStore.triggerVfx({ 
                type: isCrit ? 'critical' : 'damage', 
                val: dmg,
                target: 'enemy' 
            });
        } catch(err) {
            console.warn("VFX Error", err);
        }
        
        // 3. Lifesteal (Passive & Relics)
        let lifesteal = p.bonuses.lifesteal || 0;
        if (p.passives.includes("vampirism")) lifesteal += 0.2;
        // v38.3: Add passive lifesteal bonus from unique passives
        const passiveLifesteal = this.getPassiveBonus('lifesteal');
        lifesteal += passiveLifesteal;
        
        // v38.1: Biome Mod (Heat reduces healing)
        if (mods.lifesteal) lifesteal += mods.lifesteal;
        lifesteal = Math.max(0, lifesteal); // Clamp to 0
        
        if (lifesteal > 0) {
            const heal = Math.ceil(dmg * lifesteal);
            if(heal > 0) {
                PlayerLogic.takeDamage(-heal); // Negative damage = heal
                gameStore.triggerVfx({ type: 'heal', val: `+${heal}`, target: 'player' });
            }
        }

        // v38.3: Passive Execute Threshold (death_incarnate, final_judgment, etc)
        const executeThreshold = this.getPassiveBonus('executeThreshold');
        if (executeThreshold > 0 && e.hp > 0) {
            const hpPct = e.hp / e.maxHp;
            if (hpPct < executeThreshold) {
                e.hp = 0;
                gameStore.log(`💀 EXECUTE! Enemy killed at ${Math.floor(hpPct * 100)}% HP!`, "crit");
                gameStore.triggerVfx({ type: 'critical', val: "EXECUTE", target: 'enemy' });
            }
        }

        // 4. Check Defeat
        if (e.hp <= 0) {
            // v38.8: Check for UNDYING/BEYOND_DEATH passives
            if (this.checkEnemyUndying()) {
                // Enemy survived - continue combat
                this.state.combat.turn = 'enemy';
                setTimeout(() => this.enemyTurn(), 600);
                return;
            }
            this.handleVictory();
            return;
        }

        // 5. Enemy Turn
        this.state.combat.turn = 'enemy';
        setTimeout(() => this.enemyTurn(), 600);
    },
    
    enemyTurn() {
        const e = this.enemy;
        if (!e || e.hp <= 0) return;
        
        // Ensure status array exists
        if (!e.status) e.status = [];
        
        // v38.0: Biome Mods (Enemy Turn)
        const mods = this.state.combat.biomeMods || {};
        
        // **CHECK STUN FIRST** before processing other status (so stun duration doesn't decrement before checking!)
        const stunned = e.status.find(s => s.id === 'stun' || s.id === 'shock');
        if (stunned) {

            gameStore.log("💫 Enemy is STUNNED! Turn skipped!", "buff");
            
            // Decrement stun duration
            stunned.turn--;
            if (stunned.turn <= 0) {
                e.status = e.status.filter(s => s.id !== 'stun' && s.id !== 'shock');
                gameStore.log("Stun wore off.", "buff");
            }
            
            // Skip enemy turn
            this.state.combat.turn = 'player';
            this.lastAttackTime = 0;
            return;
        }
        
        // 1. Process Enemy Status (Start of Turn) - DoT damage, debuffs, etc
        this.processStatusEffects(e, false);
        if (e.hp <= 0) {
            this.handleVictory();
            return;
        }
        
        // v38.8: Process enemy turn passives (Limit Break, Primordial Roar, Entropy, etc.)
        this.processEnemyTurnPassives();
        
        // v36.2: PASSIVE - Thorns (Thorns Aura / Zap)
        // v36.5: Scaled with Defense
        if (PlayerLogic.state.passives.includes('thorns_aura')) {
             const thornsDmg = Math.floor(3 + (PlayerLogic.state.def * 0.5));
             e.hp -= thornsDmg;
             gameStore.log(`Thorns: Enemy took ${thornsDmg} dmg.`, "damage");
        }
        // Zap (Lightning Thorns)
        // v36.5: Scaled with Intelligence
        if (PlayerLogic.state.passives.includes('zap')) {
             const zapDmg = Math.floor(5 + (PlayerLogic.state.int * 0.3));
             e.hp -= zapDmg;
             gameStore.log(`Zap: Enemy shocked for ${zapDmg} dmg.`, "damage");
        }

        // v36.4.3: MP Regeneration (+5 MP per turn, capped at maxMp)
        if (e.mp < e.maxMp) {
            e.mp = Math.min(e.mp + 5, e.maxMp);
        }
        
        // v36.4.3: Decrement all skill cooldowns
        if (e.cooldowns) {
            Object.keys(e.cooldowns).forEach(skillId => {
                e.cooldowns[skillId]--;
                if (e.cooldowns[skillId] <= 0) delete e.cooldowns[skillId];
            });
        }
        
        // v36.4.3: SMART AI - Skill Selection
        let usedSkill = false;
        let dmg = 0;
        
        // Try to use a skill (50% chance, or prioritize based on situation)
        if (e.skills && e.skills.length > 0 && Math.random() < 0.5) {
            const selectedSkill = this.selectEnemySkill(e);
            
            if (selectedSkill) {
                // Get skill definition
                const skillDef = getEnemySkill(selectedSkill);
                
                // Check MP cost and cooldown
                if (e.mp >= skillDef.mp && !e.cooldowns[selectedSkill]) {
                    try {
                        // Execute skill
                        const result = skillDef.execute(e, PlayerLogic);
                        
                        // Deduct MP
                        e.mp -= skillDef.mp;
                        
                        // Set cooldown
                        if (skillDef.cooldown > 0) {
                            e.cooldowns[selectedSkill] = skillDef.cooldown;
                        }
                        
                        // Log result
                        gameStore.log(result.log || `${e.name} uses ${skillDef.name}!`, "combat");
                        
                        if (result.damage) dmg = result.damage;
                        usedSkill = true;
                        
                    } catch (err) {
                        console.error("Skill execution error:", err);
                        // Fall back to basic attack on error
                        usedSkill = false;
                    }
                }
            }
        }
        
        // Fallback: Basic Attack (if no skill used or skill failed)
        if (!usedSkill) {
            dmg = e.atk || 5;
            gameStore.log(`${e.name} attacks for ${dmg}!`, "damage");
        }
        
        // v38.0: UNIQUE EFFECT - Block Chance (Tower Shield)
        if (PlayerLogic.state.bonuses.block_chance && Math.random() < 0.20) {
            dmg = 0;
            gameStore.log(`🛡️ BLOCKED! Damage negated!`, "buff");
            if (SoundManager) SoundManager.play('block');
        }
        
        // v38.0: UNIQUE EFFECT - MP on Enemy Skill (Arcane Focus)
        if (usedSkill && PlayerLogic.state.bonuses.mp_on_enemy_skill) {
            const mpGain = 5;
            PlayerLogic.state.mp = Math.min(PlayerLogic.state.mp + mpGain, PlayerLogic.state.maxMp);
            gameStore.log(`✨ Arcane Focus: +${mpGain} MP from enemy skill!`, "buff");
        }
        
        // v36.2: PASSIVE - Inner Rage (+ATK when hit)
        if (PlayerLogic.state.passives.includes('rage_meter')) {
            PlayerLogic.gainStat('atk', 1); // Temp battle buff? Or perm? Desc says "+1 ATK". Usually temp in roguelikes.
            // Player.gainStat is PERMANENT. We need a temp buff.
            // Let's add a temp status 'rage_buff'
            PlayerLogic.state.status.push({ id: 'rage_buff', turn: 3, val: 1 });
            gameStore.log("Inner Rage: +ATK!", "buff");
        }
        
        // v38.0: Biome Dodge / Accuracy Check
        // Player Dodge Mod + Enemy Accuracy Penalty (if any)
        // Let's assume mods.dodge is "Player Dodge Chance"
        // v38.3: Add passive dodge bonus
        const passiveDodge = this.getPassiveBonus('dodge');
        const totalDodge = (mods.dodge || 0) + passiveDodge + (PlayerLogic.state.dodge || 0);
        if (totalDodge > 0 && Math.random() < totalDodge) {
             dmg = 0;
             gameStore.log("💨 You dodged the attack!", "buff");
        }
        
        // v38.0: Biome Damage Mods (Enemy Buffs)
        if (dmg > 0 && mods.enemyAtk) {
             dmg = Math.ceil(dmg * (1 + mods.enemyAtk));
        }

        // Hit Sfx (only if damage was dealt)
        if (dmg > 0) {
            if(SoundManager) SoundManager.play("hit");
            if(gameStore) gameStore.triggerShake("medium");
            
            // VFX
            // gameStore.triggerVfx({ type: 'damage', val: dmg, target: 'player' }); // Handled by Player.js now (integrity check)
            // Blood Particles
            for(let i=0; i<3; i++) gameStore.triggerVfx({ type: 'particle-blood', target: 'player' });
        }
        
        // Calculate Reflect
        if(dmg > 0 && PlayerLogic.state.bonuses.reflect) {
             const reflectDmg = Math.ceil(dmg * PlayerLogic.state.bonuses.reflect);
             if(reflectDmg > 0) {
                 e.hp -= reflectDmg;
                 gameStore.log(`Reflected ${reflectDmg} damage!`, "damage");
                 gameStore.triggerVfx({ type: 'damage', val: reflectDmg, target: 'enemy' });
             }
        }

        // v36.2: Reflect Magic
        if(dmg > 0 && PlayerLogic.state.bonuses.reflectMagic) {
             const magicReflect = Math.ceil(dmg * PlayerLogic.state.bonuses.reflectMagic);
             if(magicReflect > 0) {
                 e.hp -= magicReflect;
                 gameStore.log(`Magic Reflected ${magicReflect}!`, "damage");
                 gameStore.triggerVfx({ type: 'damage', val: magicReflect, target: 'enemy' });
             }
        }

        // Apply damage to player (only if skill dealt damage or basic attack)
        if (dmg > 0) {
            PlayerLogic.takeDamage(dmg);
        }
        
        if (this.state.combat.turn === 'enemy') { // Check if combat still active
            // Check if Enemy died from Reflect/Thorns
            if(e.hp <= 0) {
                this.handleVictory();
                return;
            }

            // Return turn to player
            
            // 2. Process Player Status (Start of Player Turn)
            this.processStatusEffects(PlayerLogic.state, true);
            
             // Check Death after DOT
             if (PlayerLogic.state.hp <= 0) {
                 // v35.3: RELIC - Phoenix Feather (Auto Revive)
                 if (PlayerLogic.state.bonuses.autoRevive) {
                      PlayerLogic.state.hp = Math.floor(PlayerLogic.state.maxHp * 0.5);
                      PlayerLogic.state.bonuses.autoRevive = false; // Consume it
                      gameStore.log("Relic: Phoenix Feather used! Revived!", "buff");
                      gameStore.triggerVfx({ type: 'heal', val: "REVIVED", target: 'player' });
                      if(SoundManager) SoundManager.play("relic");
                      return;
                 }
                 
                 // v38.2 FIX: Actually trigger death instead of just returning
                 gameStore.log("You have died from status effects!", "boss");
                 if(Game) Game.handleDefeat();
                 return;
            }
            
            this.state.combat.turn = 'player';
        }
    },
    
    // v36.4.3: AI Skill Selection Logic
    selectEnemySkill(enemy) {
        if (!enemy.skills || enemy.skills.length === 0) return null;
        
        // Filter available skills (not on cooldown, enough MP)
        const available = enemy.skills.filter(skillId => {
            if (enemy.cooldowns && enemy.cooldowns[skillId]) return false; // On cooldown
            const skillDef = getEnemySkill(skillId);
            if (!skillDef || enemy.mp < skillDef.mp) return false; // Not enough MP
            return true;
        });
        
        if (available.length === 0) return null;
        
        // Calculate HP percentage
        const hpPct = enemy.hp / enemy.maxHp;
        
        // Track turn count (approximate by checking cooldowns - lower = earlier turns)
        const turnCount = Object.keys(enemy.cooldowns || {}).length + 1;
        
        // Priority-based selection
        let healSkills = [];
        let buffSkills = [];
        let offensiveSkills = [];
        
        available.forEach(skillId => {
            const skillDef = getEnemySkill(skillId);
            switch (skillDef.priority) {
                case 'self_low_hp':
                    healSkills.push(skillId);
                    break;
                case 'opening':
                    buffSkills.push(skillId);
                    break;
                case 'first_turn':
                    if (turnCount <= 2) offensiveSkills.push(skillId);
                    break;
                case 'offensive':
                default:
                    offensiveSkills.push(skillId);
                    break;
            }
        });
        
        // Decision Tree
        // 1. Survival (HP < 30%)
        if (hpPct < 0.3 && healSkills.length > 0) {
            return healSkills[Math.floor(Math.random() * healSkills.length)];
        }
        
        // 2. Opening (Turn 1-2)
        if (turnCount <= 2 && buffSkills.length > 0) {
            return buffSkills[Math.floor(Math.random() * buffSkills.length)];
        }
        
        // 3. Offensive (default)
        if (offensiveSkills.length > 0) {
            return offensiveSkills[Math.floor(Math.random() * offensiveSkills.length)];
        }
        
        // Fallback: random available skill
        return available[Math.floor(Math.random() * available.length)];
    },
    
    handleVictory() {
        const e = this.enemy;
        if (!e) return;
        
        gameStore.log(`✅ Defeated ${e.name}!`, "victory");

        // v36.2: On Kill Effects
        if(PlayerLogic.state.bonuses.hp_per_kill) {
            PlayerLogic.heal(PlayerLogic.state.bonuses.hp_per_kill || 3);
        }
        
        // v38.3: Unique Passive Kill Effects
        const killHeal = this.getPassiveBonus('killHeal');
        if (killHeal > 0) {
            const healAmt = Math.floor(PlayerLogic.state.maxHp * killHeal);
            PlayerLogic.heal(healAmt);
            gameStore.log(`🩹 Kill Heal: +${healAmt} HP!`, "buff");
        }
        
        const killRestore = this.getPassiveBonus('killRestore');
        if (killRestore > 0) {
            const hpAmt = Math.floor(PlayerLogic.state.maxHp * killRestore);
            const mpAmt = Math.floor(PlayerLogic.state.maxMp * killRestore);
            PlayerLogic.heal(hpAmt);
            PlayerLogic.state.mp = Math.min(PlayerLogic.state.mp + mpAmt, PlayerLogic.state.maxMp);
            gameStore.log(`✨ Kill Restore: +${hpAmt} HP, +${mpAmt} MP!`, "buff");
        }
        
        const killAtkStack = this.getPassiveBonus('killAtkStack');
        if (killAtkStack > 0) {
            if (!PlayerLogic.state.bonuses.killAtkStacks) PlayerLogic.state.bonuses.killAtkStacks = 0;
            PlayerLogic.state.bonuses.killAtkStacks++;
            gameStore.log(`💪 Bloodlust Stack: +${Math.floor(killAtkStack * 100)}% ATK!`, "buff");
        }
        
        if (this.hasPassiveEffect('killFullHeal')) {
            PlayerLogic.state.hp = PlayerLogic.state.maxHp;
            gameStore.log(`🌿 Ragnarok: Full Heal!`, "buff");
        }
        
        // **REWARDS CALCULATION**
        const p = PlayerLogic.state;
        
        // v36.6: Reset skill cooldowns on victory
        if (p.skillCooldowns) {
            p.skillCooldowns = {};
        }
        
        // EXP
        let expGain = Formulas.calculateExpReward(e, p);
        PlayerLogic.gainExp(expGain);
        
        // GOLD
        let goldReward = Formulas.calculateGoldReward(e, gameStore.state.floor, p);
        if (goldReward < 1) goldReward = 1;
        PlayerLogic.state.gold += goldReward;
        
        // **LOOT SYSTEM**
        let lootDrops = [];
        const isBoss = e.isBoss || e.rank === 'S';
        const isElite = e.isElite || e.rank === 'A' || e.rank === 'B';
        
        // Drop rate based on enemy rank/rarity
        let dropChance = Formulas.calculateDropChance(e);
        
        if (LootManager && Math.random() < dropChance) {
            // Rarity boost for elite/boss
            let rarityOverride = e.rarity || 'common';
            if (isElite || isBoss) {
                // Elite/Boss: +1 rarity tier
                const rarityTiers = ['common', 'uncommon', 'rare', 'epic', 'legend'];
                const currentIdx = rarityTiers.indexOf(rarityOverride);
                if (currentIdx >= 0 && currentIdx < rarityTiers.length - 1) {
                    rarityOverride = rarityTiers[currentIdx + 1];
                }
            }
            
            // Generate first drop (with enemy theming)
            const loot1 = LootManager.generateDrop(gameStore.state.floor, rarityOverride, e);
            if (loot1 && PlayerLogic) {
                // Add floor metadata for equipment
                if (!['mat', 'con', 'skill_book'].includes(loot1.slot)) {
                    loot1.dropFloor = gameStore.state.floor;
                }
                
                // v37.0: Add sockets to equipment
                if (SocketManager) {
                    SocketManager.addSocketsToItem(loot1);
                }
                
                PlayerLogic.addItem(loot1);
                lootDrops.push(loot1);
            }
            
            // LUCK-BASED DOUBLE DROP: Base 5% + 1% per 5 luck
            const luckStat = p.luck || 0;
            const doubleDropChance = 0.05 + (Math.floor(luckStat / 5) * 0.01);
            
            if (Math.random() < doubleDropChance) {
                const loot2 = LootManager.generateDrop(gameStore.state.floor, rarityOverride, e);
                if (loot2 && PlayerLogic) {
                    // Add floor metadata for equipment
                    if (!['mat', 'con', 'skill_book'].includes(loot2.slot)) {
                        loot2.dropFloor = gameStore.state.floor;
                    }
                    
                    // v37.0: Add sockets to equipment
                    if (SocketManager) {
                        SocketManager.addSocketsToItem(loot2);
                    }
                    
                    PlayerLogic.addItem(loot2);
                    lootDrops.push(loot2);
                    gameStore.log(`💎 LUCKY! Double drop! (Luck: ${Math.round(doubleDropChance * 100)}%)`, "buff");
                }
            }
        }
        
        // FLOOR PROGRESSION
        gameStore.state.progress = Math.min(100, gameStore.state.progress + 20);
        // CRITICAL FIX: Sync to Game.state for save persistence
        if (Game) Game.state.progress = gameStore.state.progress;
        
        // CONSOLIDATED LOOT LOG with LUCKY DROP detection
        let lootLog = `💰 +${expGain} EXP, +${goldReward} Gold`;
        
        // Helper: Check if drop is "lucky" (higher rarity than enemy)
        const enemyRarityIdx = RARITY_TIERS.indexOf(e.rarity || 'common');
        
        if (lootDrops.length === 1) {
            const itemRarityIdx = RARITY_TIERS.indexOf(lootDrops[0].rarity);
            const rarityDiff = itemRarityIdx - enemyRarityIdx;
            
            lootLog += `, 🎁 ${lootDrops[0].name || lootDrops[0].id}`;
            
            // Lucky drop messages using config thresholds
            if (rarityDiff >= LUCKY_DROP_MESSAGES.jackpot) {
                // 3+ tiers higher (e.g., common enemy drops epic/legend)
                gameStore.log(`⭐ JACKPOT! ${lootDrops[0].name} (${lootDrops[0].rarity.toUpperCase()}) from ${e.name}!`, "rare");
            } else if (rarityDiff >= LUCKY_DROP_MESSAGES.veryLucky) {
                // 2 tiers higher
                gameStore.log(`🍀 VERY LUCKY! ${lootDrops[0].name} (${lootDrops[0].rarity.toUpperCase()})!`, "buff");
            } else if (rarityDiff >= LUCKY_DROP_MESSAGES.lucky) {
                // 1 tier higher
                gameStore.log(`✨ Lucky drop! ${lootDrops[0].name} (${lootDrops[0].rarity.toUpperCase()})`, "item");
            }
        } else if (lootDrops.length === 2) {
            lootLog += `, 🎁🎁 ${lootDrops.map(l => l.name || l.id).join(' + ')}`;
            
            // Check both items for rare drops
            lootDrops.forEach(drop => {
                const itemRarityIdx = RARITY_TIERS.indexOf(drop.rarity);
                const rarityDiff = itemRarityIdx - enemyRarityIdx;
                
                if (rarityDiff >= LUCKY_DROP_MESSAGES.veryLucky) {
                    gameStore.log(`🍀 LUCKY! ${drop.name} (${drop.rarity.toUpperCase()}) in double drop!`, "buff");
                }
            });
        }
        
        gameStore.log(lootLog, "item");
        
        // v37.0: Gem drops
        if (SocketManager) {
            const gemDrop = SocketManager.generateGemDrop(gameStore.state.floor);
            if (gemDrop) {
                SocketManager.addGem(gemDrop, gameStore.state.floor);
            }
        }

        
        // Check level up
        if (p.level > (this._lastLevel || p.level)) {
            gameStore.log("🆙 LEVEL UP!", "buff");
            if(ProgressionManager) ProgressionManager.levelUpState();
        }
        this._lastLevel = p.level;
        
        // Sound
        if(SoundManager) SoundManager.play('victory'); 

        // v38.0 FIX: Boss victory = advance to next floor
        if (isBoss) {
            gameStore.log(`🎉 BOSS DEFEATED! Advancing to next floor...`, "boss");
            if (Game && Game.nextFloor) {
                Game.nextFloor();
            } else {
                // Fallback: manual floor advancement
                gameStore.state.floor++;
                gameStore.state.progress = 0;
                gameStore.log(`Welcome to Floor ${gameStore.state.floor}...`, "boss");
            }
        } else {
            // v37.3: Add floor progress on victory (ambush = half progress as penalty)
            gameStore.state.progress = Math.min(100, (gameStore.state.progress || 0) + 10);
        }
        
        // Clear enemy and return to explore
        gameStore.state.combat.enemy = null;
        this.state.combat.turn = 'player'; // Reset turn?
        gameStore.state.activePanel = 'menu-view';
        gameStore.state.buttons = [];
    },
    
    // Helper for Unique Effects / Skills
    applyStatusToEnemy(status) {
        if(!this.enemy) return;
        if(!this.enemy.status) this.enemy.status = [];
        
        const existing = this.enemy.status.find(s => s.id === status.id);
        if(existing) {
             existing.turn = Math.max(existing.turn || 0, status.turn);
        } else {
            this.enemy.status.push({ ...status });
        }
        gameStore.log(`Applied ${status.id} to enemy!`, "debuff");
    },

    processStatusEffects(target, isPlayer) {
        if (!target || !target.status) return;
        
        // Filter out expired status
        // Each status: { id, turn, val }
        const activeStatus = [];
        
        target.status.forEach(s => {
            // Apply DOT (Damage over Time)
            // Apply DOT (Damage over Time)
            if (['burn', 'poison', 'bleed', 'flesh_rot'].includes(s.id)) {
                // Use status.val for damage amount, or fallback to 5% maxHP
                let dmg = 0;
                
                if (s.id === 'flesh_rot') {
                     // 1% of Max HP per turn (or value from bonus)
                     // s.val should be 0.01
                     dmg = Math.floor(target.maxHp * (s.val || 0.01));
                } else {
                     dmg = s.val || Math.floor(target.maxHp * 0.05);
                }
                
                if (dmg < 1) dmg = 1;
                
                // v38.9: Reduce self-damage from Flesh Rot if using defensive relics? 
                // No, "Cursed" means unavoidable usually, but maybe shielded?
                
                target.hp -= dmg;
                const statusName = s.id.charAt(0).toUpperCase() + s.id.slice(1).replace('_', ' ');
                gameStore.log(`🔥 ${isPlayer?'You':'Enemy'} took ${dmg} damage from ${statusName}!`, "damage");
                gameStore.triggerVfx({ type: 'damage', val: dmg, target: isPlayer ? 'player' : 'enemy' });
            }
            // Heal over Time
            if (s.id === 'regen') {
                let heal = s.val || Math.floor(target.maxHp * 0.05);
                if (heal < 1) heal = 1;
                
                // v38.9: Check HP Decay (Anti-Regen)?
                
                target.hp = Math.min(target.hp + heal, target.maxHp);
                gameStore.log(`💚 ${isPlayer?'You':'Enemy'} healed ${heal} from Regen.`, "heal");
            }
            
            // v38.9: Sisyphus Stone (Boss Regen Aura)
            // If checking Enemy and Player has aura, trigger regen? 
            // Better: Add this logic in distinct 'turn start' or here if we push a 'regen_aura' status?
            // Since we didn't push a status for this, we check bonuses directly.
            // ONLY if target is Enmy and Is Boss.
            if (!isPlayer && target.isBoss && PlayerLogic.state.bonuses.bossRegenAura) {
                 const regenAmt = Math.floor(target.maxHp * PlayerLogic.state.bonuses.bossRegenAura);
                 target.hp = Math.min(target.hp + regenAmt, target.maxHp);
                 gameStore.log(`🗿 Boss healed ${regenAmt} (Sisyphus Curse)!`, "heal"); 
            }
            
            // Decrement duration (Support 'turn' from config or 'duration')
            if (s.turn !== undefined) s.turn--;
            else if (s.duration !== undefined) s.duration--;
            
            // Keep if time remains
            const remaining = (s.turn !== undefined ? s.turn : s.duration);

            if (remaining > 0) activeStatus.push(s);
            else {
                const statusName = s.id.charAt(0).toUpperCase() + s.id.slice(1);
                gameStore.log(`${statusName} wore off.`, "buff");
            }
        });
        
        target.status = activeStatus;
        if(isPlayer) PlayerLogic.recalc(); // v36.2: Update Stats after buff expiry/tick
    },

    getDamageBonus() {
        let bonus = 0;
        const p = PlayerLogic.state;
        
        if (p.status) {
            p.status.forEach(s => {
                if (s.id === 'strength') bonus += 5;
                if (s.id === 'weakness') bonus -= 5;
            });
        }
        return bonus;
    },

    // v38.3: Get cumulative bonus from all passives for a specific stat
    getPassiveBonus(statKey) {
        const p = PlayerLogic.state;
        let total = 0;
        
        if (!p.passives || !Array.isArray(p.passives)) return 0;
        
        p.passives.forEach(passiveId => {
            const passive = DB.PASSIVES?.[passiveId];
            // v38.3 Fix: Warn if passive is undefined
            if (!passive) {
                console.warn(`[Combat] Undefined passive: ${passiveId}`);
                return;
            }
            if (passive?.stats?.[statKey]) {
                total += passive.stats[statKey];
            }
        });
        
        // v38.3 Fix: Cap executeThreshold at 50% max to prevent OP stacking
        if (statKey === 'executeThreshold' && total > 0.50) {
            total = 0.50;
        }
        
        return total;
    },

    // v38.3: Check if player has a passive with specific stat boolean
    hasPassiveEffect(statKey) {
        const p = PlayerLogic.state;
        if (!p.passives || !Array.isArray(p.passives)) return false;
        
        return p.passives.some(passiveId => {
            const passive = DB.PASSIVES?.[passiveId];
            return passive?.stats?.[statKey] === true;
        });
    },

    executeSkill(skillId, skill) {
        if (!this.enemy) return;
        
        const p = PlayerLogic.state;

        // v37.2 Fix: Decrement OTHER skill cooldowns when using a skill (Turn passes)
        if (p.skillCooldowns && Object.keys(p.skillCooldowns).length > 0) {
            Object.keys(p.skillCooldowns).forEach(sid => {
                // Don't modify the current skill yet (it might not be in the list, or we overwrite it anyway)
                // Actually standard turn logic de-crements everything first.
                p.skillCooldowns[sid]--;
                if (p.skillCooldowns[sid] <= 0) {
                    delete p.skillCooldowns[sid];
                }
            });
        }
        
        // v36.6: Check if skill is on cooldown (Check AFTER decrement? Or BEFORE?)
        // Standard RPG: Check -> Use -> Cooldown ticks for NEXT turn.
        // If I have 1 turn left, and I click it, can I use it?
        // Usually "1 turn left" means "Wait 1 turn". So it's not ready.
        // So I should Check BEFORE decrementing? 
        // NO. "1 turn left" usually means "Ready next turn".
        // Let's stick to the UI representation.
        // If UI says "1", button is disabled.
        // If I click another skill, turn passes, "1" becomes "0" (Ready).
        // So YES, decrement happens when valid action is taken.
        
        // Wait! logical issue:
        // If I check `p.skillCooldowns[skillId]` here, and I JUST decremented it,
        // I might allow using a skill that WAS "1" but became "0" in this microsecond.
        // IS THAT BAD?
        // If I click "Skill B", Skill B is the action.
        // Using "Skill B" takes a turn.
        // So "Skill A" (CD 1) becomes (CD 0).
        // That is correct.
        
        // BUT what about "Skill B"?
        // If "Skill B" has CD, I shouldn't be able to click it.
        // So the CHECK must happen BEFORE decrement.
        
        // CORRECTION: 
        // 1. Check if CURRENT skill is on cooldown. (If so, abort).
        // 2. Decrement ALL skills (since action is confirmed).
        // 3. Execute CURRENT skill.
        // 4. Set CURRENT skill cooldown.
        
        // So I must insert AFTER the check at lines 702-706.
        
        gameStore.log(`Used ${skill.name}!`, "combat");
        
        // v36.6.5: Calculate final cooldown with upgrades and CDR
        let baseCooldown = skill.cooldown || 0;
        
        if (baseCooldown > 0) {
            // 1. Apply permanent upgrades (reduce base cooldown)
            if (p.skillUpgrades && p.skillUpgrades[skillId]) {
                baseCooldown = Math.max(1, baseCooldown - p.skillUpgrades[skillId]);
            }
            
            // 2. Apply CDR stat (percentage reduction, capped at 50%) - v37.0: Uses cooldownReduction from gems
            const cdr = Math.min(0.50, p.bonuses?.cooldownReduction || 0);
            baseCooldown = Math.ceil(baseCooldown * (1 - cdr));
            
            // 3. Ensure minimum 1 turn
            baseCooldown = Math.max(1, baseCooldown);
        }
        
        // Set the final cooldown
        if (baseCooldown > 0) {
            if (!p.skillCooldowns) p.skillCooldowns = {};
            p.skillCooldowns[skillId] = baseCooldown;
        }

        // v36.7: Apply skill upgrades to power and ailments
        let skillPower = skill.power || 1;
        let skillStatus = skill.status ? { ...skill.status } : null;
        
        const upgrades = p.skillUpgrades[skillId];
        if (upgrades) {
            // Apply power multiplier (capped at 3x)
            if (upgrades.powerBonus) {
                skillPower *= Math.min(3.0, 1 + upgrades.powerBonus);
            }
            
            // Apply ailment duration bonus
            if (skillStatus && skillStatus.turn && upgrades.ailmentBonus) {
                skillStatus.turn += upgrades.ailmentBonus;
            }
        }

        // 1. Handle Effects
        if (skill.type === 'heal') {
           // v38.4: Block healing skills if No Healing modifier active
           if (PlayerLogic.state.modifierEffects?.healingDisabled) {
               gameStore.log(`❌ Healing disabled by modifier!`, "error");
               if (SoundManager) SoundManager.play("error");
               return; // Block heal skill
           }
           const heal = Math.floor(skillPower * (PlayerLogic.state.int || 10) * 2); // Use upgraded power
           PlayerLogic.state.hp = Math.min(PlayerLogic.state.hp + heal, PlayerLogic.state.maxHp);
           gameStore.log(`Healed for ${heal} HP.`, "item");
           gameStore.triggerVfx({ type: 'heal', val: `+${heal}`, target: 'player' });
        } 
        else if (['phys', 'mag'].includes(skill.type)) {
            // Damage Calc
            const p = PlayerLogic.state;
            let base = skill.type === 'phys' 
                ? (p.atk || p.str*2) 
                : (p.int * 2);
            
            let dmg = Math.floor(base * skillPower); // v36.7: Use upgraded power!
            
            // v37.0: Apply spellPower bonus for magic skills
            if (skill.type === 'mag' && p.bonuses.spellPower) {
                dmg = Math.floor(dmg * (1 + p.bonuses.spellPower));
            }
            
            // v37.0: Apply critical damage with critDmg bonus
            const isCrit = Math.random() < p.crit;
            if (isCrit) {
                const critMultiplier = 1.5 + (p.bonuses.critDmg || 0);
                dmg = Math.floor(dmg * critMultiplier);
            }
            
            this.enemy.hp -= dmg;
            
            gameStore.log(`${skill.name} hit for ${dmg}!`, isCrit ? 'crit' : 'damage');
            gameStore.triggerVfx({ type: isCrit ? 'critical' : 'damage', val: dmg, target: 'enemy' });
            
            // **APPLY STATUS EFFECTS** (Stun, Bleed, Burn, Poison, etc.)
            if (skillStatus && this.enemy) {
                if (!this.enemy.status) this.enemy.status = [];
                this.enemy.status.push(skillStatus); // v36.7: Use upgraded status!
                const statusName = skillStatus.id.charAt(0).toUpperCase() + skillStatus.id.slice(1);
                gameStore.log(`💥 Applied ${statusName}!`, "debuff");
            }
            
            // Lifesteal check (Skill specific)
            if (skill.lifesteal) {
                const leech = Math.floor(dmg * skill.lifesteal);
                PlayerLogic.state.hp = Math.min(p.hp + leech, p.maxHp);
            }
        }
        else if (skill.type === 'buff') {
            // Check status
             if(skill.status) {
                 PlayerLogic.state.status.push(skill.status);
                 gameStore.log(`Applied ${skill.status.id}`, "buff");
             }
        }
        else if (skill.type === 'debuff') {
             if(skill.status && this.enemy) {
                 this.enemy.status.push(skill.status); // Assuming enemy has status array
                 gameStore.log(`Applied ${skill.status.id} to enemy`, "debuff");
             }
        }
        else if (skill.type === 'summon') {
             // v35.0: Summon Implementation
             // Treat summons as a special Buff that grants Shield (HP) and Passive Dmg?
             // For MVP, Summons are Shields with flavor text.
             const hp = skill.hp || 20;
             PlayerLogic.state.invulnTurns = (PlayerLogic.state.invulnTurns || 0) + 1; // Brief safety?
             
             // Apply as Shield
             // We don't have a distinct 'shield' stat in basic Player state, usually handled via Status or HP
             // Let's verify if Player has 'shield'. 
             // Looking at Player.js, no explicit 'shield' prop in state init.
             // But 'abyssal_shield' skill adds 'shield: 30'. 
             // We should check if 'takeDamage' respects shield.
             // If not, we'll implement a 'summon_shield' status.
             
             const summonStatus = { 
                 id: `summon_${skill.name.toLowerCase().replace(' ', '_')}`, 
                 val: hp, // Use 'val' as Shield HP
                 turn: 99, // Lasts until destroyed
                 type: 'shield' 
             };
             PlayerLogic.state.status.push(summonStatus);
             gameStore.log(`${skill.name} summoned with ${hp} HP!`, "buff");
        }
        else if (skill.type === 'special') {
             // v35.0: Special Skills
             if (skill.name === 'Transmute') {
                 const gold = Math.floor(PlayerLogic.state.int * 2);
                 PlayerLogic.state.gold += gold;
                 gameStore.log(`Transmuted air into ${gold} Gold!`, "rare");
             }
             if (skill.name === 'Glitch') {
                 // Random Effect
                 const effects = ['heal', 'damage', 'gold', 'buff'];
                 const rand = effects[Math.floor(Math.random() * effects.length)];
                 if(rand === 'heal') PlayerLogic.heal(50);
                 if(rand === 'damage') this.enemy.hp -= 50;
                 if(rand === 'gold') PlayerLogic.state.gold += 50;
                 if(rand === 'buff') PlayerLogic.state.status.push({id:'glitch_power', turn:3, val:50}); // +50 stat?
                 gameStore.log(`Glitch triggered: ${rand.toUpperCase()}!`, "rare");
             }
             if (skill.name === 'Possession') {
                 gameStore.log("Possessed Enemy! They hurt themselves.", "debuff");
                 this.enemy.hp -= this.enemy.atk * 2;
             }
        }



        // 2. Cleanup & Check Victory
        gameStore.state.activePanel = 'combat'; // Always return to combat view immediately

        if (this.enemy.hp <= 0) {
            this.handleVictory();
        } else {
            setTimeout(() => this.enemyTurn(), 800);
        }
    },

    // =========================================
    // v38.8: ENEMY PASSIVE SYSTEM (Gatekeeper Bosses)
    // =========================================
    
    hasEnemyPassive(passiveId) {
        const e = this.enemy;
        if (!e || !e.passives) return false;
        return e.passives.includes(passiveId);
    },
    
    getEnemyPassiveState() {
        const e = this.enemy;
        if (!e) return {};
        
        // v38.8 FIX: Store passive state in gameStore for save/load persistence
        if (!gameStore.state.combat.enemyPassiveState) {
            gameStore.state.combat.enemyPassiveState = {};
        }
        
        // Also sync to enemy object for quick access
        e._passiveState = gameStore.state.combat.enemyPassiveState;
        return gameStore.state.combat.enemyPassiveState;
    },
    
    // Calculate damage reduction from enemy passives
    applyEnemyPassiveDamageReduction(damage) {
        const e = this.enemy;
        if (!e || !e.passives) return damage;
        
        let reducedDmg = damage;
        
        // BARRIER: 50% damage reduction above 50% HP
        if (this.hasEnemyPassive('barrier')) {
            const hpPct = e.hp / e.maxHp;
            if (hpPct > 0.5) {
                reducedDmg = Math.floor(reducedDmg * 0.5);
                gameStore.log(`🛡️ BARRIER! Damage halved!`, "debuff");
            }
        }
        
        // VOID_SHIELD: Flat 30% damage reduction
        if (this.hasEnemyPassive('void_shield')) {
            reducedDmg = Math.floor(reducedDmg * 0.7);
            gameStore.log(`🌌 VOID SHIELD absorbs 30%!`, "debuff");
        }
        
        // ADAPTIVE: +10% resist to last damage type (simplified: +10% after first hit)
        if (this.hasEnemyPassive('adaptive')) {
            const state = this.getEnemyPassiveState();
            if (state.adaptiveHits) {
                const resist = Math.min(0.5, state.adaptiveHits * 0.1); // Max 50%
                reducedDmg = Math.floor(reducedDmg * (1 - resist));
                gameStore.log(`🔄 ADAPTIVE! ${Math.floor(resist * 100)}% resist!`, "debuff");
            }
            state.adaptiveHits = (state.adaptiveHits || 0) + 1;
        }
        
        return reducedDmg;
    },
    
    // Check enemy passive on taking lethal damage
    checkEnemyUndying() {
        const e = this.enemy;
        if (!e || e.hp > 0) return false;
        
        // UNDYING: Survive first lethal hit at 1 HP (once)
        if (this.hasEnemyPassive('undying')) {
            const state = this.getEnemyPassiveState();
            if (!state.undyingUsed) {
                e.hp = 1;
                state.undyingUsed = true;
                gameStore.log(`💀 UNDYING! Survived at 1 HP!`, "boss");
                return true;
            }
        }
        
        // BEYOND_DEATH: Revive at 50% HP (once)
        if (this.hasEnemyPassive('beyond_death')) {
            const state = this.getEnemyPassiveState();
            if (!state.beyondDeathUsed) {
                e.hp = Math.floor(e.maxHp * 0.5);
                state.beyondDeathUsed = true;
                gameStore.log(`☠️ BEYOND DEATH! Revived at 50% HP!`, "boss");
                gameStore.triggerVfx({ type: 'critical', val: "REVIVE", target: 'enemy' });
                return true;
            }
        }
        
        return false;
    },
    
    // Process enemy passives that trigger on player action
    processEnemyReactivePassives(action, value = 0) {
        const e = this.enemy;
        if (!e || !e.passives) return;
        
        // SOUL_HARVEST: Gain 5% max HP when player uses skill
        if (action === 'player_skill' && this.hasEnemyPassive('soul_harvest')) {
            const heal = Math.floor(e.maxHp * 0.05);
            e.hp = Math.min(e.hp + heal, e.maxHp);
            gameStore.log(`👁️ SOUL HARVEST! Enemy healed ${heal}!`, "debuff");
        }
        
        // DEBT_COLLECTOR: Steal 10% gold on hit
        if (action === 'enemy_hit' && this.hasEnemyPassive('debt_collector')) {
            const goldStolen = Math.floor(PlayerLogic.state.gold * 0.1);
            PlayerLogic.state.gold = Math.max(0, PlayerLogic.state.gold - goldStolen);
            if (goldStolen > 0) {
                gameStore.log(`💰 DEBT COLLECTOR stole ${goldStolen} gold!`, "debuff");
            }
        }
        
        // MIRROR_IMAGE: 20% chance to reflect skill damage
        if (action === 'player_skill' && this.hasEnemyPassive('mirror_image')) {
            if (Math.random() < 0.2 && value > 0) {
                PlayerLogic.takeDamage(Math.floor(value * 0.5));
                gameStore.log(`🪞 MIRROR IMAGE! Reflected ${Math.floor(value * 0.5)} damage!`, "debuff");
            }
        }
        
        // CHAOS_AURA: Player healing reduced by 50% (handled in Player.heal)
        // ENTROPY: Player loses 5% max HP per turn (processed in enemyTurn)
    },
    
    // Process enemy start-of-combat passives
    applyEnemyCombatStartPassives() {
        const e = this.enemy;
        if (!e || !e.passives) return;
        
        // FIRST_SEAL: Block player's ultimate skill for 3 turns
        if (this.hasEnemyPassive('first_seal')) {
            if (!PlayerLogic.state.status) PlayerLogic.state.status = [];
            PlayerLogic.state.status.push({ id: 'ultimate_sealed', turn: 3 });
            gameStore.log(`🔒 FIRST SEAL! Ultimate blocked for 3 turns!`, "debuff");
        }
        
        // INEVITABLE: Cannot flee from this enemy
        if (this.hasEnemyPassive('inevitable')) {
            e._cannotFlee = true;
            gameStore.log(`⚠️ INEVITABLE! Cannot flee from this battle!`, "debuff");
        }
    },
    
    // Process enemy passives that trigger on their turn
    processEnemyTurnPassives() {
        const e = this.enemy;
        if (!e || !e.passives) return;
        
        // LIMIT_BREAK: ATK doubles when below 30% HP (once)
        if (this.hasEnemyPassive('limit_break')) {
            const state = this.getEnemyPassiveState();
            const hpPct = e.hp / e.maxHp;
            if (hpPct < 0.3 && !state.limitBreakTriggered) {
                e.atk = Math.floor(e.atk * 2);
                state.limitBreakTriggered = true;
                gameStore.log(`💥 LIMIT BREAK! Enemy ATK DOUBLED!`, "boss");
                gameStore.triggerVfx({ type: 'critical', val: "LIMIT BREAK", target: 'enemy' });
            }
        }
        
        // PRIMORDIAL_ROAR: +20% ATK every 5 turns
        if (this.hasEnemyPassive('primordial_roar')) {
            const state = this.getEnemyPassiveState();
            state.roarTurns = (state.roarTurns || 0) + 1;
            if (state.roarTurns % 5 === 0) {
                e.atk = Math.floor(e.atk * 1.2);
                gameStore.log(`🦁 PRIMORDIAL ROAR! Enemy ATK +20%!`, "boss");
            }
        }
        
        // THE_END: Gains +5% ATK per 100 player damage dealt
        if (this.hasEnemyPassive('the_end')) {
            const state = this.getEnemyPassiveState();
            if (state.playerDamageDealt && state.playerDamageDealt >= 100) {
                const stacks = Math.floor(state.playerDamageDealt / 100);
                e.atk = Math.floor(e.atk * (1 + stacks * 0.05));
                state.playerDamageDealt = state.playerDamageDealt % 100;
                gameStore.log(`⬛ THE END grows stronger! +${stacks * 5}% ATK!`, "boss");
            }
        }
        
        // ENTROPY: Player loses 5% max HP per turn
        if (this.hasEnemyPassive('entropy')) {
            const hpLoss = Math.floor(PlayerLogic.state.maxHp * 0.05);
            PlayerLogic.state.maxHp = Math.max(1, PlayerLogic.state.maxHp - hpLoss);
            PlayerLogic.state.hp = Math.min(PlayerLogic.state.hp, PlayerLogic.state.maxHp);
            gameStore.log(`⚫ ENTROPY drains ${hpLoss} max HP!`, "debuff");
        }
        
        // ETHEREAL: 30% dodge chance (processed in playerAttack)
    },
    
    // Check if enemy has ETHEREAL dodge
    checkEnemyEthereal() {
        if (this.hasEnemyPassive('ethereal')) {
            if (Math.random() < 0.3) {
                gameStore.log(`👻 ETHEREAL! Attack phased through!`, "debuff");
                return true;
            }
        }
        return false;
    },
    
    // Check CHAOS_AURA healing reduction
    getEnemyHealingReduction() {
        if (this.hasEnemyPassive('chaos_aura')) {
            return 0.5; // 50% reduction
        }
        return 0;
    }
};
