<script setup lang="ts">
import { ref, computed } from 'vue'
import { useSolver } from '../composables/useSolver'
import ResultPanel from '../components/ResultPanel.vue'

// 线性方程组状态
const matrixSize = ref(2)
const linearMatrix = ref<number[][]>([[2, 1], [1, -3]])
const linearVector = ref<number[]>([5, -1])
const linearAlgorithm = ref('gaussian')

// 非线性方程状态
const nonLinearExpression = ref('x*x - 4')
const nonLinearAlgorithm = ref('newton')
const guessValue = ref(1)
const intervalA = ref(0)
const intervalB = ref(3)
const maxIterations = ref(1000)
const tolerance = ref(1e-10)

// 结果状态
const linearOutput = ref<{solution: number[], method: string} | null>(null)
const nonLinearOutput = ref<{root: number, iterations: number, method: string} | null>(null)
const err = ref('')
const linearTime = ref<number | null>(null)
const nonLinearTime = ref<number | null>(null)

// 历史记录
const history = ref<Array<{
  type: string
  algorithm: string
  result: string
  time: number
  timestamp: Date
}>>([])

const solver = useSolver()

const updateMatrixSize = (size: number) => {
  matrixSize.value = Math.max(2, Math.min(size, 10))
  linearMatrix.value = Array(matrixSize.value).fill(0).map((_, i) =>
    Array(matrixSize.value).fill(0).map((__, j) => linearMatrix.value[i]?.[j] ?? 0)
  )
  linearVector.value = Array(matrixSize.value).fill(0).map((_, i) => linearVector.value[i] ?? 0)
}

