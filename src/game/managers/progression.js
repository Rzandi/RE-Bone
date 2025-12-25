import { Player } from '../logic/Player.js';
import { Game } from '../core/game.js';
import { gameStore } from '../store.js';
import { EVOLUTIONS, CLASS_TREES } from '../config/evolution.js';
import { VFX } from './vfx.js';

const ProgressionManager = {
    levelUpState() {
        gameStore.state.activePanel = 'levelup'; 
        // Vue LevelUpPanel.vue handles the UI rendering
        if(gameStore) gameStore.state.buttons = [];
    },

    applyLevelUp(stat) {
        Player.attr[stat]++;
        Player.recalc();
        Player.hp = Player.maxHp; // Full heal on level up
        Player.mp = Player.maxMp;
        gameStore.log(`${stat} Increased! Full Heal!`, "item"); // UI.log replacement
        
        // Check for Class Mutation (Level 20, 50, 80)
        // Use Player.classTree to identify the evolution path
        const baseClass = Player.classTree || "skeleton"; 
        
        if ((Player.level === 20 || Player.level === 50 || Player.level === 80) && 
            CLASS_TREES && CLASS_TREES[baseClass] && CLASS_TREES[baseClass][Player.level]) {
            this.mutationState(baseClass, Player.level);
            return;
        }
    
        // Check for Evolution (Level 5 & 10)
        if ((Player.level === 5 || Player.level === 10) && EVOLUTIONS && EVOLUTIONS[Player.level]) {
            this.evolutionState(Player.level);
        } else {
            Game.exploreState();
        }
    },

    evolutionState(tier) {
        // Prepare data for Vue Component
        gameStore.state.evolutionOptions = EVOLUTIONS[tier] || [];
        gameStore.state.activePanel = 'evo';
        if(gameStore) gameStore.state.buttons = [];
    },

    mutationState(baseClass, tier) {
        // Prepare data for Vue
        const options = CLASS_TREES[baseClass] && CLASS_TREES[baseClass][tier] ? CLASS_TREES[baseClass][tier] : [];
        gameStore.state.evolutionOptions = options; // Reuse evolution options state or create new one
        gameStore.state.subPanel = 'mutation'; // Flag for Vue to know it's mutation
        gameStore.state.activePanel = 'evo';
        if(gameStore) gameStore.state.buttons = [];
    },

    applyMutation(opt) {
        Player.mutate(opt);
        
        gameStore.log(`Mutated into ${opt.name}!`, "item");
        if(VFX) VFX.showSkillEffect("Evolution", "mob-sprite");
        
        Game.exploreState();
    },

    applyEvolution(id) {
        if (Player.evolutions.includes(id)) return; 
        
        Player.evolutions.push(id);
        Player.recalc(); 
        
        gameStore.log("Evolution Complete!", "item");
        if(VFX) VFX.showSkillEffect("Evolution", "mob-sprite"); 
        
        Game.exploreState();
    }
};

// Global export REMOVED
// window.ProgressionManager = ProgressionManager;
export { ProgressionManager };
