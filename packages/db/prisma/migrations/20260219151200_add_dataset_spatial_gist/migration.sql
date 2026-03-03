CREATE INDEX IF NOT EXISTS dataset_spatial_gist
ON "Dataset"
USING GIST ("spatialGeom")
WHERE "spatialGeom" IS NOT NULL;
