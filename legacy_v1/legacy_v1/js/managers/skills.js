/* =========================================
   SKILL MANAGER (v28.0)
   ========================================= */

const Skills = {
  selectedSlot: null, // v30.7 Two-click swap state

  // Render Active Skill Manager
  // Render Active Skill Manager (v30.7 Improved UI)
  renderActiveManager(container) {
      const p = Player;
      const wrap = document.createElement("div");
      wrap.innerHTML = `<h3 style="text-align:center; color:var(--c-cyan)">ACTIVE GRIMOIRE</h3>`;
      
      // A. Equipped Slots
      const slotsDiv = document.createElement("div");
      slotsDiv.style.cssText = "display:flex; justify-content:center; gap:10px; margin-bottom:15px;";
      
      for (let i=0; i<4; i++) {
          const sid = p.activeSkills[i];
          const s = sid ? DB.SKILLS[sid] : null;
          const isSelected = this.selectedSlot === i;
          
          const slot = document.createElement("div");
          slot.className = "skill-slot";
          slot.style.cssText = `
            width:60px; height:60px; 
            border:2px solid ${isSelected ? 'var(--c-gold)' : (s ? 'var(--c-cyan)' : '#444')};
            display:flex; align-items:center; justify-content:center;
            background: ${isSelected ? '#332' : '#222'}; 
            cursor:pointer; font-size:0.8rem; text-align:center;
            box-shadow: ${isSelected ? '0 0 10px var(--c-gold)' : 'none'};
            transition: 0.2s;
            position: relative;
          `;
          
          let content = `<small style="color:#444">Empty</small>`;
          if (s) {
              content = `<div>${s.name}</div>`;
          }
          if (isSelected && !s) content = `<div><small style="color:var(--c-gold)">Select<br>Spell</small></div>`;
          
          // Un-equip button (small X)
          if (s && !isSelected) {
             // content += `<div style="position:absolute; top:-5px; right:-5px; background:red; color:white; border-radius:50%; width:15px; height:15px; line-height:15px; font-size:10px;">x</div>`;
             // Actually, let's keep it simple. Click to Select. If Selected -> Show "Clear" button below?
          }

          slot.innerHTML = content;
          
          slot.onclick = () => {
              if (this.selectedSlot === i) {
                  // Deselect
                  this.selectedSlot = null;
              } else {
                  this.selectedSlot = i;
              }
              this.render();
          };
          slotsDiv.appendChild(slot);
      }
      wrap.appendChild(slotsDiv);
      
      // Control / Instructions
      const controlsDiv = document.createElement("div");
      controlsDiv.style.cssText = "text-align:center; margin-bottom:10px; min-height:30px;";
      
      if (this.selectedSlot !== null) {
          const sid = p.activeSkills[this.selectedSlot];
          if (sid) {
              const unequipBtn = document.createElement("button");
              unequipBtn.innerText = "Unequip Slot";
              unequipBtn.style.cssText = "background:#500; border:1px solid #f00; color:#fff; font-size:0.8rem; padding:5px 10px;";
              unequipBtn.onclick = () => {
                  p.unequipSkill(this.selectedSlot);
                  this.selectedSlot = null;
                  this.render();
              };
              controlsDiv.appendChild(unequipBtn);
          } else {
             controlsDiv.innerHTML = `<span style="color:var(--c-gold)">Select a spell below to equip</span>`;
          }
      } else {
          controlsDiv.innerHTML = `<span style="color:#888">Tap a slot to Modify</span>`;
      }
      wrap.appendChild(controlsDiv);
      
      // B. Library
      const libDiv = document.createElement("div");
      libDiv.style.cssText = "display:grid; grid-template-columns: 1fr 1fr; gap:5px; max-height:300px; overflow-y:auto;";
      
      p.learnedSkills.forEach(sid => {
          if (p.activeSkills.includes(sid)) return; // Skip equipped
          
          const s = DB.SKILLS[sid];
          const reqMet = p.checkSkillReqs(sid);
          
          const item = document.createElement("div");
          item.style.cssText = `
            padding:8px; border:1px solid #444; background:#111;
            color:${reqMet ? '#ddd' : '#555'}; cursor:${reqMet ? 'pointer' : 'not-allowed'};
            display:flex; justify-content:space-between; align-items:center;
          `;
          item.innerHTML = `<span>${s.name}</span> <small style="color:#aaa">${s.cost}MP</small>`;
          
          if (reqMet) {
             item.onclick = () => {
                 if (this.selectedSlot !== null) {
                     // Equip to selected slot
                     p.equipSkill(sid, this.selectedSlot);
                     this.selectedSlot = null; // Reset selection
                     this.render();
                 } else {
                     // Fallback: Find first empty
                     const emptyIdx = p.activeSkills.findIndex(x => !x);
                     if (emptyIdx !== -1) {
                         p.equipSkill(sid, emptyIdx);
                         this.render();
                     } else {
                         UI.toast("Select a slot to replace first!");
                         // Highlight slots to Guide user
                         this.render(); // Just re-render to ensure state
                     }
                 }
             };
          }
          libDiv.appendChild(item);
      });
      
      wrap.appendChild(libDiv);
      container.appendChild(wrap);
  },

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
      
      UI.log(`Learned Skill: ${node.name}!`, "log system");
      SoundManager.play("loot"); // Placeholder sound
      Player.recalc(); // Apply stats
      UI.refresh();
      this.render(); // Refresh UI
    } else {
      UI.toast("Cannot unlock this skill!");
    }
  },

  // Render Skill Tree Panel
  render() {
    const container = document.getElementById('skills-content');
    if (!container) return;
    
    container.innerHTML = "";
    
    // 1. ACTIVE SKILL MANAGER (v30.2)
    this.renderActiveManager(container);
    
    // 2. STAT TREE (v28.0)
    const treeHeader = document.createElement("h3");
    treeHeader.style.cssText = "text-align:center; color:var(--c-gold); margin-top:20px; border-top:1px solid #444; padding-top:10px;";
    treeHeader.innerText = `STAT CONSTELLATIONS (SP: ${Player.sp})`;
    container.appendChild(treeHeader);
    
    // container.innerHTML += `<div class="sp-display">Available SP: <span style="color:var(--c-gold)">${Player.sp}</span></div>`;
    
    // Render each tree (Just general for now)
    Object.entries(SKILL_TREES).forEach(([key, tree]) => {
      const treeEl = document.createElement('div');
      treeEl.className = 'skill-tree';
      treeEl.innerHTML = `<h4>${tree.name}</h4>`;
      
      const nodesContainer = document.createElement('div');
      nodesContainer.className = 'skill-nodes';
      
      Object.entries(tree.nodes).forEach(([id, node]) => {
        const isUnlocked = Player.unlockedSkills.includes(id);
        const canUnlock = this.canUnlock(key, id);
        
        const nodeEl = document.createElement('div');
        nodeEl.className = `skill-node ${isUnlocked ? 'unlocked' : ''} ${canUnlock ? 'available' : ''}`;
        nodeEl.innerHTML = `
          <div class="node-icon">${isUnlocked ? '✅' : '🔒'}</div>
          <div class="node-info">
            <strong>${node.name}</strong>
            <small>${node.desc}</small>
          </div>
          <div class="node-cost">${isUnlocked ? 'Learned' : node.cost + ' SP'}</div>
        `;
        
        nodeEl.onclick = () => {
          if (!isUnlocked && canUnlock) {
            this.unlock(key, id);
          }
        };
        
        nodesContainer.appendChild(nodeEl);
      });
      
      treeEl.appendChild(nodesContainer);
      container.appendChild(treeEl);
    });
  }
};

window.Skills = Skills;
