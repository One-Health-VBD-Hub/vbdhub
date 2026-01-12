import {
  BadRequestException,
  Controller,
  Get,
  Logger,
  Query,
  UseInterceptors
} from '@nestjs/common';
import { SearchService } from './search.service';
import {
  IsBoolean,
  IsDate,
  IsIn,
  IsOptional,
  IsPositive,
  Max
} from 'class-validator';
import { Transform, TransformFnParams, Type } from 'class-transformer';
import {
  DATABASES,
  TYPES,
  DataCategory,
  Database
} from '../synchronisation/types/indexing';
import { CacheInterceptor, CacheTTL } from '@nestjs/cache-manager';
import { ApiOperation, ApiProperty, ApiResponse } from '@nestjs/swagger';
import { normalizeWkt } from '../../common/geo';

export interface ITransformFnParams extends TransformFnParams {
  value: string;
}

export class SearchDto {
  @ApiProperty({
    required: false,
    description: 'Full-text search query string, optional'
  })
  @IsOptional()
  @Transform(({ value }: ITransformFnParams) => value.trim()) // trim whitespace
  query?: string;

  @ApiProperty({
    required: false,
    description:
      'If true, will search for exact matches of the query string, otherwise will use partial matching',
    example: false
  })
  @IsOptional()
  exact?: boolean;

  @ApiProperty({
    description: 'Number of items per page (max 50)',
    maximum: 50,
    minimum: 1,
    example: 5
  })
  @IsPositive()
  @Max(50)
  @Type(() => Number)
  limit: number;

  @ApiProperty({
    description:
      'Page number to retrieve, starting from 1\n\n' +
      'Currently, the maximum number of results to paginate through 10 000\n\n' +
      'Therefore, {limit} * {page} <= 10 000, otherwise you get bad request error\n\n' +
      'If you need more results, please refine your search query or use filters',
    example: 1,
    minimum: 1
  })
  @IsPositive()
  @Type(() => Number)
  page: number;

  @ApiProperty({
    required: false,
    description:
      'Comma-separated list of data categories to include\n\n' +
      'Available values : trait, abundance, occurrence, proteomic, genomic, microarray, transcriptomic, epidemiological',
    example: 'proteomic,trait,abundance',
    type: 'string'
  })
  // filter properties
  @IsOptional()
  @Transform(({ value }: ITransformFnParams) => (value ? value.split(',') : [])) // Split string into array
  @IsIn(TYPES, { each: true })
  category?: DataCategory[];

  @ApiProperty({
    required: false,
    description:
      'Comma-separated list of databases to search\n\n' +
      'Available values : px, vd, vt, gbif, ncbi, hub, ncbi',
    example: 'px,vd,vt',
    type: 'string'
  })
  // TODO look at support of NCBI further down
  @IsOptional()
  @Transform(({ value }: ITransformFnParams) => (value ? value.split(',') : [])) // Split string into array
  @IsIn(DATABASES, { each: true })
  database?: Database[];

  @ApiProperty({
    required: false,
    description:
      'Filter results by publication date, from which date to include results\n\n' +
      'Must be a valid ISO 8601 (YYYY-MM-DD) date string',
    example: '2020-12-30'
  })
  @IsOptional()
  @IsDate({
    message: ({ property }) =>
      `${property} must be a valid ISO 8601 (YYYY-MM-DD) date string`
  })
  @Type(() => Date)
  publishedFrom?: Date;

  @ApiProperty({
    required: false,
    description:
      'Filter results by publication date, until which date to include results\n\n' +
      'Must be a valid ISO 8601 (YYYY-MM-DD) date string',
    example: '2025-03-19'
  })
  @IsOptional()
  @IsDate({
    message: ({ property }) =>
      `${property} must be a valid ISO 8601 (YYYY-MM-DD) date string`
  })
  @Type(() => Date)
  publishedTo?: Date;

  @ApiProperty({
    required: false,
    description: 'If true, will include records that have no publication date',
    example: true
  })
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true') // careful, in JS any string is truthy (even "false")
  withoutPublished?: boolean;

  @ApiProperty({
    required: false,
    description:
      'Filter results by geometry, must be a WKT geometry Polygon or MultiPolygon e.g. "MULTIPOLYGON((...))"',
    example:
      'POLYGON ((-5.137418 54.059388, -5.532978 49.439557, 1.762903 51.069017, -0.434652 56.096556, -5.137418 54.059388))'
  })
  @IsOptional()
  @Transform(({ value }: ITransformFnParams) => {
    try {
      return normalizeWkt(value);
    } catch (e) {
      throw new BadRequestException(
        `Invalid geometry format: ${e}. Please provide a valid WKT Polygon or MultiPolygon.`
      );
    }
  })
  geometry?: string;

  @IsOptional()
  @Transform(({ value }: ITransformFnParams) => (value ? value.split(',') : [])) // Split string into array
  country?: string[];

  @ApiProperty({
    required: false,
    description:
      'Filter results by taxonomy, e.g. a comma-separated list of GBIF taxon IDs',
    example: '1650098,8326529,1652991',
    type: 'string'
  })
  @IsOptional()
  @Transform(({ value }: ITransformFnParams) => (value ? value.split(',') : [])) // Split string into array
  taxonomy?: string[];
}

@Controller('search')
export class SearchController {
  private readonly logger = new Logger(SearchController.name);

  constructor(private searchService: SearchService) {}

  @ApiOperation({
    summary: 'Search for dataset records',
    description:
      'Search for records of datasets across various databases and categories.'
  })
  @ApiResponse({
    status: 200,
    description: 'Search results'
  })
  @ApiResponse({
    status: 400,
    description:
      'Bad request, e.g. if the {limit} * {page} > 10 000 or if the query is invalid'
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error, e.g. if the search service fails'
  })
  // cached for 10 minutes
  @CacheTTL(600_000)
  @UseInterceptors(CacheInterceptor)
  @Get()
  async search(@Query() searchDto: SearchDto) {
    // TODO look at fixing this in the future
    if (searchDto.limit * searchDto.page > 10_000)
      throw new BadRequestException(
        'The maximum number of results to paginate through is 10 000. Please refine your search query or use filters.'
      );

    const start = performance.now();
    this.logger.debug('Search request:');
    this.logger.debug(searchDto);

    const res = await this.searchService.search(searchDto);
    this.logger.debug(
      `Search took: ${(performance.now() - start).toFixed(2)} ms`
    );
    return {
      count: res.count,
      hits: res.hits.map((r) => ({
        id: r.id,
        title: r.title,
        description: r.description,
        doi: r.doi,
        type: r.type,
        author: r.author,
        citation: r.citation,
        published: r.pubDate,
        kingdom: r.kingdom,
        phylum: r.phylum,
        class: r.class,
        order: r.order,
        family: r.family,
        genus: r.genus,
        species: r.species,
        unknown: r.unknown,
        db: r.db
      }))
    };
  }
}
