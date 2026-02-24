import { Module } from '@nestjs/common';
import { TaxonomyService } from './taxonomy.service';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [HttpModule],
  providers: [TaxonomyService],
  exports: [TaxonomyService]
})
export class TaxonomyModule {}
