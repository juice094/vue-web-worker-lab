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
  gap: 6px;
  margin-bottom: 12px;
}
.form-label {
  font-size: 13px;
  color: #cccccc;
}
</style>
