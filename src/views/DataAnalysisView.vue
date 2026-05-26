<script setup lang="ts">
import { ref, shallowRef } from 'vue'
import { useStats } from '../composables/useStats'
import DataUploader from '../components/DataUploader.vue'
import ResultPanel from '../components/ResultPanel.vue'

// 使用 shallowRef 避免 Vue 对海量数组进行深层响应式代理，极大提升性能
const rawDataset = shallowRef<Float64Array>(new Float64Array([12, 45, 67, 23, 89, 34, 56, 78, 90, 11]))
const parsedReport = ref<any>(null)
const err = ref('')
const fileInput = ref<HTMLInputElement | null>(null)

const statEngine = useStats()

const triggerStats = async () => {
  try {
    err.value = ''
    // 零拷贝传递：复制 buffer 避免原数组被清空
    const bufferCopy = rawDataset.value.buffer.slice(0)
    const dataCopy = new Float64Array(bufferCopy)
    parsedReport.value = await statEngine.analyze(dataCopy)
  } catch (e: any) {
    err.value = e.message
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
</script>

<template>
  <div style="padding:24px;">
    <h2>📊 离散大数据样本统计分析台</h2>
    <div style="background:#2a2a2a; padding:15px; border-radius:6px; margin-bottom:15px;">
      <p>当前激活的数据流序列样本（共 {{ rawDataset.length }} 项）：</p>
      <div class="data-preview">{{ rawDataset.slice(0, 10).join(', ') }}{{ rawDataset.length > 10 ? ' ...' : '' }}</div>
    </div>
    
    <div class="upload-area" @click="triggerFileInput" style="background:#333; padding:20px; text-align:center; border-radius:6px; margin-bottom:15px; cursor:pointer; border: 2px dashed #555;">
      📁 点击导入局部数据文件 (.txt/.csv)
      <input type="file" ref="fileInput" @change="handleFileUpload" style="display: none" accept=".csv,.txt" />
    </div>
    
    <button @click="triggerStats" class="calc-trigger" :disabled="rawDataset.length === 0">启动子线程描述性统计分析</button>

    <ResultPanel title="统计度量分析报告" :error="err">
      <div v-if="parsedReport" class="report-grid">
        <div>样本量: <span>{{ parsedReport.count }}</span></div>
        <div>最大值: <span>{{ parsedReport.max }}</span></div>
        <div>最小值: <span>{{ parsedReport.min }}</span></div>
        <div>平均值: <span>{{ parsedReport.mean.toFixed(4) }}</span></div>
        <div>方差: <span>{{ parsedReport.variance.toFixed(4) }}</span></div>
      </div>
    </ResultPanel>
  </div>
</template>

<style scoped>
.data-preview { font-family: monospace; color: #aaa; background: #1e1e1e; padding: 10px; border-radius: 4px; max-height: 60px; overflow-y: auto;}
.calc-trigger { width: 100%; margin-top: 15px; background: #d7a3e5; color: black; font-weight: 600; border: none; padding: 10px; border-radius: 4px; cursor: pointer;}
.calc-trigger:disabled { background: #666; cursor: not-allowed; }
.report-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; font-size: 15px; }
.report-grid span { color: #85e3b3; font-weight: 600; }
</style>
