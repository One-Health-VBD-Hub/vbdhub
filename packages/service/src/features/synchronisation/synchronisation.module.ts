import { Module } from '@nestjs/common';
import { SynchronisationService } from './synchronisation.service';
import { HttpModule } from '@nestjs/axios';
import { ElasticsearchModule } from '../../infrastructure/elasticsearch/elasticsearch.module';
import { TaxonomyModule } from '../taxonomy/taxonomy.module';
import { GbifSyncService } from './gbif/gbif-sync.service';
import { ProteomexchangeSyncService } from './proteomexchange/proteomexchange-sync.service';
import { VectraitsSyncService } from './vectraits/vectraits-sync.service';
import { VecdynSyncService } from './vecdyn/vecdyn-sync.service';
import { VbdhubSyncService } from './vbdhub/vbdhub-sync.service';
import { StorageModule } from '../../infrastructure/storage/storage.module';

@Module({
  imports: [HttpModule, ElasticsearchModule, TaxonomyModule, StorageModule],
  providers: [
    SynchronisationService,
    VecdynSyncService,
    VectraitsSyncService,
    GbifSyncService,
    ProteomexchangeSyncService,
    VbdhubSyncService
  ]
})
export class SynchronisationModule {}
