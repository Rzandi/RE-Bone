// v37.0 Phase 4: Economy Manager
// Dynamic pricing, inflation, scarcity, and market events

import { gameStore } from '../store.js';

export const EconomyManager = {
  
  // ============================================
  // CONSTANTS
  // ============================================
  
  MAX_GOLD: 999999,
  MAX_STOCK: 10,
  MAX_INFLATION: 2.0,
  MAX_SCARCITY: 2.0,
  MAX_COMBINED: 3.0,
  MIN_SELL_MULT: 0.25,
  MIN_BUY_MULT: 0.5,
  
  // ============================================
  // INFLATION SYSTEM
  // ============================================
  
  getInflationRate() {
    const s = gameStore.state;
    if (!s.economy) this.initEconomyState();
    
    const spent = s.economy.totalGoldSpent || 0;
    if (spent === 0) return 1.0;
    
    // Formula: 1 + (spent / 10000) * 0.5
    let rate = 1 + (spent / 10000) * 0.5;
    
    // Apply permanent deflation modifiers
    rate -= s.economy.permanentDeflation || 0;
    
    // Clamp between 0.5 and MAX_INFLATION
    return Math.max(0.5, Math.min(this.MAX_INFLATION, rate));
  },
  
  getInflationPercent() {
    return Math.round((this.getInflationRate() - 1) * 100);
  },
  
  // ============================================
  // SCARCITY SYSTEM
  // ============================================
  
  getScarcityMult(itemId) {
    const s = gameStore.state;
    if (!s.economy) this.initEconomyState();
    
    const purchases = s.economy.itemPurchases?.[itemId] || 0;
    if (purchases === 0) return 1.0;
    
    // Formula: 1 + (purchases / 10) * 0.25, capped at 2.0
    const mult = 1 + (purchases / 10) * 0.25;
    return Math.min(this.MAX_SCARCITY, mult);
  },
  
  getStockLevel(itemId) {
    const s = gameStore.state;
    if (!s.economy?.itemStock) return this.MAX_STOCK;
    return s.economy.itemStock[itemId] ?? this.MAX_STOCK;
  },
  
  getStockBadge(itemId) {
    const stock = this.getStockLevel(itemId);
    if (stock >= 5) return { icon: '🟢', label: 'In Stock', color: '#4f4' };
    if (stock >= 3) return { icon: '🟡', label: 'Limited', color: '#ff0' };
    if (stock === 2) return { icon: '🟠', label: 'Low', color: '#fa0' };
    if (stock === 1) return { icon: '🔴', label: 'Last One!', color: '#f44' };
    return { icon: '⚫', label: 'Sold Out', color: '#666' };
  },
  
  // ============================================
  // PRICE CALCULATIONS
  // ============================================
  
  calculateBuyPrice(basePrice, itemId) {
    const inflation = this.getInflationRate();
    const scarcity = this.getScarcityMult(itemId);
    const floorMult = this.getFloorMult();
    const eventMult = this.getEventPriceMult('buy');
    const repDiscount = 1 - this.getMerchantDiscount();
    
    let finalPrice = basePrice * inflation * scarcity * floorMult * eventMult * repDiscount;
    
    // Apply minimum
    finalPrice = Math.max(basePrice * this.MIN_BUY_MULT, finalPrice);
    
    // Hardcap at 3x base
    finalPrice = Math.min(basePrice * this.MAX_COMBINED, finalPrice);
    
    // Prevent NaN/Infinity
    if (!Number.isFinite(finalPrice)) finalPrice = basePrice;
    
    return Math.max(1, Math.floor(finalPrice));
  },
  
  calculateSellPrice(basePrice, itemId) {
    const eventMult = this.getEventPriceMult('sell');
    
    // Base sell = 25% of base buy price
    let sellPrice = basePrice * 0.25 * eventMult;
    
    // Apply minimum
    sellPrice = Math.max(basePrice * this.MIN_SELL_MULT * 0.5, sellPrice);
    
    // Prevent NaN/Infinity
    if (!Number.isFinite(sellPrice)) sellPrice = Math.floor(basePrice * 0.25);
    
    return Math.max(1, Math.floor(sellPrice));
  },
  
  getFloorMult() {
    const floor = gameStore.state.floor || 1;
    return 1 + (floor * 0.02);
  },
  
  getMerchantDiscount() {
    const s = gameStore.state;
    const rep = s.economy?.merchantReputation || 0;
    
    if (rep >= 50) return 0.15; // 15% off
    if (rep >= 25) return 0.10; // 10% off
    if (rep >= 10) return 0.05; // 5% off
    return 0;
  },
  
  // ============================================
  // PURCHASE & SALE TRACKING
  // ============================================
  
  recordPurchase(itemId, price) {
    const s = gameStore.state;
    if (!s.economy) this.initEconomyState();
    
    // Track gold spent
    s.economy.totalGoldSpent += price;
    
    // Track item purchases
    if (!s.economy.itemPurchases) s.economy.itemPurchases = {};
    s.economy.itemPurchases[itemId] = (s.economy.itemPurchases[itemId] || 0) + 1;
    
    // Decrease stock
    if (!s.economy.itemStock) s.economy.itemStock = {};
    if (s.economy.itemStock[itemId] === undefined) s.economy.itemStock[itemId] = this.MAX_STOCK;
    s.economy.itemStock[itemId] = Math.max(0, s.economy.itemStock[itemId] - 1);
    
    // Increase merchant reputation
    s.economy.merchantReputation = (s.economy.merchantReputation || 0) + 1;
    
    // Check inflation milestone
    this.checkInflationMilestone();
  },
  
  recordSale(itemId, price) {
    const s = gameStore.state;
    if (!s.economy) this.initEconomyState();
    
    // Track gold earned
    s.economy.totalGoldEarned += price;
    
    // Sales slightly reduce inflation (gold leaving circulation)
    s.economy.totalGoldSpent = Math.max(0, s.economy.totalGoldSpent - Math.floor(price * 0.1));
  },
  
  checkInflationMilestone() {
    const rate = this.getInflationPercent();
    if (rate >= 50 && !gameStore.state.economy.inflation50Warned) {
      gameStore.log('⚠️ High inflation! Prices are 50%+ higher!', 'warning');
      gameStore.state.economy.inflation50Warned = true;
    }
  },
  
  // ============================================
  // STOCK MANAGEMENT
  // ============================================
  
  refreshStock(floor) {
    const s = gameStore.state;
    if (!s.economy?.itemStock) return;
    
    // Each floor, regenerate some stock
    let itemsRefreshed = 0;
    const maxRefresh = 3;
    
    for (const itemId in s.economy.itemStock) {
      if (itemsRefreshed >= maxRefresh) break;
      
      const current = s.economy.itemStock[itemId];
      if (current < this.MAX_STOCK) {
        // Regenerate 1-2 stock
        const regen = 1 + Math.floor(Math.random() * 2);
        s.economy.itemStock[itemId] = Math.min(this.MAX_STOCK, current + regen);
        itemsRefreshed++;
      }
    }
    
    // Decay scarcity over time
    for (const itemId in s.economy.itemPurchases) {
      if (s.economy.itemPurchases[itemId] > 0) {
        s.economy.itemPurchases[itemId] = Math.max(0, s.economy.itemPurchases[itemId] - 1);
      }
    }
  },
  
  // ============================================
  // MARKET EVENTS
  // ============================================
  
  EVENTS: {
    // Anti-Inflation Events
    flash_sale: { 
      name: 'Flash Sale!', 
      desc: 'All items 20% off!', 
      icon: '🔥', 
      type: 'discount',
      buyMult: 0.8, 
      sellMult: 1.0, 
      duration: 1,
      color: '#4f4'
    },
    market_crash: { 
      name: 'Market Crash', 
      desc: 'Inflation reduced by 25%!', 
      icon: '📉', 
      type: 'deflation',
      deflation: 0.25,
      duration: 0, // permanent
      color: '#4af'
    },
    merchant_festival: { 
      name: 'Merchant Festival', 
      desc: 'Free refresh + 15% off!', 
      icon: '🎉', 
      type: 'discount',
      buyMult: 0.85, 
      sellMult: 1.0, 
      freeRefresh: true,
      duration: 1,
      color: '#4f4'
    },
    gold_deflation: { 
      name: 'Gold Deflation', 
      desc: 'Inflation reduced by 10%!', 
      icon: '💰', 
      type: 'deflation',
      deflation: 0.10,
      duration: 0,
      color: '#4af'
    },
    charity_event: { 
      name: 'Charity Event', 
      desc: 'Potions 50% off!', 
      icon: '❤️', 
      type: 'category_discount',
      category: 'item',
      buyMult: 0.5, 
      duration: 1,
      color: '#f4a'
    },
    bulk_discount: { 
      name: 'Bulk Discount', 
      desc: 'Buy 3+: 25% off!', 
      icon: '📦', 
      type: 'bulk',
      bulkThreshold: 3,
      buyMult: 0.75, 
      duration: 1,
      color: '#4f4'
    },
    happy_hour: { 
      name: 'Happy Hour', 
      desc: 'Sell prices +25%!', 
      icon: '🍺', 
      type: 'sell_boost',
      buyMult: 1.0, 
      sellMult: 1.25, 
      duration: 1,
      color: '#fa0'
    },
    secret_stash: { 
      name: 'Secret Stash', 
      desc: 'Rare item revealed -30%!', 
      icon: '🗝️', 
      type: 'special_discount',
      buyMult: 0.7, 
      duration: 1,
      color: '#d0d'
    },
    
    // Pro-Inflation Events
    supply_shortage: { 
      name: 'Supply Shortage', 
      desc: 'Consumables +30%!', 
      icon: '📦', 
      type: 'category_markup',
      category: 'item',
      buyMult: 1.3, 
      duration: 2,
      color: '#f44'
    },
    tax_collector: { 
      name: 'Tax Collector', 
      desc: 'Lost 10% of your gold!', 
      icon: '👔', 
      type: 'tax',
      taxPercent: 0.10,
      duration: 0,
      color: '#f44'
    },
    war_tax: { 
      name: 'War Tax', 
      desc: 'All prices +20%!', 
      icon: '⚔️', 
      type: 'markup',
      buyMult: 1.2, 
      duration: 2,
      color: '#f44'
    },
    smuggler_premium: { 
      name: 'Smuggler Premium', 
      desc: 'Rare items +40%!', 
      icon: '🏴‍☠️', 
      type: 'rarity_markup',
      rarities: ['rare', 'epic', 'legendary'],
      buyMult: 1.4, 
      duration: 1,
      color: '#fa0'
    },
    material_shortage: { 
      name: 'Material Shortage', 
      desc: 'Gems & crafting +50%!', 
      icon: '💎', 
      type: 'category_markup',
      category: 'gem',
      buyMult: 1.5, 
      duration: 2,
      color: '#f44'
    },
    merchant_strike: { 
      name: 'Merchant Strike!', 
      desc: 'Shop CLOSED!', 
      icon: '🚫', 
      type: 'closed',
      duration: 1,
      color: '#666'
    },
    
    // Neutral/Special Events
    gold_rush: { 
      name: 'Gold Rush', 
      desc: 'Sell +50%, Buy +20%', 
      icon: '🪙', 
      type: 'mixed',
      buyMult: 1.2, 
      sellMult: 1.5, 
      duration: 1,
      color: '#fa0'
    },
    trader_caravan: { 
      name: 'Trader Caravan', 
      desc: '5 extra items available!', 
      icon: '🐪', 
      type: 'bonus_stock',
      bonusItems: 5,
      duration: 1,
      color: '#4af'
    },
    black_market_deal: { 
      name: 'Black Market Deal', 
      desc: 'Shady Dealer appears!', 
      icon: '☠️', 
      type: 'special',
      openBlackMarket: true,
      duration: 1,
      color: '#a0a'
    },
    wealthy_customer: { 
      name: 'Wealthy Customer', 
      desc: 'Sell 1 item at 3x!', 
      icon: '💎', 
      type: 'one_time_sell',
      sellMult: 3.0,
      oneTime: true,
      duration: 1,
      color: '#fd0'
    },
    price_freeze: { 
      name: 'Price Freeze', 
      desc: 'No inflation this floor!', 
      icon: '❄️', 
      type: 'freeze',
      freezeInflation: true,
      duration: 1,
      color: '#4af'
    },
    economy_reset: { 
      name: 'Economy Reset!', 
      desc: 'All prices reset to base!', 
      icon: '🔄', 
      type: 'reset',
      duration: 0,
      color: '#4f4'
    },
    merchant_rivalry: { 
      name: 'Merchant Rivalry', 
      desc: 'Get 1 random item FREE!', 
      icon: '🎁', 
      type: 'free_item',
      duration: 1,
      color: '#fd0'
    }
  },
  
  rollMarketEvent() {
    const s = gameStore.state;
    if (!s.economy) this.initEconomyState();
    
    // Max 3 events per session
    if ((s.economy.eventsThisSession || 0) >= 3) return null;
    
    // Event probabilities
    const eventRolls = [
      { event: 'flash_sale', chance: 0.05 },
      { event: 'market_crash', chance: 0.01 },
      { event: 'merchant_festival', chance: 0.02 },
      { event: 'gold_deflation', chance: 0.02 },
      { event: 'charity_event', chance: 0.03 },
      { event: 'bulk_discount', chance: 0.04 },
      { event: 'happy_hour', chance: 0.03 },
      { event: 'secret_stash', chance: 0.02 },
      { event: 'supply_shortage', chance: 0.03 },
      { event: 'tax_collector', chance: 0.04 },
      { event: 'war_tax', chance: 0.02 },
      { event: 'smuggler_premium', chance: 0.03 },
      { event: 'material_shortage', chance: 0.03 },
      { event: 'merchant_strike', chance: 0.01 },
      { event: 'gold_rush', chance: 0.02 },
      { event: 'trader_caravan', chance: 0.03 },
      { event: 'black_market_deal', chance: 0.02 },
      { event: 'wealthy_customer', chance: 0.02 },
      { event: 'price_freeze', chance: 0.02 },
      { event: 'economy_reset', chance: 0.005 },
      { event: 'merchant_rivalry', chance: 0.02 }
    ];
    
    for (const roll of eventRolls) {
      if (Math.random() < roll.chance) {
        return this.applyMarketEvent(roll.event);
      }
    }
    
    return null;
  },
  
  applyMarketEvent(eventKey) {
    const s = gameStore.state;
    const event = this.EVENTS[eventKey];
    if (!event) return null;
    
    // Apply event
    s.economy.activeEvent = { key: eventKey, ...event };
    s.economy.eventDuration = event.duration;
    s.economy.eventsThisSession = (s.economy.eventsThisSession || 0) + 1;
    
    // Handle special events immediately
    if (event.type === 'tax') {
      const tax = Math.floor(s.gold * event.taxPercent);
      s.gold = Math.max(0, s.gold - tax);
      gameStore.log(`👔 Tax Collector took ${tax} gold!`, 'danger');
    }
    
    if (event.type === 'deflation') {
      s.economy.permanentDeflation = (s.economy.permanentDeflation || 0) + event.deflation;
    }
    
    if (event.type === 'reset') {
      s.economy.totalGoldSpent = 0;
      s.economy.itemPurchases = {};
      s.economy.permanentDeflation = 0;
    }
    
    gameStore.log(`${event.icon} ${event.name} - ${event.desc}`, 'system');
    
    return event;
  },
  
  getEventPriceMult(priceType) {
    const s = gameStore.state;
    const event = s.economy?.activeEvent;
    if (!event) return 1.0;
    
    if (event.freezeInflation && priceType === 'buy') {
      // Return just floor mult, skip inflation
      return 1.0 / this.getInflationRate();
    }
    
    if (priceType === 'buy') {
      return event.buyMult || 1.0;
    } else {
      return event.sellMult || 1.0;
    }
  },
  
  onFloorChange() {
    const s = gameStore.state;
    if (!s.economy) this.initEconomyState();
    
    // Decrease event duration
    if (s.economy.eventDuration > 0) {
      s.economy.eventDuration--;
      if (s.economy.eventDuration === 0) {
        gameStore.log(`⏰ ${s.economy.activeEvent?.name} ended.`, 'system');
        s.economy.activeEvent = null;
      }
    }
    
    // Refresh stock
    this.refreshStock(s.floor);
    
    // Roll for new event (only if no active event)
    if (!s.economy.activeEvent) {
      this.rollMarketEvent();
    }
    
    // Reset session event counter on new game
    if (s.floor === 1) {
      s.economy.eventsThisSession = 0;
    }
  },
  
  // ============================================
  // STATE INITIALIZATION
  // ============================================
  
  initEconomyState() {
    const s = gameStore.state;
    if (!s.economy) {
      s.economy = {
        totalGoldSpent: 0,
        totalGoldEarned: 0,
        itemPurchases: {},
        itemStock: {},
        activeEvent: null,
        eventDuration: 0,
        merchantReputation: 0,
        eventsThisSession: 0,
        permanentDeflation: 0,
        inflation50Warned: false
      };
    }
  },
  
  // Price breakdown for tooltips
  getPriceBreakdown(basePrice, itemId) {
    const inflation = this.getInflationRate();
    const scarcity = this.getScarcityMult(itemId);
    const floorMult = this.getFloorMult();
    const eventMult = this.getEventPriceMult('buy');
    const discount = this.getMerchantDiscount();
    
    return {
      base: basePrice,
      inflation: { mult: inflation, add: Math.floor(basePrice * (inflation - 1)) },
      scarcity: { mult: scarcity, add: Math.floor(basePrice * inflation * (scarcity - 1)) },
      floor: { mult: floorMult, add: Math.floor(basePrice * inflation * scarcity * (floorMult - 1)) },
      event: { mult: eventMult, add: Math.floor(basePrice * inflation * scarcity * floorMult * (eventMult - 1)) },
      discount: { mult: 1 - discount, percent: Math.round(discount * 100) },
      final: this.calculateBuyPrice(basePrice, itemId)
    };
  }
};

// Global export
window.EconomyManager = EconomyManager;
