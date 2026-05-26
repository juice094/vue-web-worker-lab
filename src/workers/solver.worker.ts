self.onmessage = (e: MessageEvent) => {
  const { id, action, payload } = e.data
  try {
    if (action === 'linear-2d') {
      // 2阶线性方程组求解 (克莱姆法则)
      const { A, b } = payload
      const detA = A[0][0] * A[1][1] - A[0][1] * A[1][0]
      
      if (Math.abs(detA) < 1e-10) throw new Error('矩阵奇异，无唯一解')
      
      const detX = b[0] * A[1][1] - A[0][1] * b[1]
      const detY = A[0][0] * b[1] - b[0] * A[1][0]
      
      self.postMessage({
        id,
        status: 'complete',
        result: { x: detX / detA, y: detY / detA }
      })
    } else if (action === 'nonlinear-secant') {
      // 割线法迭代求解
      const { expr, guess } = payload
      const f = new Function('x', `with(Math) { return ${expr}; }`)
      
      let x0 = guess
      let x1 = guess + 0.1
      let iterations = 0
      const maxIter = 1000
      const tol = 1e-7

      while (iterations < maxIter) {
        const fx1 = f(x1)
        const fx0 = f(x0)
        if (Math.abs(fx1) < tol) break
        
        if (fx1 - fx0 === 0) throw new Error('导数趋零，迭代停滞')
        
        const x2 = x1 - fx1 * (x1 - x0) / (fx1 - fx0)
        x0 = x1
        x1 = x2
        iterations++
      }
      
      self.postMessage({
        id,
        status: 'complete',
        result: { root: x1, iterations }
      })
    }
  } catch (err: any) {
    self.postMessage({ id, status: 'error', error: err.message })
  }
}
