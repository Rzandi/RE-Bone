# 🎮 Re:BONE - Dungeon Crawler RPG

**Version**: 31.0 Architecture Refactor  
**Genre**: Pixel Art Dungeon Crawler  
**Platform**: Web Browser (Desktop + Mobile) 📱  
**Status**: Production Ready ✅

---

## 📖 Overview

**Re:BONE** is a retro-style pixel art dungeon crawler featuring deep character progression, legendary items, set bonuses, and challenging boss encounters. Descend through 100 floors of increasingly difficult dungeons across 5 unique biomes. **Now fully optimized for mobile devices!**

### ✨ Key Features

- 🗺️ **100-Floor Dungeon** with 5 distinct biomes
- 🦸 **6 Unique Character Classes** with special abilities
- ⚔️ **16 Enemy Types** + **5 Epic Bosses**
- 💎 **26 Legendary Items** with set bonuses
- 🏆 **Boss Rush Mode** - Fight all bosses consecutively
- 🎯 **14 Achievements** to unlock
- 🎨 **Pixel Art Aesthetic** with dynamic VFX
- 💾 **Save/Load System** with multiple slots
- 📱 **Mobile Optimized** - Touch controls, responsive design
- 🎮 **PWA-Ready** - Install as app on mobile devices
- ⚡ **Quick-Swap Inventory** - One-click equipment
- 🔒 **Item Lock System** - Prevent accidental actions

---

## 🎮 Gameplay Features

### Character Classes

| Class          | Theme          | Specialization            |
| -------------- | -------------- | ------------------------- |
| **Skeleton**   | Undead Warrior | Balanced melee combat     |
| **Zombie**     | Tank           | High HP, poison attacks   |
| **Ghost**      | Evasion        | Dodge-focused, ethereal   |
| **Vampire** 🦇 | Lifesteal      | Sustain through healing   |
| **Lich** 💀    | Necromancer    | Magic damage, auto-revive |
| **Wraith** 👻  | Phaser         | Ignore DEF, high dodge    |

### Biome System

Descend through 5 atmospheric biomes:

1. **Surface Ruins** (Floors 100-81) - Tutorial zone
2. **Deep Caverns** (Floors 80-61) - Dark caves
3. **Dark Dungeon** (Floors 60-41) - Prison depths
4. **Ancient Crypt** (Floors 40-21) - Undead tombs
5. **The Abyss** (Floors 20-1) - Final challenge

Each biome features unique:

- Visual themes and color schemes
- Enemy types and difficulty
- Loot quality scaling
- Boss encounters

### Legendary Item System

**Rarity Tiers**:

- Common (Gray) - 60% drop rate
- Rare (Blue) - 30% drop rate
- Epic (Purple) - 8% drop rate
- **Legend (Gold)** - 2% drop rate

**Item Sets** (3-piece bonuses):

**🦇 Vampire Set**

- 2pc: +15% Lifesteal
- 3pc: +20% Lifesteal, +5 HP per kill

**💀 Bone Lord Set**

- 2pc: +5 INT
- 3pc: +10 INT, +30% Spell Damage

**👻 Shadow Set**

- 2pc: +10% Dodge
- 3pc: +20% Dodge, Phase on dodge

### Unique Legendary Effects

- **Bloodfang**: +10% additional lifesteal
- **Phoenix Feather**: Auto-revive at 60% HP (consumes)
- **Time Crystal**: Extra turn on kill
- **Shadow Cloak**: +15% dodge chance
- **Soul Reaper**: +3 HP per enemy killed
- **Eternal Grimoire**: -1 MP cost on all skills
- **Mana Siphon Ring**: +3 MP when enemy casts skill
- **Berserker Helm**: +ATK when HP low

### Boss Rush Mode

**Challenge Mode**: Fight all 5 bosses back-to-back

- Limited healing (+20 HP, +10 MP between fights)
- No item drops during rush
- Victory rewards: 500 Gold + 2 Legendary Items
- Unlock Boss Rush Champion achievement

### Achievement System

**14 Achievements** across multiple categories:

**Combat**:

- Immortal (complete without dying)
- Vampire Lord (heal 500 HP)
- Combo Master (use Bat Swarm 50x)

**Bosses**:

- Boss Rush Champion
- Flawless Victory (defeat boss without damage)
- Boss Hunter (defeat all 5 bosses)

**Collection**:

- Legendary Collector (obtain 5 legendaries)
- Set Master (equip full 3-piece set)

**Classes**:

- Complete game with each class (4 achievements)

**Exploration**:

- Abyss Explorer (survive floor 100)
- Dungeon Conqueror (reach floor 1)

---

## � Mobile Support (v26.2)

### Supported Devices

