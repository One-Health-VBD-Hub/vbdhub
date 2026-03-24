import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { getTaxonomyNamesFromIDs } from '@/lib/gbif/taxonomy';

export function useGbifTaxonomyItems(gbifIDs: string[]) {
  return useQuery({
    queryKey: ['selectedTaxItems', gbifIDs],
    placeholderData: keepPreviousData,
    staleTime: Infinity,
    queryFn: ({ signal }) => getTaxonomyNamesFromIDs(gbifIDs, signal)
  });
}
