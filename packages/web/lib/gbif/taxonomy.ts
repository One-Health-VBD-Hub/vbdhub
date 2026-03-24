export interface TaxonomyItem {
  canonicalName?: string;
  scientificName: string;
  key: number;
  rank: string;
  kingdom: string;
  phylum?: string;
  order?: string;
  family?: string;
  genus?: string;
  species?: string;
}

export async function getTaxonomyNamesFromIDs(
  gbifIDs: string[],
  signal?: AbortSignal
) {
  const settled = await Promise.allSettled(
    gbifIDs.map((id) =>
      fetch(`https://api.gbif.org/v1/species/${id}`, { signal }).then((r) =>
        r.ok ? r.json() : Promise.reject(r.statusText)
      )
    )
  );

  return settled
    .filter(
      (r): r is PromiseFulfilledResult<TaxonomyItem> => r.status === 'fulfilled'
    )
    .map((r) => r.value);
}
