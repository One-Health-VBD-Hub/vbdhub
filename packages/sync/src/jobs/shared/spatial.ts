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
        AND "spatialGeom" IS NOT NULL
    `;
    return;
  }

  const geoJson = JSON.stringify({
    type: 'MultiPoint',
    // GeoJSON uses [longitude, latitude], while the rest of this package keeps
    // coordinates as { lat, lon } for readability.
    coordinates: coordinates.map((point) => [point.lon, point.lat])
  });

  // Prisma cannot model PostGIS geometry columns directly. Create a candidate
  // geometry and update only when it differs, avoiding needless GiST index writes.
  await prisma.$executeRaw`
    WITH input AS (
      SELECT ST_SetSRID(ST_GeomFromGeoJSON(${geoJson}), 4326) AS geom
    )
    UPDATE "Dataset"
    SET "spatialGeom" = input.geom
    FROM input
    WHERE "Dataset"."id" = ${datasetId}
      AND "Dataset"."spatialGeom" IS DISTINCT FROM input.geom
  `;
}
