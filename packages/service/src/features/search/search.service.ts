import { Inject, Injectable, Logger } from '@nestjs/common';
import { ElasticsearchService } from '../../infrastructure/elasticsearch/elasticsearch.service';
import {
  EsAnyDatasetDoc,
  SYNCED_DATABASES
} from '../synchronisation/types/indexing';
import { SearchTotalHits } from '@elastic/elasticsearch/lib/api/types';
import { SearchDto } from './search.controller';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { TaxonomyService } from '../taxonomy/taxonomy.service';

export interface SearchResults {
  hits: EsAnyDatasetDoc[];
  count?: number;
}

export interface GbifOccurrenceApiResponse {
  endOfRecords: boolean;
  facets: {
    counts: { name: string; count: number }[];
  }[];
}

@Injectable()
export class SearchService {
  private readonly logger = new Logger(SearchService.name);

  constructor(
    private readonly elasticSearchService: ElasticsearchService,
    private readonly httpService: HttpService,
    private readonly taxonomyService: TaxonomyService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache
  ) {}

  async search(dto: SearchDto): Promise<SearchResults> {
    // if taxonomy filter is used, build taxonomic paths for each taxonomy we're filtering for
    let taxonomicPaths;
    if (dto.taxonomy) {
      taxonomicPaths = await Promise.all(
        dto.taxonomy.map((path) =>
          this.taxonomyService.fetchTaxonomicPathForGbifId(path)
        )
      );
      this.logger.debug('Taxonomic paths:', taxonomicPaths);
    }

    // if GBIF is not requested, we can use ES directly only
    if (
      (dto.category && !dto.category?.includes('occurrence')) ||
      (dto.database && !dto.database?.includes('gbif'))
    ) {
      const esResults = await this.elasticSearchService.search({
        ...dto,
        indices: [...SYNCED_DATABASES].filter((db) => db !== 'gbif'),
        gbifDatasetKeys: [],
        from: (dto.page - 1) * dto.limit,
        limit: dto.limit,
        taxonomicPaths: taxonomicPaths
      });

      const count =
        (esResults.hits.total as SearchTotalHits | undefined)?.value || 0;

      return {
        hits: esResults.hits.hits
          .map((hit) => hit._source)
          .filter((r) => r !== undefined),
        count
      };
    }

    // results from GBIF external API
    const gbifDatasetKeys = await this.searchGbif(
      dto.query,
      dto.geometry,
      dto.taxonomy
    );

    const esResults = await this.elasticSearchService.search({
      ...dto,
      indices: [...SYNCED_DATABASES],
      // cap to 65 536 (ES default terms limit) to avoid too many results
      gbifDatasetKeys: gbifDatasetKeys.slice(0, 65_536),
      from: (dto.page - 1) * dto.limit,
      limit: dto.limit,
      taxonomicPaths: taxonomicPaths
    });

    const count =
      (esResults.hits.total as SearchTotalHits | undefined)?.value || 0;

    return {
      hits: esResults.hits.hits
        .map((hit) => hit._source)
        .filter((r) => r !== undefined),
      count
    };
  }

  async getGbifDatasetDetails(datasetKey: string) {
    const result = await firstValueFrom(
      this.httpService.get<{
        title: string;
        description: string;
        doi: string;
        license: string;
        pubDate: Date;
        modified: Date;
      }>(`https://api.gbif.org/v1/dataset/${datasetKey}`)
    );

    return result.data;
  }

  async searchGbif(
    query: string = '',
    geometry: string = '',
    taxonKeys: string[] = [],
    countries: string[] = []
  ) {
    // check cache first
    const cacheKey = query + taxonKeys.join('') + countries.join('') + geometry;
    const value = await this.cacheManager.get<string[]>(cacheKey);
    if (value) return value;

    const taxonQuery = taxonKeys.map((taxon) => `taxonKey=${taxon}`).join('&');
    const countryQuery = countries.map((c) => `country=${c}`).join('&');

    const result = await firstValueFrom(
      this.httpService.get<GbifOccurrenceApiResponse>(
        `https://api.gbif.org/v1/occurrence/search?q=${query}&geometry=${geometry}&facet=datasetKey&limit=0&facetLimit=1200000&${taxonQuery}&${countryQuery}`
      )
    );

    const datasetKeys = result.data.facets[0].counts.map((e) => e.name);
    // cache for 5 minutes
    await this.cacheManager.set(cacheKey, datasetKeys, 300_000);

    return datasetKeys;
  }
}
