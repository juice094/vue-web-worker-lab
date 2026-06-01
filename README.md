# ⚙️ 数值计算实验室 —— Vue 3 + Web Worker

> **2026 Spring · 《Web前端开发技术》课程设计 — 后端组**
>
> 基于 Vue 3 + TypeScript + Web Worker 的前端数值计算实验平台。
> 核心演示：将耗时计算任务移交至后台 Worker 线程，避免阻塞 UI 主线程。

---

<p align="center">
  <img src="https://img.shields.io/badge/Vue-3.5-4FC08D?style=flat-square&logo=vue.js" alt="Vue">
  <img src="https://img.shields.io/badge/TypeScript-5.7-3178C6?style=flat-square&logo=typescript" alt="TypeScript">
  <img src="https://img.shields.io/badge/Vite-8-646CFF?style=flat-square&logo=vite" alt="Vite">
  <img src="https://img.shields.io/badge/Web%20Worker-API-FF6B6B?style=flat-square" alt="Web Worker">
  <img src="https://img.shields.io/badge/Pinia-3-FFD700?style=flat-square" alt="Pinia">
  <img src="https://img.shields.io/badge/Vue%20Router-4-4FC08D?style=flat-square" alt="Vue Router">
  <img src="https://img.shields.io/badge/license-Private-red?style=flat-square" alt="License">
</p>

---

## 📋 项目简介

本项目是一个**浏览器端数值计算实验平台**，核心教学目标是展示 **Web Worker** 在多线程计算中的应用：将 CPU 密集型的数学运算（矩阵运算、方程求解、大规模统计）从主线程移至后台 Worker 线程执行，确保 UI 界面始终保持流畅响应。

项目采用 **Vue 3 + TypeScript + Vite** 技术栈，包含 **5 个完整实现的数值计算模块**，每个模块均演示了不同的 Web Worker 通信模式与计算场景。当前版本 **V2.1 正式版**，全部核心功能已实现。

### 核心教学目标

| 技术点 | 教学目标 |
|:---|:---|
| **Web Worker 通信** | 主线程与 Worker 线程的消息传递（`postMessage` / `onmessage`） |
| **WorkerManager 封装** | 统一管理多个 Worker 实例的生命周期（创建/复用/销毁/错误处理） |
| **进度反馈** | 长时间计算的中途进度回传与 UI 更新 |
| **计算结果可视化** | Canvas 绑定渲染（函数曲线、矩阵热图、统计分布） |
| **TypeScript 类型安全** | Worker 消息协议的严格类型定义 |

---

## 🏗️ 技术架构

```
主线程 (Main Thread — Vue 3 App)
├── Router（5 个模块页面）
├── Pinia Store（全局状态 + 计算队列）
├── 视图组件（Chart / Table / Canvas / Form）
│
├── WorkerManager（统一封装层）
│   ├── createWorker(name)      ← 动态创建指定 Worker
│   ├── postMessage(name, data) ← 向指定 Worker 发送计算任务
│   ├── terminate(name)         ← 强制终止 Worker
│   ├── onProgress(cb)          ← 监听进度回调
│   └── onComplete(cb)          ← 监听完成回调
│
└── src/workers/（后台计算线程）
    ├── calc.worker.ts          ← 标准计算器
    ├── plot.worker.ts          ← 函数绘图采样
    ├── matrix.worker.ts        ← 矩阵运算
    ├── solver.worker.ts        ← 方程求解
    └── stats.worker.ts         ← 统计分析
```

---

## 📁 项目结构

