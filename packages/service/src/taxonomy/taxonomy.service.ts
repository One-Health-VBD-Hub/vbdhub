import { Injectable, Logger } from '@nestjs/common';
import { TaxonomyWithLineage } from '../synchronisation/types/indexing';
import { HttpService } from '@nestjs/axios';
import { GbifRawDataset } from '../synchronisation/gbif/types/gbif-api/gbif';
import { firstValueFrom } from 'rxjs';
import pLimit from 'p-limit';

// TODO add no rank?
// TODO add subspecies and other ranks supported by GBIF backbone
const RANKS = [
  'kingdom',
  'phylum',
  'class',
  'order',
  'family',
  'genus',
  'species'
] as const;
export type Rank = (typeof RANKS)[number];

const concurrencyLimit = pLimit(100); // limit to 100 concurrent requests

type MatchType = 'Exact' | 'Fuzzy' | 'PartialExact';

// for the taxonomy paths, from https://chatgpt.com/c/680f5f9c-0d88-8003-8c33-5336d2f76c8e
export const taxonomyPathTokenizerSettings = {
  analysis: {
    analyzer: {
      taxonomy_analyzer: {
        tokenizer: 'taxonomy_path_tokenizer',
        filter: ['lowercase']
      }
    },
    tokenizer: {
      taxonomy_path_tokenizer: {
        type: 'path_hierarchy',
        delimiter: '|'
      }
    }
  }
};

@Injectable()
export class TaxonomyService {
  private readonly logger = new Logger(TaxonomyService.name);

  constructor(private readonly httpService: HttpService) {}

  async fetchTaxonomicPathForGbifId(id: string) {
    const res = await firstValueFrom(
      this.httpService.get<{
        key: number;
        nubKey: number;
        nameKey: number;
        sourceTaxonKey: number;
        kingdom: string;
        phylum?: string;
        order?: string;
        family?: string;
        genus?: string;
        species?: string;
        kingdomKey: number;
        phylumKey?: number;
        classKey?: number;
        orderKey?: number;
        familyKey?: number;
        genusKey?: number;
        speciesKey?: number;
        parentKey?: number;
        parent?: string;
        scientificName: string;
        canonicalName: string;
        nameType: string;
        rank: string;
        origin: string;
        taxonomicStatus: string;
        issues: [];
        class: string;
      }>(`https://api.gbif.org/v1/species/${id}`)
    );

    return buildTaxonomyPath({
      kingdom: res.data.kingdomKey.toString(10),
      phylum: res.data.phylumKey?.toString(10),
      class: res.data.classKey?.toString(10),
      order: res.data.orderKey?.toString(10),
      family: res.data.familyKey?.toString(10),
      genus: res.data.genusKey?.toString(10),
      species: res.data.speciesKey?.toString(10)
    });
  }

  async getTaxonomyFromNamesList(
    species: string[]
  ): Promise<TaxonomyWithLineage> {
    // use the getTaxonomyFromSpecies function
    const taxonomies = await Promise.all(
      species.map((s) => concurrencyLimit(() => this.getTaxonomyFromName(s)))
    );

    // merge the taxonomies to one
    const mergedTaxonomy: TaxonomyWithLineage = {
      taxonomy_paths: [],
      kingdom: [],
      phylum: [],
      class: [],
      order: [],
      family: [],
      genus: [],
      species: [],
      unknown: []
    };

    for (const taxonomy of taxonomies) {
      mergedTaxonomy.taxonomy_paths?.push(...(taxonomy.taxonomy_paths ?? []));
      mergedTaxonomy.kingdom.push(...taxonomy.kingdom);
      mergedTaxonomy.phylum.push(...taxonomy.phylum);
      mergedTaxonomy.class.push(...taxonomy.class);
      mergedTaxonomy.order.push(...taxonomy.order);
      mergedTaxonomy.family.push(...taxonomy.family);
      mergedTaxonomy.genus.push(...taxonomy.genus);
      mergedTaxonomy.species.push(...taxonomy.species);
      mergedTaxonomy.unknown.push(...taxonomy.unknown);
    }

    // remove duplicates
    mergedTaxonomy.taxonomy_paths = [...new Set(mergedTaxonomy.taxonomy_paths)];
    mergedTaxonomy.kingdom = [...new Set(mergedTaxonomy.kingdom)];
    mergedTaxonomy.phylum = [...new Set(mergedTaxonomy.phylum)];
    mergedTaxonomy.class = [...new Set(mergedTaxonomy.class)];
    mergedTaxonomy.order = [...new Set(mergedTaxonomy.order)];
    mergedTaxonomy.family = [...new Set(mergedTaxonomy.family)];
    mergedTaxonomy.genus = [...new Set(mergedTaxonomy.genus)];
    mergedTaxonomy.species = [...new Set(mergedTaxonomy.species)];
    mergedTaxonomy.unknown = [...new Set(mergedTaxonomy.unknown)];

    return mergedTaxonomy;
  }

