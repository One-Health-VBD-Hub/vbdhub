CREATE OR REPLACE FUNCTION public.dataset_by_taxon(
  z integer,
  x integer,
  y integer,
  query_params json DEFAULT '{}'::json
)
RETURNS bytea
LANGUAGE plpgsql
STABLE
PARALLEL SAFE
AS $$
DECLARE
  mvt bytea;
  taxon_ids integer[];
BEGIN
  IF coalesce(query_params->>'taxonKey', '') <> '' THEN
    taxon_ids := string_to_array(
      regexp_replace(query_params->>'taxonKey', '\s+', '', 'g'),
      ','
    )::integer[];
  END IF;

  SELECT INTO mvt
    ST_AsMVT(tile, 'dataset_by_taxon', 4096, 'geom')
  FROM (
    SELECT
      ST_AsMVTGeom(
        ST_Transform(ST_CurveToLine(d."spatialGeom"), 3857),
        ST_TileEnvelope(z, x, y),
        4096,
        64,
        true
      ) AS geom,
      d.id::text AS id,
      d."sourceDb"::text AS "sourceDb",
      d."sourceKey"::text AS "sourceKey",
      d.title::text AS title
    FROM "Dataset" d
    WHERE d."spatialGeom" IS NOT NULL
      AND d."spatialGeom" && ST_Transform(ST_TileEnvelope(z, x, y), 4326)
      AND (
        taxon_ids IS NULL
        OR EXISTS (
          SELECT 1
          FROM "DatasetTaxon" dt
          WHERE dt."datasetId" = d.id
            AND dt."gbifTaxonId" = ANY (taxon_ids)
        )
      )
  ) AS tile
  WHERE geom IS NOT NULL;

  RETURN mvt;
END;
$$;

COMMENT ON FUNCTION public.dataset_by_taxon(integer, integer, integer, json) IS
'{"description":"Dataset tiles filtered by GBIF taxon IDs","vector_layers":[{"id":"dataset_by_taxon","fields":{"id":"String","sourceDb":"String","sourceKey":"String","title":"String"}}]}';
