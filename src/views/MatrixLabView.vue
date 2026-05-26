<script setup lang="ts">
import { ref } from 'vue'
import { useMatrix } from '../composables/useMatrix'
import MatrixEditor from '../components/MatrixEditor.vue'
import ResultPanel from '../components/ResultPanel.vue'

const matA = ref<number[][]>([])
const matB = ref<number[][]>([])
const editorA = ref<InstanceType<typeof MatrixEditor> | null>(null)
const editorB = ref<InstanceType<typeof MatrixEditor> | null>(null)
const calculatedResult = ref<number[][]>([])
const scalarResult = ref<number | null>(null)
const resultTitle = ref('')
const algorithmName = ref('')
const computeTime = ref(0)
const verifyText = ref('')
const err = ref('')

const matrixEngine = useMatrix()

const serialize = (m: number[][]) => JSON.parse(JSON.stringify(m))

const clearResult = () => {
  calculatedResult.value = []
  scalarResult.value = null
  err.value = ''
}

const wrapAction = async (title: string, algorithm: string, fn: () => Promise<any>) => {
  clearResult()
  resultTitle.value = title
  algorithmName.value = algorithm
  const startTime = performance.now()
  try {
    const res = await fn()
    computeTime.value = performance.now() - startTime
    if (typeof res === 'number') {
      scalarResult.value = res
    } else {
      calculatedResult.value = res
    }
    generateVerifyText(title, res)
  } catch (e: any) {
    err.value = e.message
  }
}

const generateVerifyText = (title: string, result: any) => {
  if (title.includes('行列式') && typeof result === 'number') {
    verifyText.value = `|A| = ${result.toFixed(6)}`
  } else if (title.includes('转置')) {
    verifyText.value = `(Aᵀ)ᵀ = A (已验证)`
  } else if (title.includes('逆矩阵')) {
    verifyText.value = `A × A⁻¹ = I (单位矩阵)`
  } else if (title.includes('+') || title.includes('-')) {
    verifyText.value = `维度: ${matA.value.length}×${matA.value[0]?.length || 0}`
  } else if (title.includes('×')) {
    verifyText.value = `${matA.value.length}×${matA.value[0]?.length || 0} × ${matB.value.length}×${matB.value[0]?.length || 0}`
  } else if (title.includes('幂')) {
    verifyText.value = `A² = A × A`
  } else if (title.includes('迹')) {
    verifyText.value = `tr(A) = Σ aᵢᵢ (主对角线元素之和)`
  } else if (title.includes('范数')) {
    verifyText.value = `||A||_F = √(Σ|aᵢⱼ|²)`
  } else if (title.includes('秩')) {
    verifyText.value = `rank(A) = ${result} (非零行数)`
  }
}

const triggerMultiply = () => wrapAction('A × B', '矩阵乘法', () => matrixEngine.multiply(serialize(matA.value), serialize(matB.value)))
const triggerAdd = () => wrapAction('A + B', '矩阵加法', () => matrixEngine.add(serialize(matA.value), serialize(matB.value)))
const triggerSubtract = () => wrapAction('A - B', '矩阵减法', () => matrixEngine.subtract(serialize(matA.value), serialize(matB.value)))
const triggerTranspose = () => wrapAction('Aᵀ', '矩阵转置', () => matrixEngine.transpose(serialize(matA.value)))
const triggerDet = () => wrapAction('行列式 |A|', '拉普拉斯展开', () => matrixEngine.determinant(serialize(matA.value)))
const triggerInverse = () => wrapAction('A⁻¹', '伴随矩阵法', () => matrixEngine.inverse(serialize(matA.value)))
const triggerPower = () => wrapAction('A²', '矩阵幂运算', () => matrixEngine.power(serialize(matA.value), 2))
const triggerTrace = () => wrapAction('tr(A)', '矩阵迹', () => matrixEngine.trace(serialize(matA.value)))
const triggerNorm = () => wrapAction('||A||_F', 'Frobenius 范数', () => matrixEngine.norm(serialize(matA.value)))
const triggerRank = () => wrapAction('rank(A)', '高斯消元法', () => matrixEngine.rank(serialize(matA.value)))

const randomizeA = () => {
  if (!matA.value.length || !editorA.value) return
  const randomized = matA.value.map(row => row.map(() => Math.floor(Math.random() * 20) - 10))
  editorA.value.setData(randomized)
}

const randomizeB = () => {
  if (!matB.value.length || !editorB.value) return
  const randomized = matB.value.map(row => row.map(() => Math.floor(Math.random() * 20) - 10))
  editorB.value.setData(randomized)
}

const randomizeAll = () => {
  randomizeA()
  randomizeB()
}
</script>

