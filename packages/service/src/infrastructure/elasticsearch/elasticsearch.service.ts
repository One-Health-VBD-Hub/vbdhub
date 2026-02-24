import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Client } from '@elastic/elasticsearch';
import {
  EsAnyDatasetDoc,
  Index,
  SYNCED_DATABASES,
  SyncedDatabase
} from '../../features/synchronisation/types/indexing';
import {
  MappingTypeMapping,
  QueryDslGeoShapeFieldQuery,
  QueryDslQueryContainer,
  SearchResponse
} from '@elastic/elasticsearch/lib/api/types';
import { SearchDto } from '../../features/search/search.controller';
import { BulkHelperOptions } from '@elastic/elasticsearch/lib/helpers';

@Injectable()
export class ElasticsearchService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(ElasticsearchService.name);
  private client: Client;

  constructor(private readonly config: ConfigService) {}

  async onModuleDestroy() {
    if (this.client) {
      await this.client.close();
      this.logger.log('Elasticsearch client connection closed.');
    }
  }

  async onModuleInit() {
    const nodeUrl = this.config.getOrThrow<string>('ELASTICSEARCH_NODE_LESS');
    const apiKey = this.config.getOrThrow<string>('ELASTICSEARCH_API_KEY_LESS');

    this.client = new Client({
      node: nodeUrl,
      auth: { apiKey },
      serverMode: 'serverless'
    });

    await this.client.ping();
  }

  async createIndex(
    index: Index,
    mappings: MappingTypeMapping,
    settings: Record<string, unknown> = {}
  ) {
    const exists = await this.client.indices.exists({ index });
    if (exists) return;

    await this.client.indices.create({
      index,
      settings,
      mappings
    });
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
  }): Promise<SearchResponse<EsAnyDatasetDoc>> {
    const filters: QueryDslQueryContainer[] = [];

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
    let textQueryClause: QueryDslQueryContainer | undefined;
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
                  operator: 'AND', // all terms must appear
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

  async getDocById(id: string, db: SyncedDatabase) {
    return this.client.search<EsAnyDatasetDoc>({
      index: [...SYNCED_DATABASES],
      query: {
        bool: {
          must: [{ ids: { values: [id] } }, { term: { db: db } }] // exact match on _id and db
        }
      },
      size: 1
    });
  }

  async ingestSingle(index: Index, id: string, doc: EsAnyDatasetDoc) {
    await this.client.index({
      index: index,
      id: id,
      document: doc
    });
  }

  async ingestBulk({
    datasource,
    onDocument
  }: BulkHelperOptions<EsAnyDatasetDoc>) {
    if (datasource instanceof Array) {
      this.logger.debug(`Ingesting ${datasource.length} docs`);
    }

    const errors: {
      document: EsAnyDatasetDoc | { message: string };
      error: unknown;
    }[] = [];

    // This helper will:
    //  • serialize your docs into bulk‐API format
    //  • flush whenever the body ≥ 90 MB
    //  • retry 3× on 429/5xx with a 1 s backoff
    //  • run up to 2 concurrent bulk requests
    const result = await this.client.helpers.bulk({
      datasource,
      onDocument,
      flushBytes: 95 * 1000 * 1000, // 95 MB cap per request
      concurrency: 2,
      retries: 3,
      include_source_on_error: true,
      onDrop(info) {
        errors.push(info);
      },
      wait: 1000 // back off 1 s between retries
    });

    if (result.failed > 0) {
      // print only the first error to avoid log flooding
      if (errors.length)
        this.logger.error('Detailed failures:', errors.slice(0, 1));
      throw new Error(`Bulk ingest had ${result.failed} failures`);
    }
  }
}