const computeLinear = async () => {
  try {
    err.value = ''
    nonLinearOutput.value = null
    linearTime.value = null
    const startTime = performance.now()
    
    let result
    const matrix = JSON.parse(JSON.stringify(linearMatrix.value))
    const vector = [...linearVector.value]
    
    if (linearAlgorithm.value === 'gaussian') {
      result = await solver.solveLinearGaussian(matrix, vector)
    } else if (linearAlgorithm.value === 'lu') {
      result = await solver.solveLinearLU(matrix, vector)
    } else {
      result = await solver.solveLinear2D(matrix, vector)
    }
    
    linearOutput.value = result
    linearTime.value = performance.now() - startTime
    
    // 添加到历史记录
    history.value.unshift({
      type: '线性方程组',
      algorithm: result.method,
      result: `x = [${result.solution.map(v => v.toFixed(6)).join(', ')}]`,
      time: linearTime.value,
      timestamp: new Date()
    })
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
    
    let result
    
    if (nonLinearAlgorithm.value === 'newton') {
      result = await solver.solveNewton(
        nonLinearExpression.value,
        guessValue.value,
        maxIterations.value,
        tolerance.value
      )
    } else if (nonLinearAlgorithm.value === 'bisection') {
      result = await solver.solveBisection(
        nonLinearExpression.value,
        intervalA.value,
        intervalB.value,
        maxIterations.value,
        tolerance.value
      )
    } else {
      result = await solver.solveSecant(
        nonLinearExpression.value,
        guessValue.value,
        guessValue.value + 0.1,
        maxIterations.value,
        tolerance.value
      )
    }
    
    nonLinearOutput.value = result
    nonLinearTime.value = performance.now() - startTime
    
    // 添加到历史记录
    history.value.unshift({
      type: '非线性方程',
      algorithm: result.method,
      result: `x = ${result.root.toFixed(10)}`,
      time: nonLinearTime.value,
      timestamp: new Date()
    })
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

const clearHistory = () => {
  history.value = []
}
</script>

<template>
  <div style="padding:24px;">
    <h2>
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display: inline-block; vertical-align: middle; margin-right: 10px;">
        <path d="M4 4h16v16H4z"/>
        <path d="M4 12h16"/>
        <path d="M12 4v16"/>
      </svg>
      数值方程求解台 (Numerical Solver)
    </h2>
    
    <div class="solver-layout">
      <!-- 线性方程组 -->
      <div class="box">
        <div class="box-header">
          <h3>线性方程组 Ax = b</h3>
          <div class="algo-selector">
            <select v-model="linearAlgorithm" class="algo-select">
              <option value="gaussian">高斯消元法</option>
              <option value="lu">LU分解</option>
              <option value="cramer">克莱姆法则 (2阶)</option>
            </select>
          </div>
        </div>
        
        <div class="size-control">
          <label>矩阵阶数:</label>
          <input type="number" v-model.number="matrixSize" @change="updateMatrixSize(matrixSize)" min="2" max="10" />
        </div>
        
        <div class="matrix-input">
          <div v-for="i in matrixSize" :key="i" class="matrix-row">
            <span class="row-label">A[{{ i-1 }}]:</span>
            <input 
              v-for="j in matrixSize" 
              :key="j" 
              type="number" 
              v-model.number="linearMatrix[i-1][j-1]"
              class="matrix-cell-input"
            />
            <span class="b-label">b[{{ i-1 }}]:</span>
            <input type="number" v-model.number="linearVector[i-1]" class="vector-input" />
          </div>
        </div>
        
        <button @click="computeLinear" class="solve-btn">求解线性方程组</button>
      </div>

      <!-- 非线性方程 -->
      <div class="box">
        <div class="box-header">
          <h3>非线性方程 f(x) = 0</h3>
          <div class="algo-selector">
            <select v-model="nonLinearAlgorithm" class="algo-select">
              <option value="newton">牛顿法</option>
              <option value="bisection">二分法</option>
              <option value="secant">割线法</option>
            </select>
          </div>
        </div>
        
        <div class="equation-input-wrapper">
          <input 
            type="text" 
            v-model="nonLinearExpression" 
            placeholder="例如: x*x - 4, sin(x) - 0.5"
            class="equation-input"
          />
        </div>
        
        <div class="param-grid">
          <div v-if="nonLinearAlgorithm === 'newton'" class="param-item">
            <label>初始猜测值:</label>
            <input type="number" v-model.number="guessValue" step="0.1" />
          </div>
          <div v-if="nonLinearAlgorithm === 'bisection'" class="param-item">
            <label>区间 [a, b]:</label>
            <input type="number" v-model.number="intervalA" step="0.1" />
            <input type="number" v-model.number="intervalB" step="0.1" />
          </div>
          <div v-if="nonLinearAlgorithm === 'secant'" class="param-item">
            <label>初始猜测值:</label>
            <input type="number" v-model.number="guessValue" step="0.1" />
          </div>
          <div class="param-item">
            <label>最大迭代次数:</label>
            <input type="number" v-model.number="maxIterations" min="1" />
          </div>
          <div class="param-item">
            <label>收敛精度:</label>
            <input type="number" v-model.number="tolerance" step="1e-10" />
          </div>
        </div>
        
        <button @click="computeNonLinear" class="solve-btn">求解非线性方程</button>
      </div>
    </div>

    <!-- 结果输出 -->
    <ResultPanel title="解空间输出" :error="err">
      <!-- 线性方程结果 -->
      <div v-if="linearOutput !== null" class="result-section">
        <div class="result-title">🔵 线性方程组解</div>
        <div class="result-grid">
          <div v-for="(val, idx) in linearOutput.solution" :key="idx" class="result-item">
            <span class="label">x<sub>{{ idx + 1 }}</sub></span>
            <span class="value">{{ val.toFixed(8) }}</span>
          </div>
          <div class="result-item">
            <span class="label">算法</span>
            <span class="value">{{ linearOutput.method }}</span>
          </div>
          <div class="result-item">
            <span class="label">计算耗时</span>
            <span class="value time">{{ linearTime !== null ? linearTime.toFixed(2) + ' ms' : '-' }}</span>
          </div>
        </div>
        <div class="verification">
          验证: {{ linearMatrix[0].map((val, idx) => `${val}×${linearOutput.solution[idx].toFixed(4)}`).join(' + ') }} = {{ linearMatrix[0].reduce((sum, val, idx) => sum + val * linearOutput.solution[idx], 0).toFixed(6) }} ≈ {{ linearVector[0] }}
        </div>
      </div>

      <!-- 非线性方程结果 -->
      <div v-if="nonLinearOutput !== null" class="result-section">
        <div class="result-title">🟢 非线性方程解</div>
        <div class="result-grid">
          <div class="result-item">
            <span class="label">近似根</span>
            <span class="value">{{ nonLinearOutput.root.toFixed(10) }}</span>
          </div>
          <div class="result-item">
            <span class="label">迭代次数</span>
            <span class="value">{{ nonLinearOutput.iterations }}</span>
          </div>
          <div class="result-item">
            <span class="label">算法</span>
            <span class="value">{{ nonLinearOutput.method }}</span>
          </div>
          <div class="result-item">
            <span class="label">计算耗时</span>
            <span class="value time">{{ nonLinearTime !== null ? nonLinearTime.toFixed(2) + ' ms' : '-' }}</span>
          </div>
        </div>
        <div class="verification">验证: f({{ nonLinearOutput.root.toFixed(6) }}) ≈ {{ computeF(nonLinearOutput.root).toExponential(8) }} ≈ 0</div>
      </div>
    </ResultPanel>
    
    <!-- 历史记录 -->
    <div v-if="history.length > 0" class="history-panel">
      <div class="history-header">
        <h3>📜 计算历史</h3>
        <button @click="clearHistory" class="clear-btn">清空历史</button>
      </div>
      <div class="history-list">
        <div v-for="(item, idx) in history" :key="idx" class="history-item">
          <div class="history-info">
            <span class="history-type">{{ item.type }}</span>
            <span class="history-algo">{{ item.algorithm }}</span>
            <span class="history-result">{{ item.result }}</span>
          </div>
          <div class="history-meta">
            <span class="history-time">{{ item.time.toFixed(2) }} ms</span>
            <span class="history-timestamp">{{ item.timestamp.toLocaleTimeString() }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* 主布局 */
h2 {
  font-size: 32px;
  margin-bottom: 30px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  letter-spacing: -0.5px;
}

.solver-layout { 
  display: grid; 
  grid-template-columns: repeat(auto-fit, minmax(500px, 1fr));
  gap: 24px; 
  margin-bottom: 30px;
}

/* 卡片样式 */
.box { 
  background: var(--bg-card);
  padding: 28px; 
  border-radius: var(--border-radius-lg); 
  border: 1px solid var(--border-color);
  box-shadow: var(--shadow-md);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.box:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-lg);
  border-color: rgba(102, 126, 234, 0.3);
}

.box-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 2px solid rgba(255, 255, 255, 0.05);
}

.box h3 {
  margin: 0;
  font-size: 20px;
  color: var(--text-primary);
  font-weight: 600;
}

/* 算法选择器 */
.algo-selector {
  position: relative;
}

.algo-select {
  background: var(--bg-secondary);
  color: var(--text-primary);
  border: 1px solid var(--border-color);
  padding: 8px 16px;
  border-radius: var(--border-radius-sm);
  font-size: 14px;
  cursor: pointer;
  outline: none;
  transition: all 0.2s;
  min-width: 150px;
}

.algo-select:hover {
  border-color: var(--color-primary);
}

.algo-select:focus {
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

/* 尺寸控制 */
.size-control {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 20px;
}

.size-control label {
  color: var(--text-secondary);
  font-size: 14px;
  font-weight: 500;
}

/* 矩阵输入区 */
.matrix-input {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 20px;
  background: var(--bg-secondary);
  padding: 20px;
  border-radius: var(--border-radius);
  border: 1px solid var(--border-color);
}

.matrix-row {
  display: flex;
  align-items: center;
  gap: 10px;
}

.row-label, .b-label {
  color: var(--text-secondary);
  font-size: 13px;
  font-family: 'Courier New', monospace;
  min-width: 60px;
}

.b-label {
  margin-left: 10px;
  color: var(--color-info);
}

/* 参数网格 */
.param-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
  margin-bottom: 20px;
}

.param-item {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.param-item label {
  color: var(--text-secondary);
  font-size: 13px;
  font-weight: 500;
}

/* 输入框通用样式 */
input[type="number"], input[type="text"] {
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  color: var(--text-primary);
  padding: 10px 14px;
  border-radius: var(--border-radius-sm);
  font-size: 14px;
  outline: none;
  transition: all 0.2s;
}

input[type="number"]:focus, input[type="text"]:focus {
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

input[type="number"]:hover, input[type="text"]:hover {
  border-color: rgba(255, 255, 255, 0.2);
}

.matrix-cell-input {
  width: 70px;
  text-align: center;
}

.vector-input {
  width: 90px;
}

.equation-input-wrapper {
  margin-bottom: 20px;
}

.equation-input {
  width: 100%;
  background: var(--bg-secondary);
  border: 2px solid var(--border-color);
  color: var(--text-primary);
  padding: 14px 18px;
  border-radius: var(--border-radius);
  font-size: 15px;
  font-family: 'Courier New', monospace;
  outline: none;
  transition: all 0.2s;
}

.equation-input:focus {
  border-color: var(--color-primary);
  box-shadow: 0 0 0 4px rgba(102, 126, 234, 0.15);
}

.equation-input::placeholder {
  color: var(--text-muted);
}

/* 按钮样式 */
.solve-btn { 
  width: 100%; 
  margin-top: 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none; 
  color: white; 
  padding: 14px 24px; 
  border-radius: var(--border-radius); 
  cursor: pointer;
  font-size: 15px;
  font-weight: 600;
  letter-spacing: 0.5px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
}

.solve-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
}

.solve-btn:active {
  transform: translateY(0);
}

/* 结果区域 */
.result-section {
  margin-bottom: 24px;
  padding: 24px;
  background: var(--bg-secondary);
  border-radius: var(--border-radius);
  border-left: 4px solid var(--color-success);
  box-shadow: var(--shadow-sm);
}

.result-title {
  font-size: 17px;
  font-weight: 600;
  margin-bottom: 16px;
  color: var(--text-primary);
  display: flex;
  align-items: center;
  gap: 8px;
}

.result-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 20px;
  margin-bottom: 16px;
}

.result-item {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 12px;
  background: var(--bg-card);
  border-radius: var(--border-radius-sm);
  border: 1px solid var(--border-color);
}

.result-item .label {
  font-size: 12px;
  color: var(--text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  font-weight: 500;
}

.result-item .value {
  font-size: 18px;
  color: var(--color-success);
  font-weight: 700;
  font-family: 'Courier New', monospace;
}

.result-item .value.time {
  color: var(--color-warning);
  font-size: 16px;
}

.verification {
  font-size: 13px;
  color: var(--text-secondary);
  background: var(--bg-card);
  padding: 12px 16px;
  border-radius: var(--border-radius-sm);
  font-family: 'Courier New', monospace;
  border: 1px solid var(--border-color);
}

/* 历史记录面板 */
.history-panel {
  margin-top: 30px;
  background: var(--bg-card);
  border-radius: var(--border-radius-lg);
  border: 1px solid var(--border-color);
  box-shadow: var(--shadow-md);
  overflow: hidden;
}

.history-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%);
  border-bottom: 1px solid var(--border-color);
}

