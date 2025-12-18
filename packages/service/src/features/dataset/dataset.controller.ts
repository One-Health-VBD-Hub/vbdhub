import {
  BadRequestException,
  Controller,
  Get,
  Logger,
  Param,
  Query,
  Redirect
} from '@nestjs/common';
import { DatasetService } from './dataset.service';
import { IsIn } from 'class-validator';
import { Database, DATABASES } from '../synchronisation/types/indexing';
import {
  ApiOperation,
  ApiParam,
  ApiProperty,
  ApiResponse
} from '@nestjs/swagger';

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

  @ApiOperation({
    summary: 'Download dataset',
    description:
      'For `db=hub`, streams the hosted dataset file. For other databases, redirects to the original dataset page.'
  })
  @ApiParam({
    name: 'id',
    type: String,
    required: true,
    description:
      'Unique identifier of the dataset within the specified database',
    example: '9d31f760-179d-4180-ad8b-d286fbfda6b7'
  })
  @ApiResponse({ status: 200, description: 'Dataset file stream (hub only)' })
  @ApiResponse({
    status: 302,
    description: 'Redirect to original dataset page (non-hub)'
  })
  @Get(':id/download')
  @Redirect()
  downloadDataset(@Param('id') id: string, @Query() dto: GetDatasetDto) {
    this.logger.debug(`Downloading dataset id: ${id} in db: ${dto.db}`);

    const url = buildExternalDatasetUrl(id, dto.db);
    if (!url) {
      throw new BadRequestException(
        `Downloads are not available for db: ${dto.db}`
      );
    }
    return { url };
  }
}

function buildExternalDatasetUrl(id: string, db: Database) {
  switch (db) {
    case 'gbif':
      return `https://www.gbif.org/dataset/${id}`;
    case 'px':
      return `https://proteomecentral.proteomexchange.org/cgi/GetDataset?ID=${id}`;
    case 'vd':
      return `https://vectorbyte.crc.nd.edu/vecdyn-detail/${id}`;
    case 'vt':
      return `https://vectorbyte.crc.nd.edu/vectraits-dataset/${id}`;
    default:
      return undefined;
  }
}
