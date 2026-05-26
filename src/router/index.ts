import { createRouter, createWebHistory } from 'vue-router'
import CalculatorView from '../views/CalculatorView.vue'
import PlotterView from '../views/PlotterView.vue'
import MatrixLabView from '../views/MatrixLabView.vue'
import SolverView from '../views/SolverView.vue'
import DataAnalysisView from '../views/DataAnalysisView.vue'

const routes = [
  { path: '/', name: 'Home', redirect: '/calc' },
  { path: '/calc', name: 'Calculator', component: CalculatorView, meta: { nav: '标准计算器' } },
  { path: '/plot', name: 'Plotter', component: PlotterView, meta: { nav: '函数绘图' } },
  { path: '/matrix', name: 'MatrixLab', component: MatrixLabView, meta: { nav: '矩阵实验室' } },
  { path: '/solver', name: 'Solver', component: SolverView, meta: { nav: '数值方程求解' } },
  { path: '/data', name: 'DataAnalysis', component: DataAnalysisView, meta: { nav: '数据分析台' } }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