.history-header h3 {
  margin: 0;
  font-size: 18px;
  color: var(--text-primary);
}

.clear-btn {
  background: rgba(245, 87, 108, 0.1);
  color: var(--color-warning);
  border: 1px solid rgba(245, 87, 108, 0.3);
  padding: 8px 16px;
  border-radius: var(--border-radius-sm);
  cursor: pointer;
  font-size: 13px;
  font-weight: 500;
  transition: all 0.2s;
}

.clear-btn:hover {
  background: rgba(245, 87, 108, 0.2);
  border-color: var(--color-warning);
}

.history-list {
  max-height: 400px;
  overflow-y: auto;
}

.history-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 24px;
  border-bottom: 1px solid var(--border-color);
  transition: background 0.2s;
}

.history-item:last-child {
  border-bottom: none;
}

.history-item:hover {
  background: var(--bg-hover);
}

.history-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
  flex: 1;
}

.history-type {
  font-size: 14px;
  color: var(--text-primary);
  font-weight: 600;
}

.history-algo {
  font-size: 12px;
  color: var(--color-info);
}

.history-result {
  font-size: 13px;
  color: var(--text-secondary);
  font-family: 'Courier New', monospace;
}

.history-meta {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 4px;
}

.history-time {
  font-size: 13px;
  color: var(--color-warning);
  font-weight: 600;
}

.history-timestamp {
  font-size: 11px;
  color: var(--text-muted);
}
</style>
