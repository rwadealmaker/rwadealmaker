<!-- src/components/AppModal.vue -->
<template>
  <div v-if="open" class="modal-mask" @click.self="$emit('close')">
    <div class="modal-card">
      <h3 class="modal-title">{{ title }}</h3>
      <div class="modal-body">
        <slot />
      </div>
      <div class="modal-actions">
        <button class="btn" @click="$emit('close')">知道了</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  open: boolean;
  title?: string;
}>();
defineEmits<{ (e: 'close'): void }>();
</script>

<style scoped>
.modal-mask {
  position: fixed; inset: 0; background: rgba(0,0,0,.35);
  display: flex; align-items: center; justify-content: center;
  z-index: 999;
}
.modal-card {
  background: #fff; border-radius: 12px; padding: 16px; width: min(460px, 92vw);
  box-shadow: 0 10px 30px rgba(0,0,0,.2);
}
.modal-title { margin: 0 0 8px; font-weight: 700; font-size: 18px; }
.modal-body { color: #333; line-height: 1.6; }
.modal-actions { display: flex; justify-content: flex-end; gap: 8px; margin-top: 14px; }
.btn { padding: 8px 14px; border: 1px solid #ddd; border-radius: 10px; background: #f7f7f7; cursor: pointer;}
.btn:hover { opacity: .9; }
</style>
