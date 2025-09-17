// should be identical to indexed.ts in hub-frontend

import type { GeoJSON } from 'geojson';
import { EsGbifDatasetDoc } from '../gbif/types/indexing';
import { EsVdDatasetDoc } from '../vecdyn/types/indexing';
import { EsVtDatasetDoc } from '../vectraits/types/indexing';
import { EsPxDatasetDoc } from '../proteomexchange/types/indexing';
import { EsHubDatasetDoc } from '../vbdhub/types/indexing';
import { MappingTypeMapping } from '@elastic/elasticsearch/lib/api/types';

export const SYNCED_DATABASES = ['gbif', 'px', 'vd', 'vt', 'hub'] as const;
export type SyncedDatabase = (typeof SYNCED_DATABASES)[number];

export const DATABASES = [...SYNCED_DATABASES, 'ncbi'] as const;
export type Database = (typeof DATABASES)[number];

export function isSyncedDatabase(value: string): value is SyncedDatabase {
  return DATABASES.includes(value as SyncedDatabase);
}

export function isDatabase(value: string): value is Database {
  return DATABASES.includes(value as Database);
}

export const INDICES = [...SYNCED_DATABASES] as const;
export type Index = (typeof INDICES)[number];

export function isIndex(value: string): value is Index {
  return INDICES.includes(value as Index);
}

export const TYPES = [
  'trait',
  'abundance',
  'occurrence',
  'proteomic',
  'genomic',
  'microarray',
  'transcriptomic',
  'epidemiological'
] as const;
export type DataCategory = (typeof TYPES)[number];

export function isDataCategory(value: string): value is DataCategory {
  return TYPES.includes(value as DataCategory);
}

export interface TaxonomyWithLineage {
  taxonomy_paths?: string[]; // taxonomy paths made out of GBIF ids
  ncbiIds?: string[]; // NCBI IDs
  kingdom: string[];
  phylum: string[];
  class: string[];
  order: string[];
  family: string[];
  genus: string[];
  species: string[];
  unknown: string[];
}

export interface DateRange {
  start: Date;
  end: Date;
}

export type EsAnyDatasetDoc =
  | EsVdDatasetDoc
  | EsVtDatasetDoc
  | EsPxDatasetDoc
  | EsGbifDatasetDoc
  | EsHubDatasetDoc;

export interface EsDatasetDoc extends TaxonomyWithLineage {
  id: string; // unique identifier for the record (e.g., GBIF dataset key, VecDyn ID)
  title: string;
  db: SyncedDatabase;
  type: DataCategory;
  description?: string;
  author?: string;
  subtype?: string;
  doi?: string;
  language?: string;
  geoCoverage?: GeoJSON; // https://www.elastic.co/guide/en/elasticsearch/reference/current/geo-shape.html
  countryCoverage?: string[];
  temporalCoverage?: DateRange;
  pubDate?: Date;
  modDate?: Date;
  citation?: string;
}

export const sharedMappingsProperties: MappingTypeMapping['properties'] = {
  id: { type: 'keyword' },
  title: {
    type: 'text',
    analyzer: 'english'
  },
  description: {
    type: 'text',
    analyzer: 'english'
  },
  db: { type: 'keyword' }, // e.g. GBIF, VecTraits, etc
  dbUrl: {
    type: 'keyword',
    index: false
  },
  authorUrl: { type: 'keyword', index: false },
  author: { type: 'text' },
  contactEmail: { type: 'keyword', index: false },
  type: { type: 'keyword' }, // e.g., trait, abundance, occurrence, etc
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
  }
};
