import { gameStore } from '../store.js';
import { Player as PlayerLogic } from './Player.js';
import { DB } from '../config/database.js';
import { CONSTANTS } from '../config/constants.js';
import { RARITY_TIERS, LUCKY_DROP_MESSAGES } from '../config/loot_config.js';

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
            this.state.combat.turn = 'player';
            
            // v35.3: RELIC - Cursed Skull (-20% Enemy HP)
            if (PlayerLogic.state.bonuses.curseAura) {
                 const reduction = Math.floor(enemy.maxHp * PlayerLogic.state.bonuses.curseAura);
                 enemy.maxHp -= reduction;
                 enemy.hp = enemy.maxHp;
                 gameStore.log(`Relic: Cursed Skull reduced enemy HP by ${reduction}!`, "buff");
            }
            
            gameStore.log(`Encounter: ${enemy.name}`, "combat");
        } catch (err) {
            console.error("Start Combat Error:", err);
            gameStore.log("Error starting combat.", "error");
            // Fallback?
            this.state.activePanel = 'menu-view';
        }
    },

    playerAttack() {
        // Prevent spam / double actions
        const now = Date.now();
        if (this.lastAttackTime && (now - this.lastAttackTime < 500)) return; // 500ms Throttle
        if (this.state.combat.turn !== 'player') return;

        this.lastAttackTime = now;

        const e = this.enemy;
        if (!e) return;

        // Failsafe: If enemy is already dead (0 HP) but still here, trigger victory
        if (e.hp <= 0) {
            this.handleVictory();
            return;
        }
        
        const p = PlayerLogic.state;
        
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

        // 1. Calculate Damage
        let bonusDmg = this.getDamageBonus(); 
        if (p.passives.includes("undead_mastery")) {
             let floorsDescended = 100 - this.state.floor; 
             bonusDmg += Math.floor(floorsDescended / 10);
        }

        let calcAtk = Math.max(1, Math.floor((p.str * p.multipliers.str) * 1.5));
        for (let k in p.equip) if (p.equip[k]?.atk) calcAtk += p.equip[k].atk;
        calcAtk = Math.floor(calcAtk * p.multipliers.dmg);
        
        let dmg = calcAtk + bonusDmg;
        
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

        // 2. Apply Damage (Critical Hit Logic)
        let isCrit = Math.random() < (p.crit || 0); 
        if (isCrit) {
            // v37.0: Use critDmg bonus from gems (default 1.5x if no bonus)
            const critMultiplier = 1.5 + (p.bonuses.critDmg || 0);
            dmg = Math.floor(dmg * critMultiplier);
        }
        
        // DEBUG LOGGING
        // gameStore.log(`[Combat] Attack: Dmg=${dmg}`, "combat");

        e.hp -= dmg;
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
        if(window.SoundManager) {
            window.SoundManager.play(isCrit ? 'crit' : 'hit');
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
        
        if (lifesteal > 0) {
            const heal = Math.ceil(dmg * lifesteal);
            if(heal > 0) {
                PlayerLogic.takeDamage(-heal); // Negative damage = heal
                gameStore.triggerVfx({ type: 'heal', val: `+${heal}`, target: 'player' });
            }
        }

        // 4. Check Defeat
        if (e.hp <= 0) {
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
                const skillDef = window.getEnemySkill(selectedSkill);
                
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
        
        // v36.2: PASSIVE - Inner Rage (+ATK when hit)
        if (PlayerLogic.state.passives.includes('rage_meter')) {
            PlayerLogic.gainStat('atk', 1); // Temp battle buff? Or perm? Desc says "+1 ATK". Usually temp in roguelikes.
            // Player.gainStat is PERMANENT. We need a temp buff.
            // Let's add a temp status 'rage_buff'
            PlayerLogic.state.status.push({ id: 'rage_buff', turn: 3, val: 1 });
            gameStore.log("Inner Rage: +ATK!", "buff");
        }

        // Hit Sfx (only if damage was dealt)
        if (dmg > 0) {
            if(window.SoundManager) window.SoundManager.play("hit");
            if(window.gameStore) window.gameStore.triggerShake("medium");
            
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
                      if(window.SoundManager) SoundManager.play("relic");
                      return;
                 }
                 
                 // Game.handleDefeat() called by takeDamage or similar logic
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
            const skillDef = window.getEnemySkill(skillId);
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
            const skillDef = window.getEnemySkill(skillId);
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
        
        // **REWARDS CALCULATION**
        const p = PlayerLogic.state;
        
        // v36.6: Reset skill cooldowns on victory
        if (p.skillCooldowns) {
            p.skillCooldowns = {};
        }
        
        // EXP
        let expGain = Math.floor((e.exp || 10) * (p.multipliers?.exp || 1));
        PlayerLogic.gainExp(expGain);
        
        // GOLD
        let baseGold = Math.floor((e.exp || 10) * 0.5) + (gameStore.state.floor * 2);
        let goldReward = Math.floor(baseGold * (0.8 + Math.random() * 0.4));
        goldReward = Math.floor(goldReward * (p.multipliers?.gold || 1));
        if (goldReward < 1) goldReward = 1;
        PlayerLogic.state.gold += goldReward;
        
        // **LOOT SYSTEM**
        let lootDrops = [];
        const isBoss = e.isBoss || e.rank === 'S';
        const isElite = e.isElite || e.rank === 'A' || e.rank === 'B';
        
        // Drop rate based on enemy rank/rarity
        let dropChance = 0.30; // Base 30%
        
        // Rank modifiers
        if (isBoss) {
            dropChance = 1.0; // 100% guaranteed
        } else if (isElite) {
            dropChance = 0.50; // Elite: 50%
        } else if (e.rank === 'C') {
            dropChance = 0.35; // Slightly better than base
        }
        
        // Rarity modifier (additional boost)
        const rarityBonus = {
            'common': 0,
            'uncommon': 0.05,
            'rare': 0.10,
            'epic': 0.15,
            'legend': 0.20
        };
        dropChance += (rarityBonus[e.rarity] || 0);
        dropChance = Math.min(1.0, dropChance); // Cap at 100%
        
        if (window.LootManager && Math.random() < dropChance) {
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
            const loot1 = window.LootManager.generateDrop(gameStore.state.floor, rarityOverride, e);
            if (loot1 && window.Player) {
                // Add floor metadata for equipment
                if (!['mat', 'con', 'skill_book'].includes(loot1.slot)) {
                    loot1.dropFloor = gameStore.state.floor;
                }
                
                // v37.0: Add sockets to equipment
                if (window.SocketManager) {
                    window.SocketManager.addSocketsToItem(loot1);
                }
                
                window.Player.addItem(loot1);
                lootDrops.push(loot1);
            }
            
            // LUCK-BASED DOUBLE DROP: Base 5% + 1% per 5 luck
            const luckStat = p.luck || 0;
            const doubleDropChance = 0.05 + (Math.floor(luckStat / 5) * 0.01);
            
            if (Math.random() < doubleDropChance) {
                const loot2 = window.LootManager.generateDrop(gameStore.state.floor, rarityOverride, e);
                if (loot2 && window.Player) {
                    // Add floor metadata for equipment
                    if (!['mat', 'con', 'skill_book'].includes(loot2.slot)) {
                        loot2.dropFloor = gameStore.state.floor;
                    }
                    
                    // v37.0: Add sockets to equipment
                    if (window.SocketManager) {
                        window.SocketManager.addSocketsToItem(loot2);
                    }
                    
                    window.Player.addItem(loot2);
                    lootDrops.push(loot2);
                    gameStore.log(`💎 LUCKY! Double drop! (Luck: ${Math.round(doubleDropChance * 100)}%)`, "buff");
                }
            }
        }
        
        // FLOOR PROGRESSION
        gameStore.state.progress = Math.min(100, gameStore.state.progress + 20);
        // CRITICAL FIX: Sync to Game.state for save persistence
        if (window.Game) window.Game.state.progress = gameStore.state.progress;
        
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
        if (window.SocketManager) {
            const gemDrop = window.SocketManager.generateGemDrop(gameStore.state.floor);
            if (gemDrop) {
                window.SocketManager.addGem(gemDrop, gameStore.state.floor);
            }
        }

        
        // Check level up
        if (p.level > (this._lastLevel || p.level)) {
            gameStore.log("🆙 LEVEL UP!", "buff");
            if(window.ProgressionManager) ProgressionManager.levelUpState();
        }
        this._lastLevel = p.level;
        
        // Sound
        if(window.SoundManager) window.SoundManager.play('victory'); 

        // v37.3: Add floor progress on victory (ambush = half progress as penalty)
        gameStore.state.progress = Math.min(100, (gameStore.state.progress || 0) + 10);
        
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
            if (['burn', 'poison', 'bleed'].includes(s.id)) {
                // Use status.val for damage amount, or fallback to 5% maxHP
                let dmg = s.val || Math.floor(target.maxHp * 0.05);
                if (dmg < 1) dmg = 1;
                
                target.hp -= dmg;
                const statusName = s.id.charAt(0).toUpperCase() + s.id.slice(1);
                gameStore.log(`🔥 ${isPlayer?'You':'Enemy'} took ${dmg} damage from ${statusName}!`, "damage");
                gameStore.triggerVfx({ type: 'damage', val: dmg, target: isPlayer ? 'player' : 'enemy' });
            }
            // Heal over Time
            if (s.id === 'regen') {
                let heal = s.val || Math.floor(target.maxHp * 0.05);
                if (heal < 1) heal = 1;
                target.hp = Math.min(target.hp + heal, target.maxHp);
                gameStore.log(`💚 ${isPlayer?'You':'Enemy'} healed ${heal} from Regen.`, "heal");
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
    }
};
