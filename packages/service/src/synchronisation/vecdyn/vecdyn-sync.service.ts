import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ElasticsearchService } from '../../elasticsearch/elasticsearch.service';
import { GeoJSON } from 'geojson';
import {
  mappings,
  EsVdDatapointDoc,
  vecDynIndexName,
  EsVdDatasetDoc
} from './types/indexing';
import {
  taxonomyPathTokenizerSettings,
  TaxonomyService
} from '../../taxonomy/taxonomy.service';
import { firstValueFrom } from 'rxjs';
import { Agent } from 'https';

type Position = [number, number];

@Injectable()
export class VecdynSyncService {
  private readonly logger = new Logger(VecdynSyncService.name);

  constructor(
    private readonly httpService: HttpService,
    private readonly elasticSearchService: ElasticsearchService,
    private readonly taxonomyService: TaxonomyService
  ) {}

  async syncDatasets() {
    // get all dataset IDs
    const res = await firstValueFrom(
      this.httpService.get<{
        ids: number[];
      }>(
        `https://vectorbyte.crc.nd.edu/portal/api/vecdynbyprovider/?page=1&keywords=&sort_column=Id&sort_dir=asc`,
        {
          httpsAgent: new Agent({ rejectUnauthorized: false })
        }
      )
    );

    const ids = res.data.ids;

    for (const id of ids) {
      const res = await firstValueFrom(
        this.httpService.get<{
          consistent_data: {
            contributoremail: string;
            citation?: string;
            sample_location: string;
            location_description: string;
            title?: string;
            doi?: string;
            submittedby: string;
            sample_lat_dd?: string;
            sample_long_dd?: string;
          };
          results: {
            species: string;
            sample_lat_dd: string;
            sample_long_dd: string;
          }[];
        }>(
          `https://vectorbyte.crc.nd.edu/portal/api/vecdyncsv/?page=1&piids=${id}`,
          {
            httpsAgent: new Agent({ rejectUnauthorized: false })
          }
        )
      );

      // Sync dataset
      await this.syncDataset(
        id,
        res.data.results.map((item) => {
          return {
            ...item,
            DatasetID: id,
            contributoremail: res.data.consistent_data.contributoremail,
            citation: res.data.consistent_data.citation,
            location_description: res.data.consistent_data.location_description,
            title: res.data.consistent_data.title,
            doi: res.data.consistent_data.doi,
            submittedby: res.data.consistent_data.submittedby,
            sample_lat_dd: Number(
              item.sample_lat_dd ?? res.data.consistent_data.sample_lat_dd
            ),
            sample_long_dd: Number(
              item.sample_long_dd ?? res.data.consistent_data.sample_long_dd
            )
          };
        })
      );
    }
  }

  async syncDataset(id: number, documents: EsVdDatapointDoc[]) {
    this.logger.log(`Syncing dataset ${id}`);

    // build GeoJSON MultiPoint of all unique valid coordinates
    const seen = new Set<string>();
    const coordinates: Position[] = [];

    for (const doc of documents) {
      const lon = doc.sample_long_dd;
      const lat = doc.sample_lat_dd;

      const key = `${lon},${lat}`;
      if (!seen.has(key)) {
        seen.add(key);
        coordinates.push([lon, lat]);
      }
    }

    if (!coordinates.length)
      throw new Error(`No coordinates found for VecDyn (dataset ${id})`);

    // return GeoJSON MultiPoint
    const geoCoverage: GeoJSON = { type: 'MultiPoint', coordinates };

    // remove duplicates
    let names = Array.from(
      new Set(
        documents.map((doc) => (doc.genus ?? '') + ' ' + (doc.species ?? ''))
      )
    );

    // some names are in non-standard form (e.g. "genus Culex" or "Mansonia genus sp."), normalise these
    names = names.map(
      (s) => s.replace(/\b(?:subgenus|genus)\b\s*/gi, '').trim() // will strip out any occurrence of "genus" or "subgenus" and collapse whitespace
    );
    // filter out "BLANK"s
    names = names.filter((s) => s !== 'BLANK' && s !== '');

    const taxonomy = await this.taxonomyService.getTaxonomyFromNamesList(names);

    const databaseRecord: EsVdDatasetDoc = {
      id: id.toString(),
      db: 'vd',
      type: 'abundance',
      contactEmail: documents[0].contributoremail,
      citation: documents[0].citation,
      locationDescription: documents[0].location_description,
      geoCoverage: geoCoverage,
      title:
        documents[0].title ??
        (documents[0].citation
          ? extractTitleFromCitation(documents[0].citation)
          : 'no title'), // TODO always add some title
      ...taxonomy
    };

    databaseRecord.doi = documents[0].doi;

    await this.elasticSearchService.getClient().index({
      index: vecDynIndexName,
      id: id.toString(),
      document: databaseRecord
    });
  }

  async createElasticSearchIndex() {
    await this.elasticSearchService.createIndex(
      vecDynIndexName,
      mappings,
      taxonomyPathTokenizerSettings
    );
  }
}

/**
 * Extracts the article title from a citation string of the form:
 *   Authors. Title. Journal info…
 *
 * @param {string} citation
 * @returns {string} the title, or empty string if none found
 */
function extractTitleFromCitation(citation: string): string {
  // \.        match “. ” (end of author list)
  // (.+?)     lazily capture everything up to a “.” that’s followed by a space+capital (journal) or end-of-string
  // \.(?= [A-Z]|\.$)
  const regex = /\. (.+?)\.(?= [A-Z]|\.$)/;
  const match = citation.match(regex);
  return match ? match[1].trim() : '';
}
