const TIMEOUT_MS = 5000

function checkTimeout(start: number) {
  if (Date.now() - start > TIMEOUT_MS) {
    throw new Error('计算超时（超过5秒）')
  }
}

function evaluate(expr: string, x: number): number {
  try {
    const f = new Function('x', `with(Math) { return ${expr}; }`)
    return f(x)
  } catch {
    throw new Error('表达式格式错误')
  }
}

// 计算数值导数
function numericalDerivative(expr: string, x: number, h: number = 1e-8): number {
  return (evaluate(expr, x + h) - evaluate(expr, x - h)) / (2 * h)
}

// 牛顿法 (Newton-Raphson)
function newtonMethod(expr: string, guess: number, startTime: number, maxIter: number = 1000, tol: number = 1e-10) {
  checkTimeout(startTime)
  let x = guess
  let iterations = 0
  const h = 1e-8
  
  while (iterations < maxIter) {
    checkTimeout(startTime)
    const fx = evaluate(expr, x)
    if (Math.abs(fx) < tol) break
    
    const dfx = numericalDerivative(expr, x, h)
    if (Math.abs(dfx) < 1e-12) throw new Error('导数接近零，牛顿法失败')
    
    x = x - fx / dfx
    iterations++
  }
  
  if (iterations >= maxIter) throw new Error('牛顿法未在指定迭代次数内收敛')
  return { root: x, iterations, method: 'Newton-Raphson Method', order: 'Quadratic' }
}

// 二分法 (Bisection)
function bisectionMethod(expr: string, a: number, b: number, startTime: number, maxIter: number = 1000, tol: number = 1e-10) {
  checkTimeout(startTime)
  let fa = evaluate(expr, a)
  let fb = evaluate(expr, b)
  
  if (fa * fb > 0) throw new Error('区间端点函数值同号，无法使用二分法')
  
  let iterations = 0
  let c = a
  
  while (iterations < maxIter) {
    checkTimeout(startTime)
    c = (a + b) / 2
    const fc = evaluate(expr, c)
    
    if (Math.abs(fc) < tol || (b - a) / 2 < tol) break
    
    if (fa * fc < 0) {
      b = c
      fb = fc
    } else {
      a = c
      fa = fc
    }
    iterations++
  }
  
  if (iterations >= maxIter) throw new Error('二分法未在指定迭代次数内收敛')
  return { root: c, iterations, method: 'Bisection Method', order: 'Linear' }
}

// 割线法 (Secant)
function secantMethod(expr: string, x0: number, x1: number, startTime: number, maxIter: number = 1000, tol: number = 1e-10) {
  checkTimeout(startTime)
  let iterations = 0
  
  while (iterations < maxIter) {
    checkTimeout(startTime)
    const fx1 = evaluate(expr, x1)
    const fx0 = evaluate(expr, x0)
    
    if (Math.abs(fx1) < tol) break
    if (Math.abs(fx1 - fx0) < 1e-12) throw new Error('割线斜率接近零')
    
    const x2 = x1 - fx1 * (x1 - x0) / (fx1 - fx0)
    x0 = x1
    x1 = x2
    iterations++
  }
  
  if (iterations >= maxIter) throw new Error('割线法未在指定迭代次数内收敛')
  return { root: x1, iterations, method: 'Secant Method', order: 'Superlinear' }
}

// 牛顿下山法 (Newton with Damping)
function newtonDamping(expr: string, guess: number, startTime: number, maxIter: number = 1000, tol: number = 1e-10) {
  checkTimeout(startTime)
  let x = guess
  let iterations = 0
  const h = 1e-8
  
  while (iterations < maxIter) {
    checkTimeout(startTime)
    const fx = evaluate(expr, x)
    if (Math.abs(fx) < tol) break
    
    const dfx = numericalDerivative(expr, x, h)
    if (Math.abs(dfx) < 1e-12) throw new Error('导数接近零')
    
    let lambda = 1.0
    let xNew = x - lambda * fx / dfx
    let fxNew = evaluate(expr, xNew)
    
    // 下山条件：|f(x_new)| < |f(x)|
    while (Math.abs(fxNew) > Math.abs(fx) && lambda > 1e-10) {
      lambda *= 0.5
      xNew = x - lambda * fx / dfx
      fxNew = evaluate(expr, xNew)
    }
    
    if (Math.abs(fxNew) > Math.abs(fx)) throw new Error('牛顿下山法无法找到更优解')
    
    x = xNew
    iterations++
  }
  
  if (iterations >= maxIter) throw new Error('牛顿下山法未在指定迭代次数内收敛')
  return { root: x, iterations, method: 'Damped Newton Method', order: 'Quadratic' }
}

