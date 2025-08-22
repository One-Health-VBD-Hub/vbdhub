import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { firstValueFrom } from 'rxjs';
import { configureAxiosRetry } from '../../common/utils';
import { HttpService } from '@nestjs/axios';
import { ElasticsearchService } from '../../elasticsearch/elasticsearch.service';
import { TaxonomyService } from '../../taxonomy/taxonomy.service';
import { GbifRawDataset, GbifRawDatasetsResponse } from './types/gbif-api/gbif';
import { EsGbifDatasetDoc, gbifIndexName, mappings } from './types/indexing';
import * as https from 'node:https';
import { EsAnyDatasetDoc } from '../types/indexing';
import { stripHtml } from 'string-strip-html';

@Injectable()
export class GbifSyncService implements OnModuleInit {
  private readonly logger = new Logger(GbifSyncService.name);

  onModuleInit() {
    configureAxiosRetry(this.httpService.axiosRef);
  }

  constructor(
    private readonly httpService: HttpService,
    private readonly elasticSearchService: ElasticsearchService,
    private readonly taxonomyService: TaxonomyService
  ) {}

  async gbifDatasetContainsOccurrences(key: string) {
    const response = await firstValueFrom(
      this.httpService.get<number>(
        `https://api.gbif.org/v1/occurrence/count?datasetKey=${key}`,
        {
          httpsAgent: new https.Agent({
            keepAlive: true
          })
        }
      )
    );

    return response.data > 0;
  }

  async gbifFetchAndIngestPage(url: string): Promise<'success' | 'last-page'> {
    const response = await firstValueFrom(
      this.httpService.get<GbifRawDatasetsResponse>(url)
    );

    // check if last page
    if (response.data.results.length === 0) return 'last-page';

    // keep only datasets which have occurrences
    const datasetsWithOccurrences: GbifRawDataset[] = [];
    for (const dataset of response.data.results) {
      const hasOccurrences = await this.gbifDatasetContainsOccurrences(
        dataset.key
      );
      if (hasOccurrences) datasetsWithOccurrences.push(dataset);
    }

    if (datasetsWithOccurrences.length === 0) return 'success';

    const records: EsGbifDatasetDoc[] = datasetsWithOccurrences.map((doc) => {
      const taxonomy = this.taxonomyService.getTaxonomyFromGbifRawDataset(doc);

      return {
        id: doc.key,
        title: doc.title,
        description: doc.description
          ? stripHtml(doc.description).result // GBIF returns in weird HTML format
          : undefined,
        doi: doc.doi,
        type: 'occurrence' as const,
        citation: doc.citation?.text,
        language: doc.language,
        author: doc.createdBy,
        countryCoverage: doc.countryCoverage,
        license: doc.license,
        authorUrl: doc.homepage,
        pubDate: doc.pubDate ? new Date(doc.pubDate) : undefined, // TODO look at
        modDate: doc.modified ? new Date(doc.modified) : undefined, // TODO look at
        db: 'gbif' as const,
        dbUrl: `https://www.gbif.org/dataset/${doc.key}`,
        ...(taxonomy ?? {
          kingdom: [],
          phylum: [],
          class: [],
          order: [],
          family: [],
          genus: [],
          species: [],
          unknown: []
        })
      };
    });

    await this.elasticSearchService.ingestData(
      records,
      (doc: EsAnyDatasetDoc) => ({
        index: { _index: gbifIndexName, _id: doc.id }
      })
    );
    return 'success';
  }

  async createElasticSearchIndex() {
    await this.elasticSearchService.createIndex(gbifIndexName, mappings);
  }
}

export function* gbifNextPageUrlGenerator() {
  let offset = 0;
  const limit = 100;
  const update = false;
  const lastDate = '2024-04-01';

  while (true) {
    // year - month - day
    yield `https://api.gbif.org/v1/dataset?limit=${limit}&offset=${offset}${update ? `&modified=${lastDate},*` : ''}`;
    offset += limit;
  }
}
