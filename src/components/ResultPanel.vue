<script setup lang="ts">
defineProps<{ title: string; error?: string }>()
</script>

<template>
  <div class="result-card">
    <div class="card-title">{{ title }}</div>
    <div class="card-content">
      <div v-if="error" class="error-msg">⚠️ 运算错误: {{ error }}</div>
      <slot v-else></slot>
    </div>
  </div>
</template>

<style scoped>
.result-card {
  background: var(--bg-card);
  border-radius: var(--border-radius-lg);
  border: 1px solid var(--border-color);
  padding: 24px;
  margin-top: 20px;
  box-shadow: var(--shadow-md);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.result-card:hover {
  box-shadow: var(--shadow-lg);
}

.card-title {
  font-size: 15px;
  color: var(--text-secondary);
  margin-bottom: 16px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 1px;
  padding-bottom: 12px;
  border-bottom: 2px solid rgba(255, 255, 255, 0.05);
}

.card-content {
  min-height: 60px;
}

.error-msg {
  color: var(--color-warning);
  font-size: 15px;
  padding: 16px;
  background: rgba(245, 87, 108, 0.1);
  border-radius: var(--border-radius-sm);
  border-left: 4px solid var(--color-warning);
  display: flex;
  align-items: center;
  gap: 10px;
}
</style>
