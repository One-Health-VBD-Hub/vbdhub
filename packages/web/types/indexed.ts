// should be identical to indexed.ts in hub-backend

import type { GeoJSON } from 'geojson';

export const SYNCED_DATABASES = ['gbif', 'px', 'vd', 'vt', 'hub'] as const;
export type SyncedDatabase = (typeof SYNCED_DATABASES)[number];

export function isSyncedDatabase(value: string): value is SyncedDatabase {
  return SYNCED_DATABASES.includes(value as SyncedDatabase);
}

export const DATABASES = [...SYNCED_DATABASES, 'ncbi'] as const;
export type Database = (typeof DATABASES)[number];

export function isDatabase(value: string): value is Database {
  return DATABASES.includes(value as Database);
}

export type DataCategory =
  | 'trait'
  | 'abundance'
  | 'occurrence'
  | 'proteomic'
  | 'genomic'
  | 'microarray'
  | 'transcriptomic'
  | 'epidemiological';

export function isDataCategory(value: string): value is DataCategory {
  return [
    'trait',
    'abundance',
    'occurrence',
    'proteomic',
    'genomic',
    'microarray',
    'transcriptomic',
    'epidemiological'
  ].includes(value);
}

export interface Taxon {
  ncbiId?: string;
  scientificName: string;
  commonName?: string;
  otherNames?: string[];
}

export interface TaxonomyWithLineage {
  kingdom: Taxon[];
  phylum: Taxon[];
  class: Taxon[];
  order: Taxon[];
  family: Taxon[];
  genus: Taxon[];
  species: Taxon[];
  unknown?: Taxon[];
}

interface DateRange {
  start: Date;
  end?: Date;
}

export type AnyRecord =
  | VecDynDataRecord
  | VecTraitsDataRecord
  | ProteomeXchangeDataRecord
  | GbifDataRecord;

export function isGbifDataRecord(r: AnyRecord): r is GbifDataRecord {
  return (r as GbifDataRecord).db === 'gbif';
}

export function isVecDynDataRecord(r: AnyRecord): r is VecDynDataRecord {
  return (r as VecDynDataRecord).db !== 'vd';
}

export function isVecTraitsDataRecord(r: AnyRecord): r is VecTraitsDataRecord {
  return (r as VecTraitsDataRecord).db === 'vt';
}

export function isProteomeXchangeDataRecord(
  r: AnyRecord
): r is ProteomeXchangeDataRecord {
  return (r as ProteomeXchangeDataRecord).db === 'px';
}

export interface DataRecord extends TaxonomyWithLineage {
  id: string;
  title: string;
  description?: string;
  db: Database; // permitted values: 'px', 'gbif', 'vd', 'vt'
  authorUrl?: string; // link to the original publication
  author?: string;
  type?: string;
  subtype?: string;
  doi?: string;
  language?: string;
  geoCoverage?: GeoJSON; // https://www.elastic.co/guide/en/elasticsearch/reference/current/geo-shape.html
  countryCoverage?: string[];
  temporalCoverage?: DateRange;
  pubDate?: string;
  modDate?: string;
  citation?: string;
}

export interface VecDynDataRecord extends DataRecord {
  collectionMethods: string[];
  db: 'vd';
}

export interface VecTraitsDataRecord extends DataRecord {
  trait: string;
  submittedBy: string;
  db: 'vt';
}

export interface ProteomeXchangeDataRecord extends DataRecord {
  repo: string; // // PRIDE, iProX, etc
  labHead?: string;
  instruments: string[];
  keywords: string[];
  db: 'px';
}

export interface GbifDataRecord extends DataRecord {
  license?: string;
  db: 'gbif';
}

export interface HubDataRecord extends DataRecord {
  db: 'hub';
}
