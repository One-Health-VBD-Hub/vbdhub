import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ElasticsearchService } from '../../elasticsearch/elasticsearch.service';
import { GeoJSON } from 'geojson';
import {
  mappings,
  EsVdDatapointDoc,
  vecDynDataIndexName,
  vecDynIndexName,
  EsVdDatasetDoc
} from './types/indexing';
import {
  taxonomyPathTokenizerSettings,
  TaxonomyService
} from '../../taxonomy/taxonomy.service';

interface TermsAgg {
  dataset_ids: {
    buckets: Array<{
      key: number;
      doc_count: number;
    }>;
  };
}

@Injectable()
export class VecdynSyncService {
  private readonly logger = new Logger(VecdynSyncService.name);

  constructor(
    private readonly httpService: HttpService,
    private readonly elasticSearchService: ElasticsearchService,
    private readonly taxonomyService: TaxonomyService
  ) {}

  async syncDatasets() {
    // get all IDs
    const response = await this.elasticSearchService
      .getClient()
      .search<Record<string, unknown>, TermsAgg>({
        index: vecDynDataIndexName,
        size: 0,
        aggs: {
          dataset_ids: {
            terms: {
              field: 'DatasetID',
              size: 10000000
            }
          }
        }
      });

    const ids = response.aggregations?.dataset_ids.buckets.map(
      (bucket) => bucket.key
    );

    if (!ids) throw new Error('No ids found for VecDyn');

    for (const id of ids) {
      const client = this.elasticSearchService.getClient();

      const scrollResponse = await client.search<EsVdDatapointDoc>({
        index: vecDynDataIndexName,
        scroll: '1m', // Keep the scroll context alive for 1 minute
        size: 5000, // Get 5000 documents per batch
        query: {
          term: {
            DatasetID: id
          }
        }
      });

      let documents = scrollResponse.hits.hits.map((hit) => hit._source);
      let scrollId = scrollResponse._scroll_id;

      // Keep fetching until no more results
      while (scrollId) {
        const nextScroll = await client.scroll<EsVdDatapointDoc>({
          scroll_id: scrollId,
          scroll: '1m'
        });

        if (nextScroll.hits.hits.length === 0) {
          break; // Exit the loop when there are no more documents
        }

        documents = documents.concat(
          nextScroll.hits.hits.map((hit) => hit._source)
        );
        scrollId = nextScroll._scroll_id;
      }

      // Cleanup the scroll context
      await client.clearScroll({ scroll_id: scrollId });

      // Sync dataset
      await this.syncDataset(
        id,
        documents.filter((doc) => !!doc)
      );
    }
  }

  async syncDataset(id: number, documents: EsVdDatapointDoc[]) {
    this.logger.log(`Syncing dataset ${id}`);

    const geoCoverage: GeoJSON = {
      type: 'MultiPoint',
      coordinates: documents.map((doc) => [
        doc.sample_long_dd,
        doc.sample_lat_dd
      ])
    };

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
    names = names.filter((s) => s !== 'BLANK');

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
