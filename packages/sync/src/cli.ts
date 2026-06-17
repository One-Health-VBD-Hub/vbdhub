import { parseArgs } from 'node:util';
import pino from 'pino';
import { runJob } from './job-registry.js';
import 'dotenv/config';

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
    strict: false,
    options: {
      job: { type: 'string' }
    }
  });

  const jobName = typeof values.job === 'string' ? values.job : undefined;
  if (!jobName) {
    logger.error('Missing required --job <name> option');
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
