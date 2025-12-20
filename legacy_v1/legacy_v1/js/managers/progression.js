const ProgressionManager = {
    levelUpState() {
        UI.showPanel("levelup");
        const p = document.getElementById("panel-levelup");
        p.innerHTML = `
          <h2 style="text-align: center; color: var(--c-gold)">LEVEL UP!</h2>
          <p style="text-align: center; margin-bottom: 20px;">Choose a stat to increase:</p>
          <div style="display:flex; flex-direction:column; gap:10px; align-items:center;">
            <button id="btn-up-str" style="width:200px; padding:10px; border-color:var(--c-red); color:#fff;">STR +1 <br><small>(Current: ${Player.attr.STR})</small></button>
            <button id="btn-up-vit" style="width:200px; padding:10px; border-color:var(--c-green); color:#fff;">VIT +1 <br><small>(Current: ${Player.attr.VIT})</small></button>
            <button id="btn-up-int" style="width:200px; padding:10px; border-color:var(--c-blue); color:#fff;">INT +1 <br><small>(Current: ${Player.attr.INT})</small></button>
          </div>
        `;
    
        document.getElementById("btn-up-str").onclick = () => this.applyLevelUp("STR");
        document.getElementById("btn-up-vit").onclick = () => this.applyLevelUp("VIT");
        document.getElementById("btn-up-int").onclick = () => this.applyLevelUp("INT");
    
        UI.setButtons([null, null, null, null]);
    },

    applyLevelUp(stat) {
        Player.attr[stat]++;
        Player.recalc();
        Player.hp = Player.maxHp; // Full heal on level up
        Player.mp = Player.maxMp;
        UI.log(`${stat} Increased! Full Heal!`, "log item");
        
        // Check for Class Mutation (Level 20, 50, 80)
        // Use Player.classTree to identify the evolution path
        const baseClass = Player.classTree || "skeleton"; 
        
        if ((Player.level === 20 || Player.level === 50 || Player.level === 80) && 
            window.CLASS_TREES && CLASS_TREES[baseClass] && CLASS_TREES[baseClass][Player.level]) {
            this.mutationState(baseClass, Player.level);
            return;
        }
    
        // Check for Evolution (Level 5 & 10)
        if ((Player.level === 5 || Player.level === 10) && window.EVOLUTIONS && EVOLUTIONS[Player.level]) {
            this.evolutionState(Player.level);
        } else {
            Game.exploreState();
        }
    },

    evolutionState(tier) {
        UI.showPanel("evo");
        const list = document.getElementById("evo-list");
        list.innerHTML = "";
        
        // Add Tier Title
        const title = document.createElement("div");
        title.style.cssText = "text-align:center; color:var(--c-gold); margin-bottom:10px;";
        title.innerText = tier === 5 ? "Tier 1 Evolution (Lv.5)" : "Tier 2 Evolution (Lv.10)";
        list.appendChild(title);
        
        const options = EVOLUTIONS[tier];
        if (!options) return Game.exploreState();
        
        options.forEach(opt => {
            const btn = document.createElement("div");
            btn.className = "shop-item"; // Reuse shop styling
            btn.style.cssText = "padding:15px; margin:10px 0; border:1px solid #444; cursor:pointer; text-align:center;";
            btn.innerHTML = `
                <strong style="color:var(--c-cyan)">${opt.name}</strong><br>
                <small>${opt.desc}</small>
            `;
            btn.onclick = () => this.applyEvolution(opt.id);
            list.appendChild(btn);
        });
        
        UI.setButtons([null, null, null, null]);
    },

    mutationState(baseClass, tier) {
        UI.showPanel("evo");
        const list = document.getElementById("evo-list");
        list.innerHTML = "";
        
        // Add Tier Title
        const title = document.createElement("div");
        title.style.cssText = "text-align:center; color:var(--c-red); margin-bottom:10px; font-size:1.2rem;";
        title.innerText = `CLASS MUTATION (Lv.${tier})`;
        list.appendChild(title);
        
        const options = CLASS_TREES[baseClass][tier];
        if (!options) return Game.exploreState();
        
        options.forEach(opt => {
            const btn = document.createElement("div");
            btn.className = "shop-item"; 
            btn.style.cssText = "padding:15px; margin:10px 0; border:1px solid #444; cursor:pointer; text-align:center;";
            
            // Sprite Preview
            let spriteHtml = opt.sprite || "";
            
            btn.innerHTML = `
                <div style="margin-bottom:10px;">${spriteHtml}</div>
                <strong style="color:var(--c-gold); font-size:1.1rem;">${opt.name}</strong><br>
                <small style="color:#aaa">${opt.desc}</small><br>
                <div style="margin-top:5px; font-size:0.8rem; color:var(--c-cyan)">
                    STR +${opt.stats.str} | VIT +${opt.stats.vit} | INT +${opt.stats.int}
                </div>
            `;
            btn.onclick = () => this.applyMutation(opt);
            list.appendChild(btn);
        });
        
        UI.setButtons([null, null, null, null]);
    },

    applyMutation(opt) {
        Player.mutate(opt);
        
        UI.log(`Mutated into ${opt.name}!`, "log item");
        VFX.showSkillEffect("Evolution", "mob-sprite");
        
        Game.exploreState();
    },

    applyEvolution(id) {
        if (Player.evolutions.includes(id)) return; 
        
        Player.evolutions.push(id);
        Player.recalc(); 
        
        UI.log("Evolution Complete!", "log item");
        VFX.showSkillEffect("Evolution", "mob-sprite"); 
        
        Game.exploreState();
    }
};

window.ProgressionManager = ProgressionManager;
