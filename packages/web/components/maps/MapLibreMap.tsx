import { Fragment } from 'react';
import Map, { Layer, Source } from 'react-map-gl/mapbox';
import 'mapbox-gl/dist/mapbox-gl.css';
import type { FilterSpecification } from 'mapbox-gl';
import type { SearchSourceDb } from '@/types/search';

interface Props {
  gbifTaxa?: Array<{
    key: string;
    name: string;
  }>;
  dbs?: SearchSourceDb[];
}

const TAXON_COLORS = [
  '#16a34a',
  '#f59e0b',
  '#dc2626',
  '#7c3aed',
  '#0891b2',
  '#db2777',
  '#ea580c',
  '#65a30d',
  '#2563eb',
  '#0f766e'
];

const MARTIN_TILE_SERVER_URL = process.env.NEXT_PUBLIC_MARTIN_TILE_SERVER_URL;
if (!MARTIN_TILE_SERVER_URL) {
  throw new Error('Missing NEXT_PUBLIC_MARTIN_TILE_SERVER_URL');
}

export default function MapLibreMap({ gbifTaxa = [], dbs = [] }: Props) {
  const taxa = gbifTaxa.filter(
    (taxon, index, self) =>
      Boolean(taxon.key) &&
      index === self.findIndex((item) => item.key === taxon.key)
  );
  const hasTaxa = taxa.length > 0;
  const datasetDbs = dbs.filter((db) => db !== 'gbif');
  const showDataset = hasTaxa && (dbs.length === 0 || datasetDbs.length > 0);
  const showGbif = hasTaxa && (dbs.length === 0 || dbs.includes('gbif'));
  const datasetFilter: FilterSpecification | undefined =
    datasetDbs.length > 0
      ? ['in', ['get', 'sourceDb'], ['literal', datasetDbs]]
      : undefined;

  return (
    <div className='relative'>
      <Map
        reuseMaps
        attributionControl={false}
        mapboxAccessToken={process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN}
        style={{ height: 500 }}
        mapStyle='mapbox://styles/mapbox/light-v10'
        initialViewState={{
          latitude: -8.85,
          longitude: 26,
          zoom: 1.4,
          bearing: 0,
          pitch: 0
        }}
      >
        {taxa.map(({ key: taxonKey }, index) => {
          const color = TAXON_COLORS[index % TAXON_COLORS.length];
          const datasetTileUrl = `${MARTIN_TILE_SERVER_URL}/public.dataset_by_taxon/{z}/{x}/{y}?taxonKey=${taxonKey}`;
          const gbifTileUrl = `https://api.gbif.org/v2/map/occurrence/density/{z}/{x}/{y}.mvt?srs=EPSG:3857&taxonKey=${taxonKey}`;

          return (
            <Fragment key={taxonKey}>
              {showDataset && (
                <Source
                  id={`dataset-${taxonKey}`}
                  key={datasetTileUrl}
                  type='vector'
                  tiles={[datasetTileUrl]}
                >
                  <Layer
                    id={`dataset-${taxonKey}-points`}
                    type='circle'
                    source={`dataset-${taxonKey}`}
                    source-layer='dataset_by_taxon'
                    filter={datasetFilter}
                    paint={{
                      'circle-color': color,
                      'circle-radius': 4,
                      'circle-stroke-color': '#ffffff',
                      'circle-stroke-width': 1,
                      'circle-opacity': 0.8
                    }}
                  />
                </Source>
              )}
              {showGbif && (
                <Source
                  id={`gbif-occurrence-density-${taxonKey}`}
                  key={gbifTileUrl}
                  type='vector'
                  tiles={[gbifTileUrl]}
                >
                  <Layer
                    id={`gbif-occurrence-points-${taxonKey}`}
                    type='circle'
                    source={`gbif-occurrence-density-${taxonKey}`}
                    source-layer='occurrence'
                    paint={{
                      'circle-color': color,
                      'circle-radius': 4,
                      'circle-stroke-color': '#ffffff',
                      'circle-stroke-width': 1,
                      'circle-opacity': 0.8
                    }}
                  />
                </Source>
              )}
            </Fragment>
          );
        })}
      </Map>

      <div className='pointer-events-none absolute bottom-3 left-3 z-10 min-w-44 rounded-md border border-black/10 bg-white/95 px-3 py-2 text-xs shadow-sm backdrop-blur-sm'>
        <div className='mb-2 font-semibold text-black'>Legend</div>
        {!hasTaxa && (
          <div className='text-black/70'>
            Use the taxonomy filter to show data
          </div>
        )}
        {taxa.map(({ key: taxonKey, name }, index) => (
          <div key={taxonKey} className='flex items-center gap-2 text-black'>
            <span
              className='inline-block h-3 w-3 rounded-full border border-white'
              style={{
                backgroundColor: TAXON_COLORS[index % TAXON_COLORS.length]
              }}
            />
            <span>
              <span className='italic'>{name}</span> data
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
