export const SEARCH_SOURCE_DBS = [
  'gbif',
  'proteomexchange',
  'vecdyn',
  'vectraits',
  'hub'
] as const;
export type SearchSourceDb = (typeof SEARCH_SOURCE_DBS)[number];

export const SEARCH_CATEGORIES = [
  'occurrence',
  'abundance',
  'traits',
  'proteomics',
  'epidemiology'
] as const;
export type SearchCategory = (typeof SEARCH_CATEGORIES)[number];

export interface SearchResults {
  items: SearchDatasetItem[];
  meta: SearchResultsMeta;
  duration?: number;
}

export interface SearchDatasetItem {
  id: string;
  sourceKey: string;
  sourceDb: SearchSourceDb;
  category: SearchCategory;
  title: string;
  description?: string;
  doi?: string;
  publisher?: string;
  publishedAt?: string;
}

export interface SearchResultsMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface SearchRequestBody {
  query?: string;
  queryMode?: 'fulltext' | 'contains' | 'exact';
  page?: number;
  limit?: number;
  category?: SearchCategory[];
  sourceDb?: SearchSourceDb[];
  publishedFrom?: string;
  publishedTo?: string;
  includeWithoutPublished?: boolean;
  geometry?: string;
  taxonomyGbifIds?: number[];
}
