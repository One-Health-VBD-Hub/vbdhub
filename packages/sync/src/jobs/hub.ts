import { z } from 'zod';
import type { JobDefinition } from '../types.js';

const hubStubDelayMsSchema = z.coerce.number().int().min(0).catch(250);

export const hubSyncJob: JobDefinition = {
  name: 'hub',
  description: 'Synchronise VBD Hub upstream data',
  async run({ logger, signal }) {
    if (signal.aborted) throw new Error('Job aborted before start');
    const delayMs = hubStubDelayMsSchema.parse(process.env.HUB_SYNC_STUB_DELAY_MS);

    logger.info('Starting synchronisation');
    // TODO: wire real sync implementation here.
    await new Promise((resolve) => setTimeout(resolve, delayMs));
    logger.info('Synchronisation complete');
  }
};
