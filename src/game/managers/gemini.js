/* =========================================
   GEMINI AI MANAGER
   ========================================= */

export const Gemini = {
  apiKey: window.SECRETS ? window.SECRETS.GEMINI_API_KEY : "",
  isLoading: false,
  
  async call(prompt) {
    if (this.isLoading) return;
    this.isLoading = true;
    UI.log("✨ Oracle menerawang...", "ai-loading");
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${this.apiKey}`;
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
        }),
      });
      if (!response.ok) throw new Error("API Error");
      const data = await response.json();
      this.isLoading = false;
      return data.candidates?.[0]?.content?.parts?.[0]?.text || "...";
    } catch (e) {
      this.isLoading = false;
      return "Jiwa terlalu lemah...";
    }
  },
  
  async generateLore(item) {
    if(window.GameStore) {
        window.GameStore.state.lore.active = true;
        window.GameStore.state.lore.title = item;
        window.GameStore.state.lore.text = "Reading ancient inscriptions...";
    }
    const r = await this.call(`Lore singkat item "${item}" RPG. Indo. Max 20 words.`);
    
    if(window.GameStore) {
        window.GameStore.state.lore.text = r;
    }
  },
  
  async generateTaunt(enemy) {
    const r = await this.call(
      `Roleplay monster ${enemy} ancaman singkat 3-5 kata. Indo.`
    );
    // Display visual speech bubble if SpriteManager exists
    // For Vue, we can just use the game log with a special type OR a store state for speech bubbles
    // Let's use log for simplicity as "Speech Bubble" component isn't strictly necessary if log is visible
    if(window.GameStore) {
        window.GameStore.log(`"${r}"`, "boss");
        // Or if we want a popup:
        // window.GameStore.state.vfx.push({ type: 'text', val: r, target: 'mob' });
    }
  },
  // No extra character here
};

window.Gemini = Gemini; // Expose globally
