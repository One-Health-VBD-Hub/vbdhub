import type { JobDefinition } from '../types.js';

export const gbifSyncJob: JobDefinition = {
  name: 'gbif',
  description: 'Synchronise GBIF records',
  async run({ logger, signal }) {
    if (signal.aborted) throw new Error('Job aborted before start');

    logger.info('Starting synchronisation');
    // TODO: wire real sync implementation here.
    logger.info('Synchronisation complete');
  }
};
