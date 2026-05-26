<script setup lang="ts">
import { ref, computed } from 'vue'
import { useWorker } from '../composables/useWorker'
import ParamForm from '../components/ParamForm.vue'
import EquationInput from '../components/EquationInput.vue'
import ResultPanel from '../components/ResultPanel.vue'

const expr = ref('x * sin(x)')
const coords = ref<{ x: number; y: number }[]>([])
const err = ref('')
const hoveredPoint = ref<{ x: number; y: number } | null>(null)
const { run } = useWorker(new URL('../workers/plot.worker.ts', import.meta.url))

// 计算坐标轴范围
const xRange = { min: -10, max: 10 }
const yRange = computed(() => {
  if (coords.value.length === 0) return { min: -10, max: 10 }
  const ys = coords.value.map(p => p.y)
  const min = Math.min(...ys)
  const max = Math.max(...ys)
  const padding = (max - min) * 0.1 || 1
  return { min: min - padding, max: max + padding }
})

// 坐标转换
const viewBox = { width: 600, height: 400 }
const margin = { top: 30, right: 30, bottom: 40, left: 50 }
const plotWidth = viewBox.width - margin.left - margin.right
const plotHeight = viewBox.height - margin.top - margin.bottom

const toSvgX = (x: number) => {
  const range = xRange.max - xRange.min
  return margin.left + ((x - xRange.min) / range) * plotWidth
}

const toSvgY = (y: number) => {
  const range = yRange.value.max - yRange.value.min
  return margin.top + plotHeight - ((y - yRange.value.min) / range) * plotHeight
}

// 生成刻度
const generateTicks = (min: number, max: number, count: number) => {
  const step = (max - min) / count
  const ticks = []
  for (let i = 0; i <= count; i++) {
    ticks.push(min + i * step)
  }
  return ticks
}

const xTicks = computed(() => generateTicks(xRange.min, xRange.max, 10))
const yTicks = computed(() => generateTicks(yRange.value.min, yRange.value.max, 8))

// 快捷函数按钮
const quickFunctions = [
  { label: 'x²', value: 'x^2' },
  { label: '√x', value: 'sqrt(x)' },
  { label: 'sin(x)', value: 'sin(x)' },
  { label: 'cos(x)', value: 'cos(x)' },
  { label: 'tan(x)', value: 'tan(x)' },
  { label: 'ln(x)', value: 'ln(x)' },
  { label: 'e^x', value: 'exp(x)' },
  { label: '|x|', value: 'abs(x)' },
  { label: 'x³', value: 'x^3' },
  { label: '1/x', value: '1/x' }
]

const insertFunction = (func: string) => {
  if (expr.value === 'x * sin(x)') {
    expr.value = func
  } else {
    expr.value += ' + ' + func
  }
}

// 点击图表获取坐标
const handleSvgClick = (event: MouseEvent) => {
  const svg = (event.target as HTMLElement).closest('svg') as SVGSVGElement
  if (!svg || coords.value.length === 0) return
  
  const rect = svg.getBoundingClientRect()
  const clickX = ((event.clientX - rect.left) / rect.width) * viewBox.width
  
  // 将SVG坐标转换为数据坐标
  const dataX = xRange.min + ((clickX - margin.left) / plotWidth) * (xRange.max - xRange.min)
  
  // 找到最近的点
  let closestPoint = coords.value[0]
  let minDistance = Infinity
  
  for (const point of coords.value) {
    const distance = Math.abs(point.x - dataX)
    if (distance < minDistance) {
      minDistance = distance
      closestPoint = point
    }
  }
  
  hoveredPoint.value = closestPoint
}

const executePlot = async () => {
  try {
    err.value = ''
    hoveredPoint.value = null
    const out = await run<{ x: number; y: number }[]>('sample', {
      expression: expr.value,
      minX: -10,
      maxX: 10,
      stepCount: 300
    })
    coords.value = out
  } catch (e: any) {
    err.value = e.message
  }
}
</script>

