import { Injectable, Logger } from '@nestjs/common';
import {
  GetObjectCommand,
  ListObjectsV2Command,
  ListObjectsV2CommandOutput,
  S3Client
} from '@aws-sdk/client-s3';
import { Readable } from 'node:stream';
import { parse } from 'csv-parse';
import { EsHubDatasetDoc, hubIndexName, mappings } from './types/indexing';
import { ElasticsearchService } from '../../elasticsearch/elasticsearch.service';
import {
  taxonomyPathTokenizerSettings,
  TaxonomyService
} from '../../taxonomy/taxonomy.service';
import { GeoJSON } from 'geojson';
import { buildUniqueMultiPoint } from '../../common/geo';
import { createHash } from 'node:crypto';

interface EpidemiologicalLineCSV {
  TaxonIdNCBI?: string;
  TaxonIdGBIF?: string;
  Genus: string;
  Species?: string;
  Latitude: string;
  Longitude: string;
  Year?: string;
  Title: string;
  Description: string;
}

@Injectable()
export class VbdhubSyncService {
  private readonly logger = new Logger(VbdhubSyncService.name);
  private readonly s3 = new S3Client({});
  private readonly bucket = 'xyz'; // TODO: add bucket

  constructor(
    private readonly taxonomyService: TaxonomyService,
    private readonly elasticSearchService: ElasticsearchService
  ) {}

  async syncDatasets() {
    this.logger.log('Syncing VBD Hub repository');

    await this.iterateAllCSVs(this.bucket);
  }

  async iterateAllCSVs(bucket: string, prefix = '') {
    let continuationToken: string | undefined;

    do {
      const listResp: ListObjectsV2CommandOutput = await this.s3.send(
        new ListObjectsV2Command({
          Bucket: bucket,
          Prefix: prefix,
          ContinuationToken: continuationToken
        })
      );

      continuationToken = listResp.NextContinuationToken;

      // iterate over all CSV files in the bucket with the given prefix (or all)
      for (const bucketObject of listResp.Contents || []) {
        if (!bucketObject.Key || !bucketObject.Key.endsWith('.csv')) continue;

        const csvText = await this.getObjectText(bucket, bucketObject.Key);
        await this.processCSV(csvText, bucketObject.Key);
      }
    } while (continuationToken);
  }

  async processCSV(csvText: Readable, datasetKey: string) {
    this.logger.log(`Processing dataset ${datasetKey}`);

    const iterator = streamCsv<EpidemiologicalLineCSV>(csvText);
    const firstRecord = (await iterator.next()).value;

    if (!firstRecord)
      throw new Error('CSV file is empty or has no valid records');

    const species = [`${firstRecord.Genus} ${firstRecord.Species}`.trim()];
    const coordinates: { lat: string; lng: string }[] = [];

    // iterate over each record in the CSV
    for await (const record of iterator) {
      species.push(`${record.Genus} ${record.Species}`.trim());
      if (record.Latitude && record.Longitude) {
        coordinates.push({ lat: record.Latitude, lng: record.Longitude });
      }
    }

    const geoCoverage: GeoJSON = buildUniqueMultiPoint(coordinates);

    const taxonomy =
      await this.taxonomyService.getTaxonomyFromNamesList(species);

    const datasetRecord: EsHubDatasetDoc = {
      id: sha1Hex(datasetKey),
      title: firstRecord.Title,
      description: firstRecord.Description,
      db: 'hub',
      type: 'epidemiological',
      geoCoverage,
      ...taxonomy
    };

    await this.elasticSearchService.getClient().index({
      index: hubIndexName,
      id: datasetKey,
      document: datasetRecord
    });
  }

  async createElasticSearchIndex() {
    await this.elasticSearchService.createIndex(
      hubIndexName,
      mappings,
      taxonomyPathTokenizerSettings
    );
  }

  async getObjectText(bucket: string, key: string): Promise<Readable> {
    const resp = await this.s3.send(
      new GetObjectCommand({ Bucket: bucket, Key: key })
    );

    if (!(resp.Body instanceof Readable))
      throw new Error('Expected response body to be a Readable stream');

    return resp.Body;
  }
}

async function* streamCsv<T = Record<string, string>>(src: Readable) {
  const parser = parse({
    columns: true, // use first row as headers
    bom: true,
    trim: true,
    skip_empty_lines: true
  });

  src.pipe(parser);

  for await (const record of parser) {
    // record is an object keyed by header names (all strings)
    yield record as T;
  }
}

function sha1Hex(str: string) {
  return createHash('sha1').update(str).digest('hex');
}
