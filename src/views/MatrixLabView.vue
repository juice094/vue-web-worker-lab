<script setup lang="ts">
import { ref } from 'vue'
import { useMatrix } from '../composables/useMatrix'
import MatrixEditor from '../components/MatrixEditor.vue'
import ResultPanel from '../components/ResultPanel.vue'

const matA = ref<number[][]>([])
const matB = ref<number[][]>([])
const calculatedResult = ref<number[][]>([])
const scalarResult = ref<number | null>(null)
const resultTitle = ref('')
const err = ref('')

const matrixEngine = useMatrix()

const serialize = (m: number[][]) => JSON.parse(JSON.stringify(m))

const clearResult = () => {
  calculatedResult.value = []
  scalarResult.value = null
  err.value = ''
}

const wrapAction = async (title: string, fn: () => Promise<any>) => {
  clearResult()
  resultTitle.value = title
  try {
    const res = await fn()
    if (typeof res === 'number') {
      scalarResult.value = res
    } else {
      calculatedResult.value = res
    }
  } catch (e: any) {
    err.value = e.message
  }
}

const triggerMultiply = () => wrapAction('A × B', () => matrixEngine.multiply(serialize(matA.value), serialize(matB.value)))
const triggerAdd = () => wrapAction('A + B', () => matrixEngine.add(serialize(matA.value), serialize(matB.value)))
const triggerSubtract = () => wrapAction('A - B', () => matrixEngine.subtract(serialize(matA.value), serialize(matB.value)))
const triggerTranspose = () => wrapAction('Aᵀ', () => matrixEngine.transpose(serialize(matA.value)))
const triggerDet = () => wrapAction('行列式 |A|', () => matrixEngine.determinant(serialize(matA.value)))
const triggerInverse = () => wrapAction('A⁻¹', () => matrixEngine.inverse(serialize(matA.value)))
</script>

<template>
  <div style="padding:24px;">
    <h2>🧮 矩阵实验室 (Matrix Laboratory)</h2>
    <p style="color:#aaa; margin-top:-8px; margin-bottom:16px;">支持 1×1 ~ 10×10 自定义矩阵，计算超过 5 秒自动中断</p>

    <div class="matrix-layout">
      <div class="matrix-card">
        <h4>矩阵 A</h4>
        <MatrixEditor @update="v => matA = v" />
      </div>
      <div class="matrix-card">
        <h4>矩阵 B</h4>
        <MatrixEditor @update="v => matB = v" />
      </div>
    </div>

    <div class="btn-group">
      <button @click="triggerAdd" class="ctrl-btn">A + B</button>
      <button @click="triggerSubtract" class="ctrl-btn">A - B</button>
      <button @click="triggerMultiply" class="ctrl-btn">A × B</button>
      <button @click="triggerTranspose" class="ctrl-btn">Aᵀ (转置)</button>
      <button @click="triggerDet" class="ctrl-btn">|A| (行列式)</button>
      <button @click="triggerInverse" class="ctrl-btn">A⁻¹ (逆矩阵)</button>
    </div>

    <ResultPanel :title="resultTitle || '数值结果空间展示'" :error="err">
      <div v-if="calculatedResult.length">
        <div v-for="(row, r) in calculatedResult" :key="r" class="res-row">
          <span v-for="(v, c) in row" :key="c" class="res-node">{{ Number(v).toFixed(4).replace(/\.?0+$/, '') }}</span>
        </div>
      </div>
      <div v-if="scalarResult !== null" class="scalar-show">{{ scalarResult }}</div>
    </ResultPanel>
  </div>
</template>

<style scoped>
.matrix-layout {
  display: flex;
  gap: 30px;
  margin-bottom: 20px;
  flex-wrap: wrap;
}
.matrix-card h4 {
  margin: 0 0 8px 0;
  color: #d7a3e5;
}
.btn-group {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 20px;
}
.ctrl-btn {
  background: #d7a3e5;
  color: black;
  border: none;
  padding: 10px 16px;
  border-radius: 4px;
  font-weight: 600;
  cursor: pointer;
}
.ctrl-btn:hover {
  opacity: 0.9;
}
.res-row {
  margin-bottom: 6px;
}
.res-node {
  display: inline-block;
  width: 70px;
  text-align: center;
  background: #333;
  margin-right: 5px;
  padding: 5px;
  border-radius: 3px;
  font-size: 13px;
}
.scalar-show {
  font-size: 18px;
  color: #85e3b3;
}
</style>
