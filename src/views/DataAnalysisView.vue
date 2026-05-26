<script setup lang="ts">
import { ref, shallowRef, watch, onUnmounted } from 'vue'
import { useStats } from '../composables/useStats'
import { useWorker } from '../composables/useWorker'
import DataUploader from '../components/DataUploader.vue'
import ResultPanel from '../components/ResultPanel.vue'
import { useAppStore } from '../stores/appStore'

// 使用 shallowRef 避免 Vue 对海量数组进行深层响应式代理，极大提升性能
const rawDataset = shallowRef<Float64Array>(new Float64Array([12, 45, 67, 23, 89, 34, 56, 78, 90, 11]))
const parsedReport = ref<any>(null)
const err = ref('')
const fileInput = ref<HTMLInputElement | null>(null)
const computationLogs = ref<string[]>([])
const appStore = useAppStore()

const statEngine = useStats()

// 监听 Worker 进度并更新 UI
let progressWatcher: any = null
watch(() => statEngine.progress.value, (newProgress) => {
  if (newProgress > 0 && newProgress < 100) {
    // 添加计算日志
    if (newProgress % 10 === 0) {
      const timestamp = new Date().toLocaleTimeString()
      computationLogs.value.push(`[${timestamp}] 计算进度: ${newProgress}%`)
    }
  }
})

const triggerStats = async () => {
  try {
    err.value = ''
    computationLogs.value = [] // 清空日志
    // 零拷贝传递：复制 buffer 避免原数组被清空
    const bufferCopy = rawDataset.value.buffer.slice(0)
    const dataCopy = new Float64Array(bufferCopy)
    
    const startTime = Date.now()
    parsedReport.value = await statEngine.analyze(dataCopy)
    const endTime = Date.now()
    
    // 添加完成日志
    computationLogs.value.push(`[${new Date().toLocaleTimeString()}] ✅ 计算完成！耗时: ${(endTime - startTime).toFixed(2)}ms`)
  } catch (e: any) {
    err.value = e.message
    computationLogs.value.push(`[${new Date().toLocaleTimeString()}] ❌ 错误: ${e.message}`)
  }
}

// 多线程并行计算演示
const runMultiThreadDemo = async () => {
  computationLogs.value = []
  err.value = ''
  
  const threadCount = 5
  computationLogs.value.push(`[${new Date().toLocaleTimeString()}] 🚀 启动 ${threadCount} 个并行线程...`)
  
  const startTime = Date.now()
  
  try {
    // 创建多个 Worker 实例并行计算
    const workers = Array.from({ length: threadCount }, (_, i) => {
      return useWorker(new URL('../workers/stats.worker.ts', import.meta.url))
    })
    
    computationLogs.value.push(`[${new Date().toLocaleTimeString()}] ⚡ 所有线程已启动，开始并行计算...`)
    
    // 并行执行所有计算
    const promises = workers.map(async (worker, index) => {
      const bufferCopy = rawDataset.value.buffer.slice(0)
      const dataCopy = new Float64Array(bufferCopy)
      
      const threadStart = Date.now()
      await worker.run<any>('descriptive', dataCopy, [dataCopy.buffer])
      const threadEnd = Date.now()
      
      computationLogs.value.push(
        `[${new Date().toLocaleTimeString()}] ✅ 线程 ${index + 1} 完成 (耗时: ${(threadEnd - threadStart).toFixed(2)}ms)`
      )
    })
    
    // 等待所有线程完成
    await Promise.all(promises)
    
    const endTime = Date.now()
    const totalTime = endTime - startTime
    
    computationLogs.value.push(`\n[${new Date().toLocaleTimeString()}] 🎉 全部 ${threadCount} 个线程并行计算完成！`)
    computationLogs.value.push(`[${new Date().toLocaleTimeString()}] ⏱️ 总耗时: ${totalTime.toFixed(2)}ms`)
    computationLogs.value.push(`[${new Date().toLocaleTimeString()}] 📊 平均每个线程: ${(totalTime / threadCount).toFixed(2)}ms`)
    computationLogs.value.push(`[${new Date().toLocaleTimeString()}] 💡 提示: 这就是 Web Worker 多线程的威力！`)
    
    // 清理 Worker
    workers.forEach(w => {
      // Worker 会在组件卸载时自动清理
    })
  } catch (e: any) {
    err.value = e.message
    computationLogs.value.push(`[${new Date().toLocaleTimeString()}] ❌ 并行计算错误: ${e.message}`)
  }
}

