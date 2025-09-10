import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { configureAxiosRetry } from '../../common/utils';
import { HttpService } from '@nestjs/axios';
import { ElasticsearchService } from '../../elasticsearch/elasticsearch.service';
import { catchError, firstValueFrom, of, throwError } from 'rxjs';
import { AxiosResponse } from 'axios';
import { Agent } from 'https';
import {
  dataMappings as mappings,
  vecDynDataIndexName
} from './types/indexing';

@Injectable()
export class VecdynDataSyncService implements OnModuleInit {
  private readonly logger = new Logger(VecdynDataSyncService.name);

  constructor(
    private readonly httpService: HttpService,
    private readonly elasticSearchService: ElasticsearchService
  ) {}

  onModuleInit() {
    configureAxiosRetry(this.httpService.axiosRef);
  }

  async getAllIds() {
    const res = await firstValueFrom(
      this.httpService.get<{
        ids: number[];
      }>(
        'https://vectorbyte.crc.nd.edu/portal/api/vecdynbyprovider/?page=1&keywords=&sort_column=Id&sort_dir=asc',
        {
          httpsAgent: new Agent({ rejectUnauthorized: false })
        }
      )
    );

    if (!res.data.ids.length) throw new Error('No ids found for VecDyn');

    return res.data.ids;
  }

  async syncCompleteData() {
    // remove all previous data
    await this.elasticSearchService.deleteAllDocuments(vecDynDataIndexName); // TODO explore if this can be refactored out

    // Create an ingest pipeline with CSV processor
    await this.elasticSearchService.getClient().ingest.putPipeline({
      id: 'vecdyn-csv-parser',
      processors: [
        {
          csv: {
            field: 'message',
            target_fields: [
              'DatasetID',
              'title',
              'doi',
              'citation',
              'kingdom',
              'phylum',
              'class',
              'order',
              'family',
              'genus',
              'species',
              'sample_start_date',
              'sample_start_time',
              'sample_end_date',
              'sample_end_time',
              'sample_value',
              'sample_unit',
              'value_transform',
              'sample_sex',
              'sample_stage',
              'sample_location',
              'sample_collection_area',
              'sample_lat_dd',
              'sample_long_dd',
              'sample_environment',
              'additional_location_info',
              'additional_sample_info',
              'sample_name',
              'species_id_method',
              'study_design',
              'sampling_strategy',
              'sampling_method',
              'location_description',
              'geo_datum',
              'gps_obfuscation_info',
              'description',
              'collection_author_name',
              'contact_name',
              'contact_affiliation',
              'email',
              'dataset_license',
              'digitized_from_graph',
              'date_uncertainty_due_to_graph',
              'time_shift_possible',
              'submittedby',
              'contributoremail',
              'curatedbydoi',
              'curatedbycitation',
              'figuretable',
              'notes',
              'subsampling_details'
            ],
            ignore_missing: false,
            trim: true
          }
        },
        {
          gsub: {
            // handle where some date are like [2019-01-01]
            field: 'sample_end_date',
            pattern: '\\[|\\]',
            replacement: ''
          }
        },
        {
          gsub: {
            // handle where some date are like [2019-01-01]
            field: 'sample_start_date',
            pattern: '\\[|\\]',
            replacement: ''
          }
        },
        {
          convert: {
            field: 'sample_lat_dd',
            type: 'double',
            ignore_missing: true
          }
        },
        {
          convert: {
            field: 'sample_long_dd',
            type: 'double',
            ignore_missing: true
          }
        },
        {
          convert: {
            field: 'sample_value',
            type: 'double',
            ignore_missing: true
          }
        },
        {
          remove: {
            field: 'message'
          }
        },
        {
          script: {
            if: 'ctx.sample_long_dd != null && ctx.sample_lat_dd != null',
            source:
              "ctx.geoCoverage = ['type': 'Point', 'coordinates': [ctx.sample_long_dd, ctx.sample_lat_dd]]"
          }
        }
      ]
    });

    // 1. Get all IDs
    const ids = await this.getAllIds();
    this.logger.debug(`Found ${ids.length} VecDyn dataset IDs to process.`);

    // iterate over in chunks
    const chunkSize = 1; // do not change (breaks assigning dataset id to each line)
    for (let i = 0; i < ids.length; i += chunkSize) {
      const chunk = ids.slice(i, i + chunkSize);

      const queryString = chunk.map((id) => `piids=${id}`).join('&');
      this.logger.debug(`Processing ids: ${chunk.join(', ')}`);

      // 2. Get data for each chunk
      const res = await firstValueFrom(
        this.httpService
          .get<string>(
            `https://vectorbyte.crc.nd.edu/portal/api/vecdyncsv/?return_as=csv&${queryString}`,
            {
              httpsAgent: new Agent({ rejectUnauthorized: false })
            }
          )
          .pipe(
            catchError((err) => {
              // If the server responded with a 404, convert to a null result
              if (err.response?.status === 404) {
                return of({ data: null } as AxiosResponse<string | null>);
              }
              // Otherwise, rethrow the original error
              return throwError(() => err);
            })
          )
      );

      // Skip if no data (reached end)
      if (!res.data) continue;

      // 3. Read CSV
      const csvData = res.data;
      let lines = csvData.split('\r\n').slice(1, -1); // Skip header and last empty row

      // add dataset id to each line
      lines = lines.map((line) => `${chunk[0]},` + line);

      this.logger.debug(
        `Processing chunk ${i / chunkSize + 1}/${Math.ceil(ids.length / chunkSize)} with ${lines.length} lines.`
      );

      // 4. Ingest data into Elasticsearch
      await this.elasticSearchService.ingestData(
        lines.map((l) => {
          return {
            message: l
          };
        }),
        () => ({
          index: {
            _index: vecDynDataIndexName,
            pipeline: 'vecdyn-csv-parser'
          }
        })
      );
    }
  }

  async createElasticSearchIndex() {
    await this.elasticSearchService.createIndex(vecDynDataIndexName, mappings);
  }
}
