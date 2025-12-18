import { NestFactory } from '@nestjs/core';
import { ConsoleLogger, Logger } from '@nestjs/common';
import { pidInterval } from 'src/common/pidusage';
import {
  isSyncedDatabase,
  SyncedDatabase
} from 'src/features/synchronisation/types/indexing';
import { SynchronisationModule } from 'src/features/synchronisation/synchronisation.module';
import { SynchronisationService } from 'src/features/synchronisation/synchronisation.service';

// Function to parse command-line arguments
function parseArguments(): {
  concurrency: number;
  db: SyncedDatabase;
} {
  const args = process.argv.slice(2); // Skip the first two arguments (node and script path)

  if (args.length < 2) {
    throw new Error('Usage: ts-node sync.ts <db> <concurrency>');
  }

  const db = args[0];
  if (!isSyncedDatabase(db)) {
    throw new Error(
      `Invalid db: ${db}. Valid dbs are 'gbif', 'px', 'vd', 'vt', 'hub'.`
    );
  }

  const concurrency = parseInt(args[1], 10);
  if (isNaN(concurrency)) throw new Error('Concurrency must be a number');

  return { concurrency, db };
}

// run with 'ts-node sync <db> <concurrency>' or 'node dist/jobs/sync <db> <concurrency>'
async function main() {
  const start = performance.now();
  Logger.log('Starting job and parsing arguments', 'sync');
  Logger.warn(`Running in ${process.env.NODE_ENV} mode`, 'sync');

  // Parse arguments
  const { concurrency, db } = parseArguments();

  Logger.log(`Fetching and ingesting data from ${db}`, 'sync');

  const app = await NestFactory.createApplicationContext(
    SynchronisationModule,
    {
      logger:
        process.env.NODE_ENV !== 'development'
          ? new ConsoleLogger({ json: true }) // necessary for production logging
          : undefined
    }
  );

  // Start the PID usage interval to log CPU and memory usage
  if (process.env.NODE_ENV === 'development') pidInterval(15_000);

  try {
    const synchronisationService = app.get(SynchronisationService);
    await synchronisationService.syncDatabase(db, concurrency);

    const end = performance.now();
    Logger.warn(`Execution time: ${end - start} ms`, 'sync');
    Logger.log('Job executed successfully', 'sync');
  } finally {
    await app.close();
  }
}

void main();