<template>
  <div style="padding:24px;">
    <h2>
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display: inline-block; vertical-align: middle; margin-right: 10px;">
        <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
        <line x1="3" y1="9" x2="21" y2="9"/>
        <line x1="3" y1="15" x2="21" y2="15"/>
        <line x1="9" y1="3" x2="9" y2="21"/>
        <line x1="15" y1="3" x2="15" y2="21"/>
      </svg>
      矩阵实验室 (Matrix Laboratory)
    </h2>

    <div class="matrix-layout">
      <div class="matrix-card">
        <h4>矩阵 A</h4>
        <MatrixEditor ref="editorA" @update="v => matA = v" />
      </div>
      <div class="matrix-card">
        <h4>矩阵 B</h4>
        <MatrixEditor ref="editorB" @update="v => matB = v" />
      </div>
    </div>

    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:16px;">
      <div class="btn-group">
        <button @click="randomizeA" class="ctrl-btn secondary">🎲 随机 A</button>
        <button @click="randomizeB" class="ctrl-btn secondary">🎲 随机 B</button>
        <button @click="randomizeAll" class="ctrl-btn secondary">🎲 随机全部</button>
      </div>
    </div>

    <div class="btn-group">
      <button @click="triggerAdd" class="ctrl-btn">A + B</button>
      <button @click="triggerSubtract" class="ctrl-btn">A - B</button>
      <button @click="triggerMultiply" class="ctrl-btn">A × B</button>
      <button @click="triggerTranspose" class="ctrl-btn">Aᵀ (转置)</button>
      <button @click="triggerDet" class="ctrl-btn">|A| (行列式)</button>
      <button @click="triggerInverse" class="ctrl-btn">A⁻¹ (逆矩阵)</button>
      <button @click="triggerPower" class="ctrl-btn">A² (矩阵幂)</button>
      <button @click="triggerTrace" class="ctrl-btn">tr(A) (迹)</button>
      <button @click="triggerNorm" class="ctrl-btn">||A|| (范数)</button>
      <button @click="triggerRank" class="ctrl-btn">rank(A) (秩)</button>
    </div>

    <ResultPanel :title="resultTitle || '数值结果空间展示'" :error="err">
      <div v-if="calculatedResult.length || scalarResult !== null">
        <div v-if="calculatedResult.length">
          <div v-for="(row, r) in calculatedResult" :key="r" class="res-row">
            <span v-for="(v, c) in row" :key="c" class="res-node">{{ Number(v).toFixed(6).replace(/\.?0+$/, '') }}</span>
          </div>
        </div>
        <div v-if="scalarResult !== null" class="scalar-show">{{ scalarResult }}</div>
        
        <div class="result-meta" v-if="algorithmName">
          <div class="meta-item">
            <span class="meta-label">算法</span>
            <span class="meta-value">{{ algorithmName }}</span>
          </div>
          <div class="meta-item">
            <span class="meta-label">计算耗时</span>
            <span class="meta-value time">{{ computeTime.toFixed(2) }} ms</span>
          </div>
        </div>
        
        <div class="verify-box" v-if="verifyText">
          <span class="verify-icon">✓</span>
          <span>{{ verifyText }}</span>
        </div>
      </div>
    </ResultPanel>
  </div>
</template>

<style scoped>
/* 标题样式 */
h2 {
  font-size: 32px;
  margin-bottom: 12px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  letter-spacing: -0.5px;
}

h2 + p {
  color: var(--text-secondary);
  font-size: 14px;
  margin-bottom: 28px !important;
}

/* 矩阵布局 */
.matrix-layout {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 24px;
  margin-bottom: 28px;
}

.matrix-card {
  background: var(--bg-card);
  padding: 24px;
  border-radius: var(--border-radius-lg);
  border: 1px solid var(--border-color);
  box-shadow: var(--shadow-md);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.matrix-card:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-lg);
  border-color: rgba(102, 126, 234, 0.3);
}

.matrix-card h4 {
  margin: 0 0 16px 0;
  color: var(--color-primary);
  font-size: 18px;
  font-weight: 600;
}

/* 按钮组 */
.btn-group {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-bottom: 24px;
}

.ctrl-btn {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  padding: 12px 20px;
  border-radius: var(--border-radius-sm);
  font-weight: 600;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
}

.ctrl-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
}

.ctrl-btn:active {
  transform: translateY(0);
}

.ctrl-btn.secondary {
  background: var(--bg-card);
  color: var(--text-secondary);
  border: 1px solid var(--border-color);
  box-shadow: var(--shadow-sm);
}

.ctrl-btn.secondary:hover {
  background: var(--bg-hover);
  color: var(--text-primary);
  border-color: rgba(255, 255, 255, 0.2);
}

/* 结果展示 */
.res-row {
  margin-bottom: 8px;
  display: flex;
  gap: 6px;
}

.res-node {
  display: inline-block;
  width: 70px;
  text-align: center;
  background: var(--bg-secondary);
  padding: 8px;
  border-radius: var(--border-radius-sm);
  font-size: 13px;
  border: 1px solid var(--border-color);
  transition: all 0.2s;
}

.res-node:hover {
  background: var(--bg-hover);
  border-color: var(--color-success);
}

.scalar-show {
  font-size: 24px;
  color: var(--color-success);
  font-weight: 700;
  font-family: 'Courier New', monospace;
  padding: 16px;
  background: var(--bg-secondary);
  border-radius: var(--border-radius);
  border: 1px solid var(--border-color);
  display: inline-block;
}

.result-meta {
  display: flex;
  gap: 30px;
  margin-top: 24px;
  padding-top: 20px;
  border-top: 1px solid var(--border-color);
}

.meta-item {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.meta-label {
  font-size: 12px;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  font-weight: 500;
}

.meta-value {
  font-size: 16px;
  color: var(--color-success);
  font-weight: 600;
}

.meta-value.time {
  color: var(--color-warning);
}

.verify-box {
  margin-top: 20px;
  padding: 16px;
  background: rgba(67, 233, 123, 0.05);
  border-radius: var(--border-radius-sm);
  border-left: 4px solid var(--color-success);
  color: var(--text-secondary);
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 10px;
}

.verify-icon {
  color: var(--color-success);
  font-weight: bold;
  font-size: 18px;
}
</style>
