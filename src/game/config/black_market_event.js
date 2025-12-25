// v37.0 Phase 3: Black Market Events
// Shady Dealer chain events + Cursed Collector hidden events

import { gameStore } from '../store.js';
import { CURSED_ITEMS, countOwnedCursedItems } from './cursed_items.js';
import { BlackMarketManager } from '../managers/BlackMarketManager.js';
import { Achievements } from '../managers/achievements.js';

// ============================================
// SHADY DEALER CHAIN EVENTS
// ============================================

export const SHADY_DEALER_EVENTS = {
  
  // Chain 1: First Encounter (Floor 5+)
  first_encounter: {
    id: 'shady_dealer_1',
    name: 'A Hooded Figure',
    minFloor: 5,
    chance: 0.05,  // 5% per explore
    requiredRep: 0,
    description: 'A hooded figure beckons from the shadows...',
    
    intro: [
      "The air grows cold. Shadows seem to thicken around a cloaked figure.",
      "\"Psst... you there. Looking for something... special?\"",
      "Golden eyes gleam from beneath the hood."
    ],
    
    options: [
      {
        text: "Browse the wares",
        action: 'openMarket',
        result: "The figure leads you to a hidden alcove filled with mysterious items."
      },
      {
        text: "\"Who are you?\"",
        action: 'askIdentity',
        result: "\"Names are dangerous things, friend. Call me... The Broker.\""
      },
      {
        text: "Walk away",
        action: 'leave',
        result: "The figure melts back into the shadows. \"Perhaps next time...\""
      }
    ]
  },
  
  // Chain 2: Trust Building (3+ purchases)
  trust_building: {
    id: 'shady_dealer_2',
    name: 'A Familiar Shadow',
    minFloor: 7,
    chance: 0.08,
    requiredRep: 2,
    description: 'The Broker remembers you...',
    
    intro: [
      "\"Ah, my favorite customer returns.\"",
      "The Broker's smile is barely visible beneath the hood.",
      "\"I've set aside some... premium merchandise. Just for you.\""
    ],
    
    options: [
      {
        text: "Show me the good stuff",
        action: 'openMarketPremium',
        result: "New items shimmer with dark energy. Medium boxes unlocked!"
      },
      {
        text: "I want a discount",
        action: 'requestDiscount',
        result: "\"Consider it done. 5% off, for loyalty.\""
      }
    ],
    
    rewards: {
      unlockMediumBoxes: true,
      discount: 0.05
    }
  },
  
  // Chain 3: Inner Circle (10+ purchases, Floor 10+)
  inner_circle: {
    id: 'shady_dealer_3',
    name: 'The Inner Circle',
    minFloor: 10,
    chance: 0.10,
    requiredRep: 3,
    description: 'The Broker offers you something rare...',
    
    intro: [
      "\"You've proven yourself trustworthy. Most customers don't last this long.\"",
      "The Broker reveals a hidden panel in the wall.",
      "\"Welcome to the Inner Circle. Here, we deal in... everything.\""
    ],
    
    options: [
      {
        text: "Enter the Circle",
        action: 'joinCircle',
        result: "Large mystery boxes and curse services unlocked!"
      },
      {
        text: "What's the catch?",
        action: 'askCatch',
        result: "\"No catch. Just... don't ask where the items come from.\""
      }
    ],
    
    rewards: {
      unlockLargeBoxes: true,
      unlockServices: true,
      discount: 0.10
    }
  },
  
  // Chain 4: The Dark Pact (20+ purchases, Floor 15+)
  dark_pact: {
    id: 'shady_dealer_4',
    name: 'The Dark Pact',
    minFloor: 15,
    chance: 0.15,
    requiredRep: 4,
    description: 'A binding offer is made...',
    
    intro: [
      "The Broker's eyes glow with unnatural light.",
      "\"I offer you a pact. Power beyond measure.\"",
      "\"But once signed, there's no going back.\""
    ],
    
    options: [
      {
        text: "Sign the pact (Curse buffs +20%, Prices -20%)",
        action: 'signPact',
        result: "Dark energy flows through you. The pact is sealed!",
        consequence: 'pactSigned'
      },
      {
        text: "Decline the offer",
        action: 'decline',
        result: "\"A shame. The offer stands... for now.\"",
        consequence: 'pactDeclined'
      }
    ],
    
    rewards: {
      pactBuffs: 1.20,  // +20% curse buff effectiveness
      pactDiscount: 0.20
    }
  },
  
  // Chain 5: Shadow Partner (50+ purchases, Floor 20+)
  shadow_partner: {
    id: 'shady_dealer_5',
    name: 'Shadow Partner',
    minFloor: 20,
    chance: 0.20,
    requiredRep: 5,
    description: 'The ultimate partnership...',
    
    intro: [
      "\"We've come a long way, you and I.\"",
      "The Broker extends a shadowy hand.",
      "\"Partners. Equals. In darkness, together.\""
    ],
    
    options: [
      {
        text: "Accept the partnership",
        action: 'acceptPartnership',
        result: "The Broker nods. \"I'll fight beside you when needed.\""
      }
    ],
    
    rewards: {
      dealerAlly: true,  // 10% chance dealer appears in boss fights
      freeBoxInterval: 10, // Free box every 10 floors
      exclusiveItems: true
    }
  }
};

