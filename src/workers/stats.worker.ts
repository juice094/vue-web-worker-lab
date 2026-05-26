self.onmessage = (e: MessageEvent) => {
  const { id, action, payload } = e.data

  if (action === 'descriptive') {
    try {
      // payload 为 Float64Array (零拷贝传输)
      const data = payload instanceof Float64Array ? payload : new Float64Array(payload)
      const count = data.length

      if (count === 0) {
        self.postMessage({ id, status: 'error', error: '数据集为空' })
        return
      }

      let min = Infinity
      let max = -Infinity
      let sum = 0
      const totalSteps = count

      // 第一遍遍历：极值与总和（带进度反馈）
      for (let i = 0; i < count; i++) {
        const val = data[i]
        if (val < min) min = val
        if (val > max) max = val
        sum += val
        
        // 每处理 1000 个数据点发送一次进度
        if (i % 1000 === 0 || i === count - 1) {
          self.postMessage({ 
            id, 
            status: 'progress', 
            progress: Math.round((i / totalSteps) * 30) // 前30%进度
          })
        }
      }

      const mean = sum / count
      let varianceSum = 0

      // 第二遍遍历：方差（带进度反馈）
      for (let i = 0; i < count; i++) {
        varianceSum += Math.pow(data[i] - mean, 2)
        
        if (i % 1000 === 0 || i === count - 1) {
          self.postMessage({ 
            id, 
            status: 'progress', 
            progress: 30 + Math.round((i / totalSteps) * 30) // 30-60%进度
          })
        }
      }

      const variance = varianceSum / count
      const stdDev = Math.sqrt(variance)
      
      // 计算中位数（带进度反馈）
      const sorted = new Float64Array(data).sort()
      let median: number
      if (count % 2 === 0) {
        median = (sorted[count / 2 - 1] + sorted[count / 2]) / 2
      } else {
        median = sorted[Math.floor(count / 2)]
      }
      
      self.postMessage({ 
        id, 
        status: 'progress', 
        progress: 70 // 排序完成 70%
      })
      
      // 计算四分位数
      const q1Index = Math.floor(count * 0.25)
      const q3Index = Math.floor(count * 0.75)
      const q1 = sorted[q1Index]
      const q3 = sorted[q3Index]
      const iqr = q3 - q1
      
      // 计算偏度 (Skewness)（带进度反馈）
      let skewnessSum = 0
      for (let i = 0; i < count; i++) {
        skewnessSum += Math.pow((data[i] - mean) / stdDev, 3)
        if (i % 1000 === 0) {
          self.postMessage({ 
            id, 
            status: 'progress', 
            progress: 75 + Math.round((i / totalSteps) * 10) // 75-85%进度
          })
        }
      }
      const skewness = (count / ((count - 1) * (count - 2))) * skewnessSum
      
      // 计算峰度 (Kurtosis)（带进度反馈）
      let kurtosisSum = 0
      for (let i = 0; i < count; i++) {
        kurtosisSum += Math.pow((data[i] - mean) / stdDev, 4)
        if (i % 1000 === 0) {
          self.postMessage({ 
            id, 
            status: 'progress', 
            progress: 85 + Math.round((i / totalSteps) * 10) // 85-95%进度
          })
        }
      }
      const kurtosis = ((count * (count + 1)) / ((count - 1) * (count - 2) * (count - 3))) * kurtosisSum - 
                       (3 * Math.pow(count - 1, 2)) / ((count - 2) * (count - 3))

      self.postMessage({
        id,
        status: 'progress',
        progress: 95 // 即将完成
      })

      self.postMessage({
        id,
        status: 'complete',
        result: { 
          count, 
          min, 
          max, 
          mean, 
          variance, 
          stdDev,
          median,
          q1,
          q3,
          iqr,
          skewness,
          kurtosis,
          sum,
          range: max - min
        }
      })
    } catch (err: any) {
      self.postMessage({ id, status: 'error', error: err.message })
    }
  }
}
