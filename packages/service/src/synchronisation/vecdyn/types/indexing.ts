import {
  EsAnyDatasetDoc,
  EsDatasetDoc,
  sharedMappingsProperties
} from '../../types/indexing';
import { MappingTypeMapping } from '@elastic/elasticsearch/lib/api/types';
import { GeoJSON } from 'geojson';

// name of the index in Elasticsearch containing VecDyn database documents (one document per dataset)
export const vecDynIndexName = 'vd';

export interface EsVdDatasetDoc extends EsDatasetDoc {
  db: 'vd';
  contactEmail: string;
  locationDescription: string;
  geoCoverage: GeoJSON;
}

export function isEsVdDatasetDoc(r: EsAnyDatasetDoc): r is EsVdDatasetDoc {
  return (r as EsVdDatasetDoc).db !== 'vd';
}

export const mappings: MappingTypeMapping = {
  dynamic: 'strict', // throw an error if a document has a field not in the mapping
  properties: {
    // general fields
    ...sharedMappingsProperties,
    // VecDyn specific fields
    collectionMethods: {
      type: 'text',
      fields: {
        raw: { type: 'keyword' }
      }
    },
    locationDescription: {
      type: 'text'
    }
  }
};

export interface EsVdDatapointDoc {
  DatasetID: number;
  location_description: string;
  title?: string;
  contributoremail: string;
  citation?: string;
  sample_lat_dd: number;
  sample_long_dd: number;
  description?: string;
  doi?: string;
  ocation_description?: string;
  submittedby: string;
  species?: string;
  genus?: string;
}