// 弦截法 (Regula Falsi / False Position)
function regulaFalsi(expr: string, a: number, b: number, startTime: number, maxIter: number = 1000, tol: number = 1e-10) {
  checkTimeout(startTime)
  let fa = evaluate(expr, a)
  let fb = evaluate(expr, b)
  
  if (fa * fb > 0) throw new Error('区间端点函数值同号')
  
  let iterations = 0
  let c = a
  
  while (iterations < maxIter) {
    checkTimeout(startTime)
    c = (a * fb - b * fa) / (fb - fa)
    const fc = evaluate(expr, c)
    
    if (Math.abs(fc) < tol) break
    
    if (fa * fc < 0) {
      b = c
      fb = fc
    } else {
      a = c
      fa = fc
    }
    iterations++
  }
  
  if (iterations >= maxIter) throw new Error('弦截法未收敛')
  return { root: c, iterations, method: 'Regula Falsi Method', order: 'Linear' }
}

// Brent 方法 (结合二分法、割线法和逆二次插值)
function brentMethod(expr: string, a: number, b: number, startTime: number, maxIter: number = 1000, tol: number = 1e-10) {
  checkTimeout(startTime)
  let fa = evaluate(expr, a)
  let fb = evaluate(expr, b)
  
  if (fa * fb > 0) throw new Error('区间端点函数值同号')
  
  if (Math.abs(fa) < Math.abs(fb)) {
    const t1 = a; a = b; b = t1
    const t2 = fa; fa = fb; fb = t2
  }
  
  let c = a
  let fc = fa
  let d = b - a
  let e = d
  let iterations = 0
  
  const eps = Number.EPSILON
  
  while (Math.abs(fb) > tol && iterations < maxIter) {
    checkTimeout(startTime)
    
    if (Math.abs(fc) < Math.abs(fb)) {
      const t1 = a; a = b; b = c; c = t1
      const t2 = fa; fa = fb; fb = fc; fc = t2
      d = b - a
      e = d
    }
    
    let s
    const tol1 = 2 * eps * Math.abs(b) + 0.5 * tol
    const xm = 0.5 * (c - b)
    
    if (Math.abs(xm) <= tol1 || fb === 0) break
    
    if (Math.abs(e) >= tol1 && Math.abs(fa) > Math.abs(fb)) {
      s = fb / fa
      let p: number, q: number
      
      if (a === c) {
        p = 2 * xm * s
        q = 1 - s
      } else {
        q = fa / fc
        const r = fb / fc
        p = s * (2 * xm * q * (q - r) - (b - a) * (r - 1))
        q = (q - 1) * (r - 1) * (s - 1)
      }
      
      if (p > 0) q = -q
      else p = -p
      
      s = e
      e = d
      
      if (2 * p < 3 * xm * q - Math.abs(tol1 * q) && p < Math.abs(0.5 * s * q)) {
        d = p / q
      } else {
        d = xm
        e = d
      }
    } else {
      d = xm
      e = d
    }
    
    a = b
    fa = fb
    
    b += (Math.abs(d) > tol1 ? d : (d > 0 ? tol1 : -tol1))
    fb = evaluate(expr, b)
    iterations++
  }
  
  if (iterations >= maxIter) throw new Error('Brent方法未收敛')
  return { root: b, iterations, method: 'Brent Method', order: 'Superlinear' }
}

