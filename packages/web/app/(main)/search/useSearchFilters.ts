import {
  parseAsArrayOf,
  parseAsBoolean,
  parseAsInteger,
  parseAsIsoDate,
  parseAsJson,
  parseAsStringLiteral,
  parseAsString,
  useQueryState
} from 'nuqs';
import { z } from 'zod';
import { Feature as GeoJSONFeature } from 'geojson';
import { SEARCH_CATEGORIES, SEARCH_SOURCE_DBS } from '@/types/search';

const GeoJSONFeatureZod = z.custom<GeoJSONFeature>((val) => {
  // runtime check – keep it simple, Zod is mainly here as a guard
  return (
    !!val &&
    typeof val === 'object' &&
    'type' in val &&
    val.type === 'Feature'
  );
});

export const FeatureRecordSchema = z.record(z.string(), GeoJSONFeatureZod);

export function useResetSearchFilters() {
  const [, setPublishedFrom] = usePublishedFrom();
  const [, setPublishedTo] = usePublishedTo();
  const [, setSearchQuery] = useSearchQuery();
  const [, setCurrentPage] = useCurrentPage();
  const [, setExactOnly] = useExactOnly();
  const [, setCategory] = useCategory();
  const [, setSourceDb] = useSourceDb();
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
    setSourceDb(null);
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
    parseAsArrayOf(parseAsStringLiteral(SEARCH_CATEGORIES))
      .withDefault([])
      .withOptions(historyPushOption)
  );
}

export function useSourceDb() {
  return useQueryState(
    'sourceDb',
    parseAsArrayOf(parseAsStringLiteral(SEARCH_SOURCE_DBS))
      .withDefault([])
      .withOptions(historyPushOption)
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
