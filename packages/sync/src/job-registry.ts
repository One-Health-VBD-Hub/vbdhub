import { gbifSyncJob } from './jobs/gbif.js';
import { hubSyncJob } from './jobs/hub.js';
import { pxSyncJob } from './jobs/px.js';
import { vdSyncJob } from './jobs/vd.js';
import { vtSyncJob } from './jobs/vt.js';
import type { Logger } from 'pino';

export const jobs = [gbifSyncJob, hubSyncJob, pxSyncJob, vdSyncJob, vtSyncJob] as const;

export async function runJob(name: string, ctx: { logger: Logger }): Promise<void> {
  const job = jobs.find((candidate) => candidate.name === name);
  if (!job) throw new Error(`Unknown job: ${name}`);

  await job.run(ctx);
}
