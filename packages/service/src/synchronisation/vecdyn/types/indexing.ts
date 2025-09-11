import { EsAnyDatasetDoc, EsDatasetDoc } from '../../types/indexing';
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
    dbUrl: { type: 'keyword', index: false },
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

// name of the index in Elasticsearch containing VecDyn database documents (one document per datapoint)
export const vecDynDataIndexName = 'vddata';

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

export const dataMappings: MappingTypeMapping = {
  dynamic: 'strict', // throw an error if a document has a field not in the mapping
  properties: {
    DatasetID: {
      type: 'short'
    },
    citation: {
      type: 'text',
      index: false
    },
    notes: {
      type: 'text',
      index: false
    },
    collection_author_name: {
      type: 'text',
      index: false
    },
    contact_affiliation: {
      type: 'text',
      index: false
    },
    contact_name: {
      type: 'text',
      index: false
    },
    contributoremail: {
      type: 'keyword',
      index: false
    },
    description: {
      type: 'text',
      index: false
    },
    digitized_from_graph: {
      type: 'keyword'
    },
    doi: {
      type: 'keyword'
    },
    email: {
      type: 'keyword'
    },
    dataset_license: {
      type: 'keyword',
      index: false
    },
    location_description: {
      type: 'text',
      index: false
    },
    sample_end_date: {
      type: 'date',
      format: 'iso8601',
      index: false
    },
    sample_end_time: {
      type: 'date',
      format: 'HH:mm:ss',
      index: false
    },
    sample_environment: {
      type: 'keyword'
    },
    sample_lat_dd: {
      type: 'double'
    },
    sample_location: {
      type: 'text',
      index: false
    },
    sample_long_dd: {
      type: 'double'
    },
    sample_sex: {
      type: 'text',
      index: false
    },
    sample_stage: {
      type: 'keyword'
    },
    sample_start_date: {
      type: 'date',
      format: 'iso8601',
      index: false
    },
    sample_start_time: {
      type: 'date',
      format: 'HH:mm:ss',
      index: false
    },
    sample_unit: {
      type: 'keyword'
    },
    sample_value: {
      type: 'double'
    },
    sampling_method: {
      type: 'keyword'
    },
    species: {
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
    species_id_method: {
      type: 'keyword'
    },
    submittedby: {
      type: 'text',
      fields: {
        raw: {
          type: 'keyword'
        }
      }
    },
    title: {
      type: 'text'
    },
    time_shift_possible: {
      type: 'keyword'
    },
    date_uncertainty_due_to_graph: {
      type: 'keyword'
    },
    figuretable: {
      type: 'text',
      index: false
    },
    additional_location_info: {
      type: 'text',
      index: false
    },
    genus: {
      type: 'text',
      fields: {
        raw: {
          type: 'keyword'
        }
      }
    },
    subsampling_details: {
      type: 'text',
      index: false
    },
    additional_sample_info: {
      type: 'text',
      index: false
    },
    sample_name: {
      type: 'text',
      fields: {
        raw: {
          type: 'keyword'
        }
      }
    },
    sampling_strategy: {
      type: 'keyword'
    },
    geoCoverage: {
      type: 'geo_shape',
      index: false
    },
    gps_obfuscation_info: {
      type: 'text',
      index: false
    },
    curatedbycitation: {
      type: 'text',
      index: false
    },
    curatedbydoi: {
      type: 'keyword'
    }
  }
};
