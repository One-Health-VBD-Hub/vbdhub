// should be identical to indexed.ts in hub-frontend

import type { GeoJSON } from 'geojson';
import { EsGbifDatasetDoc } from '../gbif/types/indexing';
import { EsVdDatasetDoc } from '../vecdyn/types/indexing';
import { EsVtDatasetDoc } from '../vectraits/types/indexing';
import { EsPxDatasetDoc } from '../proteomexchange/types/indexing';

export const SYNCED_DATABASES = ['gbif', 'px', 'vd', 'vt', 'hub'] as const;
export type SyncedDatabase = (typeof SYNCED_DATABASES)[number];

export const DATABASES = [...SYNCED_DATABASES, 'ncbi'] as const;
export type Database = (typeof DATABASES)[number];

export function isSyncedDatabase(value: string): value is SyncedDatabase {
  return DATABASES.includes(value as SyncedDatabase);
}

export const INDICES = [...SYNCED_DATABASES, 'vddata', 'vtdata'] as const;
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
  | EsGbifDatasetDoc;

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
