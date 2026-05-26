<script setup lang="ts">
import { ref } from 'vue'
import { useWorker } from '../composables/useWorker'

const currentInput = ref('0')
const formulaTrack = ref('')
const { run } = useWorker(new URL('../workers/calc.worker.ts', import.meta.url))

const pressToken = (tok: string) => {
  if (currentInput.value === '0' && tok !== '.') currentInput.value = tok
  else currentInput.value += tok
}

const clearAll = () => {
  currentInput.value = '0'
  formulaTrack.value = ''
}

const dropLast = () => {
  if (currentInput.value.length > 1) currentInput.value = currentInput.value.slice(0, -1)
  else currentInput.value = '0'
}

const commitCompute = async () => {
  try {
    formulaTrack.value = currentInput.value + ' ='
    const finalAns = await run<number>('evaluate', currentInput.value)
    currentInput.value = String(finalAns)
  } catch (err) {
    currentInput.value = 'Error'
  }
}

const applyFunction = async (func: string) => {
  try {
    const val = parseFloat(currentInput.value)
    if (isNaN(val)) return
    const expr = func.replace('x', `(${val})`)
    formulaTrack.value = `${func}(${val}) =`
    const res = await run<number>('evaluate', expr)
    currentInput.value = String(res)
  } catch (err) {
    currentInput.value = 'Error'
  }
}
</script>

<template>
  <div class="calculator-module">
    <div class="module-title">
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display: inline-block; vertical-align: middle; margin-right: 10px;">
        <rect x="4" y="2" width="16" height="20" rx="2"/>
        <line x1="8" y1="6" x2="16" y2="6"/>
        <line x1="8" y1="10" x2="8" y2="10.01"/>
        <line x1="12" y1="10" x2="12" y2="10.01"/>
        <line x1="16" y1="10" x2="16" y2="10.01"/>
        <line x1="8" y1="14" x2="8" y2="14.01"/>
        <line x1="12" y1="14" x2="12" y2="14.01"/>
        <line x1="16" y1="14" x2="16" y2="14.01"/>
        <line x1="8" y1="18" x2="8" y2="18.01"/>
        <line x1="12" y1="18" x2="12" y2="18.01"/>
        <line x1="16" y1="18" x2="16" y2="18.01"/>
      </svg>
      标准计算器
    </div>
    <div class="screen-deck">
      <div class="track-line">{{ formulaTrack }}</div>
      <div 
        class="output-line" 
        :data-length="currentInput.length > 12 ? 'long' : 'normal'"
      >
        {{ currentInput }}
      </div>
    </div>
    <div class="memory-ribbon">
      <span>MC</span><span>MR</span><span>M+</span><span>M-</span><span>MS</span>
    </div>
    <div class="buttons-grid">
      <button @click="clearAll" class="op-btn">%</button>
      <button @click="clearAll" class="op-btn">CE</button>
      <button @click="clearAll" class="op-btn">C</button>
      <button @click="dropLast" class="op-btn">⌫</button>

      <button @click="applyFunction('1/x')" class="op-btn">1/x</button>
      <button @click="applyFunction('x**2')" class="op-btn">x²</button>
      <button @click="applyFunction('Math.sqrt(x)')" class="op-btn">√x</button>
      <button @click="pressToken('÷')" class="op-btn">÷</button>

      <button @click="pressToken('7')" class="num-btn">7</button>
      <button @click="pressToken('8')" class="num-btn">8</button>
      <button @click="pressToken('9')" class="num-btn">9</button>
      <button @click="pressToken('×')" class="op-btn">×</button>

      <button @click="pressToken('4')" class="num-btn">4</button>
      <button @click="pressToken('5')" class="num-btn">5</button>
      <button @click="pressToken('6')" class="num-btn">6</button>
      <button @click="pressToken('-')" class="op-btn">−</button>

      <button @click="pressToken('1')" class="num-btn">1</button>
      <button @click="pressToken('2')" class="num-btn">2</button>
      <button @click="pressToken('3')" class="num-btn">3</button>
      <button @click="pressToken('+')" class="op-btn">+</button>

      <button class="num-btn">+/-</button>
      <button @click="pressToken('0')" class="num-btn">0</button>
      <button @click="pressToken('.')" class="num-btn">.</button>
      <button @click="commitCompute" class="equal-btn">=</button>
    </div>
  </div>
</template>

<style scoped>
.calculator-module {
  padding: 32px;
  display: flex;
  flex-direction: column;
  height: calc(100vh - 48px);
  max-width: 500px;
  margin: 0 auto;
}

.module-title { 
  font-size: 28px; 
  font-weight: 700;
  margin-bottom: 24px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  letter-spacing: -0.5px;
}

.screen-deck { 
  text-align: right; 
  padding: 28px 20px; 
  background: var(--bg-card);
  border-radius: var(--border-radius-lg);
  box-shadow: var(--shadow-md);
  border: 1px solid var(--border-color);
  margin-bottom: 20px;
}

.track-line { 
  font-size: 16px; 
  color: var(--text-secondary); 
  min-height: 24px;
  margin-bottom: 8px;
}

.output-line { 
  font-size: clamp(24px, 8vw, 52px);
  font-weight: 700; 
  color: var(--text-primary);
  letter-spacing: -1px;
  overflow-wrap: break-word;
  word-break: break-all;
  line-height: 1.2;
  max-width: 100%;
  transition: font-size 0.2s ease;
}

.output-line[data-length="long"] {
  font-size: clamp(18px, 5vw, 32px);
}

.memory-ribbon { 
  display: flex; 
  gap: 20px; 
  color: var(--text-muted); 
  font-size: 13px; 
  margin-bottom: 16px; 
  padding-left: 8px;
}

.buttons-grid { 
  display: grid; 
  grid-template-columns: repeat(4, 1fr); 
  gap: 12px; 
  flex: 1;
}

button { 
  border: none; 
  font-size: 18px; 
  color: white; 
  border-radius: var(--border-radius-sm); 
  cursor: pointer;
  transition: all 0.15s cubic-bezier(0.4, 0, 0.2, 1);
  font-weight: 500;
  box-shadow: var(--shadow-sm);
}

button:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

button:active {
  transform: translateY(0);
}

.num-btn { 
  background: var(--bg-card);
  border: 1px solid var(--border-color);
}

.num-btn:hover { 
  background: var(--bg-hover);
  border-color: rgba(255, 255, 255, 0.15);
}

.op-btn { 
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.2) 0%, rgba(118, 75, 162, 0.2) 100%);
  border: 1px solid rgba(102, 126, 234, 0.3);
  color: var(--color-primary);
  font-weight: 600;
}

.op-btn:hover { 
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.3) 0%, rgba(118, 75, 162, 0.3) 100%);
  border-color: var(--color-primary);
}

.equal-btn { 
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #ffffff;
  font-weight: 700;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
}

.equal-btn:hover { 
  box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
  filter: brightness(1.1);
}
</style>
