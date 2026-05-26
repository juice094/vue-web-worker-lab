<script setup lang="ts">
import { useRouter, useRoute } from 'vue-router'
import { useAppStore } from './stores/appStore'
import { ref } from 'vue'

const router = useRouter()
const route = useRoute()
const appStore = useAppStore()
const isSidebarCollapsed = ref(false)
const navItems = router.getRoutes().filter(r => r.meta && r.meta.nav)

const toggleSidebar = () => {
  isSidebarCollapsed.value = !isSidebarCollapsed.value
}

const getIcon = (path: string) => {
  const icons: Record<string, string> = {
    '/calc': '🧮',
    '/plot': '📈',
    '/matrix': '🔢',
    '/solver': '📐',
    '/data': '📊'
  }
  return icons[path] || '📋'
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
      <nav class="nav-menu">
        <div 
          v-for="item in navItems" 
          :key="item.path"
          :class="['nav-item', { active: route.path === item.path }]"
          @click="navigateTo(item.path)"
          :role="'button'"
          :title="isSidebarCollapsed ? item.meta.nav as string : ''"
        >
          <span class="nav-icon">{{ getIcon(item.path) }}</span>
          <span class="nav-text">{{ item.meta.nav }}</span>
        </div>
      </nav>
      <div class="sidebar-footer">
        <span class="status-indicator" :class="{ busy: appStore.isWorkerBusy }">
          {{ appStore.isWorkerBusy ? '⚙️ 线程后台计算中...' : '🟢 运算就绪' }}
        </span>
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
  background-color: #202020;
}
.sidebar {
  width: 260px;
  background-color: #202020;
  border-right: 1px solid #2d2d2d;
  display: flex;
  flex-direction: column;
  transition: width 0.3s ease;
  overflow: hidden;
}
.sidebar.collapsed {
  width: 60px;
}
.sidebar-header {
  padding: 15px 20px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.sidebar.collapsed .sidebar-header {
  padding: 15px 0;
}
.menu-burger {
  font-size: 20px;
  cursor: pointer;
  display: inline-block;
  transition: transform 0.3s ease;
}
.sidebar.collapsed .menu-burger {
  transform: rotate(90deg);
}
.nav-menu {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: 5px;
}
.sidebar.collapsed .nav-menu {
  align-items: center;
  padding: 5px 0;
}
.nav-item {
  padding: 12px 20px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: background 0.15s;
  user-select: none;
  pointer-events: all;
  display: flex;
  align-items: center;
  gap: 12px;
  white-space: nowrap;
}
.sidebar.collapsed .nav-item {
  padding: 12px;
  justify-content: center;
}
.nav-item:hover {
  background-color: #2d2d2d;
}
.nav-item.active {
  background-color: #333333;
  border-left: 4px solid #d7a3e5;
  font-weight: 600;
}
.sidebar.collapsed .nav-item.active {
  border-left: none;
  border-bottom: 3px solid #d7a3e5;
}
.nav-text {
  transition: opacity 0.2s ease;
}
.sidebar.collapsed .nav-text {
  display: none;
}
.nav-icon {
  font-size: 18px;
  display: none;
}
.sidebar.collapsed .nav-icon {
  display: inline-block;
}
.sidebar-footer {
  padding: 15px 20px;
  border-top: 1px solid #2d2d2d;
  font-size: 12px;
  overflow: hidden;
  transition: padding 0.3s ease;
}
.sidebar.collapsed .sidebar-footer {
  padding: 15px 5px;
  text-align: center;
}
.status-indicator {
  color: #85e3b3;
  transition: opacity 0.2s ease;
}
.sidebar.collapsed .status-indicator {
  font-size: 10px;
}
.status-indicator.busy {
  color: #ffb347;
}
.main-stage {
  flex: 1;
  height: 100vh;
  overflow-y: auto;
  background-color: #202020;
}
</style>
