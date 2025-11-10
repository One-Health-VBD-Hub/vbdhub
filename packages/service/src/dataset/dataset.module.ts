import { Module } from '@nestjs/common';
import { ElasticsearchModule } from '../elasticsearch/elasticsearch.module';
import { CacheModule } from '@nestjs/cache-manager';
import { HttpModule } from '@nestjs/axios';
import { Keyv } from 'keyv';
import { DatasetController } from './dataset.controller';
import { DatasetService } from './dataset.service';

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
    HttpModule
  ],
  providers: [DatasetService],
  controllers: [DatasetController]
})
export class DatasetModule {}
