import { parseArgs } from 'node:util';
import pino from 'pino';
import { listJobs } from './job-registry.js';
import { runJob } from './runner.js';

function printHelp(): void {
  const availableJobs = listJobs()
    .map((job) => `  - ${job.name}: ${job.description}`)
    .join('\n');

  console.info(
    [
      'Usage:',
      '  sync-jobs --job <name>',
      '  sync-jobs --list',
      '',
      'Options:',
      '  --job <name>   Run a named synchronisation job',
      '  --list         List available jobs',
      '  --help         Show help',
      '  SYNC_JOB=<name> Alternative to --job for scheduler env config',
      '',
      'Jobs:',
      availableJobs
    ].join('\n')
  );
}

async function main(): Promise<void> {
  const logger = pino({ name: '@vbdhub/sync' });

  const { values } = parseArgs({
    options: {
      job: { type: 'string' },
      list: { type: 'boolean', default: false },
      help: { type: 'boolean', default: false }
    }
  });

  if (values.help || values.list) {
    printHelp();
    return;
  }

  const jobName = values.job ?? process.env.SYNC_JOB;
  if (!jobName) {
    printHelp();
    process.exitCode = 1;
    return;
  }

  const abortController = new AbortController();
  const onSignal = () => {
    logger.warn('Shutdown signal received, aborting job');
    abortController.abort();
  };

  process.once('SIGINT', onSignal);
  process.once('SIGTERM', onSignal);

  try {
    await runJob(jobName, {
      signal: abortController.signal,
      logger: logger.child({ job: jobName })
    });
  } catch (error) {
    logger.error({ err: error }, 'Job failed');
    process.exitCode = 1;
  } finally {
    process.off('SIGINT', onSignal);
    process.off('SIGTERM', onSignal);
  }
}

void main();