const triggerFileInput = () => fileInput.value?.click()

const handleFileUpload = (e: Event) => {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (!file) return
  const reader = new FileReader()
  reader.onload = (event) => {
    const text = event.target?.result as string
    const nums = text.split(/[\n,]+/).map(Number).filter(n => !isNaN(n))
    // 转换为 Float64Array 以便后续进行内存转移
    rawDataset.value = new Float64Array(nums)
  }
  reader.readAsText(file)
}

const getSkewnessHint = (skewness: number) => {
  if (!skewness && skewness !== 0) return ''
  if (Math.abs(skewness) < 0.5) return '近似对称分布'
  if (skewness > 0) return '右偏（正偏）分布'
  return '左偏（负偏）分布'
}

const getKurtosisHint = (kurtosis: number) => {
  if (!kurtosis && kurtosis !== 0) return ''
  if (Math.abs(kurtosis) < 0.5) return '接近正态分布'
  if (kurtosis > 0) return '尖峰分布（重尾）'
  return '平峰分布（轻尾）'
}
</script>

<template>
  <div style="padding:24px;">
    <h2>
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display: inline-block; vertical-align: middle; margin-right: 10px;">
        <line x1="18" y1="20" x2="18" y2="10"/>
        <line x1="12" y1="20" x2="12" y2="4"/>
        <line x1="6" y1="20" x2="6" y2="14"/>
      </svg>
      离散大数据样本统计分析台
    </h2>
    <div style="background:#2a2a2a; padding:15px; border-radius:6px; margin-bottom:15px;">
      <p>当前激活的数据流序列样本（共 {{ rawDataset.length }} 项）：</p>
      <div class="data-preview">{{ rawDataset.slice(0, 10).join(', ') }}{{ rawDataset.length > 10 ? ' ...' : '' }}</div>
    </div>
    
    <div class="upload-area" @click="triggerFileInput" style="background:#333; padding:20px; text-align:center; border-radius:6px; margin-bottom:15px; cursor:pointer; border: 2px dashed #555;">
      📁 点击导入局部数据文件 (.txt/.csv)
      <input type="file" ref="fileInput" @change="handleFileUpload" style="display: none" accept=".csv,.txt" />
    </div>
    
    <button @click="triggerStats" class="calc-trigger" :disabled="rawDataset.length === 0">启动子线程描述性统计分析</button>
    
    <button @click="runMultiThreadDemo" class="calc-trigger secondary" :disabled="rawDataset.length === 0">
      🚀 多线程并行计算演示 (同时运行 5 个 Worker)
    </button>

    <div v-if="parsedReport" class="computation-log">
      <h3 class="log-title">📝 计算日志 (Web Worker 实时反馈)</h3>
      <div class="log-content">
        <div v-for="(log, idx) in computationLogs" :key="idx" class="log-line">
          <span class="log-icon">{{ log.includes('✅') ? '✅' : log.includes('❌') ? '❌' : '⚡' }}</span>
          {{ log.replace(/[✅❌⚡]\s?/g, '') }}
        </div>
        <div v-if="computationLogs.length === 0" class="log-empty">等待计算...</div>
      </div>
    </div>

    <ResultPanel title="统计度量分析报告" :error="err">
      <div v-if="parsedReport" class="stats-container">
        <!-- 基础统计 -->
        <div class="stats-section">
          <h3 class="section-title">📊 基础统计</h3>
          <div class="report-grid">
            <div class="stat-card">
              <div class="stat-label">样本量</div>
              <div class="stat-value">{{ parsedReport.count }}</div>
            </div>
            <div class="stat-card">
              <div class="stat-label">总和</div>
              <div class="stat-value">{{ parsedReport.sum?.toFixed(4) }}</div>
            </div>
            <div class="stat-card">
              <div class="stat-label">平均值</div>
              <div class="stat-value primary">{{ parsedReport.mean.toFixed(4) }}</div>
            </div>
            <div class="stat-card">
              <div class="stat-label">中位数</div>
              <div class="stat-value primary">{{ parsedReport.median?.toFixed(4) }}</div>
            </div>
          </div>
        </div>

        <!-- 极值与分布 -->
        <div class="stats-section">
          <h3 class="section-title">📈 极值与分布</h3>
          <div class="report-grid">
            <div class="stat-card">
              <div class="stat-label">最大值</div>
              <div class="stat-value success">{{ parsedReport.max }}</div>
            </div>
            <div class="stat-card">
              <div class="stat-label">最小值</div>
              <div class="stat-value warning">{{ parsedReport.min }}</div>
            </div>
            <div class="stat-card">
              <div class="stat-label">极差</div>
              <div class="stat-value">{{ parsedReport.range?.toFixed(4) }}</div>
            </div>
            <div class="stat-card">
              <div class="stat-label">方差</div>
              <div class="stat-value">{{ parsedReport.variance.toFixed(4) }}</div>
            </div>
            <div class="stat-card">
              <div class="stat-label">标准差</div>
              <div class="stat-value primary">{{ parsedReport.stdDev?.toFixed(4) }}</div>
            </div>
          </div>
        </div>

        <!-- 四分位数 -->
        <div class="stats-section">
          <h3 class="section-title">🎯 四分位数分析</h3>
          <div class="report-grid">
            <div class="stat-card">
              <div class="stat-label">第一四分位数 (Q1)</div>
              <div class="stat-value">{{ parsedReport.q1?.toFixed(4) }}</div>
            </div>
            <div class="stat-card">
              <div class="stat-label">第三四分位数 (Q3)</div>
              <div class="stat-value">{{ parsedReport.q3?.toFixed(4) }}</div>
            </div>
            <div class="stat-card highlight">
              <div class="stat-label">四分位距 (IQR)</div>
              <div class="stat-value success">{{ parsedReport.iqr?.toFixed(4) }}</div>
            </div>
          </div>
        </div>

        <!-- 分布特征 -->
        <div class="stats-section">
          <h3 class="section-title">🔬 分布特征分析</h3>
          <div class="report-grid">
            <div class="stat-card">
              <div class="stat-label">偏度 (Skewness)</div>
              <div class="stat-value">{{ parsedReport.skewness?.toFixed(4) }}</div>
              <div class="stat-hint">{{ getSkewnessHint(parsedReport.skewness) }}</div>
            </div>
            <div class="stat-card">
              <div class="stat-label">峰度 (Kurtosis)</div>
              <div class="stat-value">{{ parsedReport.kurtosis?.toFixed(4) }}</div>
              <div class="stat-hint">{{ getKurtosisHint(parsedReport.kurtosis) }}</div>
            </div>
          </div>
        </div>
      </div>
    </ResultPanel>
  </div>
