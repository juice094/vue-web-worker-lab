<script setup lang="ts">
import { ref, watch, computed } from 'vue'

const MAX_DIM = 10

const props = defineProps<{ rows?: number; cols?: number }>()
const emit = defineEmits(['update'])

const localRows = ref(Math.min(props.rows ?? 3, MAX_DIM))
const localCols = ref(Math.min(props.cols ?? 3, MAX_DIM))

const gridData = ref<number[][]>(
  Array(localRows.value).fill(0).map(() => Array(localCols.value).fill(0))
)

const clamp = (v: number) => Math.max(1, Math.min(v, MAX_DIM))

watch([() => props.rows, () => props.cols], () => {
  const r = clamp(props.rows ?? 3)
  const c = clamp(props.cols ?? 3)
  localRows.value = r
  localCols.value = c
  gridData.value = Array(r).fill(0).map(() => Array(c).fill(0))
}, { immediate: true })

watch(gridData, () => {
  emit('update', gridData.value)
}, { deep: true, immediate: true })

const updateRows = (v: number) => {
  const r = clamp(v)
  localRows.value = r
  gridData.value = Array(r).fill(0).map((_, ri) =>
    Array(localCols.value).fill(0).map((__, ci) =>
      gridData.value[ri]?.[ci] ?? 0
    )
  )
}

const updateCols = (v: number) => {
  const c = clamp(v)
  localCols.value = c
  gridData.value = gridData.value.map(row =>
    Array(c).fill(0).map((_, ci) => row[ci] ?? 0)
  )
}

const gridStyle = computed(() => ({
  gridTemplateColumns: `repeat(${localCols.value}, 70px)`
}))
</script>

<template>
  <div class="matrix-controls">
    <label>行: <input type="number" :value="localRows" @input="e => updateRows(Number((e.target as HTMLInputElement).value))" min="1" :max="MAX_DIM" /></label>
    <label>列: <input type="number" :value="localCols" @input="e => updateCols(Number((e.target as HTMLInputElement).value))" min="1" :max="MAX_DIM" /></label>
  </div>
  <div class="matrix-grid" :style="gridStyle">
    <template v-for="(row, rIdx) in gridData" :key="rIdx">
      <input
        v-for="(_, cIdx) in row"
        :key="cIdx"
        type="number"
        v-model.number="gridData[rIdx][cIdx]"
        class="matrix-cell"
      />
    </template>
  </div>
</template>

<style scoped>
.matrix-grid {
  display: grid;
  gap: 6px;
  background-color: #252525;
  padding: 8px;
  border-radius: 4px;
  width: max-content;
}
.matrix-cell {
  width: 70px;
  background-color: #333333;
  border: 1px solid #444444;
  color: white;
  text-align: center;
  padding: 6px 0;
  border-radius: 3px;
}
.matrix-controls {
  display: flex;
  gap: 12px;
  margin-bottom: 8px;
  align-items: center;
}
.matrix-controls label {
  color: #ccc;
  font-size: 13px;
  display: flex;
  align-items: center;
  gap: 4px;
}
.matrix-controls input {
  width: 50px;
  background: #333;
  border: 1px solid #555;
  color: white;
  text-align: center;
  border-radius: 3px;
  padding: 3px;
}
</style>