// 固定点迭代法 (Fixed Point Iteration)
function fixedPointIteration(expr: string, guess: number, startTime: number, maxIter: number = 1000, tol: number = 1e-10) {
  checkTimeout(startTime)
  let x = guess
  let iterations = 0
  
  while (iterations < maxIter) {
    checkTimeout(startTime)
    const xNew = evaluate(expr, x)
    
    if (Math.abs(xNew - x) < tol) {
      x = xNew
      break
    }
    
    if (!isFinite(xNew)) throw new Error('迭代发散')
    
    x = xNew
    iterations++
  }
  
  if (iterations >= maxIter) throw new Error('固定点迭代法未收敛')
  return { root: x, iterations, method: 'Fixed Point Iteration', order: 'Linear' }
}

// QR分解求解线性方程组
function qrDecomposition(A: number[][], b: number[], startTime: number) {
  checkTimeout(startTime)
  const n = A.length
  const m = A[0].length
  const Q = Array(n).fill(0).map(() => Array(n).fill(0))
  const R = Array(n).fill(0).map(() => Array(m).fill(0))
  
  // Gram-Schmidt正交化
  const a = A.map(col => [...col])
  
  for (let j = 0; j < m; j++) {
    checkTimeout(startTime)
    const v = a.map(row => row[j])
    
    for (let i = 0; i < j; i++) {
      let dot = 0
      for (let k = 0; k < n; k++) {
        dot += Q[k][i] * a[k][j]
      }
      R[i][j] = dot
      for (let k = 0; k < n; k++) {
        v[k] -= R[i][j] * Q[k][i]
      }
    }
    
    let norm = 0
    for (let k = 0; k < n; k++) norm += v[k] * v[k]
    norm = Math.sqrt(norm)
    
    if (norm < 1e-10) throw new Error('矩阵列向量线性相关')
    
    R[j][j] = norm
    for (let k = 0; k < n; k++) {
      Q[k][j] = v[k] / norm
    }
  }
  
  // 解 Rx = Q^T b
  const Qtb = Array(m).fill(0)
  for (let i = 0; i < m; i++) {
    for (let k = 0; k < n; k++) {
      Qtb[i] += Q[k][i] * b[k]
    }
  }
  
  const x = Array(m).fill(0)
  for (let i = m - 1; i >= 0; i--) {
    x[i] = Qtb[i]
    for (let j = i + 1; j < m; j++) {
      x[i] -= R[i][j] * x[j]
    }
    x[i] /= R[i][i]
  }
  
  return { solution: x, method: 'QR Decomposition' }
}

// Cholesky分解 (仅适用于对称正定矩阵)
function choleskyDecomposition(A: number[][], b: number[], startTime: number) {
  checkTimeout(startTime)
  const n = A.length
  const L = Array(n).fill(0).map(() => Array(n).fill(0))
  
  // Cholesky分解 A = L * L^T
  for (let i = 0; i < n; i++) {
    checkTimeout(startTime)
    for (let j = 0; j <= i; j++) {
      let sum = 0
      if (j === i) {
        for (let k = 0; k < j; k++) {
          sum += L[j][k] * L[j][k]
        }
        const val = A[j][j] - sum
        if (val <= 0) throw new Error('矩阵不是正定矩阵')
        L[j][j] = Math.sqrt(val)
      } else {
        for (let k = 0; k < j; k++) {
          sum += L[i][k] * L[j][k]
        }
        L[i][j] = (A[i][j] - sum) / L[j][j]
      }
    }
  }
  
  // 解 Ly = b
  const y = Array(n).fill(0)
  for (let i = 0; i < n; i++) {
    y[i] = b[i]
    for (let j = 0; j < i; j++) {
      y[i] -= L[i][j] * y[j]
    }
    y[i] /= L[i][i]
  }
  
  // 解 L^T x = y
  const x = Array(n).fill(0)
  for (let i = n - 1; i >= 0; i--) {
    x[i] = y[i]
    for (let j = i + 1; j < n; j++) {
      x[i] -= L[j][i] * x[j]
    }
    x[i] /= L[i][i]
  }
  
  return { solution: x, method: 'Cholesky Decomposition' }
}

