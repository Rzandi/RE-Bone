/* =========================================
   UI MANAGER
   ========================================= */

const UI = {
  els: {},
  btns: [],
  
  // Inventory sorting & filtering
  invSortBy: 'rarity', // rarity, type, name, atk
  invFilter: 'all', // all, weapon, armor, acc
  
  init() {
    // Load Persisted Settings
    try {
        const settings = localStorage.getItem("rebone_ui_settings");
        if(settings) {
            const s = JSON.parse(settings);
            if(s.invSortBy) this.invSortBy = s.invSortBy;
            if(s.invFilter) this.invFilter = s.invFilter;
        }
    } catch(e) { console.warn("Failed to load settings", e); }

    // Cache Elements
    const ids = [
      "ui-floor", "ui-gold", "ui-hp", "ui-maxhp", "ui-mp", "ui-maxmp",
      "ui-str", "ui-vit", "ui-int", "ui-class", "ui-lvl",
      "mob-name", "mob-hp", "mob-sprite", "mob-desc", "mob-status", "mob-passives",
      "evt-title", "evt-desc", "log-container", "inv-list", "list-content",
      "shop-content", "shop-shards", "eq-weapon", "eq-armor", "eq-acc",
      "mob-hp-bar", "evo-list", "merchant-content", "panel-victory",
      "ui-exp", "ui-next-exp", "ui-progress-bar"
    ];
    
    ids.forEach((id) => {
      const el = document.getElementById(id);
      if (el) this.els[id] = el;
    });

    // Cache Buttons (btn-0 to btn-3)
    for (let i = 1; i <= 4; i++) {
        const btn = document.getElementById(`btn-${i}`);
        if(btn) this.btns.push(btn);
    }
    
    // Event Listeners (Use global Events if available)
    if(window.Events) {
        Events.on("log", (msg) => this.log(msg));
        Events.on("log_combat", (msg) => this.log(msg, "log combat"));
        Events.on("log_item", (msg) => this.log(msg, "log item"));
        Events.on("log_boss", (msg) => this.log(msg, "log boss"));
        
        Events.on("damage", (data) => this.fxDmg(data.val, data.type));
        Events.on("progress", (pct) => this.updateProgress(pct));
        Events.on("shake", (type) => window.VFX ? VFX.screenShake(type) : null);
        Events.on("hurt", (id) => window.SpriteManager ? SpriteManager.showHurt(id, null) : null);
    }
  },
  
  saveSettings() {
       localStorage.setItem("rebone_ui_settings", JSON.stringify({
           invSortBy: this.invSortBy,
           invFilter: this.invFilter
       }));
  },
  
  showPanel(id) {
    document
      .querySelectorAll(".panel")
      .forEach((p) => p.classList.remove("active"));
    const p = document.getElementById(`panel-${id}`);
    if (p) p.classList.add("active");
  },
  
  log(m, t = "log system") {
    if(!this.els["log-container"]) return;
    const d = document.createElement("div");
    d.className = `log ${t}`;
    d.innerText = m;
    this.els["log-container"].appendChild(d);
    this.els["log-container"].scrollTop = 9999;
  },

  toggleLog() {
      const el = this.els["log-container"];
      if(!el) return;
      
      const btn = document.getElementById("btn-log-toggle");
      
      if(el.classList.contains("minimized")) {
          el.classList.remove("minimized");
          if(btn) btn.innerText = "_";
      } else {
          el.classList.add("minimized");
          if(btn) btn.innerText = "□";
      }
  },

  toast(msg, type = 'info') {
    const d = document.createElement("div");
    d.className = `toast toast-${type}`;
    d.innerText = msg;
    document.body.appendChild(d);
    
    setTimeout(() => d.classList.add("show"), 10);
    
    setTimeout(() => {
      d.classList.remove("show");
      setTimeout(() => d.remove(), 300);
    }, 3000);
  },
  
  setButtons(arr) {
    this.btns.forEach((b, i) => {
      if (arr[i]) {
        b.innerHTML = arr[i].txt;
        b.onclick = () => {
          if(window.SoundManager) SoundManager.play("ui");
          arr[i].fn();
        };
        b.disabled = false;
        if (arr[i].col) b.style.color = arr[i].col;
        else b.style.color = "#fff";
      } else {
        b.innerHTML = "-";
        b.disabled = true;
        b.onclick = null;
      }
    });
  },
  
  refresh() {
    // If Player not ready, skip
    if(!window.Player) return;
    const p = Player;

    if(this.els["ui-floor"]) this.els["ui-floor"].innerText = window.Game ? Game.floor : 1;
    if(this.els["ui-gold"]) this.els["ui-gold"].innerText = p.gold;
    if(this.els["ui-hp"]) this.els["ui-hp"].innerText = Math.floor(p.hp);
    if(this.els["ui-maxhp"]) this.els["ui-maxhp"].innerText = p.maxHp;
    if(this.els["ui-mp"]) this.els["ui-mp"].innerText = p.mp;
    if(this.els["ui-maxmp"]) this.els["ui-maxmp"].innerText = p.maxMp;
    if(this.els["ui-str"]) this.els["ui-str"].innerText = p.attr.STR;
    if(this.els["ui-vit"]) this.els["ui-vit"].innerText = p.attr.VIT;
    if(this.els["ui-int"]) this.els["ui-int"].innerText = p.attr.INT;
    if(this.els["ui-lvl"]) this.els["ui-lvl"].innerText = p.level;
    if(this.els["ui-exp"]) this.els["ui-exp"].innerText = p.exp;
    if(this.els["ui-next-exp"]) this.els["ui-next-exp"].innerText = p.nextExp;
    
    if(this.els["ui-class"]) this.els["ui-class"].innerText = p.className;
    
    if(this.els["eq-weapon"]) this.els["eq-weapon"].innerText = p.equip.weapon ? p.equip.weapon.name : "None";
    if(this.els["eq-armor"]) this.els["eq-armor"].innerText = p.equip.armor ? p.equip.armor.name : "None";
    if(this.els["eq-acc"]) this.els["eq-acc"].innerText = p.equip.acc ? p.equip.acc.name : "None";
    
    if(this.renderStatus) this.renderStatus(p, "ui-status");
    if(this.addStatTooltips) this.addStatTooltips();
  },

  updateProgress(pct) {
      if(this.els["ui-progress-bar"]) {
          this.els["ui-progress-bar"].style.width = `${Math.min(100, Math.max(0, pct))}%`;
      }
  },
  
  addStatTooltips() {
    if(!window.Player) return;
    const p = Player;
    
    const createTooltip = (stat, breakdown) => {
      return `<div class="stat-tooltip">
        ${breakdown.map(line => `<div class="stat-tooltip-line">${line}</div>`).join('')}
      </div>`;
    };
    
    // Max HP breakdown
    const hpEquip = (p.equip.weapon?.hp || 0) + (p.equip.armor?.hp || 0) + (p.equip.acc?.hp || 0);
    const hpBase = 20 + (p.attr.VIT * 5);
    if (this.els["ui-maxhp"] && this.els["ui-maxhp"].parentElement && !this.els["ui-maxhp"].parentElement.classList.contains('stat-display')) {
      const wrapper = document.createElement('span');
      wrapper.className = 'stat-display';
      wrapper.title = 'HP Breakdown';
      this.els["ui-maxhp"].parentElement.insertBefore(wrapper, this.els["ui-maxhp"]);
      wrapper.appendChild(this.els["ui-maxhp"]);
      wrapper.innerHTML += createTooltip('HP', [
        `Base: ${hpBase} (20 + VIT×5)`,
        `Equipment: +${hpEquip}`,
        `<div class="stat-tooltip-total">Total: ${p.maxHp}</div>`
      ]);
    }
    
    // Max MP breakdown
    const mpEquip = (p.equip.weapon?.mp || 0) + (p.equip.armor?.mp || 0) + (p.equip.acc?.mp || 0);
    const mpBase = 10 + (p.attr.INT * 3);
    if (this.els["ui-maxmp"] && this.els["ui-maxmp"].parentElement && !this.els["ui-maxmp"].parentElement.classList.contains('stat-display')) {
      const wrapper = document.createElement('span');
      wrapper.className = 'stat-display';
      wrapper.title = 'MP Breakdown';
      this.els["ui-maxmp"].parentElement.insertBefore(wrapper, this.els["ui-maxmp"]);
      wrapper.appendChild(this.els["ui-maxmp"]);
      wrapper.innerHTML += createTooltip('MP', [
        `Base: ${mpBase} (10 + INT×3)`,
        `Equipment: +${mpEquip}`,
        `<div class="stat-tooltip-total">Total: ${p.maxMp}</div>`
      ]);
    }
  },
  
  renderInv() {
    if(!this.els["inv-list"] || !window.Player) return;
    const l = this.els["inv-list"];
    l.innerHTML = "";
    
    // Add sort/filter controls
    const controls = document.createElement("div");
    controls.style.cssText = "display:flex; gap:5px; margin-bottom:10px; flex-wrap:wrap;";
    
    // Sort buttons
    const sortButtons = [
      { label: "🏆 Rarity", value: "rarity" },
      { label: "📦 Type", value: "type" },
      { label: "🔤 Name", value: "name" },
      { label: "⚔️ ATK", value: "atk" }
    ];
    
    sortButtons.forEach(btn => {
      const b = document.createElement("button");
      b.textContent = btn.label;
      b.style.cssText = `padding:4px 8px; font-size:11px; cursor:pointer; background:${
        this.invSortBy === btn.value ? 'var(--c-gold)' : '#333'
      }; border:1px solid #555; color:#fff;`;
      b.onclick = () => {
        this.invSortBy = btn.value;
        this.saveSettings(); 
        this.renderInv();
      };
      controls.appendChild(b);
    });
    
    // Filter buttons
    const filterButtons = [
      { label: "ALL", value: "all" },
      { label: "⚔️", value: "weapon" },
      { label: "🛡️", value: "armor" },
      { label: "💎", value: "acc" }
    ];
    
    filterButtons.forEach(btn => {
      const b = document.createElement("button");
      b.textContent = btn.label;
      b.style.cssText = `padding:4px 8px; font-size:11px; cursor:pointer; background:${
        this.invFilter === btn.value ? 'var(--c-ai)' : '#333'
      }; border:1px solid #555; color:#fff; margin-left:${btn.value === 'all' ? '10px' : '0'};`;
      b.onclick = () => {
        this.invFilter = btn.value;
        this.saveSettings();
        this.renderInv();
      };
      controls.appendChild(b);
    });
    
    // Auto-sort button
    const autoSortBtn = document.createElement("button");
    autoSortBtn.textContent = "🗂️ Auto-Sort";
    autoSortBtn.style.cssText = "padding:4px 8px; font-size:11px; cursor:pointer; background:#555; border:1px solid var(--c-gold); color:var(--c-gold); margin-left:auto;";
    autoSortBtn.onclick = () => {
      this.invSortBy = 'rarity';
      this.saveSettings();
      Player.autoSortInventory();
    };
    controls.appendChild(autoSortBtn);
    
    // Salvage Mode Toggle
    const salvageBtn = document.createElement("button");
    salvageBtn.textContent = Player.salvageMode ? "♻️ SALVAGE MODE" : "🛡️ EQUIP MODE";
    salvageBtn.style.cssText = `padding:4px 8px; font-size:11px; cursor:pointer; background:${Player.salvageMode ? '#d32f2f' : '#333'}; border:1px solid #555; color:#fff; margin-left:5px;`;
    salvageBtn.onclick = () => {
        Player.salvageMode = !Player.salvageMode;
        Player.inspectMode = false;
        this.renderInv();
    };
    controls.appendChild(salvageBtn);

    l.appendChild(controls);
    
    // Inventory List Processing
    let inv = [...Player.inventory].filter(i => i && i.name && i.slot);
    
    if (this.invFilter !== 'all') {
      inv = inv.filter(item => item.slot === this.invFilter);
    }
    
    inv.sort((a, b) => {
      if (this.invSortBy === 'rarity') {
        return (this.rarityValue(b.rarity) - this.rarityValue(a.rarity));
      } else if (this.invSortBy === 'type') {
        return (a.slot || "").localeCompare(b.slot || "");
      } else if (this.invSortBy === 'name') {
        return (a.name || "").localeCompare(b.name || "");
      } else if (this.invSortBy === 'atk') {
        return (b.atk || 0) - (a.atk || 0);
      }
      return 0;
    });
    
    if (inv.length === 0) {
      l.innerHTML += "<div style='text-align:center;color:#555'>(No items)</div>";
      return;
    }
    
    const frag = document.createDocumentFragment();
    inv.forEach((it) => {
      const d = document.createElement("div");
      d.className = "list-item item-rarity-" + it.rarity;
      
      let stats = [];
      if (it.atk) stats.push(`ATK+${it.atk}`);
      if (it.def) stats.push(`DEF+${it.def}`);
      if (it.hp) stats.push(`HP+${it.hp}`);
      if (it.mp) stats.push(`MP+${it.mp}`);
      if (it.int) stats.push(`INT+${it.int}`);
      
      let setIndicator = it.setBonus ? " ⚡" : "";
      
      let comparison = "";
      if (!Player.inspectMode) {
        const equipped = Player.equip[it.slot];
        if (equipped) {
          comparison = this.getItemComparison(it, equipped);
        }
      }
      
      const originalIndex = Player.inventory.indexOf(it);
      const isLocked = Player.isLocked(it);
      
      let tooltip = `${it.name}\n${it.desc || ''}`;
      if(it.price) tooltip += `\nValue: ${it.price} G`;
      if(it.setBonus) tooltip += `\nSet: ${it.setBonus}`;
      if(it.uniqueEffect) tooltip += `\nEffect: ${it.uniqueEffect}`;
      
      d.setAttribute("data-tooltip", tooltip);
      
      if (window.MobileHandler) {
          MobileHandler.enableLongPress(d, () => UI.showMobileTooltip(tooltip));
      }
      
      d.innerHTML = `
        <div>
          <span class="rare-${it.rarity}">${it.name}${setIndicator}</span>
          <br>
          <small style="color:#888">${it.slot.toUpperCase()}</small>
          ${stats.length > 0 ? `<br><small style="color:#aaa">${stats.join(', ')}</small>` : ''}
          ${comparison ? `<br><small>${comparison}</small>` : ''}
        </div>
        <div style="display:flex; gap:8px; align-items:center;">
          <span class="lock-icon" style="cursor:pointer; font-size:14px;" title="${isLocked ? 'Unlock item' : 'Lock item'}">${isLocked ? '🔒' : '🔓'}</span>
          <div style="font-size:1.2rem; color:var(--c-ai)">${Player.inspectMode ? '👁️' : '⚡'}</div>
        </div>
      `;
      
      const lockIcon = d.querySelector('.lock-icon');
      if(lockIcon) {
          lockIcon.onclick = (e) => {
            e.stopPropagation();
            Player.toggleLock(it);
          };
      }
      
      d.onclick = () => {
        Player.handleItemClick(originalIndex);
      };
      
      frag.appendChild(d);
    });
    
    l.appendChild(frag);
  },
  
  rarityValue(rarity) {
    if(window.CONSTANTS) return CONSTANTS.RARITY_VALUES[rarity] || 0;
    return 0; 
  },
  
  getItemComparison(newItem, equipped) {
    let changes = [];
    
    const compareAt = (stat) => {
      const newVal = newItem[stat] || 0;
      const oldVal = equipped[stat] || 0;
      const diff = newVal - oldVal;
      
      if (diff > 0) {
        changes.push(`<span style="color:#4f4">${stat.toUpperCase()}+${diff}↑</span>`);
      } else if (diff < 0) {
        changes.push(`<span style="color:#f44">${stat.toUpperCase()}${diff}↓</span>`);
      }
    };
    
    ['atk', 'def', 'hp', 'mp', 'int'].forEach(compareAt);
    
    return changes.length > 0 ? changes.join(' ') : '<span style="color:#888">Same stats</span>';
  },
  
  renderStatus(target, elId) {
    const el = document.getElementById(elId);
    if (!el) return;
    el.innerHTML = "";
    if(target.status) {
        target.status.forEach((s) => {
          const meta = DB.STATUS[s.id];
          if (meta)
            el.innerHTML += `<span class="badge" style="border-color:${meta.color}; color:${meta.color}">${meta.icon} ${s.turn}</span>`;
        });
    }
  },
  
  fxDmg(val, type = "physical") {
    const d = document.createElement("div");
    d.className = `dmg-popup dmg-${type}`;
    
    if (type === "heal") {
      d.innerText = `+${val}`;
    } else if (type === "critical") {
      d.innerText = `${val}!`;
    } else {
      d.innerText = val;
    }
    
    const layer = document.getElementById("dmg-layer");
    if(layer) layer.appendChild(d);
    setTimeout(() => d.remove(), 1000);
  },

  showLeaderboard() {
    this.showPanel("leaderboard"); 
    const list = document.getElementById("score-list");
    if(!list) return;
    list.innerHTML = "";
    
    const scores = window.Social ? window.Social.getHighScores() : [];
    
    if (scores.length === 0) {
      list.innerHTML = `<tr><td colspan="5" style="text-align:center; padding:20px; color:#666;">No souls claimed yet...</td></tr>`;
      return;
    }
    
    scores.forEach((run, i) => {
      const row = document.createElement("tr");
      row.style.borderBottom = "1px solid #333";
      
      const dailyIcon = run.isDaily ? "🌞" : "";
      
      row.innerHTML = `
        <td style="padding:8px; color:#888;">#${i + 1}</td>
        <td style="padding:8px;">
          <span class="sprite sprite-${run.class ? run.class.toLowerCase().replace(/\s+/g, '-') : 'skeleton'}"></span>
        </td>
        <td style="padding:8px;">${run.level}</td>
        <td style="padding:8px;">${run.floor}</td>
        <td style="padding:8px; text-align:right; color:var(--c-gold);">
          ${dailyIcon} ${run.score.toLocaleString()}
        </td>
      `;
      list.appendChild(row);
    });
  },

  showLevelUpEffect(level) {
      const d = document.createElement("div");
      d.className = "level-up-text";
      d.innerText = `LEVEL UP! ${level}`;
      document.body.appendChild(d);
      setTimeout(() => d.remove(), 1600);
  },

  showMobileTooltip(text) {
      const existing = document.getElementById('mobile-tooltip');
      if(existing) existing.remove();
      const existingBg = document.getElementById('mobile-tooltip-backdrop');
      if(existingBg) existingBg.remove();
      
      const d = document.createElement("div");
      d.id = "mobile-tooltip";
      d.style.cssText = `
          position: fixed;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          background: rgba(0,0,0,0.95);
          border: 1px solid var(--c-gold);
          color: #fff;
          padding: 15px;
          border-radius: 8px;
          z-index: 10001;
          width: 80%;
          max-width: 300px;
          white-space: pre-wrap;
          font-family: var(--font);
          box-shadow: 0 0 20px rgba(0,0,0,0.7);
          text-align: center;
      `;
      d.innerText = text;
      
      d.onclick = () => { d.remove(); if(document.getElementById('mobile-tooltip-backdrop')) document.getElementById('mobile-tooltip-backdrop').remove(); };
      
      const backdrop = document.createElement("div");
      backdrop.id = "mobile-tooltip-backdrop";
      backdrop.style.cssText = `
          position: fixed;
          top: 0; left: 0; right: 0; bottom: 0;
          background: rgba(0,0,0,0.5);
          z-index: 10000;
      `;
      backdrop.onclick = () => {
          d.remove();
          backdrop.remove();
      };
      
      document.body.appendChild(backdrop);
      document.body.appendChild(d);
  },

  // GEMINI UI VISUALS
  showLoreCard(title, text) {
      // Remove existing
      const exist = document.getElementById("lore-card");
      if(exist) exist.remove();
      const existBg = document.getElementById("lore-bg");
      if(existBg) existBg.remove();
      
      const bg = document.createElement("div");
      bg.id = "lore-bg";
      bg.style.cssText = "position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.7); z-index:4999;";
      bg.onclick = () => { bg.remove(); if(document.getElementById('lore-card')) document.getElementById('lore-card').remove(); };
      
      const d = document.createElement("div");
      d.id = "lore-card";
      d.className = "lore-modal";
      d.innerHTML = `
          <h2 style="color:var(--c-gold)">${title}</h2>
          <hr style="border-color:#333; opacity:0.5; margin:10px 0;">
          <div class="lore-text">${text}</div>
          <button onclick="document.getElementById('lore-card').remove(); document.getElementById('lore-bg').remove();" style="width:100%; margin-top:15px;">CLOSE</button>
      `;
      
      document.body.appendChild(bg);
      document.body.appendChild(d);
  },
  
  showSpeechBubble(text) {
      const container = document.getElementById("mob-sprite");
      if(!container) return;
      
      // Remove old bubbles
      const old = container.parentElement.querySelector(".speech-bubble");
      if(old) old.remove();
      
      const b = document.createElement("div");
      b.className = "speech-bubble";
      b.innerText = text;
      
      // Position
      container.parentElement.style.position = "relative";
      container.parentElement.appendChild(b);
      
      // Auto hide
      setTimeout(() => {
          b.style.opacity = 0;
          setTimeout(() => b.remove(), 300);
      }, 4000);
  }
};

window.UI = UI;
