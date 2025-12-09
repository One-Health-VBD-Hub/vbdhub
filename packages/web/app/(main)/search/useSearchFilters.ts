import {
  parseAsArrayOf,
  parseAsBoolean,
  parseAsInteger,
  parseAsIsoDate,
  parseAsJson,
  parseAsString,
  useQueryState
} from 'nuqs';
import { z } from 'zod';
import { Feature as GeoJSONFeature } from 'geojson';

const GeoJSONFeatureZod = z.custom<GeoJSONFeature>((val) => {
  // runtime check – keep it simple, Zod is mainly here as a guard
  return !!val && typeof val === 'object' && (val as any).type === 'Feature';
});

export const FeatureRecordSchema = z.record(z.string(), GeoJSONFeatureZod);

export function useResetSearchFilters() {
  const [, setPublishedFrom] = usePublishedFrom();
  const [, setPublishedTo] = usePublishedTo();
  const [, setSearchQuery] = useSearchQuery();
  const [, setCurrentPage] = useCurrentPage();
  const [, setExactOnly] = useExactOnly();
  const [, setCategory] = useCategory();
  const [, setDatabase] = useDatabase();
  const [, setTaxonomy] = useTaxonomy();
  const [, setWithoutPublished] = useWithoutPublished();
  const [, setGeometry] = useGeometry();

  return () => {
    setPublishedFrom(null);
    setPublishedTo(null);
    setSearchQuery(null);
    setCurrentPage(null);
    setExactOnly(null);
    setCategory(null);
    setDatabase(null);
    setTaxonomy(null);
    setWithoutPublished(null);
    setGeometry(null);
  };
}

const historyPushOption = { history: 'push' as const };

export function useGeometry() {
  return useQueryState(
    'geometry',
    parseAsJson(FeatureRecordSchema)
      .withDefault({})
      .withOptions(historyPushOption)
  );
}

export function usePublishedFrom() {
  return useQueryState(
    'publishedFrom',
    parseAsIsoDate.withOptions(historyPushOption)
  );
}

export function usePublishedTo() {
  return useQueryState(
    'publishedTo',
    parseAsIsoDate.withOptions(historyPushOption)
  );
}

export function useSearchQuery() {
  return useQueryState('query', historyPushOption);
}

export function useCurrentPage() {
  return useQueryState(
    'page',
    parseAsInteger.withDefault(1).withOptions(historyPushOption)
  );
}

export function useExactOnly() {
  return useQueryState(
    'exact',
    parseAsBoolean.withDefault(false).withOptions(historyPushOption)
  );
}

export function useCategory() {
  return useQueryState(
    'category',
    parseAsArrayOf(parseAsString).withDefault([]).withOptions(historyPushOption)
  );
}

export function useDatabase() {
  return useQueryState(
    'database',
    parseAsArrayOf(parseAsString).withDefault([]).withOptions(historyPushOption)
  );
}

export function useTaxonomy() {
  return useQueryState(
    'taxonomy',
    parseAsArrayOf(parseAsString).withDefault([]).withOptions(historyPushOption)
  );
}

export function useWithoutPublished() {
  return useQueryState(
    'withoutPublished',
    parseAsBoolean.withDefault(false).withOptions(historyPushOption)
  );
}
