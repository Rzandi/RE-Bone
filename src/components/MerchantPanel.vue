<script setup>
import { computed } from "vue";
import { gameStore } from "../game/store.js";

const s = gameStore.state;
defineProps(["stock"]);

// We need DB to lookup item details. Assuming window.DB exists from legacy loader.
// Or we could import it. window.DB is reliable if game is running.
const getStockItems = computed(() => {
  if (!window.DB || !window.DB.ITEMS) return [];
  return s.merchantStock
    .map((key) => {
      const item = window.DB.ITEMS[key];
      return item ? { ...item, key } : null;
    })
    .filter((i) => i);
});

const buy = (key) => {
  const item = window.DB.ITEMS[key];
  if (!item) return;

  if (window.PlayerLogic) {
    window.PlayerLogic.buyItem(key, item.price);
  }
};

const leave = () => {
  if (window.Game) window.Game.exploreState();
};

const getRarityColor = (rarity) => {
  const map = { common: "#fff", rare: "#44f", epic: "#d0d", legend: "#ff0" };
  return map[rarity] || "#fff";
};
</script>

<template>
  <div class="merchant-panel">
    <div class="header">
      <h2 style="color: gold">MERCHANT</h2>
      <p>"Got some rare things on sale, stranger..."</p>
    </div>

    <div class="stock-list">
      <div v-for="item in getStockItems" :key="item.key" class="shop-item">
        <div class="info">
          <strong :style="{ color: getRarityColor(item.rarity) }">{{
            item.name
          }}</strong>
          <div class="desc">{{ item.desc }}</div>
        </div>
        <div class="action">
          <div class="price" :class="{ red: s.gold < item.price }">
            {{ item.price }} G
          </div>
          <button @click="buy(item.key)" :disabled="s.gold < item.price">
            BUY
          </button>
        </div>
      </div>

      <div
        v-if="getStockItems.length === 0"
        style="text-align: center; padding: 20px; color: #555"
      >
        Sold Out / Closed
      </div>
    </div>

    <div class="footer">
      <button class="leave-btn" @click="leave">LEAVE SHOP</button>
    </div>
  </div>
</template>

<style scoped>
.merchant-panel {
  display: flex;
  flex-direction: column;
  flex: 1;
  border: 1px solid gold;
  background: #000;
  margin: 10px;
  overflow: hidden;
}
.header {
  background: #221;
  padding: 10px;
  text-align: center;
  border-bottom: 1px solid #442;
}
.stock-list {
  flex: 1;
  overflow-y: auto;
  padding: 10px;
}
.shop-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border: 1px solid #333;
  background: #111;
  margin-bottom: 8px;
  padding: 8px;
}
.desc {
  font-size: 0.8rem;
  color: #888;
}
.action {
  text-align: right;
  min-width: 80px;
}
.price {
  color: gold;
  margin-bottom: 5px;
}
.price.red {
  color: #f44;
}
button {
  background: gold;
  border: none;
  color: black;
  font-weight: bold;
  cursor: pointer;
  padding: 4px 8px;
}
button:disabled {
  background: #444;
  color: #888;
  cursor: not-allowed;
}
.footer {
  padding: 10px;
  text-align: center;
  border-top: 1px solid #333;
}
.leave-btn {
  background: #333;
  color: white;
  border: 1px solid #555;
  padding: 10px 30px;
}
</style>
