import {
  EsAnyDatasetDoc,
  DataCategory,
  EsDatasetDoc,
  sharedMappingsProperties
} from '../../types/indexing';
import { MappingTypeMapping } from '@elastic/elasticsearch/lib/api/types';
import { GeoJSON } from 'geojson';

export const mappings: MappingTypeMapping = {
  dynamic: 'strict', // throw an error if a document has a field not in the mapping
  properties: {
    // general fields
    ...sharedMappingsProperties,
    // VecTraits specific fields
    trait: {
      type: 'text',
      fields: {
        raw: { type: 'keyword' }
      }
    },
    habitat: { type: 'text' },
    submittedBy: { type: 'text' },
    locationDate: { type: 'date' },
    longitude: { type: 'float' },
    latitude: { type: 'float' },
    locationDescription: { type: 'text' }
  }
};

// name of the index in Elasticsearch containing VecTraits database documents (one document per dataset)
export const vecTraitsIndexName = 'vt';

export interface EsVtDatasetDoc extends EsDatasetDoc {
  db: 'vt';
  locationDescription: string;
  locationDate?: Date;
  longitude?: number;
  latitude?: number;
  id: string;
  description?: string;
  contactEmail: string;
  dbUrl: string;
  authorUrl?: string;
  type: DataCategory;
  subtype?: string;
  doi?: string;
  language?: string;
  trait?: string;
  habitat?: string;
  geoCoverage?: GeoJSON;
  submittedBy: string;
}

export function isEsVtDatasetDoc(r: EsAnyDatasetDoc): r is EsVtDatasetDoc {
  return (r as EsVtDatasetDoc).db === 'vt';
}

export interface EsVtDatapointDoc {
  SubmittedBy: string;
  DatasetID: number;
  ContributorEmail: string;
  Citation: string;
  OriginalTraitName?: string;
  OriginalTraitDef?: string;
  OriginalTraitUnit: string;
  OriginalTraitValue: number;
  DOI?: string;
  Habitat?: string;
  LabField?: string;
  Location: string;
  geoCoverage?: GeoJSON;
  LocationDate?: Date;
  LocationType?: string;
  Longitude?: number;
  Latitude?: number;
  Contributoremail: string;
  Interactor1?: string;
  Interactor2?: string;
}
