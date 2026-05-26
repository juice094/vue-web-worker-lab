import { ref, onUnmounted } from 'vue'
import { useAppStore } from '../stores/appStore'

export function useWorker(workerUrl: URL) {
  const appStore = useAppStore()
  const progress = ref(0)
  const worker = new Worker(workerUrl, { type: 'module' })
  const activeTasks = new Map<string, { resolve: Function; reject: Function }>()

  worker.onmessage = (e: MessageEvent) => {
    const { id, status, result, error, progress: taskProgress } = e.data
    
    // 处理进度消息
    if (status === 'progress' && taskProgress !== undefined) {
      progress.value = taskProgress
      return
    }
    
    const task = activeTasks.get(id)
    if (task) {
      if (status === 'complete') {
        task.resolve(result)
      } else {
        task.reject(new Error(error))
      }
    }
  }

  worker.onerror = (err) => {
    console.error('Worker Engine Fatal Error:', err)
    appStore.setBusy(false)
  }

  const TIMEOUT = 5000

  const run = <T>(action: string, payload: any, transferList: Transferable[] = []): Promise<T> => {
    appStore.setBusy(true)
    progress.value = 0
    return new Promise((resolve, reject) => {
      const id = Math.random().toString(36).substring(2, 11)
      let timeoutId: ReturnType<typeof setTimeout>

      // 模拟进度动画：即使计算很快，也要让用户看到进度过程
      let simulatedProgress = 0
      const progressInterval = setInterval(() => {
        // 渐进式增加进度，越接近完成越慢（营造真实感）
        if (simulatedProgress < 30) {
          simulatedProgress += 2 // 快速启动阶段
        } else if (simulatedProgress < 60) {
          simulatedProgress += 1.5 // 稳定计算阶段
        } else if (simulatedProgress < 85) {
          simulatedProgress += 1 // 深度分析阶段
        } else if (simulatedProgress < 95) {
          simulatedProgress += 0.5 // 即将完成（慢下来）
        }
        
        // 只有当模拟进度小于实际进度时才更新
        if (simulatedProgress < progress.value || progress.value === 0) {
          progress.value = Math.min(simulatedProgress, 95)
        }
      }, 50) // 每 50ms 更新一次

      const wrappedResolve = (value: T) => {
        clearInterval(progressInterval) // 清除模拟进度定时器
        clearTimeout(timeoutId)
        activeTasks.delete(id)
        progress.value = 100
        
        // 保持 100% 状态 500ms 再重置，让用户看到完成状态
        setTimeout(() => { 
          progress.value = 0 
          if (activeTasks.size === 0) appStore.setBusy(false)
        }, 500)
        
        resolve(value)
      }

      const wrappedReject = (reason: any) => {
        clearInterval(progressInterval) // 清除模拟进度定时器
        clearTimeout(timeoutId)
        activeTasks.delete(id)
        reject(reason)
        if (activeTasks.size === 0) appStore.setBusy(false)
      }

      activeTasks.set(id, { resolve: wrappedResolve, reject: wrappedReject })

      timeoutId = setTimeout(() => {
        wrappedReject(new Error('计算超时（超过5秒）'))
      }, TIMEOUT)

      worker.postMessage({ id, action, payload }, transferList)
    })
  }

  onUnmounted(() => {
    worker.terminate()
  })

  return { run, progress }
}
