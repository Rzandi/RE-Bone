/* =========================================
   SKILL MANAGER (v28.0)
   ========================================= */

import { gameStore } from '../store.js';
import { Player } from '../logic/Player.js';
import { SoundManager } from './sound.js';
import { SKILL_TREES } from '../config/skill_trees.js';

const Skills = {
  selectedSlot: null, // v30.7 Two-click swap state

  // Check if player can unlock a node
  canUnlock(treeKey, nodeId) {
    if (Player.sp < 1) return false;
    if (Player.unlockedSkills.includes(nodeId)) return false; // Already unlocked
    
    const node = SKILL_TREES[treeKey].nodes[nodeId];
    if (Player.sp < node.cost) return false;
    
    // Check constraint/requirement
    if (node.req && !Player.unlockedSkills.includes(node.req)) return false;
    
    return true;
  },

  // Unlock a node
  unlock(treeKey, nodeId) {
    if (this.canUnlock(treeKey, nodeId)) {
      const node = SKILL_TREES[treeKey].nodes[nodeId];
      
      Player.sp -= node.cost;
      Player.unlockedSkills.push(nodeId);
      
      if(gameStore) gameStore.log(`Learned Skill: ${node.name}!`, "system");
      if(SoundManager) SoundManager.play("loot"); 
      Player.recalc(); // Apply stats
    } else {
      if(gameStore) gameStore.log("Cannot unlock this skill!", "error");
    }
  }
};

// Global Export REMOVED
// window.Skills = Skills;
export { Skills };