<template>
  <div style="padding:24px;">
    <h2>
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display: inline-block; vertical-align: middle; margin-right: 10px;">
        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
      </svg>
      2D 函数全自动化可视化绘图
    </h2>
    <ParamForm label="输入待采样的数学函数表达式 f(x):">
      <EquationInput v-model="expr" placeholder="例如: sin(x) * x" />
    </ParamForm>
    
    <!-- 快捷函数按钮 -->
    <div style="margin: 10px 0;">
      <div style="color: #b5b5b5; font-size: 13px; margin-bottom: 8px;">快捷函数:</div>
      <div style="display: flex; flex-wrap: wrap; gap: 8px;">
        <button 
          v-for="func in quickFunctions" 
          :key="func.label"
          @click="insertFunction(func.value)"
          class="quick-btn"
        >
          {{ func.label }}
        </button>
      </div>
    </div>
    
    <button @click="executePlot" class="action-trigger">异步离线批量采样并绘图</button>
    
    <ResultPanel title="2D 矢量渲染图形谱图" :error="err">
      <div v-if="coords.length" class="canvas-fallback">
        <svg 
          :viewBox="`0 0 ${viewBox.width} ${viewBox.height}`" 
          class="vector-svg"
          @click="handleSvgClick"
        >
          <!-- 背景网格 -->
          <g class="grid">
            <!-- X轴网格线 -->
            <line 
              v-for="tick in xTicks" 
              :key="`x-grid-${tick}`"
              :x1="toSvgX(tick)" 
              :y1="margin.top" 
              :x2="toSvgX(tick)" 
              :y2="margin.top + plotHeight"
              stroke="#2a2a2a" 
              stroke-width="1"
            />
            <!-- Y轴网格线 -->
            <line 
              v-for="tick in yTicks" 
              :key="`y-grid-${tick}`"
              :x1="margin.left" 
              :y1="toSvgY(tick)" 
              :x2="margin.left + plotWidth" 
              :y2="toSvgY(tick)"
              stroke="#2a2a2a" 
              stroke-width="1"
            />
          </g>
          
          <!-- 坐标轴 -->
          <g class="axes">
            <!-- X轴 -->
            <line 
              :x1="margin.left" 
              :y1="toSvgY(0)" 
              :x2="margin.left + plotWidth" 
              :y2="toSvgY(0)"
              stroke="#666" 
              stroke-width="2"
            />
            <!-- Y轴 -->
            <line 
              :x1="toSvgX(0)" 
              :y1="margin.top" 
              :x2="toSvgX(0)" 
              :y2="margin.top + plotHeight"
              stroke="#666" 
              stroke-width="2"
            />
          </g>
          
          <!-- 刻度标签 -->
          <g class="ticks">
            <!-- X轴刻度 -->
            <g v-for="tick in xTicks" :key="`x-tick-${tick}`">
              <line 
                :x1="toSvgX(tick)" 
                :y1="toSvgY(0) - 3" 
                :x2="toSvgX(tick)" 
                :y2="toSvgY(0) + 3"
                stroke="#888" 
                stroke-width="1"
              />
              <text 
                :x="toSvgX(tick)" 
                :y="toSvgY(0) + 18"
                fill="#888"
                font-size="11"
                text-anchor="middle"
              >
                {{ Math.round(tick * 100) / 100 }}
              </text>
            </g>
            
            <!-- Y轴刻度 -->
            <g v-for="tick in yTicks" :key="`y-tick-${tick}`">
              <line 
                :x1="toSvgX(0) - 3" 
                :y1="toSvgY(tick)" 
                :x2="toSvgX(0) + 3" 
                :y2="toSvgY(tick)"
                stroke="#888" 
                stroke-width="1"
              />
              <text 
                :x="toSvgX(0) - 8" 
                :y="toSvgY(tick) + 4"
                fill="#888"
                font-size="11"
                text-anchor="end"
              >
                {{ Math.round(tick * 100) / 100 }}
              </text>
            </g>
          </g>
          
          <!-- 函数曲线 -->
          <polyline
            fill="none"
            stroke="#d7a3e5"
            stroke-width="2"
            :points="coords.map(p => `${toSvgX(p.x)}, ${toSvgY(p.y)}`).join(' ')"
          />
          
          <!-- 鼠标悬停点 -->
          <g v-if="hoveredPoint" class="hover-point">
            <!-- 垂直辅助线 -->
            <line 
              :x1="toSvgX(hoveredPoint.x)" 
              :y1="margin.top" 
              :x2="toSvgX(hoveredPoint.x)" 
              :y2="margin.top + plotHeight"
              stroke="#d7a3e5" 
              stroke-width="1"
              stroke-dasharray="4,4"
              opacity="0.5"
            />
            <!-- 水平辅助线 -->
            <line 
              :x1="margin.left" 
              :y1="toSvgY(hoveredPoint.y)" 
              :x2="margin.left + plotWidth" 
              :y2="toSvgY(hoveredPoint.y)"
              stroke="#d7a3e5" 
              stroke-width="1"
              stroke-dasharray="4,4"
              opacity="0.5"
            />
            <!-- 数据点 -->
            <circle 
              :cx="toSvgX(hoveredPoint.x)" 
              :cy="toSvgY(hoveredPoint.y)" 
              r="5" 
              fill="#d7a3e5"
            />
            <!-- 坐标标签 -->
            <rect 
              :x="toSvgX(hoveredPoint.x) + 10" 
              :y="toSvgY(hoveredPoint.y) - 35"
              width="120"
              height="30"
              rx="4"
              fill="#2b2b2b"
              stroke="#d7a3e5"
              stroke-width="1"
            />
            <text 
              :x="toSvgX(hoveredPoint.x) + 15" 
              :y="toSvgY(hoveredPoint.y) - 20"
              fill="#d7a3e5"
              font-size="12"
              font-family="monospace"
            >
              ({{ hoveredPoint.x.toFixed(2) }}, {{ hoveredPoint.y.toFixed(2) }})
            </text>
          </g>
        </svg>
      </div>
    </ResultPanel>
  </div>