// Gauss-Seidel迭代法
function gaussSeidel(A: number[][], b: number[], startTime: number, maxIter: number = 1000, tol: number = 1e-10) {
  checkTimeout(startTime)
  const n = A.length
  const x = Array(n).fill(0)
  
  for (let iter = 0; iter < maxIter; iter++) {
    checkTimeout(startTime)
    const xOld = [...x]
    
    for (let i = 0; i < n; i++) {
      let sum = 0
      for (let j = 0; j < n; j++) {
        if (i !== j) sum += A[i][j] * x[j]
      }
      x[i] = (b[i] - sum) / A[i][i]
    }
    
    // 检查收敛
    let diff = 0
    for (let i = 0; i < n; i++) {
      diff += Math.abs(x[i] - xOld[i])
    }
    
    if (diff < tol) {
      return { solution: x, method: 'Gauss-Seidel Iteration', iterations: iter + 1 }
    }
  }
  
  throw new Error('Gauss-Seidel迭代未收敛')
}

// Jacobi迭代法
function jacobiIteration(A: number[][], b: number[], startTime: number, maxIter: number = 1000, tol: number = 1e-10) {
  checkTimeout(startTime)
  const n = A.length
  let x = Array(n).fill(0)
  
  for (let iter = 0; iter < maxIter; iter++) {
    checkTimeout(startTime)
    const xNew = Array(n).fill(0)
    
    for (let i = 0; i < n; i++) {
      let sum = 0
      for (let j = 0; j < n; j++) {
        if (i !== j) sum += A[i][j] * x[j]
      }
      xNew[i] = (b[i] - sum) / A[i][i]
    }
    
    // 检查收敛
    let diff = 0
    for (let i = 0; i < n; i++) {
      diff += Math.abs(xNew[i] - x[i])
    }
    
    x = xNew
    
    if (diff < tol) {
      return { solution: x, method: 'Jacobi Iteration', iterations: iter + 1 }
    }
  }
  
  throw new Error('Jacobi迭代未收敛')
}

// SOR (Successive Over-Relaxation) 超松弛迭代法
function sorIteration(A: number[][], b: number[], omega: number, startTime: number, maxIter: number = 1000, tol: number = 1e-10) {
  checkTimeout(startTime)
  if (omega <= 0 || omega >= 2) throw new Error('松弛因子ω应在(0,2)范围内')
  
  const n = A.length
  const x = Array(n).fill(0)
  
  for (let iter = 0; iter < maxIter; iter++) {
    checkTimeout(startTime)
    const xOld = [...x]
    
    for (let i = 0; i < n; i++) {
      let sum = 0
      for (let j = 0; j < n; j++) {
        if (i !== j) sum += A[i][j] * x[j]
      }
      x[i] = (1 - omega) * xOld[i] + omega * (b[i] - sum) / A[i][i]
    }
    
    let diff = 0
    for (let i = 0; i < n; i++) {
      diff += Math.abs(x[i] - xOld[i])
    }
    
    if (diff < tol) {
      return { solution: x, method: `SOR Iteration (ω=${omega})`, iterations: iter + 1 }
    }
  }
  
  throw new Error('SOR迭代未收敛')
}

// Conjugate Gradient (共轭梯度法，适用于对称正定矩阵)
function conjugateGradient(A: number[][], b: number[], startTime: number, maxIter: number = 1000, tol: number = 1e-10) {
  checkTimeout(startTime)
  const n = A.length
  let x = Array(n).fill(0)
  
  // 计算初始残差 r = b - Ax
  const r = b.map((bi, i) => {
    let sum = 0
    for (let j = 0; j < n; j++) sum += A[i][j] * x[j]
    return bi - sum
  })
  
  let p = [...r]
  let rsOld = 0
  for (let i = 0; i < n; i++) rsOld += r[i] * r[i]
  
  for (let iter = 0; iter < maxIter; iter++) {
    checkTimeout(startTime)
    
    // Ap = A * p
    const Ap = Array(n).fill(0)
    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n; j++) {
        Ap[i] += A[i][j] * p[j]
      }
    }
    
    let pAp = 0
    for (let i = 0; i < n; i++) pAp += p[i] * Ap[i]
    
    const alpha = rsOld / pAp
    
    // x = x + alpha * p
    for (let i = 0; i < n; i++) x[i] += alpha * p[i]
    
    // r = r - alpha * Ap
    for (let i = 0; i < n; i++) r[i] -= alpha * Ap[i]
    
    let rsNew = 0
    for (let i = 0; i < n; i++) rsNew += r[i] * r[i]
    
    if (Math.sqrt(rsNew) < tol) {
      return { solution: x, method: 'Conjugate Gradient', iterations: iter + 1 }
    }
    
    const beta = rsNew / rsOld
    for (let i = 0; i < n; i++) p[i] = r[i] + beta * p[i]
    
    rsOld = rsNew
  }
  
  throw new Error('共轭梯度法未收敛')
}

