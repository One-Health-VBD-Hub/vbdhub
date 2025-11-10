import { Controller, Get, Logger, Param, Query } from '@nestjs/common';
import { DatasetService } from './dataset.service';
import { IsIn } from 'class-validator';
import { Database, DATABASES } from '../synchronisation/types/indexing';
import { ApiOperation, ApiParam, ApiProperty } from '@nestjs/swagger';

export class GetDatasetDto {
  @ApiProperty({
    description: 'Database to query the dataset from',
    type: String,
    example: 'gbif'
  })
  @IsIn(DATABASES)
  db: Database;
}

@Controller('dataset')
export class DatasetController {
  private readonly logger = new Logger(DatasetController.name);

  constructor(private readonly datasetService: DatasetService) {}

  @ApiOperation({
    summary: 'Get dataset summary by ID',
    description:
      'Retrieve a summary of a dataset given its unique identifier and database.'
  })
  @ApiParam({
    name: 'id',
    type: String,
    required: true,
    description:
      'Unique identifier of the dataset within the specified database',
    example: '9d31f760-179d-4180-ad8b-d286fbfda6b7'
  })
  @Get(':id')
  getDatasetSummary(@Param('id') id: string, @Query() dto: GetDatasetDto) {
    this.logger.debug(`Getting dataset summary for id: ${id} in db: ${dto.db}`);
    return this.datasetService.getDocById(id, dto.db);
  }
}
