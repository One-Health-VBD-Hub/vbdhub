import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { firstValueFrom } from 'rxjs';
import { configureAxiosRetry } from '../../common/utils';
import { HttpService } from '@nestjs/axios';
import { ElasticsearchService } from '../../elasticsearch/elasticsearch.service';
import {
  taxonomyPathTokenizerSettings,
  TaxonomyService
} from '../../taxonomy/taxonomy.service';
import {
  mappings,
  EsPxDatasetDoc,
  proteomeXchangeIndexName
} from './types/indexing';
import { AxiosError } from 'axios';
import { xmlToClass } from 'xml-class-transformer';
import { getIdentifiers, ProteomeXchangeDatasetType } from './types/xml';
import { validate } from 'class-validator';
import { ok } from 'node:assert/strict';
import { EsAnyDatasetDoc } from '../types/indexing';

@Injectable()
export class ProteomexchangeSyncService implements OnModuleInit {
  private readonly logger = new Logger(ProteomexchangeSyncService.name);

  onModuleInit() {
    configureAxiosRetry(this.httpService.axiosRef);
  }

  constructor(
    private readonly httpService: HttpService,
    private readonly elasticSearchService: ElasticsearchService,
    private readonly taxonomyService: TaxonomyService
  ) {}

  async getWeeklyPxIds(): Promise<string[]> {
    const response = await firstValueFrom(
      this.httpService.get<{
        items: { title: string; uniqueId: string; link: string; date: Date }[];
      }>(
        'https://script.google.com/macros/s/AKfycbz-yxe0esmV5I3Xux5I80lOi1dKZE7TJtOnGvH7Cs1HKcZnqDrPcA03DjEGCk8V3jw/exec'
      )
    );

    return response.data.items.map((item) => item.uniqueId);
  }

  async pxSingleFetchAndIngestPage(
    url: string
  ): Promise<'success' | 'last-page' | 'not-yet-released'> {
    const response = await firstValueFrom(
      this.httpService.get<string>(url, {
        responseType: 'text'
      })
    ).catch((e: AxiosError) => {
      if (e.response?.status === 404) {
        return e.response;
      }
      throw e; // Re-throw the error if it's not a 404
    });

    // check if last page
    if (
      response.status === 404 &&
      response.statusText === 'Identifier not assigned' // example ID 100000
    ) {
      return 'last-page';
    } else if (
      response.status === 404 &&
      response.statusText === 'Dataset not yet accessible' // example ID 10, 1150
    ) {
      return 'not-yet-released';
    } else if (response.status === 404) {
      throw new Error('Unexpected 404 error');
    }

    // response must be string at this point because of responseType: 'text'
    ok(typeof response.data === 'string');

    const jsonObj = xmlToClass(response.data, ProteomeXchangeDatasetType);
    const errs = await validate(jsonObj);
    if (errs.length > 0) throw new Error('Validation error');

    const speciesList = jsonObj.SpeciesList.Species.flatMap((r) => r.cvParam)
      .filter((r) => r.name === 'taxonomy: scientific name')
      .map((r) => r.value)
      .filter((r) => r !== undefined);
    const taxonomy =
      await this.taxonomyService.getTaxonomyFromNamesList(speciesList);

    const repository = jsonObj.DatasetSummary.hostingRepository;

    const { pxId, doi } = getIdentifiers(jsonObj);
    ok(pxId !== undefined); // pxId is always defined

    const record: EsPxDatasetDoc = {
      id: pxId,
      title: jsonObj.DatasetSummary.title,
      ...taxonomy,
      description: jsonObj.DatasetSummary.Description,
      db: 'px',
      doi: doi,
      repo: repository,
      instruments: [], // TODO instrument
      keywords: [], // TODO keywords
      pubDate: new Date(jsonObj.DatasetSummary.announceDate),
      type: 'proteomic'
    };

    await this.elasticSearchService.ingestData(
      [record],
      (doc: EsAnyDatasetDoc) => ({
        index: { _index: proteomeXchangeIndexName, _id: doc.id }
      })
    );
    return 'success';
  }

  async createElasticSearchIndex() {
    await this.elasticSearchService.createIndex(
      proteomeXchangeIndexName,
      mappings,
      taxonomyPathTokenizerSettings
    );
  }
}

export function* pxSingleNextPageUrlGenerator() {
  let page = 1;
  while (true) {
    yield `https://proteomecentral.proteomexchange.org/cgi/GetDataset?ID=${page}&outputMode=XML`;
    page++;
    if (page === 466) page = 467; // TODO fix later (not possible right now)
  }
}
