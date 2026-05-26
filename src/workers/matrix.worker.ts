const MATRIX_TIMEOUT_MS = 5000

function checkMatrixTimeout(start: number) {
  if (Date.now() - start > MATRIX_TIMEOUT_MS) {
    throw new Error('计算超时（超过5秒），请降低矩阵阶数')
  }
}

function multiply(matrixA: number[][], matrixB: number[][]) {
  const r1 = matrixA.length, c1 = matrixA[0].length
  const r2 = matrixB.length, c2 = matrixB[0].length
  if (c1 !== r2) throw new Error('矩阵维度不匹配，无法相乘')

  const out = Array(r1).fill(0).map(() => Array(c2).fill(0))
  for (let i = 0; i < r1; i++) {
    for (let j = 0; j < c2; j++) {
      let sum = 0
      for (let k = 0; k < c1; k++) {
        sum += matrixA[i][k] * matrixB[k][j]
      }
      out[i][j] = sum
    }
  }
  return out
}

function add(matrixA: number[][], matrixB: number[][]) {
  const r = matrixA.length, c = matrixA[0].length
  if (matrixB.length !== r || matrixB[0].length !== c) {
    throw new Error('矩阵维度不匹配，无法相加')
  }
  return matrixA.map((row, i) => row.map((v, j) => v + matrixB[i][j]))
}

function subtract(matrixA: number[][], matrixB: number[][]) {
  const r = matrixA.length, c = matrixA[0].length
  if (matrixB.length !== r || matrixB[0].length !== c) {
    throw new Error('矩阵维度不匹配，无法相减')
  }
  return matrixA.map((row, i) => row.map((v, j) => v - matrixB[i][j]))
}

function transpose(matrix: number[][]) {
  const r = matrix.length, c = matrix[0].length
  const out: number[][] = Array(c).fill(0).map(() => Array(r).fill(0))
  for (let i = 0; i < r; i++) {
    for (let j = 0; j < c; j++) {
      out[j][i] = matrix[i][j]
    }
  }
  return out
}

function determinant(matrix: number[][], startTime: number): number {
  checkMatrixTimeout(startTime)
  const n = matrix.length
  if (n !== matrix[0].length) throw new Error('必须为方阵')
  if (n === 1) return matrix[0][0]
  if (n === 2) return matrix[0][0] * matrix[1][1] - matrix[0][1] * matrix[1][0]

  let d = 0
  for (let i = 0; i < n; i++) {
    const sub = matrix.slice(1).map(row => row.filter((_, j) => j !== i))
    d += matrix[0][i] * determinant(sub, startTime) * (i % 2 === 0 ? 1 : -1)
  }
  return d
}

function inverse(matrix: number[][], startTime: number): number[][] {
  checkMatrixTimeout(startTime)
  const n = matrix.length
  if (n !== matrix[0].length) throw new Error('必须为方阵才能求逆')
  const det = determinant(matrix, startTime)
  if (Math.abs(det) < 1e-10) throw new Error('矩阵不可逆（行列式为0）')

  // 伴随矩阵法求逆
  const adj: number[][] = Array(n).fill(0).map(() => Array(n).fill(0))
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      const minor = matrix
        .filter((_, ri) => ri !== i)
        .map(row => row.filter((_, ci) => ci !== j))
      adj[j][i] = determinant(minor, startTime) * ((i + j) % 2 === 0 ? 1 : -1)
    }
  }
  return adj.map(row => row.map(v => v / det))
}

function power(matrix: number[][], exponent: number, startTime: number): number[][] {
  checkMatrixTimeout(startTime)
  const n = matrix.length
  if (n !== matrix[0].length) throw new Error('必须为方阵才能求幂')
  if (exponent === 0) {
    // 返回单位矩阵
    return Array(n).fill(0).map((_, i) => Array(n).fill(0).map((__, j) => i === j ? 1 : 0))
  }
  if (exponent === 1) return matrix.map(row => [...row])
  
  let result = matrix.map(row => [...row])
  for (let i = 2; i <= exponent; i++) {
    checkMatrixTimeout(startTime)
    result = multiply(result, matrix)
  }
  return result
}

function trace(matrix: number[][], startTime: number): number {
  checkMatrixTimeout(startTime)
  const n = matrix.length
  if (n !== matrix[0].length) throw new Error('必须为方阵才能求迹')
  return matrix.reduce((sum, row, i) => sum + row[i], 0)
}

function norm(matrix: number[][]): number {
  // Frobenius 范数
  return Math.sqrt(matrix.reduce((sum, row) => 
    sum + row.reduce((rowSum, val) => rowSum + val * val, 0), 0
  ))
}

function rank(matrix: number[][], startTime: number): number {
  checkMatrixTimeout(startTime)
  // 高斯消元求秩
  const m = matrix.map(row => [...row])
  const rows = m.length
  const cols = m[0].length
  let rank = 0
  
  for (let col = 0; col < cols && rank < rows; col++) {
    checkMatrixTimeout(startTime)
    // 找主元
    let pivotRow = rank
    for (let i = rank + 1; i < rows; i++) {
      if (Math.abs(m[i][col]) > Math.abs(m[pivotRow][col])) {
        pivotRow = i
      }
    }
    
    if (Math.abs(m[pivotRow][col]) < 1e-10) continue
    
    // 交换行
    if (pivotRow !== rank) {
      [m[rank], m[pivotRow]] = [m[pivotRow], m[rank]]
    }
    
    // 消元
    for (let i = rank + 1; i < rows; i++) {
      const factor = m[i][col] / m[rank][col]
      for (let j = col; j < cols; j++) {
        m[i][j] -= factor * m[rank][j]
      }
    }
    rank++
  }
  
  return rank
}

self.onmessage = (e: MessageEvent) => {
  const { id, action, payload } = e.data
  const startTime = Date.now()
  try {
    if (action === 'multiply') {
      const { matrixA, matrixB } = payload
      const result = multiply(matrixA, matrixB)
      self.postMessage({ id, status: 'complete', result })
    } else if (action === 'add') {
      const { matrixA, matrixB } = payload
      const result = add(matrixA, matrixB)
      self.postMessage({ id, status: 'complete', result })
    } else if (action === 'subtract') {
      const { matrixA, matrixB } = payload
      const result = subtract(matrixA, matrixB)
      self.postMessage({ id, status: 'complete', result })
    } else if (action === 'transpose') {
      const { matrix } = payload
      const result = transpose(matrix)
      self.postMessage({ id, status: 'complete', result })
    } else if (action === 'determinant') {
      const { matrix } = payload
      const result = determinant(matrix, startTime)
      self.postMessage({ id, status: 'complete', result })
    } else if (action === 'inverse') {
      const { matrix } = payload
      const result = inverse(matrix, startTime)
      self.postMessage({ id, status: 'complete', result })
    } else if (action === 'power') {
      const { matrix, exponent } = payload
      const result = power(matrix, exponent, startTime)
      self.postMessage({ id, status: 'complete', result })
    } else if (action === 'trace') {
      const { matrix } = payload
      const result = trace(matrix, startTime)
      self.postMessage({ id, status: 'complete', result })
    } else if (action === 'norm') {
      const { matrix } = payload
      const result = norm(matrix)
      self.postMessage({ id, status: 'complete', result })
    } else if (action === 'rank') {
      const { matrix } = payload
      const result = rank(matrix, startTime)
      self.postMessage({ id, status: 'complete', result })
    }
  } catch (err: any) {
    self.postMessage({ id, status: 'error', error: err.message })
  }
}