// 高斯消元法
function gaussianElimination(A: number[][], b: number[], startTime: number) {
  checkTimeout(startTime)
  const n = A.length
  // 构建增广矩阵
  const aug: number[][] = A.map((row, i) => [...row, b[i]])

  for (let i = 0; i < n; i++) {
    checkTimeout(startTime)
    // 选主元
    let maxRow = i
    for (let k = i + 1; k < n; k++) {
      if (Math.abs(aug[k][i]) > Math.abs(aug[maxRow][i])) {
        maxRow = k
      }
    }
    if (Math.abs(aug[maxRow][i]) < 1e-12) throw new Error('矩阵奇异，无唯一解')

    // 交换行
    ;[aug[i], aug[maxRow]] = [aug[maxRow], aug[i]]

    // 消元
    for (let k = i + 1; k < n; k++) {
      const factor = aug[k][i] / aug[i][i]
      for (let j = i; j <= n; j++) {
        aug[k][j] -= factor * aug[i][j]
      }
    }
  }

  // 回代
  const x = Array(n).fill(0)
  for (let i = n - 1; i >= 0; i--) {
    checkTimeout(startTime)
    x[i] = aug[i][n]
    for (let j = i + 1; j < n; j++) {
      x[i] -= aug[i][j] * x[j]
    }
    x[i] /= aug[i][i]
  }

  return { solution: x, method: 'Gaussian Elimination' }
}

// LU 分解 (Doolittle 方法)
function luDecomposition(A: number[][], b: number[], startTime: number) {
  checkTimeout(startTime)
  const n = A.length
  const L = Array(n).fill(0).map(() => Array(n).fill(0))
  const U = Array(n).fill(0).map(() => Array(n).fill(0))

  for (let i = 0; i < n; i++) {
    checkTimeout(startTime)
    // U 的上三角
    for (let j = i; j < n; j++) {
      let sum = 0
      for (let k = 0; k < i; k++) {
        sum += L[i][k] * U[k][j]
      }
      U[i][j] = A[i][j] - sum
    }

    // L 的下三角
    for (let j = i; j < n; j++) {
      if (i === j) {
        L[i][i] = 1
      } else {
        let sum = 0
        for (let k = 0; k < i; k++) {
          sum += L[j][k] * U[k][i]
        }
        if (Math.abs(U[i][i]) < 1e-12) throw new Error('LU分解失败，主元为零')
        L[j][i] = (A[j][i] - sum) / U[i][i]
      }
    }
  }

  // 解 Ly = b
  const y = Array(n).fill(0)
  for (let i = 0; i < n; i++) {
    let sum = 0
    for (let j = 0; j < i; j++) {
      sum += L[i][j] * y[j]
    }
    y[i] = b[i] - sum
  }

  // 解 Ux = y
  const x = Array(n).fill(0)
  for (let i = n - 1; i >= 0; i--) {
    let sum = 0
    for (let j = i + 1; j < n; j++) {
      sum += U[i][j] * x[j]
    }
    if (Math.abs(U[i][i]) < 1e-12) throw new Error('LU分解失败，主元为零')
    x[i] = (y[i] - sum) / U[i][i]
  }

  return { solution: x, method: 'LU Decomposition (Doolittle)' }
}

// 函数求值
function evaluateFunction(expr: string, xValues: number[], startTime: number): number[] {
  checkTimeout(startTime)
  const f = new Function('x', `with(Math) { return ${expr}; }`)
  return xValues.map(x => {
    try {
      const y = f(x)
      return isNaN(y) || !isFinite(y) ? NaN : y
    } catch {
      return NaN
    }
  })
}

