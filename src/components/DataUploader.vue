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
  border: 2px dashed #444;
  padding: 20px;
  text-align: center;
  border-radius: 6px;
  cursor: pointer;
}
.picker-trigger {
  cursor: pointer;
  color: #d7a3e5;
  font-size: 14px;
}
</style>
