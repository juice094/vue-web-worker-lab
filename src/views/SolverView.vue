<script setup lang="ts">
import { ref } from 'vue'
import { useSolver } from '../composables/useSolver'
import EquationInput from '../components/EquationInput.vue'
import ResultPanel from '../components/ResultPanel.vue'

const linearMatrix = ref([[2, 1], [1, -3]])
const linearVector = ref([5, -1])
const nonLinearExpression = ref('x*x - 4')
const guessValue = ref(1)

const linearOutput = ref<{x: number, y: number} | null>(null)
const nonLinearOutput = ref<{root: number, iterations: number} | null>(null)
const err = ref('')
const linearTime = ref<number | null>(null)
const nonLinearTime = ref<number | null>(null)

const solver = useSolver()

const computeLinear = async () => {
  try {
    err.value = ''
    nonLinearOutput.value = null
    linearTime.value = null
    const startTime = performance.now()
    // 采用深拷贝打破响应式追踪传给 Worker
    linearOutput.value = await solver.solveLinear(
      JSON.parse(JSON.stringify(linearMatrix.value)), 
      [...linearVector.value]
    )
    linearTime.value = performance.now() - startTime
  } catch (e: any) {
    err.value = e.message
  }
}

const computeNonLinear = async () => {
  try {
    err.value = ''
    linearOutput.value = null
    nonLinearTime.value = null
    const startTime = performance.now()
    nonLinearOutput.value = await solver.solveNonLinear(nonLinearExpression.value, guessValue.value)
    nonLinearTime.value = performance.now() - startTime
  } catch (e: any) {
    err.value = e.message
  }
}

const computeF = (x: number): number => {
  try {
    const f = new Function('x', `with(Math) { return ${nonLinearExpression.value}; }`)
    return f(x)
  } catch {
    return NaN
  }
}
</script>

<template>
  <div style="padding:24px;">
    <h2>📐 数值方程求解台</h2>
    <div class="solver-layout">
      <!-- 线性方程组 -->
      <div class="box">
        <h3>线性方程组 Ax = b <span class="algo-tag">克莱姆法则</span></h3>
        <div class="matrix-input">
          <div class="matrix-row">
            <label>A[0]:</label>
            <input type="number" v-model.number="linearMatrix[0][0]"/>
            <input type="number" v-model.number="linearMatrix[0][1]"/>
            <label>b[0]:</label>
            <input type="number" v-model.number="linearVector[0]"/>
          </div>
          <div class="matrix-row">
            <label>A[1]:</label>
            <input type="number" v-model.number="linearMatrix[1][0]"/>
            <input type="number" v-model.number="linearMatrix[1][1]"/>
            <label>b[1]:</label>
            <input type="number" v-model.number="linearVector[1]"/>
          </div>
        </div>
        <button @click="computeLinear" class="solve-btn">求解线性向量</button>
      </div>

      <!-- 非线性方程 -->
      <div class="box">
        <h3>非线性方程 f(x) = 0 <span class="algo-tag">割线法</span></h3>
        <EquationInput v-model="nonLinearExpression" />
        <div class="param-row">
          <label>初始估算迭代点:</label>
          <input type="number" v-model.number="guessValue" step="0.1" />
        </div>
        <button @click="computeNonLinear" class="solve-btn">牛顿割线迭代求解</button>
      </div>
    </div>

    <!-- 结果输出 -->
    <ResultPanel title="解空间输出" :error="err">
      <!-- 线性方程结果 -->
      <div v-if="linearOutput !== null" class="result-section">
        <div class="result-title">🔵 线性方程组解</div>
        <div class="result-grid">
          <div class="result-item">
            <span class="label">x₁</span>
            <span class="value">{{ linearOutput.x.toFixed(8) }}</span>
          </div>
          <div class="result-item">
            <span class="label">x₂</span>
            <span class="value">{{ linearOutput.y.toFixed(8) }}</span>
          </div>
          <div class="result-item">
            <span class="label">算法</span>
            <span class="value">Cramer's Rule</span>
          </div>
          <div class="result-item">
            <span class="label">计算耗时</span>
            <span class="value time">{{ linearTime !== null ? linearTime.toFixed(2) + ' ms' : '-' }}</span>
          </div>
        </div>
        <div class="verification">验证: {{ linearMatrix[0][0] }}×{{ linearOutput.x.toFixed(4) }} + {{ linearMatrix[0][1] }}×{{ linearOutput.y.toFixed(4) }} = {{ (linearMatrix[0][0]*linearOutput.x + linearMatrix[0][1]*linearOutput.y).toFixed(6) }} ≈ {{ linearVector[0] }}</div>
      </div>

      <!-- 非线性方程结果 -->
      <div v-if="nonLinearOutput !== null" class="result-section">
        <div class="result-title">🟢 非线性方程解</div>
        <div class="result-grid">
          <div class="result-item">
            <span class="label">近似根</span>
            <span class="value">{{ nonLinearOutput.root.toFixed(8) }}</span>
          </div>
          <div class="result-item">
            <span class="label">迭代次数</span>
            <span class="value">{{ nonLinearOutput.iterations }}</span>
          </div>
          <div class="result-item">
            <span class="label">算法</span>
            <span class="value">Secant Method</span>
          </div>
          <div class="result-item">
            <span class="label">计算耗时</span>
            <span class="value time">{{ nonLinearTime !== null ? nonLinearTime.toFixed(2) + ' ms' : '-' }}</span>
          </div>
        </div>
        <div class="verification">验证: f({{ nonLinearOutput.root.toFixed(4) }}) ≈ {{ computeF(nonLinearOutput.root).toFixed(10) }} ≈ 0</div>
      </div>
    </ResultPanel>
  </div>
