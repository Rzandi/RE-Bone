/* =========================================
   GEMINI AI MANAGER
   ========================================= */

const Gemini = {
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
    // Show placeholder first
    UI.showLoreCard(item, "Reading ancient inscriptions...");
    const r = await this.call(`Lore singkat item "${item}" RPG. Indo. Max 20 words.`);
    UI.showLoreCard(item, r);
  },
  
  async generateTaunt(enemy) {
    const r = await this.call(
      `Roleplay monster ${enemy} ancaman singkat 3-5 kata. Indo.`
    );
    // Display visual speech bubble if SpriteManager exists
    if(window.UI && UI.showSpeechBubble) {
        UI.showSpeechBubble(r);
    } else {
        UI.log(`${enemy}: "${r}"`, "log ai");
    }
  },
};
