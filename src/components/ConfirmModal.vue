<script setup>
import { defineProps, defineEmits } from 'vue';

const props = defineProps({
  title: { type: String, default: 'Confirm Action' },
  message: String,
  confirmText: { type: String, default: 'Confirm' },
  cancelText: { type: String, default: 'Cancel' },
  danger: { type: Boolean, default: false }
});

const emit = defineEmits(['confirm', 'cancel']);

const handleConfirm = () => emit('confirm');
const handleCancel = () => emit('cancel');
</script>

<template>
  <div class="modal-overlay" @click="handleCancel">
    <div class="modal-content" @click.stop>
      <h2>{{ title }}</h2>
      <p class="modal-message">{{ message }}</p>
      
      <div class="modal-actions">
        <button class="btn-cancel" @click="handleCancel">{{ cancelText }}</button>
        <button 
          class="btn-confirm" 
          :class="{ danger }" 
          @click="handleConfirm">
          {{ confirmText }}
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0, 0, 0, 0.85);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  animation: fade-in 0.2s ease;
}

@keyframes fade-in {
  from { opacity: 0; }
  to { opacity: 1; }
}

.modal-content {
  background: linear-gradient(135deg, #1a1a2a, #0a0a1a);
  border: 2px solid var(--c-gold);
  border-radius: 8px;
  padding: 30px;
  max-width: 400px;
  min-width: 300px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.8);
  animation: slide-up 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55);
}

@keyframes slide-up {
  from { 
    transform: translateY(50px); 
    opacity: 0;
  }
  to { 
    transform: translateY(0); 
    opacity: 1;
  }
}

.modal-content h2 {
  margin: 0 0 15px 0;
  color: var(--c-gold);
  font-size: 1.3rem;
  text-align: center;
}

.modal-message {
  color: #ccc;
  margin: 0 0 25px 0;
  text-align: center;
  line-height: 1.5;
}

.modal-actions {
  display: flex;
  gap: 15px;
  justify-content: center;
}

.btn-cancel, .btn-confirm {
  padding: 10px 25px;
  border-radius: 4px;
  font-weight: bold;
  cursor: pointer;
  border: 2px solid;
  font-size: 0.95rem;
  transition: all 0.2s;
}

.btn-cancel {
  background: #333;
  color: #fff;
  border-color: #555;
}

.btn-cancel:hover {
  background: #444;
  border-color: #666;
}

.btn-confirm {
  background: var(--c-gold);
  color: #000;
  border-color: #fff;
}

.btn-confirm:hover {
  transform: scale(1.05);
  box-shadow: 0 4px 12px rgba(255, 215, 0, 0.4);
}

.btn-confirm.danger {
  background: #d00;
  color: #fff;
  border-color: #f55;
}

.btn-confirm.danger:hover {
  background: #e00;
  box-shadow: 0 4px 12px rgba(255, 0, 0, 0.4);
}

.btn-confirm.danger:hover {
  background: #e00;
  box-shadow: 0 4px 12px rgba(255, 0, 0, 0.4);
}

/* ============================================
   v36.9 PHASE 2: RESPONSIVE LAYOUTS
   ============================================ */

/* Mobile: Bottom sheet modal */
@media (max-width: 767px) {
  .modal-overlay {
    align-items: flex-end;
  }
  
  .modal-content {
    border-radius: 20px 20px 0 0;
    max-width: 100%;
    min-width: 100%;
    max-height: 80vh;
    animation: slide-up-mobile 0.3s ease;
  }
  
  @keyframes slide-up-mobile {
    from {
      transform: translateY(100%);
      opacity: 1;
    }
    to {
      transform: translateY(0);
      opacity: 1;
    }
  }
  
  /* Add swipe handle indicator */
  .modal-content::before {
    content: '';
    display: block;
    width: 40px;
    height: 4px;
    background: #666;
    border-radius: 2px;
    margin: 0 auto 15px;
  }
}

/* ============================================
   v36.9 PHASE 1: MOBILE TOUCH OPTIMIZATION
   ============================================ */

/* Touch optimization */
button {
  touch-action: manipulation;
  -webkit-tap-highlight-color: transparent;
}

/* Mobile: Larger buttons & spacing */
@media (max-width: 767px) {
  .modal-content {
    padding: 25px 20px;
    max-width: 90%;
  }
  
  .modal-content h2 {
    font-size: 1.2rem;
  }
  
  .modal-message {
    font-size: 0.95rem;
    margin-bottom: 20px;
  }
  
  .modal-actions {
    gap: 12px;
  }
  
  .btn-cancel, .btn-confirm {
    min-height: 48px;
    padding: 14px 28px;
    font-size: 1rem;
    flex: 1;
  }
}

/* Touch feedback */
@media (hover: none) and (pointer: coarse) {
  .btn-cancel:active,
  .btn-confirm:active {
    transform: scale(0.96);
    opacity: 0.9;
    transition: transform 0.1s ease;
  }
  
  /* Disable hover effects */
  .btn-cancel:hover,
  .btn-confirm:hover {
    transform: none;
    box-shadow: none;
  }
}
</style>
