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

      // 第一遍遍历：极值与总和
      for (let i = 0; i < count; i++) {
        const val = data[i]
        if (val < min) min = val
        if (val > max) max = val
        sum += val
      }

      const mean = sum / count
      let varianceSum = 0

      // 第二遍遍历：方差
      for (let i = 0; i < count; i++) {
        varianceSum += Math.pow(data[i] - mean, 2)
      }

      const variance = varianceSum / count

      self.postMessage({
        id,
        status: 'complete',
        result: { count, min, max, mean, variance }
      })
    } catch (err: any) {
      self.postMessage({ id, status: 'error', error: err.message })
    }
  }
}
