import { nowMonotonic } from './time';

export function createTaskTimer(): {
  start(): void;
  stop(): number | null;
  cancel(): void;
  getElapsedMs(): number | null;
  isRunning(): boolean;
} {
  let startedAt: number | null = null;
  let elapsed: number | null = null;
  let running = false;

  return {
    start() {
      startedAt = nowMonotonic();
      elapsed = null;
      running = startedAt >= 0;
    },
    stop() {
      if (!running || startedAt === null) return elapsed;
      const end = nowMonotonic();
      elapsed = Math.max(0, end - startedAt);
      running = false;
      startedAt = null;
      return elapsed;
    },
    cancel() {
      startedAt = null;
      elapsed = null;
      running = false;
    },
    getElapsedMs() {
      if (running && startedAt !== null) {
        const end = nowMonotonic();
        return Math.max(0, end - startedAt);
      }
      return elapsed;
    },
    isRunning() {
      return running;
    },
  };
}
