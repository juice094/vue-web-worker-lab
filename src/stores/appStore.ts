import { defineStore } from 'pinia'

export const useAppStore = defineStore('appStore', {
  state: () => ({
    isWorkerBusy: false
  }),
  actions: {
    setBusy(status: boolean) {
      this.isWorkerBusy = status
    }
  }
})