- ✅ iPhone (SE - 15 Pro Max)
- ✅ Android (5.5" - 6.7" screens)
- ✅ Tablets (iPad, Android)
- ✅ Portrait & Landscape modes

### Features

- Touch-optimized UI (55px buttons)
- 55-60 FPS performance
- PWA installable
- Safe area support (notches)

### Install as App

1. Open in mobile browser
2. "Add to Home Screen"
3. Launch fullscreen!

---

## �🚀 Getting Started

### Installation

1. Clone or download the repository
2. Open `index.html` in a modern web browser
3. No build process required!

```bash
# Clone the repo
git clone https://github.com/yourusername/rebone.git
cd rebone

# Open in browser
# Double-click index.html or use a local server
```

### Controls

**Menu Navigation**:

- Click buttons to select options
- NEW GAME → Choose class → Start adventure
- CONTINUE → Load saved game
- BOSS RUSH → Challenge mode
- ACHIEVEMENTS → View progress

**Combat**:

- **ATTACK** - Basic attack
- **SKILL** - Use class abilities (costs MP)
- **ITEM** - Use consumables
- **RUN** - Flee from battle (chance to fail)

**Exploration**:

- **MAJU** - Descend to next floor
- **REST** - Recover +5 HP
- **TAS** - Open inventory/equipment
- **STATUS** - View character stats

---

## 🎯 Game Mechanics

### Combat System

- **Turn-based** battle system
- **ATK vs DEF** damage calculation
- **Multi-hit attacks** (e.g., Bat Swarm)
- **Ignore DEF** abilities (e.g., Phase Strike)
- **Lifesteal** mechanics for sustain
- **Status effects** (poison, debuffs)

### Character Progression

- **Level up** by gaining EXP
- **Equipment slots**: Weapon, Armor, Accessory
- **Stat bonuses** from equipment
- **Set bonuses** for synergy
- **Passive abilities** unlock at class selection

### Loot System

- **30% base drop rate** from enemies
- **Boss guaranteed legendary** drops
- **Floor-based scaling** (better loot deeper)
- **Rarity probability** system
- **Unique effects** on legendary items

---

## 📁 Project Structure

```
RE_Bone/
├── index.html              # Main entry point
├── css/
│   ├── main.css           # Core styling
│   ├── biomes.css         # Biome themes
│   ├── vfx.css            # Visual effects
│   └── items.css          # Item rarity colors
├── js/
│   ├── config/
│   │   ├── database.js    # Game data
│   │   ├── legendary_items.js
│   │   └── biomes.js
│   ├── core/
│   │   ├── game.js        # Game loop
│   │   ├── player.js      # Player state
│   │   └── combat.js      # Combat logic
│   └── managers/
│       ├── ui.js          # UI updates
│       ├── vfx.js         # Visual effects
│       ├── sprite.js      # Animations
│       ├── sound.js       # Audio (future)
│       ├── achievements.js
│       ├── loot.js        # Loot logic (New)
│       └── progression.js # Leveling UI (New)
└── assets/
    └── sprites/           # Pixel art

```

---

## 🛠️ Development

### Technology Stack

- **Frontend**: Vanilla JavaScript (ES6+)
- **Styling**: CSS3 with custom properties
- **Storage**: LocalStorage for saves
- **Architecture**: Component-based modules

### Code Quality

- ✅ Error handling throughout
- ✅ Modular architecture
- ✅ Global scope management
- ✅ Performance optimized
- ✅ Comprehensive comments

---

## 🎨 Credits

**Development**: Your Name  
**Pixel Art**: Custom sprites  
**Design**: Retro dungeon crawler inspired  
**Version**: 25.0 (December 2025)

---

## 📝 Changelog

See [CHANGELOG.md](CHANGELOG.md) for version history.

---

## 🗺️ Future Roadmap

See [FUTURE_ROADMAP.md](FUTURE_ROADMAP.md) for planned features:

- Phase 3: More content (items, biomes, classes)
- Phase 4: Polish & balance tuning
- Phase 5: QoL features (New Game+, Hardcore mode)
- Phase 6: Advanced systems (crafting, skill trees)

---

## 📄 License

[Your chosen license here]

---

## 🤝 Contributing

Contributions welcome! Please:

1. Fork the repository
2. Create a feature branch
3. Submit a pull request

---

## 🐛 Bug Reports

Found a bug? Please report it:

- Include version number (v25.0)
- Steps to reproduce
- Expected vs actual behavior
- Browser/platform info

---

## 💬 Support

- 📧 Email: your.email@example.com
- 💬 Discord: [Your server]
- 🐦 Twitter: [@yourhandle]

---

**Enjoy the dungeon crawl!** 🎮💀

_Last updated: December 15, 2025_
