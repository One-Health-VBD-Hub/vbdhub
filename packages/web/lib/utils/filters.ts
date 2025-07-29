import type { Filters } from '@/app/(main)/search/FilterPanel';
import { isDatabase, isDataCategory } from '@/types/indexed';
import { stringify, parse, GeoJSONPolygon } from 'wellknown';
import { Feature } from 'geojson';

export function getFiltersFromUrl(searchParams: URLSearchParams): Filters {
  const category = searchParams.get('category')?.split(',');
  const database = searchParams.get('database')?.split(',');
  const publishedFrom = searchParams.get('publishedFrom');
  const publishedTo = searchParams.get('publishedTo');
  const withoutPublished = searchParams.get('withoutPublished');
  const geometry = searchParams.get('geometry');
  const taxonomy = searchParams.get('taxonomy')?.split(',');
  const exactOnly = searchParams.get('exact') === 'true';

  if (category && !category.every(isDataCategory))
    throw new Error(`Invalid category value in URL: ${category}`);

  if (database && !database.every(isDatabase))
    throw new Error(`Invalid database value in URL: ${database}`);

  const geoJson = geometry
    ? wktMultiPolygonToGeoJson(geometry).reduce(
        (acc, feature) => {
          const randomId = Math.random().toString(36).substring(2, 15); // generate a random ID
          feature.id = randomId;
          acc[randomId] = feature;
          return acc;
        },
        {} as Record<string, Feature>
      )
    : {};

  return {
    category: category ?? [],
    database: database ?? [],
    taxonomy: taxonomy ?? [],
    publishedFrom: publishedFrom ? new Date(publishedFrom) : undefined,
    publishedTo: publishedTo ? new Date(publishedTo) : undefined,
    withoutPublished: withoutPublished === 'true',
    geometry: geoJson,
    exactOnly: exactOnly
  };
}

export function getFilterUrlQuery(
  filters: Filters,
  urlQuery = new URLSearchParams()
): URLSearchParams {
  const geoFeatures = Object.values(filters.geometry);

  if (filters.category.length)
    urlQuery.set('category', filters.category.join(','));
  if (filters.database.length)
    urlQuery.set('database', filters.database.join(','));
  if (filters.taxonomy.length)
    urlQuery.set('taxonomy', filters.taxonomy.join(','));
  if (filters.publishedFrom)
    urlQuery.set('publishedFrom', `${filters.publishedFrom.toISOString()}`);
  if (filters.publishedTo)
    urlQuery.set('publishedTo', `${filters.publishedTo.toISOString()}`);
  if (filters.publishedFrom || filters.publishedTo)
    urlQuery.set('withoutPublished', `${filters.withoutPublished ?? false}`);
  if (geoFeatures.length)
    urlQuery.set('geometry', geoJsonToWktMultiPolygon(geoFeatures));
  if (filters.exactOnly) urlQuery.set('exact', 'true');
  return urlQuery;
}

function geoJsonToWktMultiPolygon(geometry: Feature[]): string {
  const polygons = geometry.map((feature) => {
    if (feature.geometry.type !== 'Polygon') {
      throw new Error('Geometry must be a Polygon');
    }
    // TODO: look at more efficient
    return stringify(feature.geometry as GeoJSONPolygon).replace('POLYGON', '');
  });
  return `MULTIPOLYGON(${polygons.join(',')})`;
}

function wktMultiPolygonToGeoJson(wkt: string): Feature[] {
  const multiPolygon = parse(wkt);
  if (!multiPolygon || multiPolygon.type !== 'MultiPolygon') {
    throw new Error('WKT must be a MultiPolygon');
  }
  return multiPolygon.coordinates.map((coords) => ({
    type: 'Feature',
    geometry: {
      type: 'Polygon',
      coordinates: coords
    },
    properties: {}
  }));
}
