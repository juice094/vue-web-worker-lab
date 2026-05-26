import { useWorker } from './useWorker'
import { computed } from 'vue'

export function useStats() {
  const { run, progress } = useWorker(new URL('../workers/stats.worker.ts', import.meta.url))
  
  const analyze = (data: Float64Array) => run<any>('descriptive', data, [data.buffer])
  
  return { 
    analyze,
    progress: computed(() => progress.value)
  }
}