</template>

<style scoped>
.solver-layout { display: flex; gap: 20px; margin-bottom: 20px; }
.box { 
  background: #2a2a2a; 
  padding: 20px; 
  border-radius: 8px; 
  flex: 1;
  border: 1px solid #3a3a3a;
}
.box h3 {
  margin: 0 0 15px 0;
  font-size: 16px;
  display: flex;
  align-items: center;
  gap: 10px;
}
.algo-tag {
  font-size: 11px;
  background: #4a4a4a;
  color: #85e3b3;
  padding: 2px 8px;
  border-radius: 4px;
  font-weight: normal;
}
.matrix-input {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 15px;
}
.matrix-row {
  display: flex;
  align-items: center;
  gap: 8px;
}
.matrix-row label {
  min-width: 40px;
  color: #aaa;
  font-size: 14px;
}
.param-row {
  display: flex;
  align-items: center;
  gap: 10px;
  margin: 10px 0;
}
.param-row label {
  color: #aaa;
  font-size: 14px;
}
.solve-btn { 
  width: 100%; 
  margin-top: 15px; 
  background: #4a4a4a; 
  border: none; 
  color: white; 
  padding: 10px; 
  border-radius: 6px; 
  cursor: pointer;
  font-size: 14px;
  transition: background 0.2s;
}
.solve-btn:hover {
  background: #5a5a5a;
}
input[type="number"] { 
  width: 60px; 
  background: #333; 
  border: 1px solid #505050; 
  color: white; 
  text-align: center;
  padding: 5px;
  border-radius: 4px;
}
.result-section {
  margin-bottom: 20px;
  padding: 15px;
  background: #1e1e1e;
  border-radius: 6px;
  border-left: 3px solid #85e3b3;
}
.result-title {
  font-size: 15px;
  font-weight: 600;
  margin-bottom: 12px;
  color: #e0e0e0;
}
.result-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 15px;
  margin-bottom: 12px;
}
.result-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.result-item .label {
  font-size: 12px;
  color: #888;
}
.result-item .value {
  font-size: 16px;
  color: #85e3b3;
  font-weight: 600;
  font-family: 'Courier New', monospace;
}
.result-item .value.time {
  color: #d7a3e5;
  font-size: 14px;
}
.verification {
  font-size: 13px;
  color: #aaa;
  background: #2a2a2a;
  padding: 8px 12px;
  border-radius: 4px;
  font-family: 'Courier New', monospace;
}
</style>
