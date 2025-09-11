import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ElasticsearchService } from '../../elasticsearch/elasticsearch.service';
import { configureAxiosRetry } from '../../common/utils';
import { firstValueFrom } from 'rxjs';
import { Agent } from 'https';
import {
  dataMappings as mappings,
  vecTraitsDataIndexName
} from './types/indexing';

@Injectable()
export class VectraitsDataSyncService implements OnModuleInit {
  private readonly logger = new Logger(VectraitsDataSyncService.name);

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
        'https://vectorbyte.crc.nd.edu/portal/api/vectraits-explorer/?page=1&keywords=&sort_column=DatasetID&sort_dir=asc',
        {
          httpsAgent: new Agent({ rejectUnauthorized: false })
        }
      )
    );

    if (!res.data.ids.length) throw new Error('No ids found for VecTraits');

    return res.data.ids;
  }

  async syncCompleteData() {
    // 1. Get all IDs
    const ids = await this.getAllIds();
    const url =
      'https://vectorbyte.crc.nd.edu/portal/api/vectraits-get-populated-fields/';

    // Create form data with multiple 'ids' entries
    const formData = new FormData();
    ids.forEach((id) => formData.append('ids', id.toString()));

    // 2. Get CSV
    const response = await firstValueFrom(
      this.httpService.post<string>(url, formData, {
        httpsAgent: new Agent({ rejectUnauthorized: false }),
        headers: {
          'Content-Type': `multipart/form-data; boundary=generated-boundary`
        }
      })
    );

    // 3. Create an ingest pipeline with CSV processor
    await this.elasticSearchService.getClient().ingest.putPipeline({
      id: 'vectraits-csv-parser',
      processors: [
        {
          csv: {
            field: 'message',
            target_fields: [
              'Id',
              'DatasetID',
              'IndividualID',
              'OriginalID',
              'OriginalTraitName',
              'OriginalTraitDef',
              'StandardisedTraitName',
              'StandardisedTraitDef',
              'OriginalTraitValue',
              'OriginalTraitUnit',
              'OriginalErrorPos',
              'OriginalErrorNeg',
              'OriginalErrorUnit',
              'StandardisedTraitValue',
              'StandardisedTraitUnit',
              'Replicates',
              'Habitat',
              'LabField',
              'AmbientTemp',
              'AmbientTempMethod',
              'AmbientTempUnit',
              'SecondStressor',
              'SecondStressorDef',
              'SecondStressorValue',
              'SecondStressorUnit',
              'TimeStart',
              'TimeEnd',
              'TotalObsTimeValue',
              'TotalObsTimeUnit',
              'TotalObsTimeNotes',
              'Location',
              'LocationType',
              'LocationDate',
              'LocationDatePrecision',
              'CoordinateType',
              'Latitude',
              'Longitude',
              'Interactor1',
              'Interactor1Common',
              'Interactor1Wholepart',
              'Interactor1Number',
              'Interactor1Kingdom',
              'Interactor1Phylum',
              'Interactor1Class',
              'Interactor1Order',
              'Interactor1Family',
              'Interactor1Genus',
              'Interactor1Species',
              'Interactor1Stage',
              'Interactor1Sex',
              'Interactor1Temp',
              'Interactor1TempUnit',
              'Interactor1TempMethod',
              'Interactor1GrowthTemp',
              'Interactor1GrowthTempUnit',
              'Interactor1GrowthDur',
              'Interactor1GrowthdDurUnit',
              'Interactor1GrowthType',
              'Interactor1AccTemp',
              'Interactor1AccTime',
              'Interactor1AccTimeUnit',
              'Interactor1OrigTempNotes',
              'Interactor1OrigTime',
              'Interactor1OrigTimeUnit',
              'Interactor1Size',
              'Interactor1SizeUnit',
              'Interactor1SizeType',
              'Interactor1SizeSI',
              'Interactor1SizeUnitSI',
              'Interactor1DenValue',
              'Interactor1DenUnit',
              'Interactor2Common',
              'Interactor2Kingdom',
              'Interactor2Phylum',
              'Interactor2Class',
              'Interactor2Order',
              'Interactor2Family',
              'Interactor2Genus',
              'Interactor2Species',
              'Interactor2Stage',
              'Interactor2Temp',
              'Interactor2TempUnit',
              'Interactor2GrowthTemp',
              'Interactor2GrowthTempUnit',
              'FigureTable',
              'Citation',
              'DOI',
              'CuratedByCitation',
              'CuratedByDOI',
              'SubmittedBy',
              'ContributorEmail',
              'Notes',
              'DefaultChartXaxis',
              'DefaultChartCategory',
              'EmbargoReleaseDate'
            ],
            ignore_missing: false,
            trim: true
          }
        },
        {
          convert: {
            field: 'DatasetID',
            type: 'long',
            ignore_missing: true
          }
        },
        {
          convert: {
            field: 'Id',
            type: 'long',
            ignore_missing: true
          }
        },
        {
          convert: {
            field: 'Interactor1GrowthDur',
            type: 'double',
            ignore_missing: true
          }
        },
        {
          convert: {
            field: 'Interactor1GrowthTemp',
            type: 'double',
            ignore_missing: true
          }
        },
        {
          convert: {
            field: 'Interactor1Number',
            type: 'double',
            ignore_missing: true
          }
        },
        {
          convert: {
            field: 'Interactor1Size',
            type: 'double',
            ignore_missing: true
          }
        },
        {
          convert: {
            field: 'Interactor1Temp',
            type: 'double',
            ignore_missing: true
          }
        },
        {
          convert: {
            field: 'Interactor2GrowthTemp',
            type: 'double',
            ignore_missing: true
          }
        },
        {
          convert: {
            field: 'Latitude',
            type: 'double',
            ignore_missing: true
          }
        },
        {
          convert: {
            field: 'LocationDatePrecision',
            type: 'long',
            ignore_missing: true
          }
        },
        {
          convert: {
            field: 'Longitude',
            type: 'double',
            ignore_missing: true
          }
        },
        {
          convert: {
            field: 'OriginalErrorNeg',
            type: 'double',
            ignore_missing: true
          }
        },
        {
          convert: {
            field: 'OriginalErrorPos',
            type: 'double',
            ignore_missing: true
          }
        },
        {
          convert: {
            field: 'OriginalTraitValue',
            type: 'double',
            ignore_missing: true
          }
        },
        {
          convert: {
            field: 'Replicates',
            type: 'long',
            ignore_missing: true
          }
        },
        {
          convert: {
            field: 'SecondStressorValue',
            type: 'double',
            ignore_missing: true
          }
        },
        {
          convert: {
            field: 'TotalObsTimeValue',
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
            if: 'ctx.Latitude != null && ctx.Longitude != null',
            source:
              "ctx.geoCoverage = ['type': 'Point', 'coordinates': [ctx.Longitude, ctx.Latitude]]"
          }
        },
        {
          date: {
            field: 'LocationDate', // the field with the original date string
            target_field: 'LocationDate', // overwrite it (or use a new field name)
            formats: ['yyyy-MM-dd'], // input format (use java time patterns)
            output_format: 'iso8601',
            if: 'ctx.LocationDate != null' // only if the field is not null
          }
        }
      ]
    });

    // 2. Read CSV
    const csvData = response.data;
    const lines = csvData.split('\r\n').slice(1, -1); // Skip header and last empty row

    // 3. Ingest data
    await this.elasticSearchService.ingestData(
      lines.map((l) => ({
        message: l
      })),
      (doc: { message: string }) => ({
        index: {
          _index: vecTraitsDataIndexName,
          pipeline: 'vectraits-csv-parser',
          _id: doc.message.split(',')[0] // Use 'Id' as the document ID
        }
      })
    );

    this.logger.log('VecTraits data synced');
  }

  async createElasticSearchIndex() {
    await this.elasticSearchService.createIndex('vtdata', mappings);
  }
}
