import { SynchronisationModule } from '../synchronisation/synchronisation.module';
import { NestFactory } from '@nestjs/core';
import { SynchronisationService } from '../synchronisation/synchronisation.service';
import { ConsoleLogger, Logger } from '@nestjs/common';
import {
  SyncedDatabase,
  isSyncedDatabase
} from '../synchronisation/types/indexing';
import { pidInterval } from '../common/pidusage';

// Function to parse command-line arguments
function parseArguments(): {
  concurrency: number;
  db: SyncedDatabase;
  mode?: string;
} {
  const args = process.argv.slice(2); // Skip the first two arguments (node and script path)

  if (args.length < 2) {
    throw new Error('Usage: ts-node sync.ts <db> <concurrency> <mode>');
  }

  const db = args[0];
  if (!isSyncedDatabase(db)) {
    throw new Error(
      `Invalid db: ${db}. Valid dbs are 'gbif', 'px', 'vd', 'vt'.`
    );
  }

  const mode = args[2];
  if (mode && mode !== 'data') {
    throw new Error(`Invalid mode: ${mode}. Valid modes are 'data'.`);
  }

  const concurrency = parseInt(args[1], 10);
  if (isNaN(concurrency)) throw new Error('Concurrency must be a number');

  return { concurrency, db, mode };
}

// run with 'ts-node sync <db> <concurrency> <mode>' or 'node dist/jobs/sync <db> <concurrency> <mode>'
async function main() {
  const start = performance.now();
  Logger.log('Starting job and parsing arguments', 'sync');
  Logger.warn(`Running in ${process.env.NODE_ENV} mode`, 'sync');

  // Parse arguments
  const { concurrency, db, mode } = parseArguments();

  Logger.log(`Fetching and ingesting data from ${db}`, 'sync');

  const app = await NestFactory.createApplicationContext(
    SynchronisationModule,
    {
      logger:
        process.env.NODE_ENV !== 'development'
          ? new ConsoleLogger({
              logLevels: ['warn'], // hide non-warn or lower logs in production
              json: true // necessary for production logging
            })
          : undefined
    }
  );

  const tasksService = app.get(SynchronisationService);

  // Start the PID usage interval to log CPU and memory usage
  if (process.env.NODE_ENV === 'development') pidInterval(15_000);

  try {
    if (mode === 'data') {
      await tasksService.syncCompleteData(db);
    } else {
      await tasksService.syncDatabase(db, concurrency);
    }

    const end = performance.now();
    Logger.warn(`Execution time: ${end - start} ms`, 'sync');
    Logger.log('Job executed successfully', 'sync');
  } finally {
    await app.close();
  }
}

void main();
