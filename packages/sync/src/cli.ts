import { parseArgs } from 'node:util';
import pino from 'pino';
import { jobs } from './job-registry.js';
import 'dotenv/config';

async function main(): Promise<void> {
  const logger = pino({
    transport: {
      target: 'pino-pretty',
      options: { colorize: true, singleLine: true }
    }
  });

  const { values } = parseArgs({
    options: { job: { type: 'string' } }
  });

  const jobName = values.job;
  if (!jobName) {
    logger.error('Missing required --job <name> option');
    process.exitCode = 1;
    return;
  }

  try {
    const job = jobs.find((job) => job.name === jobName);
    if (!job) throw new Error(`Unknown job: ${jobName}`);

    await job.run({ logger });
  } catch (error) {
    logger.error({ err: error }, 'Job failed');
    process.exitCode = 1;
  }
}

void main();
