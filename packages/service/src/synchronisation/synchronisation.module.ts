import { Module } from '@nestjs/common';
import { SynchronisationService } from './synchronisation.service';
import { HttpModule } from '@nestjs/axios';
import { ElasticsearchModule } from '../elasticsearch/elasticsearch.module';
import { TaxonomyModule } from '../taxonomy/taxonomy.module';
import { VecdynDataSyncService } from './vecdyn/vecdyn-data-sync.service';
import { VectraitsDataSyncService } from './vectraits/vectraits-data-sync.service';
import { GbifSyncService } from './gbif/gbif-sync.service';
import { ProteomexchangeSyncService } from './proteomexchange/proteomexchange-sync.service';
import { VectraitsSyncService } from './vectraits/vectraits-sync.service';
import { VecdynSyncService } from './vecdyn/vecdyn-sync.service';

@Module({
  imports: [HttpModule, ElasticsearchModule, TaxonomyModule],
  providers: [
    SynchronisationService,
    VecdynSyncService,
    VecdynDataSyncService,
    VectraitsSyncService,
    VectraitsDataSyncService,
    GbifSyncService,
    ProteomexchangeSyncService
  ]
})
export class SynchronisationModule {}
