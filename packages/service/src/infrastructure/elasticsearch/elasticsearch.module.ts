import { Module } from '@nestjs/common';
import { ElasticsearchService } from './elasticsearch.service';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [ConfigModule.forRoot()],
  providers: [ElasticsearchService],
  exports: [ElasticsearchService]
})
export class ElasticsearchModule {}
