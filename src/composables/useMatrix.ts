import { useWorker } from './useWorker'

export function useMatrix() {
  const { run } = useWorker(new URL('../workers/matrix.worker.ts', import.meta.url))

  const multiply = (matrixA: number[][], matrixB: number[][]) => run<number[][]>('multiply', { matrixA, matrixB })
  const add = (matrixA: number[][], matrixB: number[][]) => run<number[][]>('add', { matrixA, matrixB })
  const subtract = (matrixA: number[][], matrixB: number[][]) => run<number[][]>('subtract', { matrixA, matrixB })
  const transpose = (matrix: number[][]) => run<number[][]>('transpose', { matrix })
  const determinant = (matrix: number[][]) => run<number>('determinant', { matrix })
  const inverse = (matrix: number[][]) => run<number[][]>('inverse', { matrix })
  const power = (matrix: number[][], exponent: number) => run<number[][]>('power', { matrix, exponent })
  const trace = (matrix: number[][]) => run<number>('trace', { matrix })
  const norm = (matrix: number[][]) => run<number>('norm', { matrix })
  const rank = (matrix: number[][]) => run<number>('rank', { matrix })

  return { multiply, add, subtract, transpose, determinant, inverse, power, trace, norm, rank }
}