```
vue-web-worker-lab/
├── index.html                        # HTML 入口
├── vite.config.js                    # Vite 配置
├── tsconfig.json                     # TypeScript 配置
├── package.json                      # 依赖管理
├── src/
│   ├── main.ts                       # 应用入口
│   ├── App.vue                       # 根组件（导航栏 + Worker 状态 + 进度条）
│   ├── router/
│   │   └── index.ts                  # Vue Router 配置（5 页面路由）
│   ├── stores/
│   │   └── appStore.ts               # Pinia 全局状态（Worker 繁忙状态）
│   ├── views/
│   │   ├── CalculatorView.vue        # 标准计算器（235 行）
│   │   ├── PlotterView.vue           # 函数绘图（397 行）
│   │   ├── MatrixLabView.vue         # 矩阵实验室（350 行）
│   │   ├── SolverView.vue            # 数值方程求解（712 行）
│   │   └── DataAnalysisView.vue      # 数据分析台（524 行）
│   ├── components/
│   │   ├── DataUploader.vue          # 数据上传组件
│   │   ├── EquationInput.vue         # 方程输入组件
│   │   ├── MatrixEditor.vue          # 矩阵编辑器
│   │   ├── ParamForm.vue             # 参数表单
│   │   └── ResultPanel.vue           # 结果展示面板
│   ├── workers/
│   │   ├── calc.worker.ts            # 标准计算器 Worker（14 行）
│   │   ├── plot.worker.ts            # 函数绘图采样 Worker（34 行）
│   │   ├── matrix.worker.ts          # 矩阵运算 Worker（207 行）
│   │   ├── solver.worker.ts          # 方程求解 Worker（743 行）
│   │   └── stats.worker.ts           # 统计分析 Worker（137 行）
│   ├── composables/
│   │   ├── useWorker.ts              # WorkerManager 封装（101 行）
│   │   ├── useMatrix.ts              # 矩阵运算 Hook
│   │   ├── useSolver.ts              # 方程求解 Hook（71 行）
│   │   └── useStats.ts               # 统计分析 Hook
│   └── style.css                     # 全局样式
├── 666.md                            # 项目开发笔记
├── code.md                           # 代码说明文档
├── tt.md                             # 技术方案文档
└── README.md                         # 本文件
```

> **开发状态**：V2.1 正式版，全部 5 个计算模块 + Worker 通信链路已实现。

---

## 🚀 快速开始

### 环境要求

- Node.js ≥ 18
- pnpm ≥ 8（推荐）或 npm

### 安装与启动

```bash
# 克隆仓库
git clone https://github.com/juice094/vue-web-worker-lab.git
cd vue-web-worker-lab

# 安装依赖
pnpm install

# 启动开发服务器
pnpm dev
# → http://localhost:5173
```

### Web Worker 配置说明

Vite 原生支持 Worker 编译，使用 `?worker` 后缀导入：

```typescript
// src/composables/useWorker.ts
import CalcWorker from '@/workers/calc.worker.ts?worker'

const worker = new CalcWorker()
worker.postMessage({ type: 'CALCULATE', payload: { expression: '2+2' } })
worker.onmessage = (e) => {
  console.log('Result:', e.data.result)
}
```

---

## 🧮 五大计算模块

### 模块 1：标准计算器

| 属性 | 说明 |
|:---|:---|
| **功能** | 四则运算、科学函数（sin/cos/log/exp）、大精度整数运算 |
| **Worker 用途** | 大整数/高精度浮点运算不阻塞 UI |
| **输入** | 数学表达式字符串或交互式按钮 |
| **输出** | 计算结果 + 计算耗时 |
| **可视化** | 文本结果 + 计算耗时 |

### 模块 2：函数绘图

| 属性 | 说明 |
|:---|:---|
| **功能** | 数学函数 2D 可视化（y=f(x)） |
| **Worker 用途** | 批量采样点计算（大范围高精度采样） |
| **输入** | 函数表达式字符串 + 定义域范围 |
| **输出** | 采样点数组 + Canvas 曲线渲染 |
| **可视化** | Canvas 绑定点线图 / 区域填充 |

### 模块 3：矩阵实验室 ⭐

