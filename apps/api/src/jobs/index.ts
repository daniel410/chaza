import { priceUpdateJob } from './price-update';
import { priceAlertJob } from './price-alerts';

export { PriceUpdateJob, priceUpdateJob, updateRetailerPrices } from './price-update';
export { PriceAlertJob, priceAlertJob } from './price-alerts';

/**
 * Job Scheduler
 * 
 * In production, you would use a proper job scheduler like:
 * - Bull/BullMQ with Redis
 * - AWS SQS + Lambda
 * - node-cron for simple cases
 * - Temporal for complex workflows
 * 
 * This is a simple implementation using setInterval.
 */

interface ScheduledJob {
  name: string;
  interval: number; // in milliseconds
  lastRun: Date | null;
  isRunning: boolean;
  run: () => Promise<void>;
}

class JobScheduler {
  private jobs: Map<string, ScheduledJob> = new Map();
  private timers: Map<string, NodeJS.Timeout> = new Map();

  /**
   * Register a job with the scheduler
   */
  register(name: string, interval: number, runFn: () => Promise<void>): void {
    this.jobs.set(name, {
      name,
      interval,
      lastRun: null,
      isRunning: false,
      run: runFn,
    });
    console.log(`[Scheduler] Registered job: ${name} (interval: ${interval}ms)`);
  }

  /**
   * Start all registered jobs
   */
  startAll(): void {
    console.log('[Scheduler] Starting all jobs...');
    for (const [name] of this.jobs) {
      this.start(name);
    }
  }

  /**
   * Start a specific job
   */
  start(name: string): void {
    const job = this.jobs.get(name);
    if (!job) {
      console.error(`[Scheduler] Job not found: ${name}`);
      return;
    }

    // Clear existing timer if any
    this.stop(name);

    // Run immediately on start
    this.runJob(name);

    // Schedule recurring runs
    const timer = setInterval(() => this.runJob(name), job.interval);
    this.timers.set(name, timer);

    console.log(`[Scheduler] Started job: ${name}`);
  }

  /**
   * Stop a specific job
   */
  stop(name: string): void {
    const timer = this.timers.get(name);
    if (timer) {
      clearInterval(timer);
      this.timers.delete(name);
      console.log(`[Scheduler] Stopped job: ${name}`);
    }
  }

  /**
   * Stop all jobs
   */
  stopAll(): void {
    console.log('[Scheduler] Stopping all jobs...');
    for (const [name] of this.timers) {
      this.stop(name);
    }
  }

  /**
   * Run a job immediately
   */
  async runJob(name: string): Promise<void> {
    const job = this.jobs.get(name);
    if (!job) {
      console.error(`[Scheduler] Job not found: ${name}`);
      return;
    }

    if (job.isRunning) {
      console.log(`[Scheduler] Job ${name} is already running, skipping...`);
      return;
    }

    try {
      job.isRunning = true;
      console.log(`[Scheduler] Running job: ${name}`);
      await job.run();
      job.lastRun = new Date();
    } catch (error) {
      console.error(`[Scheduler] Job ${name} failed:`, error);
    } finally {
      job.isRunning = false;
    }
  }

  /**
   * Get status of all jobs
   */
  getStatus(): Record<string, { lastRun: Date | null; isRunning: boolean }> {
    const status: Record<string, { lastRun: Date | null; isRunning: boolean }> = {};
    for (const [name, job] of this.jobs) {
      status[name] = {
        lastRun: job.lastRun,
        isRunning: job.isRunning,
      };
    }
    return status;
  }
}

// Create scheduler instance
export const scheduler = new JobScheduler();

// Register default jobs
const ONE_HOUR = 60 * 60 * 1000;
const SIX_HOURS = 6 * ONE_HOUR;
const TWELVE_HOURS = 12 * ONE_HOUR;
const ONE_DAY = 24 * ONE_HOUR;

scheduler.register('price-update', ONE_DAY, async () => {
  await priceUpdateJob.run();
});

scheduler.register('price-alerts', ONE_HOUR, async () => {
  await priceAlertJob.run();
});

// Export scheduler control functions
export function startScheduler(): void {
  scheduler.startAll();
}

export function stopScheduler(): void {
  scheduler.stopAll();
}
