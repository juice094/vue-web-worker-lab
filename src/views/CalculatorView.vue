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
    <div class="module-title">≡ 标准计算器</div>
    <div class="screen-deck">
      <div class="track-line">{{ formulaTrack }}</div>
      <div class="output-line">{{ currentInput }}</div>
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
  padding: 24px;
  display: flex;
  flex-direction: column;
  height: calc(100vh - 48px);
}
.module-title { font-size: 20px; font-weight: 500; margin-bottom: 20px;}
.screen-deck { text-align: right; padding: 20px 10px; background-color: #202020; }
.track-line { font-size: 15px; color: #888888; min-height: 20px; }
.output-line { font-size: 46px; font-weight: 700; color: #ffffff; }
.memory-ribbon { display: flex; gap: 24px; color: #8c8c8c; font-size: 12px; margin-bottom: 12px; padding-left: 8px;}
.buttons-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 3px; flex: 1; }
button { border: none; font-size: 16px; color: white; border-radius: 3px; cursor: pointer; }
.num-btn { background-color: #3b3b3b; }
.num-btn:hover { background-color: #323232; }
.op-btn { background-color: #323232; }
.op-btn:hover { background-color: #2b2b2b; }
.equal-btn { background-color: #d7a3e5; color: #000000; font-weight: 700; }
.equal-btn:hover { background-color: #c592d3; }
</style>
