<script setup lang="ts">
import { useRouter, useRoute } from 'vue-router'
import { useAppStore } from './stores/appStore'
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'

const router = useRouter()
const route = useRoute()
const appStore = useAppStore()
const isSidebarCollapsed = ref(false)
const navItems = router.getRoutes().filter(r => r.meta && r.meta.nav)

// 禁止浏览器缩放
const preventZoom = (e: KeyboardEvent) => {
  if ((e.ctrlKey || e.metaKey) && (e.key === '+' || e.key === '-' || e.key === '=' || e.key === '0')) {
    e.preventDefault()
  }
}

const preventWheelZoom = (e: WheelEvent) => {
  if (e.ctrlKey || e.metaKey) {
    e.preventDefault()
  }
}

onMounted(() => {
  window.addEventListener('keydown', preventZoom)
  window.addEventListener('wheel', preventWheelZoom, { passive: false })
})

onUnmounted(() => {
  window.removeEventListener('keydown', preventZoom)
  window.removeEventListener('wheel', preventWheelZoom)
})

// Worker 进度状态
const workerProgress = ref(0)
const workerActivity = ref(false)

// 监听 Worker 进度并更新状态
watch(() => appStore.isWorkerBusy, (isBusy) => {
  if (isBusy) {
    workerActivity.value = true
  } else {
    // 延迟一点再停止动画，让用户看到完成效果
    setTimeout(() => {
      workerActivity.value = false
    }, 500)
  }
})

// 循环进度动画：即使实际计算很快，也让进度条持续动
let animationFrame: number | null = null
let animatedProgress = 0
const animateProgress = () => {
  if (appStore.isWorkerBusy) {
    animatedProgress += 0.5 // 每帧增加 0.5%
    if (animatedProgress > 100) animatedProgress = 0 // 循环
    workerProgress.value = animatedProgress
    animationFrame = requestAnimationFrame(animateProgress)
  }
}

watch(() => appStore.isWorkerBusy, (isBusy) => {
  if (isBusy && !animationFrame) {
    animatedProgress = 0
    animateProgress()
  } else if (!isBusy && animationFrame) {
    cancelAnimationFrame(animationFrame)
    animationFrame = null
    workerProgress.value = 100
    setTimeout(() => { workerProgress.value = 0 }, 500)
  }
})

const statusText = computed(() => {
  if (!appStore.isWorkerBusy) return '运算就绪'
  if (workerProgress.value < 20) return '正在启动线程...'
  if (workerProgress.value < 40) return '数据预处理中...'
  if (workerProgress.value < 60) return 'Worker 计算中...'
  if (workerProgress.value < 80) return '高级统计分析...'
  if (workerProgress.value < 100) return '即将完成...'
  return '计算完成'
})

const toggleSidebar = () => {
  isSidebarCollapsed.value = !isSidebarCollapsed.value
}

const getIcon = (path: string) => {
  const icons: Record<string, string> = {
    '/calc': '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="2" width="16" height="20" rx="2"/><line x1="8" y1="6" x2="16" y2="6"/><line x1="8" y1="10" x2="8" y2="10.01"/><line x1="12" y1="10" x2="12" y2="10.01"/><line x1="16" y1="10" x2="16" y2="10.01"/><line x1="8" y1="14" x2="8" y2="14.01"/><line x1="12" y1="14" x2="12" y2="14.01"/><line x1="16" y1="14" x2="16" y2="14.01"/><line x1="8" y1="18" x2="8" y2="18.01"/><line x1="12" y1="18" x2="12" y2="18.01"/><line x1="16" y1="18" x2="16" y2="18.01"/></svg>',
    '/plot': '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>',
    '/matrix': '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="3" y1="15" x2="21" y2="15"/><line x1="9" y1="3" x2="9" y2="21"/><line x1="15" y1="3" x2="15" y2="21"/></svg>',
    '/solver': '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h16v16H4z"/><path d="M4 12h16"/><path d="M12 4v16"/></svg>',
    '/data': '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>'
  }
  return icons[path] || '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/></svg>'
}

const navigateTo = (path: string) => {
  console.log('导航到:', path)
  router.push(path)
}
</script>

<template>
  <div class="app-layout">
    <aside class="sidebar" :class="{ collapsed: isSidebarCollapsed }">
      <div class="sidebar-header" @click="toggleSidebar">
        <span class="menu-burger">≡</span>
      </div>
      <div class="sidebar-brand">
        <div class="brand-logo">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polygon points="12 2 2 7 12 12 22 7 12 2"/>
            <polyline points="2 17 12 22 22 17"/>
            <polyline points="2 12 12 17 22 12"/>
          </svg>
        </div>
        <div class="brand-info">
          <h3 class="brand-title">Web Worker</h3>
          <p class="brand-subtitle">多线程计算平台</p>
        </div>
      </div>
      <nav class="nav-menu">
        <div 
          v-for="item in navItems" 
          :key="item.path"
          :class="['nav-item', { active: route.path === item.path }]"
          @click="navigateTo(item.path)"
          :role="'button'"
          :title="isSidebarCollapsed ? item.meta.nav as string : ''"
        >
          <span class="nav-icon" v-html="getIcon(item.path)"></span>
          <span class="nav-text">{{ item.meta.nav }}</span>
        </div>
      </nav>
      <div class="sidebar-footer">
        <div class="status-container">
          <div class="status-indicator" :class="{ 
            busy: appStore.isWorkerBusy,
            active: workerActivity
          }">
            <span class="status-dot"></span>
            <span class="status-text">{{ statusText }}</span>
          </div>
          <div v-if="appStore.isWorkerBusy" class="progress-bar">
            <div class="progress-fill" :style="{ width: workerProgress + '%' }"></div>
          </div>
        </div>
      </div>
    </aside>
    <main class="main-stage">
      <router-view />
    </main>
  </div>
