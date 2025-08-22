import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit
} from '@nestjs/common';
import { Client } from '@elastic/elasticsearch';
import { EsAnyDatasetDoc, Index } from '../synchronisation/types/indexing';
import {
  MappingTypeMapping,
  QueryDslGeoShapeFieldQuery,
  TasksGetResponse
} from '@elastic/elasticsearch/lib/api/types';
import { SearchDto } from '../search/search.controller';

export type Action = {
  index: { _index: string; _id?: string; pipeline?: string };
};

@Injectable()
export class ElasticsearchService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(ElasticsearchService.name);
  private client: Client;
  private nodeUrl = process.env.ELASTICSEARCH_NODE;
  private apiKey = process.env.ELASTICSEARCH_API_KEY;

  async onModuleDestroy() {
    if (this.client) {
      await this.client.close();
      this.logger.log('Elasticsearch client connection closed.');
    }
  }

  async onModuleInit() {
    if (!this.nodeUrl || !this.apiKey)
      throw new Error('Elasticsearch configuration is missing');

    this.client = new Client({
      node: this.nodeUrl,
      auth: { apiKey: this.apiKey }
    });

    const isAlive = await this.client.cluster.health();

    if (isAlive.status.toLowerCase() == 'red') {
      this.logger.error(
        'Elasticsearch cluster is not healthy:',
        isAlive.status
      );
    } else {
      this.logger.log(`Elasticsearch cluster health: ${isAlive.status}`);
    }
  }

  getClient() {
    return this.client;
  }

  async createIndex(
    index: Index,
    mappings: MappingTypeMapping,
    settings = {},
    shards = 2
  ) {
    await this.client.indices.create({
      index,
      settings: {
        number_of_shards: shards,
        number_of_replicas: 0,
        ...settings
      },
      mappings
    });
  }

  async deleteAllDocuments(indexName: string) {
    const { task } = await this.client.deleteByQuery({
      index: indexName,
      query: {
        match_all: {} // Matches all documents
      },
      slices: 'auto',
      scroll_size: 10_000,
      wait_for_completion: false
    });

    if (!task)
      throw new Error(`Failed to initiate delete task for index ${indexName}`);

    // now poll:
    let status: TasksGetResponse;
    do {
      status = await this.client.tasks.get({ task_id: task.toString() });
      await new Promise((r) => setTimeout(r, 5_000)); // wait 5 seconds before checking again
    } while (!status.completed);

    this.logger.warn(
      `Deleted documents: ${(status.task.status as { deleted?: string }).deleted ?? ''}`
    );
  }

  async ping() {
    return await this.client.ping();
  }

  async search({
    query,
    from,
    limit,
    category,
    database,
    indices,
    publishedFrom,
    publishedTo,
    withoutPublished,
    gbifDatasetKeys,
    geometry,
    exact,
    taxonomicPaths
  }: Omit<SearchDto, 'page' | 'taxonomy'> & {
    indices: Index[];
    from: number;
    gbifDatasetKeys: string[];
    taxonomicPaths?: string[];
  }) {
    const filters = [];

    if (gbifDatasetKeys.length > 0) {
      filters.push({
        bool: {
          should: [
            // allow all documents that are not from gbif
            {
              bool: {
                must_not: { term: { db: 'gbif' } }
              }
            },
            // allow gbif documents only if their datasetKey is in gbifDatasetKeys
            {
              bool: {
                must: [
                  { term: { db: 'gbif' } },
                  { terms: { id: gbifDatasetKeys } }
                ]
              }
            }
          ],
          minimum_should_match: 1
        }
      });
    }

    // filters for various data categories (occurrence, abundance, etc)
    if (category && category.length > 0) {
      filters.push({
        terms: { type: category }
      });
    }

    if (database && database.length > 0) {
      filters.push({
        terms: { db: database }
      });
    }

    // only add the pubDate filter if at least one date is provided
    if (publishedFrom || publishedTo) {
      const rangeFilter = {
        range: {
          pubDate: {
            gte: publishedFrom?.toISOString(),
            lte: publishedTo?.toISOString()
          }
        }
      };

      // if the `withoutPublished` is true, also include documents that are missing pubDate
      if (withoutPublished) {
        filters.push({
          bool: {
            should: [
              rangeFilter,
              { bool: { must_not: { exists: { field: 'pubDate' } } } }
            ],
            minimum_should_match: 1
          }
        });
      } else {
        filters.push(rangeFilter);
      }
    }

    // add geometry filter if provided
    if (geometry) {
      filters.push({
        bool: {
          should: [
            // always allow GBIF docs (skip geometry check on them)
            { term: { db: 'gbif' } },
            // but non-GBIF docs must satisfy the geometry
            {
              geo_shape: {
                geoCoverage: {
                  shape: geometry,
                  relation: 'intersects'
                }
              }
            } as QueryDslGeoShapeFieldQuery
          ],
          minimum_should_match: 1
        }
      });
    }

    // taxonomy filter (should not run on GBIF docs)
    if (taxonomicPaths && taxonomicPaths.length > 0) {
      filters.push({
        bool: {
          // either it's a GBIF record…
          should: [
            { term: { db: 'gbif' } },
            ...taxonomicPaths.map((path) => ({
              match_phrase: {
                taxonomy_paths: path
              }
            }))
          ],
          minimum_should_match: 1
        }
      });
    }

    // build the text‐match clause
    let textQueryClause: Record<string, any> | undefined;
    if (query) {
      // https://chatgpt.com/c/684712c0-c624-8003-97db-be08474634a8
      if (exact) {
        // exact‐only: no fuzziness, no boosting, phrase‐only
        textQueryClause = {
          multi_match: {
            query,
            type: 'phrase',
            fields: ['title^2', '*'],
            operator: 'AND', // make sure all terms must appear
            slop: 0 // enforce exact adjacency,
          }
        };
      } else {
        // fuzzy + boost setup
        textQueryClause = {
          bool: {
            must: [
              {
                multi_match: {
                  query,
                  fuzziness: 'AUTO',
                  fields: ['title^2', '*'],
                  type: 'most_fields'
                }
              }
            ],
            should: [
              {
                multi_match: {
                  query,
                  type: 'phrase',
                  fields: ['title^2', '*'],
                  boost: 5
                }
              }
            ]
          }
        };
      }
    }

    return await this.client.search<EsAnyDatasetDoc>({
      index: indices,
      from,
      size: limit,
      query: {
        bool: {
          // only include our text clause if we have one
          ...(textQueryClause ? { must: [textQueryClause] } : {}),
          filter: filters
        }
      }
    });
  }

  async getAllDocs(index: Index) {
    return this.client.search({
      index: index,
      query: {
        match_all: {}
      }
    });
  }

  async getNodeHeapPressure(): Promise<number | undefined> {
    try {
      // fetch node statistics
      const response = await this.client.nodes.stats({ metric: 'jvm' });
      const nodeId = Object.keys(response.nodes)[0];
      return response.nodes[nodeId].jvm?.mem?.heap_used_percent;
    } catch (error) {
      this.logger.error(`Error fetching node stats: ${error}`);
    }
  }

  async ingestData(
    docs: EsAnyDatasetDoc[] | { message: string }[],
    onDocument: (doc: EsAnyDatasetDoc | { message: string }) => Action
  ) {
    this.logger.debug(`Ingesting ${docs.length} docs`);
    const errors: {
      document: EsAnyDatasetDoc | { message: string };
      error: unknown;
    }[] = [];

    // This helper will:
    //  • serialize your docs into bulk‐API format
    //  • flush whenever the body ≥ 90 MB
    //  • retry 3× on 429/5xx with a 200 ms backoff
    //  • run up to 2 concurrent bulk requests
    const result = await this.client.helpers.bulk({
      datasource: docs,
      onDocument,
      flushBytes: 95 * 1000 * 1000, // 95 MB cap per request
      concurrency: 2,
      retries: 3,
      onDrop(info) {
        errors.push(info);
      },
      wait: 1000 // back off 1 s between retries
    });

    if (result.failed > 0) {
      if (errors.length) this.logger.error('Detailed failures:', errors);
      throw new Error(`Bulk ingest had ${result.failed} failures`);
    }
  }
}
