import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { ConfigModule } from '@nestjs/config';
import { SearchModule } from './search/search.module';
import { SentryGlobalFilter, SentryModule } from '@sentry/nestjs/setup';
import { APP_FILTER } from '@nestjs/core';
import { DatasetModule } from './dataset/dataset.module';

@Module({
  providers:
    process.env.NODE_ENV !== 'development'
      ? [
          {
            provide: APP_FILTER,
            useClass: SentryGlobalFilter
          }
        ]
      : [],
  imports: [
    ...[ConfigModule.forRoot(), SearchModule, DatasetModule],
    ...(process.env.NODE_ENV !== 'development' ? [SentryModule.forRoot()] : [])
  ],
  controllers: [AppController]
})
export class AppModule {}
