import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ElasticsearchService } from '../../elasticsearch/elasticsearch.service';
import {
  mappings,
  EsVtDatapointDoc,
  EsVtDatasetDoc,
  vecTraitsIndexName
} from './types/indexing';
import {
  taxonomyPathTokenizerSettings,
  TaxonomyService
} from '../../taxonomy/taxonomy.service';
import { firstValueFrom } from 'rxjs';
import { Agent } from 'https';

@Injectable()
export class VectraitsSyncService {
  private readonly logger = new Logger(VectraitsSyncService.name);

  constructor(
    private readonly httpService: HttpService,
    private readonly elasticSearchService: ElasticsearchService,
    private readonly taxonomyService: TaxonomyService
  ) {}

  async syncDatasets() {
    // get all dataset IDs
    const res = await firstValueFrom(
      this.httpService.get<{
        ids: number[];
      }>(
        `https://vectorbyte.crc.nd.edu/portal/api/vectraits-explorer/?page=1&keywords=&sort_column=DatasetID&sort_dir=asc`,
        {
          httpsAgent: new Agent({ rejectUnauthorized: false })
        }
      )
    );

    const ids = res.data.ids;

    for (const id of ids) {
      const res = await firstValueFrom(
        this.httpService.get<{ results: EsVtDatapointDoc[] }>(
          `https://vectorbyte.crc.nd.edu/portal/api/vectraits-dataset/${id}/`,
          {
            httpsAgent: new Agent({ rejectUnauthorized: false })
          }
        )
      );

      // Sync dataset
      await this.syncDataset(id, res.data.results);
    }
  }

  async syncDataset(id: number, documents: EsVtDatapointDoc[]) {
    this.logger.log(`Syncing dataset ${id}`);

    const speciesList = [];
    for (const doc of documents) {
      if (doc.Interactor1 && doc.Interactor1 !== 'None None')
        speciesList.push(doc.Interactor1);
      if (doc.Interactor2 && doc.Interactor2 !== 'None None')
        speciesList.push(doc.Interactor2);
    }

    const taxonomy =
      await this.taxonomyService.getTaxonomyFromNamesList(speciesList);

    const esVtDatasetDoc: EsVtDatasetDoc = {
      id: id.toString(),
      db: 'vt',
      dbUrl: `https://vectorbyte.crc.nd.edu/vectraits-dataset/${id}`,
      type: 'trait',
      locationDescription: documents[0].Location,
      contactEmail: documents[0].ContributorEmail,
      title: documents[0].Citation,
      submittedBy: documents[0].SubmittedBy,
      ...taxonomy
    };

    esVtDatasetDoc.doi = documents[0].DOI;
    esVtDatasetDoc.trait = documents[0].OriginalTraitName;
    esVtDatasetDoc.habitat = documents[0].Habitat;
    esVtDatasetDoc.longitude = documents[0].Longitude;
    esVtDatasetDoc.latitude = documents[0].Latitude;
    esVtDatasetDoc.locationDate = documents[0].LocationDate;
    // make a GeoJSON POINT if we have both lat and lon
    esVtDatasetDoc.geoCoverage =
      documents[0].Longitude && documents[0].Latitude
        ? {
            type: 'Point',
            coordinates: [documents[0].Longitude, documents[0].Latitude]
          }
        : undefined;

    await this.elasticSearchService.getClient().index({
      index: vecTraitsIndexName,
      id: id.toString(),
      document: esVtDatasetDoc
    });
  }

  async createElasticSearchIndex() {
    await this.elasticSearchService.createIndex(
      vecTraitsIndexName,
      mappings,
      taxonomyPathTokenizerSettings
    );
  }
}
