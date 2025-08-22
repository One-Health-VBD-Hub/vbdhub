import { Module } from '@nestjs/common';
import { SearchService } from './search.service';
import { SearchController } from './search.controller';
import { ElasticsearchModule } from '../elasticsearch/elasticsearch.module';
import { CacheModule } from '@nestjs/cache-manager';
import { HttpModule } from '@nestjs/axios';
import { Keyv } from 'keyv';
import { TaxonomyModule } from '../taxonomy/taxonomy.module';

@Module({
  imports: [
    ElasticsearchModule,
    CacheModule.register({
      // set up a custom Keyv store for plain JS objects caching
      stores: [
        (() => {
          const keyv = new Keyv();
          keyv.serialize = undefined;
          keyv.deserialize = undefined;
          return keyv;
        })()
      ],
      ttl: 300_000 // 5 minutes TTL
    }),
    HttpModule,
    TaxonomyModule
  ],
  providers: [SearchService],
  controllers: [SearchController]
})
export class SearchModule {}
