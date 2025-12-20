/* =========================================
   SOCIAL MANAGER (v29.0)
   Handles Leaderboards, Daily Runs, and Sharing
   ========================================= */

const Social = {
  // Storage Keys
  KEY_SCORES: "rebone_scores_v1",
  KEY_DAILY: "rebone_daily_last",

  // Save a completed run
  saveRun(runData) {
    const history = this.getHighScores();
    const newEntry = {
      date: new Date().toISOString().split('T')[0],
      score: this.calculateScore(runData),
      class: runData.class,
      floor: runData.floor,
      level: runData.level,
      isDaily: runData.isDaily || false,
      timestamp: Date.now()
    };

    history.push(newEntry);
    
    // Sort by Score DESC
    history.sort((a, b) => b.score - a.score);
    
    // Keep top 20
    if (history.length > 20) history.pop();
    
    localStorage.setItem(this.KEY_SCORES, JSON.stringify(history));
    UI.log("Run saved to Hall of Bones!", "log system");
    
    return newEntry.score;
  },

  // Retrieve High Scores
  getHighScores() {
    const raw = localStorage.getItem(this.KEY_SCORES);
    return raw ? JSON.parse(raw) : [];
  },
  
  // Check if daily run already completed today
  isDailyCompleted() {
    const today = new Date().toISOString().split('T')[0];
    const scores = this.getHighScores();
    return scores.some(s => s.isDaily && s.date === today);
  },

  // Calculate Score
  // Formula: (Floor * 100) + (Level * 50) + (Gold * 0.1) + Bonus
  calculateScore(data) {
    let score = (data.floor * 100) + (data.level * 50);
    score += Math.floor(data.gold * 0.1);
    
    // Bonuses using optional chaining/defaults
    if (data.killedBosses) score += (data.killedBosses * 500);
    if (data.isDaily) score = Math.floor(score * 1.2); // 20% Bonus for Daily
    
    return score;
  },

  // Daily Run Logic
  getDailySeed() {
    const date = new Date().toISOString().split('T')[0]; // "YYYY-MM-DD"
    return date;
  },

  // Simple pseudo-random generator based on seed string
  // Returns number 0-1
  seededRandom(seed) {
    let hash = 0;
    for (let i = 0; i < seed.length; i++) {
      hash = ((hash << 5) - hash) + seed.charCodeAt(i);
      hash |= 0;
    }
    const x = Math.sin(hash) * 10000;
    return x - Math.floor(x);
  },

  // Get active modifiers for today
  getDailyModifiers() {
    const seed = this.getDailySeed();
    const rand = this.seededRandom(seed);
    
    const modifiers = [];
    
    // 30% chance for "Glass Cannon" (High DMG, Low HP)
    if (rand < 0.3) {
      modifiers.push({
        id: "glass_cannon",
        name: "Glass Cannon",
        desc: "ATK +50%, Max HP -50%"
      });
    }
    // 30% chance (mapped to 0.3-0.6) for "Gold Rush" (More Gold, tougher enemies)
    else if (rand < 0.6) {
      modifiers.push({
        id: "gold_rush",
        name: "Gold Rush",
        desc: "Gold Drops x2, Enemy HP +30%"
      });
    }
    // Else "Hardcore"
    else {
      modifiers.push({
        id: "hardcore",
        name: "Hardcore",
        desc: "No HP Regen, Score x1.5"
      });
    }
    
    return modifiers;
  },
  
  // Share Run to Clipboard
  shareRun(runData) {
    const score = this.calculateScore(runData);
    const date = new Date().toLocaleDateString();
    
    const text = `💀 Re:BONE Run ${date}
🛡️ ${runData.class} | Lv. ${runData.level}
📉 Floor ${runData.floor}
🏆 Score: ${score.toLocaleString()}
#ReBoneGame`;

    navigator.clipboard.writeText(text).then(() => {
        UI.toast("Copied to Clipboard!");
    }).catch(err => {
        console.error("Failed to copy", err);
        UI.toast("Failed to copy");
    });
  }
};

window.Social = Social;
