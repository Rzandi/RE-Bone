<script setup>
import { ref, onMounted } from 'vue';

const props = defineProps({
  message: String,
  icon: { type: String, default: '📢' },
  duration: { type: Number, default: 3000 }
});

const emit = defineEmits(['dismiss']);

const visible = ref(false);

onMounted(() => {
  // Trigger enter animation
  setTimeout(() => visible.value = true, 10);
  
  // Auto-dismiss
  setTimeout(() => {
    visible.value = false;
    setTimeout(() => emit('dismiss'), 300);
  }, props.duration);
});
</script>

<template>
  <div class="toast" :class="{ visible }">
    <span class="toast-icon">{{ icon }}</span>
    <span class="toast-message">{{ message }}</span>
  </div>
</template>

<style scoped>
.toast {
  background: linear-gradient(135deg, rgba(0, 0, 0, 0.95), rgba(20, 20, 40, 0.95));
  border: 2px solid var(--c-gold);
  border-radius: 8px;
  padding: 12px 20px;
  margin-bottom: 10px;
  display: flex;
  align-items: center;
  gap: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.5);
  transform: translateX(400px);
  opacity: 0;
  transition: all 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55);
  min-width: 250px;
  max-width: 350px;
}

.toast.visible {
  transform: translateX(0);
  opacity: 1;
}

.toast-icon {
  font-size: 1.5rem;
  flex-shrink: 0;
}

.toast-message {
  color: #fff;
  font-weight: bold;
  font-size: 0.9rem;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
}
</style>
