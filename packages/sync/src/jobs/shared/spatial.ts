import { createPrismaClient } from '@vbdhub/db';

export interface Coordinate {
  lat: number;
  lon: number;
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
