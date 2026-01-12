import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { SyncedDatabase } from './types/indexing';
import { configureAxiosRetry } from '../../common/utils';
import {
  gbifNextPageUrlGenerator,
  GbifSyncService
} from './gbif/gbif-sync.service';
import {
  ProteomexchangeSyncService,
  pxSingleNextPageUrlGenerator
} from './proteomexchange/proteomexchange-sync.service';
import { VecdynSyncService } from './vecdyn/vecdyn-sync.service';
import { VectraitsSyncService } from './vectraits/vectraits-sync.service';
import { VbdhubSyncService } from './vbdhub/vbdhub-sync.service';

@Injectable()
export class SynchronisationService implements OnModuleInit {
  private readonly logger = new Logger(SynchronisationService.name);

  onModuleInit() {
    configureAxiosRetry(this.httpService.axiosRef);
  }

  constructor(
    private readonly httpService: HttpService,
    private readonly gbifSyncService: GbifSyncService,
    private readonly pxSyncService: ProteomexchangeSyncService,
    private readonly vecDynSyncService: VecdynSyncService,
    private readonly vecTraitsSyncService: VectraitsSyncService,
    private readonly vbdhubSyncService: VbdhubSyncService
  ) {}

  async fetchAndIngestPageFromDb(
    url: string,
    db: SyncedDatabase
  ): Promise<'success' | 'last-page' | 'not-yet-released'> {
    if (db === 'px') {
      return this.pxSyncService.pxSingleFetchAndIngestPage(url);
    } else if (db === 'gbif') {
      return this.gbifSyncService.gbifFetchAndIngestPage(url);
    } else {
      throw new Error('Invalid database name');
    }
  }

  async processWithConcurrency(concurrency: number, db: SyncedDatabase) {
    const generator = getNextPageUrlGenerator(db);
    const completionTimes: number[] = [];
    const controller = new AbortController();

    const updateThroughput = () => {
      const cutoff = Date.now() - 10000;
      while (completionTimes[0] !== undefined && completionTimes[0] < cutoff) {
        completionTimes.shift();
      }
      return completionTimes.length;
    };

    const throughputLogger = setInterval(() => {
      this.logger.log(`Throughput: ${updateThroughput()}/10s`);
    }, 10000);

    try {
      const workers = Array(concurrency)
        .fill(null)
        .map(async () => {
          while (!controller.signal.aborted) {
            const { value: url, done } = generator.next();
            if (done) break;

            this.logger.log(`Fetching ${url}`);
            if (!url) throw new Error('No url');
            const result = await this.fetchAndIngestPageFromDb(url, db);
            completionTimes.push(Date.now());

            if (result === 'last-page') {
              controller.abort();
              generator.return();
            }
          }
        });

      await Promise.all(workers);
    } finally {
      clearInterval(throughputLogger);
      controller.abort();
      generator.return();
    }
  }

  async syncDatabase(db: SyncedDatabase, concurrency = 10) {
    if (db === 'px') {
      await this.processWithConcurrency(concurrency, db);
    } else if (db === 'gbif') {
      await this.processWithConcurrency(concurrency, db);
    } else if (db === 'vd') {
      await this.vecDynSyncService.syncDatasets();
    } else if (db === 'vt') {
      await this.vecTraitsSyncService.syncDatasets();
    } else if (db === 'hub') {
      await this.vbdhubSyncService.syncDatasets();
    }
  }
}

export function getNextPageUrlGenerator(db: SyncedDatabase) {
  if (db === 'px') {
    return pxSingleNextPageUrlGenerator();
  } else if (db === 'gbif') {
    return gbifNextPageUrlGenerator();
  } else if (db === 'vd') {
    return vbNextPageUrlGenerator(
      'https://vectorbyte.crc.nd.edu/portal/api/vecdynbyprovider'
    );
  } else if (db === 'vt') {
    return vbNextPageUrlGenerator(
      'https://vectorbyte.crc.nd.edu/portal/api/vectraits-explorer'
    );
  } else {
    throw new Error('Invalid database name');
  }
}

function* vbNextPageUrlGenerator(endpoint: string) {
  let page = 1;
  while (true) {
    yield `${endpoint}/?page=${page}`;
    page++;
  }
}
