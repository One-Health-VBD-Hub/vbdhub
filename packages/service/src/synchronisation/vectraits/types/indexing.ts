import {
  EsAnyDatasetDoc,
  DataCategory,
  EsDatasetDoc
} from '../../types/indexing';
import { MappingTypeMapping } from '@elastic/elasticsearch/lib/api/types';
import { GeoJSON } from 'geojson';

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

// name of the index in Elasticsearch containing VecTraits database documents (one document per datapoint)
export const vecTraitsDataIndexName = 'vtdata';

export const dataMappings: MappingTypeMapping = {
  dynamic: 'strict', // throw an error if a document has a field not in the mapping
  properties: {
    AmbientTemp: {
      type: 'float',
      index: false
    },
    AmbientTempMethod: {
      type: 'text',
      fields: {
        raw: {
          type: 'keyword'
        }
      }
    },
    AmbientTempUnit: {
      type: 'keyword',
      index: false
    },
    Citation: {
      type: 'text',
      index: false
    },
    ContributorEmail: {
      type: 'keyword'
    },
    CoordinateType: {
      type: 'text',
      fields: {
        raw: {
          type: 'keyword'
        }
      }
    },
    DOI: {
      type: 'keyword'
    },
    DatasetID: {
      type: 'short'
    },
    DefaultChartCategory: {
      type: 'keyword'
    },
    DefaultChartXaxis: {
      type: 'keyword'
    },
    FigureTable: {
      type: 'text',
      index: false
    },
    Habitat: {
      type: 'text',
      fields: {
        raw: {
          type: 'keyword'
        }
      }
    },
    Id: {
      type: 'long'
    },
    IndividualID: {
      type: 'text',
      fields: {
        raw: {
          type: 'keyword'
        }
      }
    },
    Interactor1: {
      type: 'text',
      fields: {
        raw: {
          type: 'keyword'
        }
      }
    },
    Interactor1AccTemp: {
      type: 'float'
    },
    Interactor1AccTime: {
      type: 'float'
    },
    Interactor1AccTimeUnit: {
      type: 'keyword'
    },
    Interactor1Class: {
      type: 'text',
      fields: {
        raw: {
          type: 'keyword'
        }
      }
    },
    Interactor1Common: {
      type: 'text',
      fields: {
        raw: {
          type: 'keyword'
        }
      }
    },
    Interactor1Family: {
      type: 'text',
      fields: {
        raw: {
          type: 'keyword'
        }
      }
    },
    Interactor1Genus: {
      type: 'text',
      fields: {
        raw: {
          type: 'keyword'
        }
      }
    },
    Interactor1GrowthDur: {
      type: 'double'
    },
    Interactor1GrowthTemp: {
      type: 'double'
    },
    Interactor1GrowthTempUnit: {
      type: 'keyword'
    },
    Interactor1GrowthType: {
      type: 'text',
      fields: {
        raw: {
          type: 'keyword'
        }
      }
    },
    Interactor1GrowthdDurUnit: {
      type: 'keyword'
    },
    Interactor1Kingdom: {
      type: 'text',
      fields: {
        raw: {
          type: 'keyword'
        }
      }
    },
    Interactor1Number: {
      type: 'double'
    },
    Interactor1Order: {
      type: 'text',
      fields: {
        raw: {
          type: 'keyword'
        }
      }
    },
    Interactor1Phylum: {
      type: 'text',
      fields: {
        raw: {
          type: 'keyword'
        }
      }
    },
    Interactor1Sex: {
      type: 'text',
      fields: {
        raw: {
          type: 'keyword'
        }
      }
    },
    Interactor1Size: {
      type: 'double'
    },
    Interactor1SizeSI: {
      type: 'float'
    },
    Interactor1SizeType: {
      type: 'text',
      fields: {
        raw: {
          type: 'keyword'
        }
      }
    },
    Interactor1SizeUnit: {
      type: 'keyword'
    },
    Interactor1SizeUnitSI: {
      type: 'keyword'
    },
    Interactor1Species: {
      type: 'text',
      fields: {
        raw: {
          type: 'keyword'
        }
      }
    },
    Interactor1Stage: {
      type: 'keyword'
    },
    Interactor1Temp: {
      type: 'double'
    },
    Interactor1TempMethod: {
      type: 'text',
      fields: {
        raw: {
          type: 'keyword'
        }
      }
    },
    Interactor1TempUnit: {
      type: 'keyword'
    },
    Interactor1Wholepart: {
      type: 'keyword'
    },
    Interactor2Class: {
      type: 'text',
      fields: {
        raw: {
          type: 'keyword'
        }
      }
    },
    Interactor2Common: {
      type: 'text',
      fields: {
        raw: {
          type: 'keyword'
        }
      }
    },
    Interactor2Family: {
      type: 'text',
      fields: {
        raw: {
          type: 'keyword'
        }
      }
    },
    Interactor2Genus: {
      type: 'text',
      fields: {
        raw: {
          type: 'keyword'
        }
      }
    },
    Interactor2GrowthTemp: {
      type: 'double'
    },
    Interactor2GrowthTempUnit: {
      type: 'keyword'
    },
    Interactor2Kingdom: {
      type: 'text',
      fields: {
        raw: {
          type: 'keyword'
        }
      }
    },
    Interactor2Order: {
      type: 'text',
      fields: {
        raw: {
          type: 'keyword'
        }
      }
    },
    Interactor2Phylum: {
      type: 'text',
      fields: {
        raw: {
          type: 'keyword'
        }
      }
    },
    Interactor2Species: {
      type: 'text',
      fields: {
        raw: {
          type: 'keyword'
        }
      }
    },
    Interactor2Stage: {
      type: 'text',
      fields: {
        raw: {
          type: 'keyword'
        }
      }
    },
    LabField: {
      type: 'text',
      fields: {
        raw: {
          type: 'keyword'
        }
      }
    },
    Latitude: {
      type: 'double'
    },
    Location: {
      type: 'text'
    },
    LocationDate: {
      type: 'date',
      format: 'iso8601'
    },
    LocationDatePrecision: {
      type: 'short'
    },
    LocationType: {
      type: 'text'
    },
    Longitude: {
      type: 'double'
    },
    Notes: {
      type: 'text'
    },
    OriginalErrorNeg: {
      type: 'double'
    },
    OriginalErrorPos: {
      type: 'double'
    },
    OriginalErrorUnit: {
      type: 'keyword'
    },
    OriginalID: {
      type: 'keyword'
    },
    OriginalTraitDef: {
      type: 'text'
    },
    OriginalTraitName: {
      type: 'text'
    },
    OriginalTraitUnit: {
      type: 'keyword'
    },
    OriginalTraitValue: {
      type: 'double'
    },
    Replicates: {
      type: 'integer'
    },
    SecondStressor: {
      type: 'text',
      fields: {
        raw: {
          type: 'keyword'
        }
      }
    },
    SecondStressorDef: {
      type: 'text'
    },
    SecondStressorUnit: {
      type: 'keyword'
    },
    SecondStressorValue: {
      type: 'double'
    },
    SubmittedBy: {
      type: 'text',
      fields: {
        raw: {
          type: 'keyword'
        }
      }
    },
    TotalObsTimeUnit: {
      type: 'keyword'
    },
    TotalObsTimeValue: {
      type: 'double'
    },
    geoCoverage: {
      type: 'geo_shape',
      index: false
    },
    location: {
      type: 'text',
      index: false
    },
    CuratedByCitation: {
      type: 'text',
      index: false
    },
    CuratedByDOI: {
      type: 'keyword'
    },
    // TODO look at field
    TimeStart: {
      type: 'date'
    },
    // TODO look at field
    TimeEnd: {
      type: 'date'
    },
    Interactor1DenValue: {
      type: 'keyword'
    },
    Interactor1DenUnit: {
      type: 'keyword'
    },
    StandardisedTraitValue: {
      type: 'double',
      index: false
    },
    StandardisedTraitUnit: {
      type: 'keyword',
      index: false
    },
    Interactor1OrigTimeUnit: {
      type: 'keyword',
      index: false
    },
    EmbargoReleaseDate: {
      type: 'date',
      index: false
    },
    Interactor1OrigTime: {
      type: 'float',
      index: false
    },
    StandardisedTraitName: {
      type: 'keyword',
      index: false
    },
    StandardisedTraitDef: {
      type: 'keyword',
      index: false
    }
  }
};
