import { Module } from '@nestjs/common';
import { DiscourseController } from './discourse.controller';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [ConfigModule],
  controllers: [DiscourseController]
})
export class DiscourseModule {}
