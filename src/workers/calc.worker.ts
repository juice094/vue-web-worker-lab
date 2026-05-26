self.onmessage = (e: MessageEvent) => {
  const { id, action, payload } = e.data
  if (action === 'evaluate') {
    try {
      const sanitized = payload.replace(/×/g, '*').replace(/÷/g, '/')
      // 允许直接使用 Math 对象下的函数
      const computeResult = new Function('Math', `with(Math) { return (${sanitized}); }`)(Math)
      if (computeResult === undefined || isNaN(computeResult)) throw new Error('无效表达式')
      self.postMessage({ id, status: 'complete', result: computeResult })
    } catch (err: any) {
      self.postMessage({ id, status: 'error', error: err.message })
    }
  }
}
