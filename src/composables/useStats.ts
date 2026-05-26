import { useWorker } from './useWorker'

export function useStats() {
  const { run } = useWorker(new URL('../workers/stats.worker.ts', import.meta.url))
  
  const analyze = (data: Float64Array) => run<any>('descriptive', data, [data.buffer])
  
  return { analyze }
}
