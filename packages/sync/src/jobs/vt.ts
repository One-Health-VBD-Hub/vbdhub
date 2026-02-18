import type { JobDefinition } from '../types.js';

export const vtSyncJob: JobDefinition = {
  name: 'vt',
  description: 'Synchronise VecTraits records',
  async run({ logger, signal }) {
    if (signal.aborted) throw new Error('Job aborted before start');

    logger.info('Starting synchronisation');
    // TODO: wire real sync implementation here.
    await new Promise((resolve) => setTimeout(resolve, 250));
    logger.info('Synchronisation complete');
  }
};
