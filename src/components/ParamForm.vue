<script setup lang="ts">
defineProps<{ label: string }>()
</script>

<template>
  <div class="form-group">
    <label class="form-label">{{ label }}</label>
    <slot></slot>
  </div>
</template>

<style scoped>
.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 16px;
}

.form-label {
  font-size: 14px;
  color: var(--text-secondary);
  font-weight: 500;
}
</style>