// ============================================
// CURSED COLLECTOR HIDDEN EVENTS
// ============================================

export const CURSED_COLLECTOR_EVENTS = {
  
  // Event 1: Whispers of the Damned (5 Cursed Items)
  whispers: {
    id: 'curse_collector_1',
    name: 'Whispers of the Damned',
    requiredCursedItems: 5,
    
    intro: [
      "The cursed items in your pack begin to vibrate.",
      "Whispers echo in your mind—voices of the damned.",
      "A shadowy figure materializes before you."
    ],
    
    dialogue: [
      "\"You carry the burden of curses... I can help you bear them.\"",
      "\"Accept this gift—resistance against the darkness within.\""
    ],
    
    rewards: {
      curseResistance: 0.10,  // +10% curse effect reduction
      revealDealer: 3  // Show dealer location for 3 floors
    },
    
    achievementId: 'curse_collector_1'
  },
  
  // Event 2: The Collector's Burden (10 Cursed Items)
  burden: {
    id: 'curse_collector_2',
    name: "The Collector's Burden",
    requiredCursedItems: 10,
    
    intro: [
      "Your cursed items pulse with synchronized energy.",
      "The curses have begun to merge—to communicate.",
      "The Shadow speaks again."
    ],
    
    dialogue: [
      "\"Your collection grows. The curses speak to each other now.\"",
      "\"I grant you the power to transfer curses between items.\""
    ],
    
    rewards: {
      curseTransfer: true,  // Unlock curse transfer ability
      specialItem: 'collectors_burden'  // New cursed item
    },
    
    achievementId: 'curse_collector_2'
  },
  
  // Event 3: Embrace the Darkness (15 Cursed Items)
  embrace: {
    id: 'curse_collector_3',
    name: 'Embrace the Darkness',
    requiredCursedItems: 15,
    
    intro: [
      "The darkness within you has grown strong.",
      "You ARE the curse now.",
      "A final choice awaits."
    ],
    
    dialogue: [
      "\"Few mortals walk this path.\"",
      "\"Choose: Embrace fully, or resist forever.\""
    ],
    
    choices: [
      {
        text: "Embrace (Curse buffs +25%, debuffs -25%)",
        effect: 'embrace',
        curseBuffMult: 1.25,
        curseDebuffMult: 0.75
      },
      {
        text: "Resist (Curse debuffs -40%, buffs -20%)",
        effect: 'resist',
        curseBuffMult: 0.80,
        curseDebuffMult: 0.60
      }
    ],
    
    rewards: {
      title: 'Void Walker'
    },
    
    achievementId: 'curse_collector_3'
  },
  
  // Event 4: Lord of Shadows (20 Cursed Items - ALL)
  lord: {
    id: 'curse_collector_4',
    name: 'Lord of Shadows',
    requiredCursedItems: 20,
    
    intro: [
      "All 20 cursed items resonate as one.",
      "The ultimate power awaits—but so does a test.",
      "Your shadow takes form before you."
    ],
    
    dialogue: [
      "\"To become the Lord, you must defeat yourself.\"",
      "\"Face your Shadow Self—all your curses given form.\""
    ],
    
    boss: {
      name: 'Shadow Self',
      copyPlayerStats: true,
      copyPlayerCurses: true,
      bonusHp: 1.5  // 50% more HP
    },
    
    rewards: {
      crownOfThorns: true,  // Legendary accessory
      curseVisibility: true,  // See curses in shops before purchase
      title: 'Lord of Curses'
    },
    
    achievementId: 'lord_of_curses'
  }
};

