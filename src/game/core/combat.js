/* =========================================
   COMBAT SYSTEM (Refactored v31.0)
   ========================================= */

const CombatManager = {
    enemy: null,

    // Initialize checking Game existence if needed
    init() {},

    startCombat(enemy, isBoss = false) {
        this.enemy = enemy;
        
        // Ensure buttons are set
        this.setCombatButtons();
    },

    setCombatButtons() {
        const fleeChance = this.getFleeChance();
        
        UI.setButtons([
            { txt: "ATTACK", col: "#f55", fn: () => this.playerTurn() },
            { txt: "SKILL", col: "var(--c-blue)", fn: () => Game.skillState() },
            { txt: "ITEM", fn: () => Game.invState() },
            { 
                txt: `FLEE (${fleeChance}%)`, 
                col: fleeChance > 50 ? "#fff" : "#888",
                fn: () => this.attemptFlee() 
            },
        ]);
    },

    getFleeChance() {
        if (!this.enemy || !this.enemy.maxHp) return 0;
        
        // Formula: Base 50% + Stat Advantage - Floor Penalty
        // Using Level vs Floor scaling
        let base = 50;
        
        // Stats Factor: If Player Stronger than Floor average?
        // Let's use simpler logic: Player Level vs Floor
        // Assumes Level 1 = Floor 1. Level 10 = Floor 10.
        // Bonus per level variance?
        
        // User Idea: "Stats Player vs Enemy - Floor * %"
        // Let's use (Player.SPD equivalent or Level) vs Floor
        let statBonus = (Player.level * 3);
        let floorPenalty = (Game.state.floor * 2);
        
        // Adjust for Enemy Rank if exists
        if(this.enemy.rank) {
            const rankPenalties = { 'E':0, 'D':5, 'C':10, 'B':20, 'A':30, 'S':50 };
            floorPenalty += (rankPenalties[this.enemy.rank] || 0);
        }

        let chance = base + statBonus - floorPenalty;
        return Math.max(0, Math.min(100, Math.floor(chance)));
    },
    
    attemptFlee() {
        const chance = this.getFleeChance();
        const roll = Math.random() * 100;
        
        if (roll < chance) {
            Events.emit("log_item", "Escaped safely!");
            // Fix: Go to Explore State (which is now Manual Main Menu effectively)
            Game.exploreState();
        } else {
            Events.emit("log_combat", "Failed to escape!");
            UI.setButtons([]); // Disable buttons
            setTimeout(() => this.enemyTurn(), 800); // Punish
        }
    },

    playerTurn() {
        if (!this.enemy) return;

        // Player Basic Attack with damage bonus
        let bonusDmg = Player.getDamageBonus();
        let dmg = Math.max(1, Player.atk + bonusDmg);
        Player.onAttack(this.enemy); // Trigger Passives

        // VFX
        try { Events.emit('shake', 'normal'); } catch (e) {}
        try { Events.emit('hurt', 'mob-sprite'); } catch (e) {}

        this.enemy.hp -= dmg;
        
        // Lifesteal Calculation
        let setBonus = Player.getSetBonuses();
        let uniqueEffects = Player.getUniqueEffects();
        let totalLifesteal = (setBonus.lifesteal || 0) + (uniqueEffects.lifesteal || 0);
        
        // Vampirism Passive
        if (Player.passives.includes("vampirism")) totalLifesteal += 0.2;
        
        let healAmount = 0;
        if (totalLifesteal > 0) {
            healAmount = Math.floor(dmg * totalLifesteal);
            Player.hp = Math.min(Player.hp + healAmount, Player.maxHp);
        }
        
        // Log
        if (healAmount > 0) {
            Events.emit("log", `Kamu serang ${dmg} dmg, +${healAmount} HP`);
        } else {
            Events.emit("log", `Kamu serang ${dmg} dmg`);
        }
        
        // Update UI
        const pct = (this.enemy.hp / this.enemy.maxHp) * 100;
        // Keep precise HP bar update in UI Logic? No, this is presentation.
        // But UI.els["mob-hp-bar"] requires direct access unless we emit "enemy_hp" event.
        // For now, let's keep it here or create a specific event.
        // Let's stick to simple events first.
        if(window.UI && UI.els && UI.els["mob-hp-bar"]) {
             UI.els["mob-hp-bar"].style.width = `${Math.max(0, pct)}%`; 
        } 
        Events.emit('damage', { val: dmg, type: 'phys' });

        // Check Victory
        if (this.enemy.hp <= 0) {
            Game.handleWin(healAmount);
            return;
        }
        
        // Extra Turn (Time Crystal)
        if (uniqueEffects.extraTurn) {
            Events.emit("log_item", "⏰ Time Crystal! Extra turn!");
            UI.refresh();
            return;
        }

        setTimeout(() => this.enemyTurn(), 600);
    },

    enemyTurn() {
        if (!this.enemy || this.enemy.hp <= 0) return;

        // Check Invulnerability
        if (Player.invulnTurns > 0) {
            Player.invulnTurns--;
            Events.emit("log_item", "⚡ Invulnerable! Attack nullified!");
            UI.refresh();
            return;
        }
        
        let dmg = Math.max(1, this.enemy.atk);
        
        // --- ENEMY AI ---
        // Random Skill Usage (40% Chance)
        if (this.enemy.skills && this.enemy.skills.length > 0 && Math.random() < 0.4) {
             const skKey = this.enemy.skills[Math.floor(Math.random() * this.enemy.skills.length)];
             const sk = DB.SKILLS[skKey];
             if (sk) {
                 if (sk.type === "dmg_debuff") {
                     dmg = Math.floor(dmg * sk.power);
                     this.applyStatus(Player, sk.status);
                 }
                 
                 // Soul Siphon
                 if (Player.passives.includes("soul_siphon")) {
                     Player.mp = Math.min(Player.mp + 2, Player.maxMp);
                     Events.emit("log_item", "+2 MP (Soul Siphon)");
                 }
                 
                 // Mana Siphon Ring
                 let uniqueEffects = Player.getUniqueEffects();
                 if (uniqueEffects.mpOnEnemySkill > 0) {
                     Player.mp = Math.min(Player.mp + uniqueEffects.mpOnEnemySkill, Player.maxMp);
                     Events.emit("log_item", `+${uniqueEffects.mpOnEnemySkill} MP (Mana Siphon Ring)`);
                 }
             }
        }

        // --- DEFENSIVE PASSIVES ---
        // Ethereal (15%)
        if (Player.passives.includes("ethereal") && Math.random() < 0.15) {
            Events.emit("log_item", "DODGE! (Ethereal)");
            dmg = 0;
        }
        // Intangible (30%)
        else if (Player.passives.includes("intangible") && Math.random() < 0.3) {
            Events.emit("log_item", "👻 Phased through attack! (Intangible)");
            dmg = 0;
        }
        else {
            // Shadow Set Dodge
            let setBonus = Player.getSetBonuses();
            if (setBonus.dodge > 0 && Math.random() < setBonus.dodge) {
                Events.emit("log_item", "🌑 Shadow dodge! (Set Bonus)");
                dmg = 0;
            } else {
                 // Shadow Cloak
                 let uniqueEffects = Player.getUniqueEffects();
                 if (uniqueEffects.dodge > 0 && Math.random() < uniqueEffects.dodge) {
                     Events.emit("log_item", "🌫️ Shadow Cloak! Dodged!");
                     dmg = 0;
                 }
            }
        }

        // --- DAMAGE CALC ---
        if (dmg > 0) {
            // Calculate Mitigation
            let reduction = 0;
            
            // Armor
            if (Player.def > 0) reduction += Player.def;
            
            // Frenzy (DEF Down)
            let frenzy = Player.status.find(s => s.id === 'frenzy');
            if (frenzy) reduction = Math.max(0, reduction - 5);

            // Buffs
            let buffDef = Player.status.find(s => s.id === 'buff_def');
            if(buffDef) reduction += buffDef.val;

            // Stone Skin
            if(Player.passives.includes("stone_skin")) reduction += 5;

            // Apply Reduction
            dmg = Math.max(1, dmg - reduction);
            
            // Thorns (Reflect)
            if (Player.passives.includes("thorns")) {
                let reflect = Math.floor(dmg * 0.15);
                if (reflect > 0) {
                    this.enemy.hp -= reflect;
                    Events.emit("log_combat", `Thorns reflected ${reflect} dmg!`);
                    if (this.enemy.hp <= 0) {
                        Game.handleWin();
                        return;
                    }
                }
            }
            
            // Plague Ward (Reflect 50%)
            let pWard = Player.status.find(s => s.id === "plague_ward");
            if (pWard) {
                let reflect = Math.floor(dmg * 0.5);
                this.enemy.hp -= reflect;
                Events.emit("log_combat", `Plague Ward reflected ${reflect} dmg!`);
                if (this.enemy.hp <= 0) {
                     Game.handleWin();
                     return;
                }
            }

            // Take Damage
            Player.takeDamage(dmg);
            
            // Screen Shake
            try { Events.emit('shake', 'heavy'); } catch(e){}
            Events.emit("log", `Musuh serang ${dmg} dmg!`); // "log damage" type was not standard, used "log"
        }

        // Apply Status Effects (Burn, Poison, etc on Player) 
        // Note: Player.takeDamage handles updating UI, but Combat might need to trigger turn end stuff?
        // Game loop usually handles Player status updates at start of Player turn?
        // No, current logic seems to be: Enemy acts -> Player acts (wait for input).
        
        UI.refresh();
        
        // Restore buttons for Player Turn
        this.setCombatButtons();
    },

    // --- SKILL EXECUTION ---
    executeSkill(s) {
        if (!this.enemy) return;
        
        let setBonus = Player.getSetBonuses();
        let uniqueEffects = Player.getUniqueEffects();

        // HEAL
        if (s.type === "heal") {
            this._handleHealSkill(s);
            return;
        }

        // MULTI-HIT
        if (s.hits && s.hits > 1) {
            this._handleMultiHitSkill(s, setBonus, uniqueEffects);
            return;
        }

        // SINGLE HIT / STATUS
        if (s.type === "phys" || s.type === "mag") {
            this._handleSingleHitSkill(s, setBonus, uniqueEffects);
        } else if (s.type === "buff" || s.type === "debuff") {
            this._handleStatusSkill(s);
        } else if (s.type === "special") {
            Events.emit("log_combat", `Skill ${s.name} used!`);
        }

        // GLOBAL VFX & END TURN
        this._finalizeSkillVFX(s.name);
        
        // Check Victory
        if (this.enemy.hp <= 0) {
            Game.handleWin();
        } else {
            setTimeout(() => this.enemyTurn(), 600);
        }
    },

    _handleHealSkill(s) {
        let h = Math.floor(Player.attr.VIT * 4 * s.power);
        Player.hp = Math.min(Player.hp + h, Player.maxHp);
        
        if (s.invuln) {
            Player.invulnTurns = s.invuln;
            Events.emit("log_item", `Heal +${h} | Invulnerability: ${s.invuln} turn(s)!`);
        } else {
            Events.emit("log_item", `Heal +${h}`);
        }
        
        try { VFX.showSkillEffect(s.name, 'mob-sprite'); } catch(e) {}
        
        UI.showPanel("combat");
        this.setCombatButtons();

        setTimeout(() => {
            if (!Game.checkAscensionVictory()) this.enemyTurn();
        }, 600);
    },

    _handleMultiHitSkill(s, setBonus, uniqueEffects) {
        let totalDmg = 0;
        let totalHeal = 0;
        let bonusDmg = Player.getDamageBonus();

        for (let i = 0; i < s.hits; i++) {
            let hitDmg = 0;
            if (s.type === "phys") {
                let rawDmg = Math.floor((Player.atk + bonusDmg) * s.power);
                if (s.ignoreDef) hitDmg = rawDmg;
                else hitDmg = Math.max(1, rawDmg - (this.enemy.def || 0));
            } else if (s.type === "mag") {
                let baseDmg = Math.floor((Player.attr.INT * 2 + bonusDmg) * s.power);
                hitDmg = Math.floor(baseDmg * (1 + (setBonus.spellDamage || 0)));
            }

            totalDmg += hitDmg;
            
            let lifesteal = (s.lifesteal || 0) + (uniqueEffects.lifesteal || 0);
            if (lifesteal > 0) totalHeal += Math.floor(hitDmg * lifesteal);

            setTimeout(() => { try { Events.emit('damage', { val: hitDmg, type: 'phys' }); } catch(e){} }, i * 150);
        }

        this.enemy.hp -= totalDmg;
        if (totalHeal > 0) {
            Player.hp = Math.min(Player.hp + totalHeal, Player.maxHp);
            Events.emit("log_combat", `${s.hits}-Hit! ${totalDmg} dmg, +${totalHeal} HP`);
        } else {
            Events.emit("log_combat", `${s.hits}-Hit Combo! ${totalDmg} total dmg`);
        }
        
        this._finalizeSkillVFX(s.name);
        
        UI.showPanel("combat");
        this.setCombatButtons();
        
        if (this.enemy.hp <= 0) {
             Game.handleWin();
        } else {
             setTimeout(() => this.enemyTurn(), 600);
        }
    },

    _handleSingleHitSkill(s, setBonus, uniqueEffects) {
        let dmg = 0;
        let healAmount = 0;
        let bonusDmg = Player.getDamageBonus();

        if (s.type === "phys") {
            let rawDmg = Math.floor((Player.atk + bonusDmg) * s.power);
            if (s.ignoreDef) {
                dmg = rawDmg;
                Events.emit("log_combat", "⚡ Phase Strike! (Ignored DEF)");
            } else {
                dmg = Math.max(1, rawDmg - (this.enemy.def || 0));
            }
        } else if (s.type === "mag") {
            let baseDmg = Math.floor((Player.attr.INT * 2 + bonusDmg) * s.power);
            dmg = Math.floor(baseDmg * (1 + (setBonus.spellDamage || 0)));
        }

        let lifesteal = (s.lifesteal || 0) + (uniqueEffects.lifesteal || 0);
        if (lifesteal > 0) healAmount = Math.floor(dmg * lifesteal);

        this.enemy.hp -= dmg;
        
        
        if (healAmount > 0) {
            Player.hp = Math.min(Player.hp + healAmount, Player.maxHp);
            Events.emit("log_combat", `Skill ${s.name}: ${dmg} dmg, +${healAmount} HP`);
        } else {
            Events.emit("log_combat", `Skill ${s.name}: ${dmg} dmg`);
        }
        Events.emit('damage', { val: dmg, type: s.type === 'mag' ? 'magic' : 'phys' });
        UI.showPanel("combat");
        this.setCombatButtons();
    },

    _handleStatusSkill(s) {
        if (s.type === "debuff" && s.status) {
            this.enemy.status.push({ ...s.status });
            Events.emit("log_combat", `Skill ${s.name}: Applied ${s.status.id}!`);
        } else if (s.type === "buff" && s.status) {
            Player.status.push({ ...s.status });
            Events.emit("log_item", `Skill ${s.name}: Applied ${s.status.id}!`);
        }
        
        UI.showPanel("combat");
        this.setCombatButtons();
    },

    _finalizeSkillVFX(name) {
        try { 
           if(window.VFX) VFX.showSkillEffect(name, 'mob-sprite'); 
        } catch(e) {}
        
        try { 
           if(window.SpriteManager) SpriteManager.showHurt('mob-sprite', this.enemy.sprite); 
        } catch(e) {}
    },

    applyStatus(target, st) {
        target.status.push(st);
        Events.emit("log_combat", "Status Applied!");
    }
};

window.CombatManager = CombatManager;
