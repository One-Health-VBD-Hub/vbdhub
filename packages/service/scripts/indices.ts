import { NestFactory } from '@nestjs/core';
import { SynchronisationModule } from '../src/synchronisation/synchronisation.module';
import { VecdynDataSyncService } from '../src/synchronisation/vecdyn/vecdyn-data-sync.service';
import { Logger } from '@nestjs/common';
import { VectraitsSyncService } from '../src/synchronisation/vectraits/vectraits-sync.service';
import { ProteomexchangeSyncService } from '../src/synchronisation/proteomexchange/proteomexchange-sync.service';
import { VectraitsDataSyncService } from '../src/synchronisation/vectraits/vectraits-data-sync.service';
import { VecdynSyncService } from '../src/synchronisation/vecdyn/vecdyn-sync.service';
import { GbifSyncService } from '../src/synchronisation/gbif/gbif-sync.service';
import { Index, INDICES, isIndex } from '../src/synchronisation/types/indexing';

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
      case 'vddata':
        syncService = app.get(VecdynDataSyncService);
        await syncService.createElasticSearchIndex();
        return;
      case 'vt':
        syncService = app.get(VectraitsSyncService);
        await syncService.createElasticSearchIndex();
        return;
      case 'vtdata':
        syncService = app.get(VectraitsDataSyncService);
        await syncService.createElasticSearchIndex();
        return;
      case 'px':
        syncService = app.get(ProteomexchangeSyncService);
        await syncService.createElasticSearchIndex();
        return;
      case 'hub':
        throw new Error('Index hub not implemented');
    }
  } finally {
    Logger.log('Index created', 'indices');
    await app.close();
  }
}

void main();
