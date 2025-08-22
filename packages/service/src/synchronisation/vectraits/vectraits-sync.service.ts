import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ElasticsearchService } from '../../elasticsearch/elasticsearch.service';
import {
  mappings,
  EsVtDatapointDoc,
  EsVtDatasetDoc,
  vecTraitsDataIndexName,
  vecTraitsIndexName
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
export class VectraitsSyncService {
  private readonly logger = new Logger(VectraitsSyncService.name);

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
        index: vecTraitsDataIndexName,
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

    if (!ids) throw new Error('No ids found for VecTraits');

    for (const id of ids) {
      const client = this.elasticSearchService.getClient();

      const scrollResponse = await client.search<EsVtDatapointDoc>({
        index: vecTraitsDataIndexName,
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
        const nextScroll = await client.scroll<EsVtDatapointDoc>({
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

  async syncDataset(id: number, documents: EsVtDatapointDoc[]) {
    this.logger.log(`Syncing dataset ${id}`);

    const speciesList = [];
    for (const doc of documents) {
      if (doc.Interactor1) speciesList.push(doc.Interactor1);
      if (doc.Interactor2) speciesList.push(doc.Interactor2);
    }

    const taxonomy =
      await this.taxonomyService.getTaxonomyFromNamesList(speciesList);

    const esVtDatasetDoc: EsVtDatasetDoc = {
      id: id.toString(),
      db: 'vt',
      dbUrl: `https://vectorbyte.crc.nd.edu/vectraits-dataset/${id}`,
      type: 'trait',
      locationDescription: documents[0].Location,
      contactEmail: documents[0].ContributorEmail,
      title: documents[0].Citation,
      submittedBy: documents[0].SubmittedBy,
      ...taxonomy
    };

    esVtDatasetDoc.doi = documents[0].DOI;
    esVtDatasetDoc.trait = documents[0].OriginalTraitName;
    esVtDatasetDoc.habitat = documents[0].Habitat;
    esVtDatasetDoc.longitude = documents[0].Longitude;
    esVtDatasetDoc.latitude = documents[0].Latitude;
    esVtDatasetDoc.locationDate = documents[0].LocationDate;
    esVtDatasetDoc.geoCoverage = documents[0].geoCoverage;

    await this.elasticSearchService.getClient().index({
      index: vecTraitsIndexName,
      id: id.toString(),
      document: esVtDatasetDoc
    });
  }

  async createElasticSearchIndex() {
    await this.elasticSearchService.createIndex(
      vecTraitsIndexName,
      mappings,
      taxonomyPathTokenizerSettings
    );
  }
}