  // TODO look at synonyms and non-standard names handling
  async getTaxonomyFromName(name: string): Promise<TaxonomyWithLineage> {
    const res = await firstValueFrom(
      this.httpService.post<{
        names: [
          {
            id: string;
            name: string;
            matchType: MatchType;
            results?: [
              {
                dataSourceId: number;
                dataSourceTitleShort: string;
                matchedName: string;
                recordId: string;
                classificationPath: string;
                classificationRanks: string;
                classificationIds: string;
              }
            ];
          }
        ];
      }>('https://verifier.globalnames.org/api/v1/verifications', {
        nameStrings: [name],
        withAllMatches: true,
        preferredSources: [4, 11]
      })
    );

    // if no names found
    if (res.data.names[0].results === undefined) {
      this.logger.warn(`No results for ${name}`);
      return {
        taxonomy_paths: [name],
        kingdom: [],
        phylum: [],
        class: [],
        order: [],
        family: [],
        genus: [],
        species: [],
        unknown: [name]
      };
    }

    const gbifTaxonomy = res.data.names[0].results.find(
      (r) => r.dataSourceId === 11
    );

    if (gbifTaxonomy?.classificationPath) {
      const taxonomy = parseTaxonomyPath(
        gbifTaxonomy.classificationPath,
        gbifTaxonomy.classificationRanks
      );

      taxonomy.taxonomy_paths = [gbifTaxonomy.classificationIds];

      return {
        ...taxonomy,
        unknown: taxonomy.unknown.concat(
          res.data.names[0].matchType !== 'Exact' &&
            res.data.names[0].matchType !== 'Fuzzy'
            ? [name]
            : []
        ) // add also the original name if not EXACT or FUZZY (with typos) match
      };
    } else {
      return {
        taxonomy_paths: [name],
        kingdom: [],
        phylum: [],
        class: [],
        order: [],
        family: [],
        genus: [],
        species: [],
        unknown: [name]
      };
    }
  }

  // only from metadata document, not exhaustive and not authoritative (may contain mistakes)
  getTaxonomyFromGbifRawDataset(
    doc: GbifRawDataset
  ): TaxonomyWithLineage | undefined {
    if (!doc.taxonomicCoverages) return;
    const res: TaxonomyWithLineage = {
      kingdom: [],
      phylum: [],
      class: [],
      order: [],
      family: [],
      genus: [],
      species: [],
      unknown: []
    };

    for (const taxonomicCoverages of doc.taxonomicCoverages) {
      for (const coverage of taxonomicCoverages.coverages) {
        if (!coverage.scientificName) continue;
        const nameClean = coverage.scientificName.replace(/"/g, '');

        if (coverage.rank && RANKS.includes(coverage.rank.verbatim as Rank)) {
          res[coverage.rank.verbatim as Rank].push(nameClean);
        } else {
          res.species.push(nameClean);
        }
      }
    }

    return res;
  }
}

export function parseTaxonomyPath(
  path: string,
  ranks: string
): TaxonomyWithLineage {
  // 1) break into arrays
  const rankList = ranks.split('|').map((r) => r.trim());
  const nameList = path.split('|').map((n) => n.trim());

  // 2) initialise result with all empty arrays
  const taxonomy: TaxonomyWithLineage = {
    kingdom: [],
    phylum: [],
    class: [],
    order: [],
    family: [],
    genus: [],
    species: [], // may stay empty if not provided
    unknown: []
  };

  // 3) zip them and assign
  rankList.forEach((rank, idx) => {
    const name = nameList[idx];
    if (!name) return; // skip if there's no corresponding value

    // only assign if it's one of our known keys and it's a valid rank
    if (RANKS.includes(rank as Rank)) {
      taxonomy[rank as Rank].push(name);
    } else {
      // if rank is not known, assign to unknown
      taxonomy.unknown.push(name);
    }
  });

  return taxonomy;
}

export function buildTaxonomyPath(
  ranks: { [key in Rank]: string | undefined },
  delimiter = '|'
): string {
  // fixed, desired rank order
  const order = [
    'kingdom',
    'phylum',
    'class',
    'order',
    'family',
    'genus',
    'species'
  ] as const;

  return order
    .map((level) => {
      const v = ranks[level];
      // trim and drop truly empty strings
      return v != null ? v.trim() : '';
    })
    .filter((v) => v.length > 0) // keep only non‐empty
    .join(delimiter);
}
