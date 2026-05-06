type Job = {
  key: string;
  run: () => Promise<void>;
};

export class InMemoryJobQueue {
  private queue: Job[] = [];
  private active = 0;
  private readonly activeKeys = new Set<string>();

  constructor(private readonly concurrency = 1) {}

  enqueue(key: string, run: () => Promise<void>) {
    if (this.activeKeys.has(key)) {
      return false;
    }

    this.activeKeys.add(key);
    this.queue.push({ key, run });
    this.drain();
    return true;
  }

  private drain() {
    while (this.active < this.concurrency && this.queue.length > 0) {
      const nextJob = this.queue.shift();

      if (!nextJob) {
        return;
      }

      this.active += 1;

      void nextJob
        .run()
        .catch((error) => {
          console.error(`[job-queue] Job failed: ${nextJob.key}`, error);
        })
        .finally(() => {
          this.active -= 1;
          this.activeKeys.delete(nextJob.key);
          this.drain();
        });
    }
  }
}

export const paymentJobQueue = new InMemoryJobQueue(1);
