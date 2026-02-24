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
import type {
  Polygon,
  MultiPolygon,
  Geometry,
  Position,
  MultiPoint
} from 'geojson';

// Check if it is a Polygon or MultiPolygon
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

/**
 * Build a GeoJSON MultiPoint from an array of {lat,lng} objects
 * - filters out invalid coordinates
 * - filters out duplicates (after rounding to given precision)
 * - optionally drops "Null Island" (0,0)
 * @param {{ lat: string | number; lng: string | number }[]} docs Array of objects with lat and lng properties
 * @param {object} [opts] Options.
 * @param {number} [opts.precision=6] Decimal places to round for de-duplication (0–15 is typical).
 * @param {boolean} [opts.dropNullIsland=true] If true, drop the (0, 0) point.
 * @returns {GeoJSON.MultiPoint} from the coordinates
 * @throws Error if no valid coordinates are found
 * @see https://geojson.org/
 */
export function buildUniqueMultiPoint(
  docs: { lat: string | number; lng: string | number }[],
  opts: { precision?: number; dropNullIsland?: boolean } = {}
): MultiPoint {
  const { precision = 6, dropNullIsland = true } = opts;
  const seen = new Set<string>();
  const coordinates: Position[] = [];

  for (const d of docs) {
    const lon = Number(d.lng);
    const lat = Number(d.lat);

    // validate
    if (!Number.isFinite(lon) || !Number.isFinite(lat)) continue;
    if (lon < -180 || lon > 180 || lat < -90 || lat > 90) continue;
    if (dropNullIsland && lon === 0 && lat === 0) continue;

    // normalize/round to collapse micro jitter (tune precision as needed)
    const lonR = +lon.toFixed(precision);
    const latR = +lat.toFixed(precision);

    const key = `${lonR},${latR}`;
    if (seen.has(key)) continue;
    seen.add(key);
    coordinates.push([lonR, latR]);
  }

  if (coordinates.length === 0) {
    throw new Error('No valid coordinates to build MultiPoint');
  }

  return { type: 'MultiPoint', coordinates };
}
