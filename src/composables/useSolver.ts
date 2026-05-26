import { useWorker } from './useWorker'

export function useSolver() {
  const { run } = useWorker(new URL('../workers/solver.worker.ts', import.meta.url))
  
  // 线性方程组求解 - 直接法
  const solveLinearGaussian = (A: number[][], b: number[]) => 
    run<{solution: number[], method: string}>('linear-gaussian', { A, b })
  const solveLinearLU = (A: number[][], b: number[]) => 
    run<{solution: number[], method: string}>('linear-lu', { A, b })
  const solveLinearQR = (A: number[][], b: number[]) => 
    run<{solution: number[], method: string}>('linear-qr', { A, b })
  const solveLinearCholesky = (A: number[][], b: number[]) => 
    run<{solution: number[], method: string}>('linear-cholesky', { A, b })
  const solveLinear2D = (A: number[][], b: number[]) => 
    run<{solution: number[], method: string}>('linear-2d', { A, b })
  
  // 线性方程组求解 - 迭代法
  const solveLinearGaussSeidel = (A: number[][], b: number[], maxIter: number = 1000, tol: number = 1e-10) => 
    run<{solution: number[], method: string, iterations: number}>('linear-gauss-seidel', { A, b, maxIter, tol })
  const solveLinearJacobi = (A: number[][], b: number[], maxIter: number = 1000, tol: number = 1e-10) => 
    run<{solution: number[], method: string, iterations: number}>('linear-jacobi', { A, b, maxIter, tol })
  const solveLinearSOR = (A: number[][], b: number[], omega: number = 1.5, maxIter: number = 1000, tol: number = 1e-10) => 
    run<{solution: number[], method: string, iterations: number}>('linear-sor', { A, b, omega, maxIter, tol })
  const solveLinearCG = (A: number[][], b: number[], maxIter: number = 1000, tol: number = 1e-10) => 
    run<{solution: number[], method: string, iterations: number}>('linear-cg', { A, b, maxIter, tol })
  
  // 非线性方程求解
  const solveNewton = (expr: string, guess: number, maxIter: number = 1000, tol: number = 1e-10) => 
    run<{root: number, iterations: number, method: string, order: string}>('nonlinear-newton', { expr, guess, maxIter, tol })
  const solveBisection = (expr: string, a: number, b: number, maxIter: number = 1000, tol: number = 1e-10) => 
    run<{root: number, iterations: number, method: string, order: string}>('nonlinear-bisection', { expr, a, b, maxIter, tol })
  const solveSecant = (expr: string, x0: number, x1: number, maxIter: number = 1000, tol: number = 1e-10) => 
    run<{root: number, iterations: number, method: string, order: string}>('nonlinear-secant', { expr, x0, x1, maxIter, tol })
  const solveDampedNewton = (expr: string, guess: number, maxIter: number = 1000, tol: number = 1e-10) => 
    run<{root: number, iterations: number, method: string, order: string}>('nonlinear-damped-newton', { expr, guess, maxIter, tol })
  const solveRegulaFalsi = (expr: string, a: number, b: number, maxIter: number = 1000, tol: number = 1e-10) => 
    run<{root: number, iterations: number, method: string, order: string}>('nonlinear-regula-falsi', { expr, a, b, maxIter, tol })
  const solveBrent = (expr: string, a: number, b: number, maxIter: number = 1000, tol: number = 1e-10) => 
    run<{root: number, iterations: number, method: string, order: string}>('nonlinear-brent', { expr, a, b, maxIter, tol })
  const solveFixedPoint = (expr: string, guess: number, maxIter: number = 1000, tol: number = 1e-10) => 
    run<{root: number, iterations: number, method: string, order: string}>('nonlinear-fixed-point', { expr, guess, maxIter, tol })
  
  // 函数求值
  const evaluateFunction = (expr: string, xValues: number[]) => 
    run<{values: number[], method: string}>('function-eval', { expr, xValues })
  
  return { 
    // 直接法
    solveLinearGaussian, 
    solveLinearLU,
    solveLinearQR,
    solveLinearCholesky,
    solveLinear2D,
    // 迭代法
    solveLinearGaussSeidel,
    solveLinearJacobi,
    solveLinearSOR,
    solveLinearCG,
    // 非线性方程
    solveNewton,
    solveBisection,
    solveSecant,
    solveDampedNewton,
    solveRegulaFalsi,
    solveBrent,
    solveFixedPoint,
    // 工具函数
    evaluateFunction
  }
}
