import type { JobDefinition } from '../types.js';

export const pxSyncJob: JobDefinition = {
  name: 'px',
  description: 'Synchronise ProteomeXchange records',
  async run({ logger, signal }) {
    if (signal.aborted) throw new Error('Job aborted before start');

    logger.info('Starting synchronisation');
    // TODO: wire real sync implementation here.
    await new Promise((resolve) => setTimeout(resolve, 250));
    logger.info('Synchronisation complete');
  }
};
