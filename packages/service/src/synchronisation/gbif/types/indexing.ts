import { MappingTypeMapping } from '@elastic/elasticsearch/lib/api/types';
import { EsAnyDatasetDoc, EsDatasetDoc } from '../../types/indexing';

export const mappings: MappingTypeMapping = {
  dynamic: 'strict', // throw an error if a document has a field not in the mapping
  properties: {
    // general fields
    id: { type: 'keyword' },
    title: {
      type: 'text',
      analyzer: 'english',
      fields: {
        raw: { type: 'keyword' }
      }
    },
    description: {
      type: 'text',
      analyzer: 'english'
    },
    // GBIF, VecTraits, etc
    db: { type: 'keyword' },
    dbUrl: {
      type: 'keyword',
      index: false
    },
    authorUrl: { type: 'keyword', index: false },
    author: { type: 'text' },
    contactEmail: { type: 'keyword', index: false },
    type: { type: 'keyword' },
    subtype: { type: 'keyword' },
    doi: { type: 'keyword' },
    language: { type: 'keyword' },
    geoCoverage: { type: 'geo_shape' },
    countryCoverage: { type: 'keyword' },
    temporalCoverage: {
      type: 'object',
      properties: {
        start: { type: 'date' },
        end: { type: 'date' }
      }
    },
    pubDate: { type: 'date' },
    modDate: { type: 'date' },
    citation: { type: 'text' },
    // taxonomic coverage
    kingdom: {
      type: 'text',
      fields: {
        raw: {
          type: 'keyword'
        }
      }
    },
    phylum: {
      type: 'text',
      fields: {
        raw: {
          type: 'keyword'
        }
      }
    },
    class: {
      type: 'text',
      fields: {
        raw: {
          type: 'keyword'
        }
      }
    },
    order: {
      type: 'text',
      fields: {
        raw: {
          type: 'keyword'
        }
      }
    },
    family: {
      type: 'text',
      fields: {
        raw: {
          type: 'keyword'
        }
      }
    },
    genus: {
      type: 'text',
      fields: {
        raw: {
          type: 'keyword'
        }
      }
    },
    species: {
      type: 'text',
      fields: {
        raw: {
          type: 'keyword'
        }
      }
    },
    unknown: {
      type: 'text',
      fields: {
        raw: {
          type: 'keyword'
        }
      }
    },
    // GBIF specific fields
    license: { type: 'keyword' }
  }
};

export interface GbifDoc {
  id: string;
  title?: string;
  description?: string;
  db: string;
  dbUrl: string;
  authorUrl?: string;
  pubDate?: Date;
}

// name of the index in Elasticsearch containing GBIF database documents (one document per dataset)
export const gbifIndexName = 'gbif';

export interface EsGbifDatasetDoc extends EsDatasetDoc {
  license?: string;
  db: 'gbif';
}

export function isEsGbifDatasetDoc(r: EsAnyDatasetDoc): r is EsGbifDatasetDoc {
  return (r as EsGbifDatasetDoc).db === 'gbif';
}
