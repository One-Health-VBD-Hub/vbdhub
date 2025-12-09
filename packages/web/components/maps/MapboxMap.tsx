'use client';

import Map, {
  FullscreenControl,
  GeolocateControl,
  NavigationControl,
  ScaleControl
} from 'react-map-gl/mapbox';
import 'mapbox-gl/dist/mapbox-gl.css';
import DrawControl from '@/components/maps/DrawControl';
import { useMemo } from 'react';
import { Feature as GeoJSONFeature } from 'geojson';
import { useGeometry } from '@/app/(main)/search/useSearchFilters';

interface Props {
  scaleControl?: boolean;
  geoLocateControl?: boolean;
  fullscreenControl?: boolean;
  navigationControl?: boolean;
  className?: string;
}

export default function MapboxMap({
  scaleControl = false,
  geoLocateControl = false,
  fullscreenControl = false,
  navigationControl = false,
  className
}: Props) {
  const [features, setFeatures] = useGeometry();

  const onUpdate = (e: { features: GeoJSONFeature[] }) => {
    setFeatures((prevFeatures) => {
      const newFeatures = { ...prevFeatures };

      for (const f of e.features) {
        if (f.id) newFeatures[f.id] = f;
      }

      return newFeatures;
    });
  };

  const onDelete = (e: { features: GeoJSONFeature[] }) => {
    setFeatures((prevFeatures) => {
      const newFeatures = { ...prevFeatures };

      for (const f of e.features) {
        if (f.id) delete newFeatures[f.id];
      }

      return newFeatures;
    });
  };

  return (
    <div className={className}>
      <Map
        reuseMaps
        attributionControl={false}
        initialViewState={{
          latitude: 54.5,
          longitude: 1.17,
          zoom: 3.5,
          bearing: 0,
          pitch: 0
        }}
        mapStyle='mapbox://styles/mapbox/light-v9'
        mapboxAccessToken={process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN}
      >
        {geoLocateControl && <GeolocateControl />}
        {fullscreenControl && <FullscreenControl />}
        {navigationControl && <NavigationControl />}
        {scaleControl && <ScaleControl />}
        <DrawControl
          features={features}
          position='top-left'
          displayControlsDefault={false}
          controls={useMemo(
            () => ({
              polygon: true,
              trash: true
            }),
            []
          )}
          onCreate={onUpdate}
          onUpdate={onUpdate}
          onDelete={onDelete}
        />
      </Map>
    </div>
  );
}
