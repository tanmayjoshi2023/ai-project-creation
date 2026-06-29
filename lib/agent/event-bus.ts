export class AsyncQueue<T> {
  private queue: T[] = []
  private resolvers: ((value: IteratorResult<T>) => void)[] = []
  private closed = false

  push(value: T) {
    if (this.closed) return
    const resolver = this.resolvers.shift()
    if (resolver) {
      resolver({ value, done: false })
    } else {
      this.queue.push(value)
    }
  }

  close() {
    this.closed = true
    while (this.resolvers.length > 0) {
      const resolver = this.resolvers.shift()
      if (resolver) {
        resolver({ value: undefined as any, done: true })
      }
    }
  }

  [Symbol.asyncIterator](): AsyncIterator<T> {
    return {
      next: () => {
        if (this.queue.length > 0) {
          return Promise.resolve({ value: this.queue.shift()!, done: false })
        }
        if (this.closed) {
          return Promise.resolve({ value: undefined as any, done: true })
        }
        return new Promise<IteratorResult<T>>((resolve) => {
          this.resolvers.push(resolve)
        })
      }
    }
  }
}

export const activeQueues = new Map<string, AsyncQueue<any>>()

export function emitThought(
  analysisId: string,
  agent: string,
  status: 'running' | 'complete' | 'error',
  text: string,
  elapsedMs?: number
) {
  if (!analysisId) return
  const queue = activeQueues.get(analysisId)
  if (queue) {
    queue.push({
      type: 'thought',
      data: {
        agent,
        status,
        text,
        elapsedMs,
      },
    })
  }
}