// ============================================
// EVENT TRIGGER LOGIC
// ============================================

export const BlackMarketEventManager = {
  
  // Check if shady dealer should appear
  shouldTriggerDealer(floor) {
    const s = gameStore.state;
    const rep = BlackMarketManager?.getDealerReputation() || 0;
    
    // Find eligible event based on rep
    for (const key of Object.keys(SHADY_DEALER_EVENTS).reverse()) {
      const event = SHADY_DEALER_EVENTS[key];
      if (floor >= event.minFloor && rep >= event.requiredRep) {
        if (Math.random() < event.chance) {
          return event;
        }
      }
    }
    
    return null;
  },
  
  // Check for cursed collector events
  checkCursedCollectorEvent() {
    const s = gameStore.state;
    const ownedCount = countOwnedCursedItems(s.inventory);
    
    // Initialize triggered events tracker
    if (!s.triggeredCurseEvents) s.triggeredCurseEvents = [];
    
    for (const key of Object.keys(CURSED_COLLECTOR_EVENTS)) {
      const event = CURSED_COLLECTOR_EVENTS[key];
      
      if (ownedCount >= event.requiredCursedItems && 
          !s.triggeredCurseEvents.includes(event.id)) {
        return event;
      }
    }
    
    return null;
  },
  
  // Mark event as triggered
  markEventTriggered(eventId) {
    const s = gameStore.state;
    if (!s.triggeredCurseEvents) s.triggeredCurseEvents = [];
    
    if (!s.triggeredCurseEvents.includes(eventId)) {
      s.triggeredCurseEvents.push(eventId);
    }
  },
  
  // Apply event rewards
  applyEventRewards(event) {
    const s = gameStore.state;
    
    if (!s.curseModifiers) s.curseModifiers = {};
    
    if (event.rewards) {
      // Apply curse resistance
      if (event.rewards.curseResistance) {
        s.curseModifiers.resistance = (s.curseModifiers.resistance || 0) + event.rewards.curseResistance;
      }
      
      // Unlock abilities
      if (event.rewards.curseTransfer) {
        s.curseModifiers.canTransfer = true;
      }
      
      // Apply curse buff/debuff modifiers
      if (event.rewards.curseBuffMult) {
        s.curseModifiers.buffMult = event.rewards.curseBuffMult;
      }
      if (event.rewards.curseDebuffMult) {
        s.curseModifiers.debuffMult = event.rewards.curseDebuffMult;
      }
      
      // Grant title
      if (event.rewards.title) {
        s.titles = s.titles || [];
        s.titles.push(event.rewards.title);
        gameStore.log(`🏆 Title earned: ${event.rewards.title}!`, 'achievement');
      }
      
      // Track achievement
      if (event.achievementId && Achievements) {
        Achievements.unlock(event.achievementId);
      }
    }
    
    this.markEventTriggered(event.id);
  }
};

// Global export

