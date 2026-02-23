import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { SearchRequestBody, SearchResults } from '@/types/search';
import { Filters } from '@/app/(main)/search/FilterPanel';
import { stringify, GeoJSONPolygon } from 'wellknown';
import { Feature } from 'geojson';

interface UseSearchResultsProps {
  query: string | null;
  page: number;
  filters: Filters;
  limit?: number;
}

function toIsoDateOnly(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function geoJsonToWktMultiPolygon(geometry: Feature[]): string {
  const polygons = geometry.map((feature) => {
    if (feature.geometry.type !== 'Polygon') {
      throw new Error('Geometry must be a Polygon');
    }
    return stringify(feature.geometry as GeoJSONPolygon).replace('POLYGON', '');
  });
  return `MULTIPOLYGON(${polygons.join(',')})`;
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
      const body: SearchRequestBody = {
        page,
        limit
      };

      const trimmedQuery = query?.trim();
      if (trimmedQuery) {
        body.query = trimmedQuery;
        body.queryMode = filters.exactOnly ? 'exact' : 'fulltext';
      }

      if (filters.category.length > 0) {
        body.category = filters.category;
      }

      if (filters.sourceDb.length > 0) {
        body.sourceDb = filters.sourceDb;
      }

      if (filters.publishedFrom) {
        body.publishedFrom = toIsoDateOnly(filters.publishedFrom);
      }
      if (filters.publishedTo) {
        body.publishedTo = toIsoDateOnly(filters.publishedTo);
      }
      if (filters.publishedFrom || filters.publishedTo) {
        body.includeWithoutPublished = filters.withoutPublished ?? false;
      }

      const geometryFeatures = Object.values(filters.geometry);
      if (geometryFeatures.length > 0) {
        body.geometry = geoJsonToWktMultiPolygon(geometryFeatures);
      }

      const taxonomyGbifIds = Array.from(
        new Set(
          filters.taxonomy
            .map((value) => Number.parseInt(value, 10))
            .filter((value) => Number.isInteger(value) && value > 0)
        )
      );
      if (taxonomyGbifIds.length > 0) {
        body.taxonomyGbifIds = taxonomyGbifIds;
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/search`,
        {
          method: 'POST',
          headers: {
            'content-type': 'application/json'
          },
          body: JSON.stringify(body)
        }
      );
      if (!response.ok) throw new Error('Network response was not ok');

      const end = performance.now();
      return { ...(await response.json()), duration: end - start };
    }
  });
};