</template>

<style scoped>
.app-layout {
  display: flex;
  width: 100vw;
  height: 100vh;
  background: var(--bg-primary);
}

.sidebar {
  width: 260px;
  background: var(--bg-secondary);
  border-right: 1px solid var(--border-color);
  display: flex;
  flex-direction: column;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  overflow: hidden;
  box-shadow: var(--shadow-md);
}

.sidebar.collapsed {
  width: 70px;
}

.sidebar-header {
  padding: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-bottom: 1px solid var(--border-color);
}

.sidebar.collapsed .sidebar-header {
  padding: 20px 0;
}

.menu-burger {
  font-size: 22px;
  cursor: pointer;
  display: inline-block;
  transition: transform 0.3s ease;
  color: var(--text-secondary);
}

.menu-burger:hover {
  color: var(--text-primary);
}

.sidebar.collapsed .menu-burger {
  transform: rotate(90deg);
}

/* 品牌区域 */
.sidebar-brand {
  padding: 24px 20px;
  display: flex;
  align-items: center;
  gap: 14px;
  border-bottom: 1px solid var(--border-color);
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.08) 0%, rgba(118, 75, 162, 0.08) 100%);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.sidebar.collapsed .sidebar-brand {
  padding: 20px 10px;
  justify-content: center;
}

.brand-logo {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: var(--border-radius-sm);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
  transition: all 0.3s ease;
}

.brand-logo svg {
  color: white;
  width: 24px;
  height: 24px;
}

.brand-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
  overflow: hidden;
}

.sidebar.collapsed .brand-info {
  display: none;
}

.brand-title {
  margin: 0;
  font-size: 18px;
  font-weight: 700;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  letter-spacing: -0.5px;
  white-space: nowrap;
}

.brand-subtitle {
  margin: 0;
  font-size: 12px;
  color: var(--text-secondary);
  white-space: nowrap;
  opacity: 0.8;
}

.nav-menu {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 12px;
  overflow-y: auto;
}

.sidebar.collapsed .nav-menu {
  align-items: center;
  padding: 12px 0;
}

.nav-item {
  padding: 14px 18px;
  border-radius: var(--border-radius-sm);
  cursor: pointer;
  font-size: 15px;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  user-select: none;
  pointer-events: all;
  display: flex;
  align-items: center;
  gap: 14px;
  white-space: nowrap;
  color: var(--text-secondary);
  position: relative;
  overflow: hidden;
}

.sidebar.collapsed .nav-item {
  padding: 14px;
  justify-content: center;
}

.nav-item::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 3px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  transform: scaleY(0);
  transition: transform 0.2s;
}

.nav-item:hover {
  background: var(--bg-hover);
  color: var(--text-primary);
  transform: translateX(4px);
}

.nav-item.active {
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.15) 0%, rgba(118, 75, 162, 0.15) 100%);
  color: var(--color-primary);
  font-weight: 600;
  box-shadow: 0 2px 8px rgba(102, 126, 234, 0.2);
}

.nav-item.active::before {
  transform: scaleY(1);
}

.sidebar.collapsed .nav-item.active {
  border-left: none;
  border-bottom: 3px solid transparent;
}

.sidebar.collapsed .nav-item.active::before {
  transform: scaleX(1);
  width: 100%;
  height: 3px;
  bottom: 0;
  top: auto;
}

.nav-text {
  transition: opacity 0.2s ease;
}

.sidebar.collapsed .nav-text {
  display: none;
}

.nav-icon {
  display: none;
  flex-shrink: 0;
}

.sidebar:not(.collapsed) .nav-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.nav-icon svg {
  width: 20px;
  height: 20px;
  stroke: currentColor;
}

.sidebar.collapsed .nav-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.sidebar-footer {
  padding: 18px 20px;
  border-top: 1px solid var(--border-color);
  font-size: 13px;
  overflow: hidden;
  transition: padding 0.3s ease;
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.05) 0%, rgba(118, 75, 162, 0.05) 100%);
}

.sidebar.collapsed .sidebar-footer {
  padding: 18px 5px;
  text-align: center;
}

.status-container {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.status-indicator {
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.3s ease;
}

.status-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: var(--color-success);
  box-shadow: 0 0 8px var(--color-success);
  transition: all 0.3s ease;
}

.status-indicator.busy .status-dot {
  background: var(--color-warning);
  box-shadow: 0 0 12px var(--color-warning);
  animation: pulse 1.5s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.6;
    transform: scale(1.2);
  }
}

.status-text {
  color: var(--text-secondary);
  font-size: 13px;
  transition: color 0.3s ease;
}

.status-indicator.busy .status-text {
  color: var(--color-warning);
  font-weight: 500;
}

.progress-bar {
  width: 100%;
  height: 4px;
  background: var(--bg-secondary);
  border-radius: 2px;
  overflow: hidden;
  box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.3);
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--color-primary), var(--color-success));
  border-radius: 2px;
  transition: width 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 0 10px rgba(102, 126, 234, 0.5);
}

.sidebar.collapsed .status-indicator {
  font-size: 11px;
  justify-content: center;
}

.status-indicator.busy {
  color: var(--color-warning);
}

.main-stage {
  flex: 1;
  height: 100vh;
  overflow-y: auto;
  background: var(--bg-primary);
}
</style>
