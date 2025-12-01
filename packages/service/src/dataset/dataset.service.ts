import { Injectable, Logger } from '@nestjs/common';
import { ElasticsearchService } from '../elasticsearch/elasticsearch.service';
import { Database, isSyncedDatabase } from 'src/synchronisation/types/indexing';

@Injectable()
export class DatasetService {
  private readonly logger = new Logger(DatasetService.name);

  constructor(private readonly elasticSearchService: ElasticsearchService) {}

  async getDocById(id: string, db: Database) {
    if (db === 'ncbi') {
      throw new Error('NCBI database is not yet supported');
    }

    if (isSyncedDatabase(db)) {
      const r = (await this.elasticSearchService.getDocById(id, db)).hits
        .hits[0]?._source;

      // if not found/does not exist (e.g. malformed id)
      if (!r) return undefined;

      return {
        id: r.id,
        title: r.title,
        description: r.description,
        doi: r.doi,
        type: r.type,
        author: r.author,
        citation: r.citation,
        published: r.pubDate,
        kingdom: r.kingdom,
        phylum: r.phylum,
        class: r.class,
        order: r.order,
        family: r.family,
        genus: r.genus,
        species: r.species,
        unknown: r.unknown,
        db: r.db
      };
    }
  }
}
