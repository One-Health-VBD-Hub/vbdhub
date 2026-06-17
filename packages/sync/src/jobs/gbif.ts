import type { JobDefinition } from '../types.js';

export const gbifSyncJob: JobDefinition = {
  name: 'gbif',
  async run({ logger }) {
    logger.info('Starting synchronisation');
    // TODO: wire real sync implementation here.
    logger.info('Synchronisation complete');
  }
};
