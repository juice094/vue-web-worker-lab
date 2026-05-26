import { onUnmounted } from 'vue'
import { useAppStore } from '../stores/appStore'

export function useWorker(workerUrl: URL) {
  const appStore = useAppStore()
  const worker = new Worker(workerUrl, { type: 'module' })
  const activeTasks = new Map<string, { resolve: Function; reject: Function }>()

  worker.onmessage = (e: MessageEvent) => {
    const { id, status, result, error } = e.data
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
    return new Promise((resolve, reject) => {
      const id = Math.random().toString(36).substring(2, 11)
      let timeoutId: ReturnType<typeof setTimeout>

      const wrappedResolve = (value: T) => {
        clearTimeout(timeoutId)
        activeTasks.delete(id)
        resolve(value)
        if (activeTasks.size === 0) appStore.setBusy(false)
      }

      const wrappedReject = (reason: any) => {
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

  return { run }
}
