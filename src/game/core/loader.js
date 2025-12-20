/* =========================================
   BOOTSTRAP LOADER
   ========================================= */

const Loader = {
  requiredModules: [
    "CONSTANTS",
    "DB", 
    "Events", 
    "LootManager", 
    "ProgressionManager", 
    "CombatManager",
    "Player",
    "UI",
    "Game"
  ],

  init() {
    console.log("🚀 Starting RE:Bone...");
    
    // 1. Dependency Check
    const missing = this.requiredModules.filter(m => !window[m]);
    
    if (missing.length > 0) {
      this.showError(`Missing Modules: ${missing.join(", ")}`);
      return;
    }
    
    // 2. Safe Startup
    try {
      console.log("✅ Modules Loaded. Initializing...");
      
      // Initialize Systems
      if(window.UI) UI.init();
      if(window.Game) Game.init();
      
      // Hide Loading Screen (if we had one)
      const loaderEl = document.getElementById("loading-screen");
      if(loaderEl) loaderEl.style.display = "none";
      
    } catch (e) {
      console.error("CRITICAL BOOT ERROR:", e);
      this.showError(`Startup Failed: ${e.message}`);
    }
  },

  showError(msg) {
    const errDiv = document.createElement("div");
    errDiv.style.cssText = `
      position: fixed; top: 0; left: 0; width: 100%; height: 100%;
      background: #200000; color: #ff5555;
      display: flex; flex-direction: column; 
      align-items: center; justify-content: center;
      z-index: 9999; font-family: monospace; text-align: center;
      padding: 20px;
    `;
    
    errDiv.innerHTML = `
      <h1 style="font-size: 2em; margin-bottom: 20px;">☠️ FATAL ERROR ☠️</h1>
      <p style="font-size: 1.2em; border: 1px solid #ff5555; padding: 10px;">${msg}</p>
      <p style="margin-top: 20px; color: #aaa;">Check console for details.</p>
      <button onclick="location.reload()" style="margin-top:20px; padding:10px 20px; font-size:1.2em; cursor:pointer;">RELOAD</button>
    `;
    
    document.body.appendChild(errDiv);
  }
};

// Start Load Sequence
window.addEventListener("load", () => Loader.init());
