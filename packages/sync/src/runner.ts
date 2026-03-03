import { getJob, listJobs } from './job-registry.js';
import type { JobContext } from './types.js';

export async function runJob(name: string, ctx: JobContext): Promise<void> {
  const job = getJob(name);
  if (!job) throw new Error(`Unknown job: ${name}`);

  await job.run(ctx);
}

export async function runAllJobs(ctx: JobContext): Promise<void> {
  for (const job of listJobs()) {
    if (ctx.signal.aborted) throw new Error('Job run aborted');

    await job.run(ctx);
  }
}
