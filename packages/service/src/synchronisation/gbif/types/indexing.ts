import { MappingTypeMapping } from '@elastic/elasticsearch/lib/api/types';
import {
  EsAnyDatasetDoc,
  EsDatasetDoc,
  sharedMappingsProperties
} from '../../types/indexing';

export const mappings: MappingTypeMapping = {
  dynamic: 'strict', // throw an error if a document has a field not in the mapping
  properties: {
    // general fields
    ...sharedMappingsProperties,
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