| 属性 | 说明 |
|:---|:---|
| **功能** | 矩阵乘法、求逆、行列式、转置、幂运算 |
| **Worker 用途** | 高维矩阵运算不阻塞 UI |
| **输入** | 矩阵二维数组（MatrixEditor 组件交互式编辑） |
| **输出** | 运算结果矩阵 + 耗时 |
| **可视化** | 结果矩阵表格 + 热力色阶渲染 |
| **优先级** | **P0 — 输入输出最清晰，最易验证 Worker 链路** |

### 模块 4：数值方程求解

| 属性 | 说明 |
|:---|:---|
| **功能** | 线性方程组（高斯消元）、非线性方程（Newton-Raphson）、常微分方程（Runge-Kutta） |
| **Worker 用途** | 迭代算法后台执行，支持分步进度回传 |
| **输入** | 方程参数 / 系数矩阵 / 初始值（EquationInput + ParamForm 组件） |
| **输出** | 解向量 + 收敛曲线（迭代历史） |
| **可视化** | Canvas 收敛折线图 |
| **优先级** | P1 — 最复杂模块，712 行 View + 743 行 Worker |

### 模块 5：数据分析台

| 属性 | 说明 |
|:---|:---|
| **功能** | 描述统计（均值/方差/分位数）、线性回归、直方图/分布拟合 |
| **Worker 用途** | 大数据量统计计算 |
| **输入** | CSV 文本或随机生成数据（DataUploader 组件） |
| **输出** | 统计量 + 回归系数 + 拟合优度 |
| **可视化** | Canvas 直方图 + 散点图 + 回归线 |
| **优先级** | P1 — 复用绘图能力，Worker 内纯统计公式 |

---

## 📝 开发路线图

| 阶段 | 内容 | 预估代码量 | 状态 | 优先级 |
|:---|:---|:---:|:---:|:---:|
| **Phase 0** | Vite + Vue 3 + TypeScript 项目初始化 | ~100 行 | ✅ 完成 | P0 |
| **Phase 1** | WorkerManager 封装 + 类型协议定义 | ~100 行 | ✅ 完成 | P0 |
| **Phase 2** | **矩阵实验室**（乘法/求逆/特征值/行列式） | ~500 行 | ✅ 完成 | **P0** |
| **Phase 3** | 函数绘图（2D 采样 + Canvas 曲线） | ~400 行 | ✅ 完成 | P1 |
| **Phase 4** | 数据分析台（统计 + 回归 + 直方图） | ~500 行 | ✅ 完成 | P1 |
| **Phase 5** | 标准计算器（表达式解析 + 科学函数） | ~250 行 | ✅ 完成 | P2 |
| **Phase 6** | 方程求解（线性/非线性/ODE + 收敛曲线） | ~1,500 行 | ✅ 完成 | P1 |
| **Phase 7** | UI 美化（主题/动画/响应式） | ~300 行 | ✅ 完成 | P2 |
| Phase 8 | 3D 函数曲面（WebGL） | 200-300 行 | ⏳ 可选扩展 | P3 |

### 矩阵实验室优先理由

1. **输入输出结构最清晰**：二维数组进 → 二维数组出，无字符串解析歧义
2. **Worker 效果最明显**：大矩阵运算（500×500）在主线程会卡顿数秒，Worker 中不影响 UI
3. **可视化最直观**：结果矩阵用热力色阶渲染，颜色深浅 = 数值大小
4. **算法经典且成熟**：高斯消元、LU 分解、幂法求特征值等教科书标准算法

---

## 🧪 Web Worker 核心实现示例

### Worker 消息协议（TypeScript）

```typescript
// src/types/worker.ts

// 通用请求格式
export interface WorkerRequest<T> {
  id: string           // 任务唯一标识
  type: string         // 任务类型
  payload: T           // 任务参数
}

// 通用响应格式
export interface WorkerResponse<T> {
  id: string
  status: 'progress' | 'complete' | 'error'
  data?: T
  progress?: number   // 0-100
  error?: string
}

// 矩阵运算专用
export interface MatrixPayload {
  operation: 'multiply' | 'inverse' | 'eigenvalue' | 'determinant'
  matrixA: number[][]
  matrixB?: number[][]
}
```

