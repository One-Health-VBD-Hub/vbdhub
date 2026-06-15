import { gbifSyncJob } from './jobs/gbif.js';
import { hubSyncJob } from './jobs/hub.js';
import { pxSyncJob } from './jobs/px.js';
import { vdSyncJob } from './jobs/vd.js';
import { vtSyncJob } from './jobs/vt.js';
import type { JobContext } from './types.js';

export const jobs = [gbifSyncJob, hubSyncJob, pxSyncJob, vdSyncJob, vtSyncJob] as const;

export async function runJob(name: string, ctx: JobContext): Promise<void> {
  const job = jobs.find((candidate) => candidate.name === name);
  if (!job) throw new Error(`Unknown job: ${name}`);

  await job.run(ctx);
}
