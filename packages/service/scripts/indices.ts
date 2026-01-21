import { NestFactory } from '@nestjs/core';
import { Logger } from '@nestjs/common';
import {
  Index,
  INDICES,
  isIndex
} from '../src/features/synchronisation/types/indexing';
import { SynchronisationModule } from '../src/features/synchronisation/synchronisation.module';
import { GbifSyncService } from '../src/features/synchronisation/gbif/gbif-sync.service';
import { VecdynSyncService } from '../src/features/synchronisation/vecdyn/vecdyn-sync.service';
import { VectraitsSyncService } from '../src/features/synchronisation/vectraits/vectraits-sync.service';
import { ProteomexchangeSyncService } from '../src/features/synchronisation/proteomexchange/proteomexchange-sync.service';
import { VbdhubSyncService } from '../src/features/synchronisation/vbdhub/vbdhub-sync.service';

// run with `sst shell -- ts-node packages/service/scripts/indices.ts <INDEX>`
async function main() {
  const args = process.argv.slice(2); // Skip the first two arguments (node and script path)l

  if (args.length < 1) throw new Error('Usage: ts-node indices.ts <index>');

  if (!isIndex(args[0]))
    throw new Error(
      `Invalid index: ${args[0]}. Valid indexes are ${INDICES.join(', ')}`
    );

  const index: Index = args[0];

  const app = await NestFactory.createApplicationContext(SynchronisationModule);
  let syncService;

  try {
    switch (index) {
      case 'gbif':
        syncService = app.get(GbifSyncService);
        await syncService.createElasticSearchIndex();
        return;
      case 'vd':
        syncService = app.get(VecdynSyncService);
        await syncService.createElasticSearchIndex();
        return;
      case 'vt':
        syncService = app.get(VectraitsSyncService);
        await syncService.createElasticSearchIndex();
        return;
      case 'px':
        syncService = app.get(ProteomexchangeSyncService);
        await syncService.createElasticSearchIndex();
        return;
      case 'hub':
        syncService = app.get(VbdhubSyncService);
        await syncService.createElasticSearchIndex();
    }
  } finally {
    Logger.log('Index created', 'indices');
    await app.close();
  }
}

void main();
