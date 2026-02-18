import { gbifSyncJob } from './jobs/gbif.js';
import { hubSyncJob } from './jobs/hub.js';
import { pxSyncJob } from './jobs/px.js';
import { vdSyncJob } from './jobs/vd.js';
import { vtSyncJob } from './jobs/vt.js';
import type { JobDefinition } from './types.js';

export const jobs = [gbifSyncJob, hubSyncJob, pxSyncJob, vdSyncJob, vtSyncJob] as const;

export function listJobs(): readonly JobDefinition[] {
  return jobs;
}

export function getJob(name: string): JobDefinition | undefined {
  return jobs.find((job) => job.name === name);
}
