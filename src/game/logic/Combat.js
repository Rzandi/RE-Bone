import { gameStore } from '../store.js';
import { Player as PlayerLogic } from './Player.js';
import { DB } from '../config/database.js';
import { CONSTANTS } from '../config/constants.js';

/* =========================================
   COMBAT LOGIC (Vue Version)
   ========================================= */

export const Combat = {
    get state() { return gameStore.state; },
    get enemy() { return gameStore.state.combat.enemy; },
    
    init() {},

    startCombat(enemyData, isBoss = false) {
        // 1. Clear Buttons IMMEDIATELY to prevent "Explore" buttons from sticking
        gameStore.state.buttons = [];
        this.state.activePanel = 'combat';

        try {
            // 2. Setup Enemy
            // deep clone enemy to avoid mutating DB
            const enemy = JSON.parse(JSON.stringify(enemyData));
            enemy.maxHp = enemy.hp; // Ensure MaxHP is set
            enemy.isBoss = isBoss;
            enemy.status = [];
            
            this.state.combat.enemy = enemy;
            this.state.combat.turn = 'player';
            
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

        // Lock turn immediately to prevent double-clicks
        this.state.combat.turn = 'enemy_waiting';

        // 1. Calculate Damage
        const p = PlayerLogic.state;
        let bonusDmg = this.getDamageBonus(); 
        if (p.passives.includes("undead_mastery")) {
             let floorsDescended = 100 - this.state.floor; 
             bonusDmg += Math.floor(floorsDescended / 10);
        }

        let calcAtk = Math.max(1, Math.floor((p.str * p.multipliers.str) * 1.5));
        for (let k in p.equip) if (p.equip[k]?.atk) calcAtk += p.equip[k].atk;
        calcAtk = Math.floor(calcAtk * p.multipliers.dmg);
        
        let dmg = calcAtk + bonusDmg;
        
        // 2. Apply Damage (Critical Hit Logic)
        let isCrit = Math.random() < (p.crit || 0); 
        if (isCrit) dmg = Math.floor(dmg * 1.5);

        // DEBUG LOGGING
        console.log(`[Combat] Attack: Dmg=${dmg}, EnemyHP=${e.hp} -> ${e.hp - dmg}`);

        e.hp -= dmg;
        gameStore.log(`You hit for ${dmg} damage!${isCrit ? ' (CRIT!)' : ''}`, isCrit ? "crit" : "damage");
        
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
        
        // 3. Lifesteal
        if (p.passives.includes("vampirism")) {
            const heal = Math.ceil(dmg * 0.2);
            PlayerLogic.takeDamage(-heal); // Negative damage = heal
            gameStore.triggerVfx({ type: 'heal', val: `+${heal}`, target: 'player' });
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
        
        let dmg = e.atk || 5;
        
        // AI Logic stub
        gameStore.log(`${e.name} attacks for ${dmg}!`, "damage");
        
        // SOUND HOOK
        if(window.SoundManager) window.SoundManager.play('hit');
        
        PlayerLogic.takeDamage(dmg);
        gameStore.triggerVfx({ type: 'damage', val: dmg, target: 'player' });
        
        if (this.state.hp <= 0) {
            // Player Death handled by PlayerLogic/Game
        }
        
        // Return turn to player
        this.state.combat.turn = 'player';
    },
    
    handleVictory() {
        const e = this.enemy;
        gameStore.log(`Defeated ${e.name}!`, "victory");
        
        // Disable buttons using spacers (prevents ControlPanel defaulting to Attack buttons)
        gameStore.state.buttons = [null, null, null, null]; 

        // Sound
        if(window.SoundManager) window.SoundManager.play('victory'); 

        // Delay for VFX/Text reading
        setTimeout(() => {
           try {
               // Delegate to Game Core
               if(window.Game) {
                   window.Game.handleWin(0);
               } else {
                   throw new Error("Game Core missing");
               }
           } catch(err) {
               console.error("Victory Error:", err);
               // Failsafe Cleanup
               gameStore.state.combat.enemy = null;
               gameStore.state.activePanel = 'menu-view';
               gameStore.state.buttons = []; // Revert to defaults
           }
        }, 1000);
    },
    
    getDamageBonus() {
        return 0; // Placeholder
    },

    executeSkill(skill) {
        if (!this.enemy) return;
        
        gameStore.log(`Used ${skill.name}!`, "combat");

        // 1. Handle Effects
        if (skill.type === 'heal') {
           const heal = Math.floor(skill.power * (PlayerLogic.state.int || 10) * 2); // Simple scaling
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
                
            let dmg = Math.floor(base * skill.power);
            
            // Apply Damage
            const isCrit = Math.random() < p.crit;
            if (isCrit) dmg = Math.floor(dmg * 1.5);
            
            this.enemy.hp -= dmg;
            
            gameStore.log(`${skill.name} hit for ${dmg}!`, isCrit ? 'crit' : 'damage');
            gameStore.triggerVfx({ type: isCrit ? 'critical' : 'damage', val: dmg, target: 'enemy' });
            
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
             if(skill.status && this.enemy.now) {
                 this.enemy.status.push(skill.status); // Assuming enemy has status array
                 gameStore.log(`Applied ${skill.status.id} to enemy`, "debuff");
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
