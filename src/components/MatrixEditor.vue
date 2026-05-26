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

defineExpose({
  setData: (data: number[][]) => {
    if (!data || data.length === 0) return
    localRows.value = data.length
    localCols.value = data[0].length
    gridData.value = data.map(row => [...row])
  }
})
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
.matrix-controls {
  display: flex;
  gap: 16px;
  margin-bottom: 12px;
  align-items: center;
}

.matrix-controls label {
  color: var(--text-secondary);
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 500;
}

.matrix-controls input {
  width: 60px;
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  color: var(--text-primary);
  text-align: center;
  border-radius: var(--border-radius-sm);
  padding: 6px 8px;
  font-size: 14px;
  outline: none;
  transition: all 0.2s;
}

.matrix-controls input:focus {
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.matrix-controls input:hover {
  border-color: rgba(255, 255, 255, 0.2);
}

.matrix-grid {
  display: grid;
  gap: 8px;
  background: var(--bg-secondary);
  padding: 16px;
  border-radius: var(--border-radius);
  width: max-content;
  border: 1px solid var(--border-color);
}

.matrix-cell {
  width: 70px;
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  color: var(--text-primary);
  text-align: center;
  padding: 8px 0;
  border-radius: var(--border-radius-sm);
  font-size: 14px;
  outline: none;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.matrix-cell:focus {
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.15);
  background: var(--bg-hover);
}

.matrix-cell:hover:not(:focus) {
  border-color: rgba(255, 255, 255, 0.2);
}
</style>
