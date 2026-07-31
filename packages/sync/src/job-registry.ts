import { gbifSyncJob } from './jobs/gbif.js';
import { hubSyncJob } from './jobs/hub.js';
import { pxSyncJob } from './jobs/px.js';
import { vdSyncJob } from './jobs/vd.js';
import { vtSyncJob } from './jobs/vt.js';

export const jobs = [gbifSyncJob, hubSyncJob, pxSyncJob, vdSyncJob, vtSyncJob] as const;