### Worker 脚本模板

```typescript
// src/workers/matrix.worker.ts

self.onmessage = (e: MessageEvent) => {
  const { id, type, payload } = e.data

  if (type === 'MATRIX_OPERATION') {
    const result = performMatrixOperation(payload)

    // 进度反馈（大矩阵分块计算时）
    self.postMessage({ id, status: 'progress', progress: 50 })

    // 最终结果
    self.postMessage({ id, status: 'complete', data: result })
  }
}

function performMatrixOperation(payload: MatrixPayload): number[][] {
  switch (payload.operation) {
    case 'multiply': return matrixMultiply(payload.matrixA, payload.matrixB!)
    case 'inverse': return matrixInverse(payload.matrixA)
    case 'eigenvalue': return powerIteration(payload.matrixA)
    case 'determinant': return [[determinant(payload.matrixA)]]
  }
}
```

---

## 👥 组员分工建议

| 方向 | 工作内容 | 预估代码量 | 适合技能 |
|:---|:---|:---:|:---|
| **WorkerManager + 类型系统** | 封装 Worker 生命周期 + 消息协议类型定义 | 200-300 行 | TypeScript 类型系统 |
| **矩阵实验室** | 矩阵算法实现 + 热图可视化 + Worker 集成 | 400-600 行 | 线性代数基础 |
| **函数绘图** | 表达式求值 + 采样算法 + ECharts 曲线 | 300-400 行 | 数学/可视化兴趣 |
| **数据分析** | 统计公式 + 回归算法 + 直方图 + CSV 解析 | 300-400 行 | 统计学基础 |
| **方程求解** | 迭代算法 + 收敛检测 + 公式解析器 | 400-500 行 | 数值分析兴趣 |
| **UI/UX** | Vue 组件美化、主题、响应式布局、动画 | 200-300 行 | CSS/Vue 组件 |

---

## 📚 相关文档

| 文档 | 路径 | 说明 |
|:---|:---|:---|
| **项目开发笔记** | `666.md` | 开发过程记录与问题追踪 |
| **代码说明文档** | `code.md` | 完整代码架构与模块说明 |
| **技术方案文档** | `tt.md` | Worker 通信协议、模块详细设计 |
| **Vue Web Worker 技术方案** | `course-design-2026-spring/00-materials/tt-技术方案/` | 格雷整理的原始技术方案 |
| **课程设计团队指南** | `course-design-2026-spring/课程设计团队指南.md` | 三组整体规划与协调 |

---

## 🔧 开发规范

### Git 工作流

```bash
# 创建功能分支
git checkout -b feature/你的名字-功能名

# 开发并提交
git add .
git commit -m "feat(matrix): 实现矩阵乘法 Worker 与热图可视化"

# 推送并发起 PR
git push origin feature/你的名字-功能名
# → 在 GitHub 发起 Pull Request，等待 review
```

### Commit Message 规范

| 类型 | 用途 | 示例 |
|:---|:---|:---|
| `feat:` | 新功能 | `feat(matrix): 实现高斯消元求逆矩阵` |
| `fix:` | Bug 修复 | `fix(worker): 修复大矩阵传输时的栈溢出` |
| `docs:` | 文档 | `docs: 更新矩阵实验室 API 说明` |
| `refactor:` | 重构 | `refactor: 提取 Worker 错误处理为公共函数` |

---

## 📄 License

Private — 仅限 2026 Spring 《Web前端开发技术》课程设计小组内部使用。

---

<p align="center">
  <sub>Built with ❤️ and Web Worker · 2026 Spring Web前端开发技术课程设计小组</sub>
</p>
