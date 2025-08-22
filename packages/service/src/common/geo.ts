import rewind from '@turf/rewind';
import buffer from '@turf/buffer';
import { BadRequestException } from '@nestjs/common';
import {
  GeoJSONGeometryOrNull,
  GeoJSONMultiPolygon,
  GeoJSONPolygon,
  parse,
  stringify
} from 'wellknown';
import kinks from '@turf/kinks';
import simplify from '@turf/simplify';
import type { Polygon, MultiPolygon, Geometry } from 'geojson';

// Check if it is is a Polygon or MultiPolygon
function isPoly(
  g: GeoJSONGeometryOrNull | Geometry
): g is GeoJSONPolygon | GeoJSONMultiPolygon {
  return (
    g != null &&
    (g.type === 'Polygon' || g.type === 'MultiPolygon') &&
    Array.isArray(g.coordinates)
  );
}

// Normalize WKT geometry to a valid MultiPolygon
// this is necessary for GBIF but also a good practice
export function normalizeWkt(value: string): string {
  // 1. Parse WKT → a Turf Feature
  const parsed: GeoJSONGeometryOrNull = parse(value);
  if (!isPoly(parsed)) throw new BadRequestException('Invalid WKT geometry');

  // 2. Fix ring orientation
  let geoJson = rewind(parsed, { reverse: false }) as Polygon | MultiPolygon;
  if (!isPoly(geoJson)) throw new BadRequestException('Invalid WKT geometry');

  // 3. Auto‑repair self‑intersections
  const kinkFc = kinks(geoJson);
  if (kinkFc.features.length > 0) {
    const res = buffer(geoJson, 0, { units: 'degrees' });
    if (res) geoJson = res.geometry;
  }

  // 4. Simplify tiny slivers
  geoJson = simplify(geoJson, {
    tolerance: 1e-6,
    highQuality: false,
    mutate: true
  });

  // 5. Back to WKT
  return stringify(geoJson as GeoJSONPolygon | GeoJSONMultiPolygon);
}