</template>

<style scoped>
/* 标题样式 */
h2 {
  font-size: 32px;
  margin-bottom: 30px;
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  letter-spacing: -0.5px;
}

/* 快捷按钮 */
.quick-btn {
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  color: var(--color-info);
  padding: 10px 16px;
  border-radius: var(--border-radius-sm);
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: var(--shadow-sm);
}

.quick-btn:hover {
  background: var(--bg-hover);
  border-color: var(--color-info);
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

.quick-btn:active {
  transform: translateY(0);
}

/* 操作按钮 */
.action-trigger { 
  width: 100%;
  margin-top: 20px;
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
  border: none; 
  color: white; 
  padding: 14px 24px; 
  border-radius: var(--border-radius); 
  cursor: pointer;
  font-size: 15px;
  font-weight: 600;
  letter-spacing: 0.5px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 4px 12px rgba(79, 172, 254, 0.3);
}

.action-trigger:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(79, 172, 254, 0.4);
}

.action-trigger:active {
  transform: translateY(0);
}

/* SVG图表 */
.vector-svg { 
  background: var(--bg-card); 
  width: 100%; 
  height: auto;
  border-radius: var(--border-radius-lg);
  cursor: crosshair;
  box-shadow: var(--shadow-md);
  border: 1px solid var(--border-color);
  transition: all 0.3s;
}

.vector-svg:hover {
  box-shadow: var(--shadow-lg);
  border-color: rgba(79, 172, 254, 0.3);
}

.canvas-fallback {
  overflow-x: auto;
}
</style>
