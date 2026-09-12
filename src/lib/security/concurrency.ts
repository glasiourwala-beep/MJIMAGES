/**
 * Concurrency Gate / Semaphore for CPU/Memory Intensive Image Operations
 * Limits the number of concurrent Sharp image processing tasks running simultaneously
 * to prevent server resource starvation under concurrent loads.
 */

class ConcurrencyGate {
  private activeCount = 0;
  private maxConcurrent: number;
  private queue: (() => void)[] = [];

  constructor(maxConcurrent = 10) {
    this.maxConcurrent = maxConcurrent;
  }

  async acquire(): Promise<() => void> {
    if (this.activeCount < this.maxConcurrent) {
      this.activeCount++;
      let released = false;
      return () => {
        if (!released) {
          released = true;
          this.release();
        }
      };
    }

    return new Promise<() => void>((resolve) => {
      this.queue.push(() => {
        this.activeCount++;
        let released = false;
        resolve(() => {
          if (!released) {
            released = true;
            this.release();
          }
        });
      });
    });
  }

  private release() {
    this.activeCount--;
    if (this.queue.length > 0 && this.activeCount < this.maxConcurrent) {
      const next = this.queue.shift();
      if (next) next();
    }
  }

  get stats() {
    return {
      active: this.activeCount,
      queued: this.queue.length,
      max: this.maxConcurrent,
    };
  }
}

export const imageProcessingGate = new ConcurrencyGate(10);
