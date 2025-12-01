import { Module } from '@nestjs/common';
import { SynchronisationService } from './synchronisation.service';
import { HttpModule } from '@nestjs/axios';
import { ElasticsearchModule } from '../elasticsearch/elasticsearch.module';
import { TaxonomyModule } from '../taxonomy/taxonomy.module';
import { GbifSyncService } from './gbif/gbif-sync.service';
import { ProteomexchangeSyncService } from './proteomexchange/proteomexchange-sync.service';
import { VectraitsSyncService } from './vectraits/vectraits-sync.service';
import { VecdynSyncService } from './vecdyn/vecdyn-sync.service';
import { VbdhubSyncService } from './vbdhub/vbdhub-sync.service';

@Module({
  imports: [HttpModule, ElasticsearchModule, TaxonomyModule],
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