self.onmessage = (e: MessageEvent) => {
  const { id, action, payload } = e.data
  const startTime = Date.now()
  try {
    // 线性方程组求解
    if (action === 'linear-gaussian') {
      const { A, b } = payload
      const result = gaussianElimination(A, b, startTime)
      self.postMessage({ id, status: 'complete', result })
    } else if (action === 'linear-lu') {
      const { A, b } = payload
      const result = luDecomposition(A, b, startTime)
      self.postMessage({ id, status: 'complete', result })
    } else if (action === 'linear-qr') {
      const { A, b } = payload
      const result = qrDecomposition(A, b, startTime)
      self.postMessage({ id, status: 'complete', result })
    } else if (action === 'linear-cholesky') {
      const { A, b } = payload
      const result = choleskyDecomposition(A, b, startTime)
      self.postMessage({ id, status: 'complete', result })
    } else if (action === 'linear-gauss-seidel') {
      const { A, b, maxIter, tol } = payload
      const result = gaussSeidel(A, b, startTime, maxIter, tol)
      self.postMessage({ id, status: 'complete', result })
    } else if (action === 'linear-jacobi') {
      const { A, b, maxIter, tol } = payload
      const result = jacobiIteration(A, b, startTime, maxIter, tol)
      self.postMessage({ id, status: 'complete', result })
    } else if (action === 'linear-sor') {
      const { A, b, omega, maxIter, tol } = payload
      const result = sorIteration(A, b, omega, startTime, maxIter, tol)
      self.postMessage({ id, status: 'complete', result })
    } else if (action === 'linear-cg') {
      const { A, b, maxIter, tol } = payload
      const result = conjugateGradient(A, b, startTime, maxIter, tol)
      self.postMessage({ id, status: 'complete', result })
    } else if (action === 'linear-2d') {
      // 兼容旧的2阶克莱姆法则
      const { A, b } = payload
      const detA = A[0][0] * A[1][1] - A[0][1] * A[1][0]
      
      if (Math.abs(detA) < 1e-10) throw new Error('矩阵奇异，无唯一解')
      
      const detX = b[0] * A[1][1] - A[0][1] * b[1]
      const detY = A[0][0] * b[1] - b[0] * A[1][0]
      
      self.postMessage({
        id,
        status: 'complete',
        result: { solution: [detX / detA, detY / detA], method: 'Cramer\'s Rule' }
      })
    }
    // 非线性方程求解
    else if (action === 'nonlinear-newton') {
      const { expr, guess, maxIter, tol } = payload
      const result = newtonMethod(expr, guess, startTime, maxIter, tol)
      self.postMessage({ id, status: 'complete', result })
    } else if (action === 'nonlinear-bisection') {
      const { expr, a, b, maxIter, tol } = payload
      const result = bisectionMethod(expr, a, b, startTime, maxIter, tol)
      self.postMessage({ id, status: 'complete', result })
    } else if (action === 'nonlinear-secant') {
      const { expr, x0, x1, maxIter, tol } = payload
      const result = secantMethod(expr, x0, x1, startTime, maxIter, tol)
      self.postMessage({ id, status: 'complete', result })
    } else if (action === 'nonlinear-damped-newton') {
      const { expr, guess, maxIter, tol } = payload
      const result = newtonDamping(expr, guess, startTime, maxIter, tol)
      self.postMessage({ id, status: 'complete', result })
    } else if (action === 'nonlinear-regula-falsi') {
      const { expr, a, b, maxIter, tol } = payload
      const result = regulaFalsi(expr, a, b, startTime, maxIter, tol)
      self.postMessage({ id, status: 'complete', result })
    } else if (action === 'nonlinear-brent') {
      const { expr, a, b, maxIter, tol } = payload
      const result = brentMethod(expr, a, b, startTime, maxIter, tol)
      self.postMessage({ id, status: 'complete', result })
    } else if (action === 'nonlinear-fixed-point') {
      const { expr, guess, maxIter, tol } = payload
      const result = fixedPointIteration(expr, guess, startTime, maxIter, tol)
      self.postMessage({ id, status: 'complete', result })
    }
    // 函数求值
    else if (action === 'function-eval') {
      const { expr, xValues } = payload
      const result = evaluateFunction(expr, xValues, startTime)
      self.postMessage({ id, status: 'complete', result })
    }
  } catch (err: any) {
    self.postMessage({ id, status: 'error', error: err.message })
  }
}
