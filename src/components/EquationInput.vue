<script setup lang="ts">
defineProps<{ modelValue: string; placeholder?: string }>()
defineEmits(['update:modelValue'])
</script>

<template>
  <input 
    type="text" 
    :value="modelValue" 
    @input="$emit('update:modelValue', ($event.target as HTMLInputElement).value)"
    :placeholder="placeholder"
    class="raw-input"
  />
</template>

<style scoped>
.raw-input {
  background: var(--bg-secondary);
  border: 2px solid var(--border-color);
  color: var(--text-primary);
  padding: 12px 16px;
  border-radius: var(--border-radius-sm);
  font-size: 15px;
  font-family: 'Courier New', monospace;
  outline: none;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  width: 100%;
}

.raw-input:focus {
  border-color: var(--color-info);
  box-shadow: 0 0 0 4px rgba(79, 172, 254, 0.15);
}

.raw-input:hover {
  border-color: rgba(255, 255, 255, 0.2);
}

.raw-input::placeholder {
  color: var(--text-muted);
}
</style>
