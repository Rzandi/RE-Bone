/* =========================================
   BIOME CONFIGURATION
   ========================================= */

const Biomes = {
  // Biome definitions
  ZONES: {
    abyss: {
      name: "The Abyss",
      floors: [81, 100],
      desc: "The deepest darkness...",
      color: "#1a0033",
      enemyMultiplier: 0.8, // Start Zone (Easy)
      theme: "dark-purple"
    },
    crypt: {
      name: "Ancient Crypt",
      floors: [61, 80],
      desc: "Tombs of forgotten kings",
      color: "#1a1100",
      enemyMultiplier: 1.0,
      theme: "dark-gold"
    },
    // v27.0 New Biome
    crystal: {
      name: "Crystal Caverns",
      floors: [55, 75], // Overlaps/Alternative
      desc: "Reflective crystal depths",
      color: "#001a1a",
      enemyMultiplier: 1.3,
      theme: "crystal"
    },
    dungeon: {
      name: "Dark Dungeon",
      floors: [41, 60],
      desc: "Twisted corridors",
      color: "#0a1a0a",
      enemyMultiplier: 1.6,
      theme: "dark-green"
    },
    cavern: {
      name: "Deep Caverns",
      floors: [21, 40],
      desc: "Underground depths",
      color: "#1a0a0a",
      enemyMultiplier: 2.0,
      theme: "dark-red"
    },
    surface: {
      name: "Surface Ruins",
      floors: [1, 20],
      desc: "The world above",
      color: "#0a0a0a",
      enemyMultiplier: 2.5, // End Zone (Hard)
      theme: "neutral"
    }
  },
  
  // Get current biome based on floor
  getCurrent(floor) {
    if (floor > 80) return this.ZONES.abyss;
    if (floor > 75) return this.ZONES.crypt; // 80-76
    if (floor > 55) return this.ZONES.crystal; // 75-56 (New Biome)
    if (floor > 40) return this.ZONES.dungeon; // 55-41 (Rest of Dungeon)
    if (floor > 20) return this.ZONES.cavern;
    return this.ZONES.surface;
  },
  
  // Apply biome styling to UI
  apply(floor) {
    const biome = this.getCurrent(floor);
    const mainView = document.getElementById('main-view');
    
    // Remove all biome classes
    mainView.classList.remove('biome-abyss', 'biome-crypt', 'biome-dungeon', 'biome-cavern', 'biome-surface');
    
    // Add current biome class
    const biomeClass = `biome-${Object.keys(this.ZONES).find(k => this.ZONES[k] === biome)}`;
    mainView.classList.add(biomeClass);
    
    return biome;
  },
  
  // Get enemy scaling for current biome with improved progression
  getScaling(floor) {
    const biomeMultiplier = this.getCurrent(floor).enemyMultiplier;
    // REVERSE DUNGEON SCALING: Start at Floor 100 (Easy) -> Floor 1 (Hard)
    // Floor 100: ~1.0x | Floor 50: ~1.5x | Floor 1: ~2.5x
    const floorProgress = (100 - floor) / 100; // 0 at Start (100), 1 at End (1)
    const exponentialScale = 1 + Math.pow(floorProgress, 1.2) * 1.5;
    
    // Combine biome multiplier with exponential scaling
    return biomeMultiplier * exponentialScale;
  },
  
  // Show biome transition message
  showTransition(biome) {
    UI.log(`━━━ Entering: ${biome.name} ━━━`, "log boss");
    UI.log(biome.desc, "log system");
  }
};

// Export to global scope
window.Biomes = Biomes;
