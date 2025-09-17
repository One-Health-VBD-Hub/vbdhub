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