</template>

<style scoped>
/* 标题样式 */
h2 {
  font-size: 32px;
  margin-bottom: 30px;
  background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  letter-spacing: -0.5px;
}

/* 数据预览区 */
.data-preview { 
  font-family: 'Courier New', monospace; 
  color: var(--text-secondary); 
  background: var(--bg-card); 
  padding: 16px; 
  border-radius: var(--border-radius-sm); 
  max-height: 80px; 
  overflow-y: auto;
  border: 1px solid var(--border-color);
  font-size: 13px;
  line-height: 1.6;
}

/* 上传区域 */
.upload-area {
  background: var(--bg-card);
  padding: 32px 24px;
  text-align: center;
  border-radius: var(--border-radius-lg);
  cursor: pointer;
  border: 2px dashed var(--border-color);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  margin-bottom: 20px;
}

.upload-area:hover {
  border-color: var(--color-success);
  background: rgba(67, 233, 123, 0.05);
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

.upload-area:active {
  transform: translateY(0);
}

/* 计算按钮 */
.calc-trigger { 
  width: 100%; 
  margin-top: 20px; 
  background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
  color: white; 
  font-weight: 600; 
  border: none; 
  padding: 14px 24px; 
  border-radius: var(--border-radius); 
  cursor: pointer;
  font-size: 15px;
  letter-spacing: 0.5px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 4px 12px rgba(67, 233, 123, 0.3);
}

.calc-trigger:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(67, 233, 123, 0.4);
}

