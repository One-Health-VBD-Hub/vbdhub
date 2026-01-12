import { Injectable, Logger } from '@nestjs/common';
import { Readable } from 'node:stream';
import { parse } from 'csv-parse';
import { EsHubDatasetDoc, hubIndexName, mappings } from './types/indexing';
import { ElasticsearchService } from '../../../infrastructure/elasticsearch/elasticsearch.service';
import {
  taxonomyPathTokenizerSettings,
  TaxonomyService
} from '../../taxonomy/taxonomy.service';
import { GeoJSON } from 'geojson';
import { buildUniqueMultiPoint } from '../../../common/geo';
import { createHash } from 'node:crypto';
import { StorageService } from '../../../infrastructure/storage/storage.service';

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

  constructor(
    private readonly taxonomyService: TaxonomyService,
    private readonly elasticSearchService: ElasticsearchService,
    private readonly storageService: StorageService
  ) {}

  async syncDatasets() {
    this.logger.log('Syncing VBD Hub repository');

    await this.iterateAllCSVs();
  }

  async iterateAllCSVs() {
    for await (const obj of this.storageService.listObjects({
      prefix: 'epidemiological',
      recursive: true
    })) {
      if (!obj.name || !obj.name.endsWith('.csv')) continue;

      const stream = await this.storageService.getObjectStream({
        objectKey: obj.name
      });
      await this.processCSV(stream, obj.name);
    }
  }

  async processCSV(csvText: Readable, datasetName: string) {
    this.logger.log(`Processing dataset ${datasetName}`);

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
      id: sha1Hex(datasetName), // unique ID based on dataset name
      title: firstRecord.Title,
      description: firstRecord.Description,
      db: 'hub',
      type: 'epidemiological',
      geoCoverage,
      ...taxonomy
    };

    await this.elasticSearchService.getClient().index({
      index: hubIndexName,
      id: datasetName,
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

// Simple SHA-1 hash function to create unique IDs
function sha1Hex(str: string) {
  return createHash('sha1').update(str).digest('hex');
}
