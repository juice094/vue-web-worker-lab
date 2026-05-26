const TIMEOUT_MS = 5000

function checkTimeout(start: number) {
  if (Date.now() - start > TIMEOUT_MS) {
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
  checkTimeout(startTime)
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
  checkTimeout(startTime)
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
    }
  } catch (err: any) {
    self.postMessage({ id, status: 'error', error: err.message })
  }
}
