import { parseArgs } from 'node:util';
import pino from 'pino';
import { jobs, runJob } from './job-registry.js';
import 'dotenv/config';

function printHelp(): void {
  const availableJobs = jobs.map((job) => `  - ${job.name}: ${job.description}`).join('\n');

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
      '',
      'Jobs:',
      availableJobs
    ].join('\n')
  );
}

async function main(): Promise<void> {
  const logger = pino({
    transport: {
      target: 'pino-pretty',
      options: {
        colorize: true,
        singleLine: true
      }
    }
  });

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

  const jobName = values.job;
  if (!jobName) {
    printHelp();
    process.exitCode = 1;
    return;
  }

  try {
    await runJob(jobName, {
      logger
    });
  } catch (error) {
    logger.error({ err: error }, 'Job failed');
    process.exitCode = 1;
  }
}

void main();
