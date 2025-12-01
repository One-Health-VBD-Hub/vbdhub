import { EsDatasetDoc, sharedMappingsProperties } from '../../types/indexing';
import { MappingTypeMapping } from '@elastic/elasticsearch/lib/api/types';

export const mappings: MappingTypeMapping = {
  dynamic: 'strict', // throw an error if a document has a field not in the mapping
  properties: {
    ...sharedMappingsProperties
  }
};

// name of the index in Elasticsearch containing VBD Hub database documents (one document per dataset)
export const hubIndexName = 'hub';

export interface EsHubDatasetDoc extends EsDatasetDoc {
  license?: string;
  db: 'hub';
  type: 'epidemiological';
}
