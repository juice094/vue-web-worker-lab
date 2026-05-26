<script setup lang="ts">
const emit = defineEmits(['loaded'])

const handleFile = (e: Event) => {
  const target = e.target as HTMLInputElement
  if (target.files && target.files[0]) {
    const reader = new FileReader()
    reader.onload = () => {
      const txt = reader.result as string
      const parsedNumbers = txt.split(/[\s,]+/).map(Number).filter(n => !isNaN(n))
      emit('loaded', parsedNumbers)
    }
    reader.readAsText(target.files[0])
  }
}
</script>

<template>
  <div class="upload-zone">
    <input type="file" accept=".txt,.csv" @change="handleFile" id="file-picker" hidden />
    <label for="file-picker" class="picker-trigger">📂 点击导入局部数据文件 (.txt/.csv)</label>
  </div>
</template>

<style scoped>
.upload-zone {
  border: 2px dashed var(--border-color);
  padding: 32px 24px;
  text-align: center;
  border-radius: var(--border-radius-lg);
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  background: var(--bg-card);
}

.upload-zone:hover {
  border-color: var(--color-success);
  background: rgba(67, 233, 123, 0.05);
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

.picker-trigger {
  cursor: pointer;
  color: var(--text-secondary);
  font-size: 15px;
  font-weight: 500;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.upload-zone:hover .picker-trigger {
  color: var(--color-success);
}
</style>
