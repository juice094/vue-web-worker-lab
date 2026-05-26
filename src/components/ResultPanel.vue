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
  background-color: #2b2b2b;
  border-radius: 6px;
  border: 1px solid #3c3c3c;
  padding: 16px;
  margin-top: 15px;
}
.card-title {
  font-size: 13px;
  color: #b5b5b5;
  margin-bottom: 10px;
  font-weight: 600;
  text-transform: uppercase;
}
.error-msg {
  color: #ff6b6b;
  font-size: 14px;
}
</style>
