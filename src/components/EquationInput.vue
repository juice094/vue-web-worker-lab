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
  background-color: #333333;
  border: 1px solid #444444;
  color: white;
  padding: 10px;
  border-radius: 4px;
  font-size: 14px;
  font-family: monospace;
}
</style>
