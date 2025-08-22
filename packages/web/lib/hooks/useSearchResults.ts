import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { SearchResults } from '@/types/search';
import { Filters } from '@/app/(main)/search/FilterPanel';
import { getFilterUrlQuery } from '@/lib/utils/filters';

interface UseSearchResultsProps {
  query?: string;
  page: number;
  filters: Filters;
  limit?: number;
}

export const useSearchResults = ({
  query,
  page,
  filters,
  limit = 20
}: UseSearchResultsProps) => {
  return useQuery({
    queryKey: [query, page, filters, limit],
    staleTime: Infinity, // enable request caching
    placeholderData: keepPreviousData,
    queryFn: async (): Promise<SearchResults> => {
      const start = performance.now();
      const fQ = getFilterUrlQuery(filters).toString()
        ? `&${getFilterUrlQuery(filters).toString()}`
        : '';

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}search?${query ? `&query=${query}` : ''}&page=${page}${fQ}&limit=${limit}`
      );
      if (!response.ok) throw new Error('Network response was not ok');

      const end = performance.now();
      return { ...(await response.json()), duration: end - start };
    }
  });
};
