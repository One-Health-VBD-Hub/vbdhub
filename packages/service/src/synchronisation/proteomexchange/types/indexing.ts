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
    taxonomy_paths: {
      type: 'text',
      analyzer: 'taxonomy_analyzer',
      fields: {
        raw: { type: 'keyword' }
      }
    },
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
    // ProteomeXchange specific fields
    repo: { type: 'keyword' }, // PRIDE, iProX, etc
    labHead: { type: 'text' },
    instruments: {
      type: 'text',
      fields: {
        raw: { type: 'keyword' }
      }
    },
    keywords: { type: 'text' }
  }
};

// name of the index in Elasticsearch containing ProteomeXchange database documents (one document per record)
export const proteomeXchangeIndexName = 'px';

export interface EsPxDatasetDoc extends EsDatasetDoc {
  repo: string; // // PRIDE, iProX, etc
  labHead?: string;
  instruments: string[];
  keywords: string[];
  db: 'px';
}

export function isEsPxDatasetDoc(r: EsAnyDatasetDoc): r is EsPxDatasetDoc {
  return (r as EsPxDatasetDoc).db === 'px';
}