.calc-trigger:active:not(:disabled) {
  transform: translateY(0);
}

.calc-trigger:disabled { 
  background: var(--bg-hover);
  color: var(--text-muted);
  cursor: not-allowed;
  box-shadow: none;
}

.calc-trigger.secondary {
  background: linear-gradient(135deg, rgba(79, 172, 254, 0.2) 0%, rgba(0, 242, 254, 0.2) 100%);
  border: 2px solid rgba(79, 172, 254, 0.4);
  color: var(--color-info);
  box-shadow: 0 4px 12px rgba(79, 172, 254, 0.2);
}

.calc-trigger.secondary:hover:not(:disabled) {
  background: linear-gradient(135deg, rgba(79, 172, 254, 0.3) 0%, rgba(0, 242, 254, 0.3) 100%);
  border-color: var(--color-info);
  box-shadow: 0 6px 20px rgba(79, 172, 254, 0.3);
}

/* 计算日志 */
.computation-log {
  margin-top: 24px;
  margin-bottom: 24px;
  background: var(--bg-card);
  border-radius: var(--border-radius-lg);
  border: 1px solid var(--border-color);
  box-shadow: var(--shadow-md);
  overflow: hidden;
}

.log-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
  padding: 16px 20px;
  background: linear-gradient(135deg, rgba(79, 172, 254, 0.1) 0%, rgba(0, 242, 254, 0.1) 100%);
  border-bottom: 1px solid var(--border-color);
}

.log-content {
  padding: 16px 20px;
  max-height: 200px;
  overflow-y: auto;
  font-family: 'Courier New', monospace;
  font-size: 13px;
  line-height: 1.8;
}

.log-line {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 6px 12px;
  border-radius: var(--border-radius-sm);
  transition: background 0.2s;
}

.log-line:hover {
  background: var(--bg-hover);
}

.log-icon {
  flex-shrink: 0;
  font-size: 14px;
}

.log-empty {
  color: var(--text-muted);
  text-align: center;
  padding: 20px;
  font-style: italic;
}

/* 统计容器 */
.stats-container {
  display: flex;
  flex-direction: column;
  gap: 28px;
}

/* 统计区块 */
.stats-section {
  background: var(--bg-card);
  border-radius: var(--border-radius-lg);
  padding: 24px;
  border: 1px solid var(--border-color);
  box-shadow: var(--shadow-md);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.stats-section:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-lg);
  border-color: rgba(67, 233, 123, 0.2);
}

.section-title {
  font-size: 18px;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 20px 0;
  padding-bottom: 12px;
  border-bottom: 2px solid var(--border-color);
}

/* 报告网格 */
.report-grid { 
  display: grid; 
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); 
  gap: 16px;
}

/* 统计卡片 */
.stat-card {
  background: var(--bg-secondary);
  border-radius: var(--border-radius);
  padding: 16px;
  border: 1px solid var(--border-color);
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
}

.stat-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: linear-gradient(90deg, var(--color-primary), var(--color-success));
  opacity: 0;
  transition: opacity 0.2s;
}

.stat-card:hover {
  background: var(--bg-hover);
  border-color: rgba(67, 233, 123, 0.3);
  transform: translateY(-3px);
  box-shadow: var(--shadow-md);
}

.stat-card:hover::before {
  opacity: 1;
}

.stat-card.highlight {
  background: linear-gradient(135deg, rgba(67, 233, 123, 0.1) 0%, rgba(56, 249, 215, 0.1) 100%);
  border-color: rgba(67, 233, 123, 0.3);
}

.stat-label {
  font-size: 13px;
  color: var(--text-secondary);
  margin-bottom: 8px;
  font-weight: 500;
}

.stat-value {
  font-size: 22px;
  font-weight: 700;
  color: var(--text-primary);
  font-family: 'Courier New', monospace;
  letter-spacing: -0.5px;
}

.stat-value.primary {
  color: var(--color-primary);
}

.stat-value.success {
  color: var(--color-success);
}

.stat-value.warning {
  color: var(--color-warning);
}

.stat-hint {
  font-size: 12px;
  color: var(--text-muted);
  margin-top: 6px;
  font-style: italic;
}
</style>
