import { createPrismaClient } from '@vbdhub/db';

export interface Coordinate {
  lat: number;
  lon: number;
}

export interface BoundingBox {
  minLat: number;
  minLon: number;
  maxLat: number;
  maxLon: number;
}

export function getBoundingBox(coords: Coordinate[]): BoundingBox | null {
  const first = coords[0];
  if (!first) return null;

  let minLat = first.lat;
  let maxLat = first.lat;
  let minLon = first.lon;
  let maxLon = first.lon;

  for (let i = 1; i < coords.length; i += 1) {
    const coordinate = coords[i];
    if (!coordinate) continue;
    const { lat, lon } = coordinate;
    if (lat < minLat) minLat = lat;
    if (lat > maxLat) maxLat = lat;
    if (lon < minLon) minLon = lon;
    if (lon > maxLon) maxLon = lon;
  }

  return { minLat, minLon, maxLat, maxLon };
}

export async function upsertSpatialGeometry(
  prisma: ReturnType<typeof createPrismaClient>,
  datasetId: string,
  coordinates: Coordinate[]
): Promise<void> {
  if (coordinates.length === 0) {
    await prisma.$executeRaw`
      UPDATE "Dataset"
      SET "spatialGeom" = NULL
      WHERE "id" = ${datasetId}
    `;
    return;
  }

  const geoJson = JSON.stringify({
    type: 'MultiPoint',
    // GeoJSON uses [longitude, latitude], while the rest of this package keeps
    // coordinates as { lat, lon } for readability.
    coordinates: coordinates.map((point) => [point.lon, point.lat])
  });

  // Prisma does not model PostGIS geometry columns directly, so write the
  // spatial footprint with raw SQL while keeping values parameterized.
  await prisma.$executeRaw`
    UPDATE "Dataset"
    SET "spatialGeom" = ST_SetSRID(ST_GeomFromGeoJSON(${geoJson}), 4326)
    WHERE "id" = ${datasetId}
  `;
}
