import { useWorker } from './useWorker'

export function useSolver() {
  const { run } = useWorker(new URL('../workers/solver.worker.ts', import.meta.url))
  
  const solveLinear = (A: number[][], b: number[]) => run<{x: number, y: number}>('linear-2d', { A, b })
  const solveNonLinear = (expr: string, guess: number) => run<{root: number, iterations: number}>('nonlinear-secant', { expr, guess })
  
  return { solveLinear, solveNonLinear }
}
