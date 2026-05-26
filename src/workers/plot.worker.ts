self.onmessage = (e: MessageEvent) => {
  const { id, action, payload } = e.data
  if (action === 'sample') {
    try {
      const { expression, minX, maxX, stepCount } = payload
      const points = []
      const delta = (maxX - minX) / stepCount
      
      // 预处理表达式，支持更多数学函数
      let processedExpr = expression
        .replace(/\^/g, '**')  // 支持 ^ 作为幂运算符
        .replace(/ln\(/g, 'log(')  // ln -> log (自然对数)
        .replace(/log2\(/g, 'log2(')  // log2
        .replace(/log10\(/g, 'log10(')  // log10
      
      const mathFunc = new Function('x', `with(Math) { return ${processedExpr}; }`)
      
      for (let i = 0; i <= stepCount; i++) {
        const x = minX + i * delta
        try {
          const y = mathFunc(x)
          if (!isNaN(y) && isFinite(y)) {
            points.push({ x, y })
          }
        } catch (e) {
          // 忽略单个点的计算错误，继续处理
        }
      }
      self.postMessage({ id, status: 'complete', result: points })
    } catch (err: any) {
      self.postMessage({ id, status: 'error', error: err.message })
    }
  }
}
