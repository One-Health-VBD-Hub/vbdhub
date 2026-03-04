import rewind from '@turf/rewind';
import type { Geometry } from 'geojson';

const { wktToGeoJSON, geojsonToWKT } = require('@terraformer/wkt') as {
  wktToGeoJSON: (wkt: string) => Geometry;
  geojsonToWKT: (geometry: Geometry) => string;
};

const isPolygonalGeometry = (
  geometry: Geometry
): geometry is Geometry & { type: 'Polygon' | 'MultiPolygon' } =>
  geometry.type === 'Polygon' || geometry.type === 'MultiPolygon';

export const normalizeWktForGbif = (geometry: string): string => {
  const normalized = geometry.trim();
  try {
    const geojson = wktToGeoJSON(normalized);
    if (!isPolygonalGeometry(geojson)) return normalized;
    const rewound = rewind(geojson, { mutate: false }) as Geometry;
    return geojsonToWKT(rewound);
  } catch {
    return normalized;
  }
};
