'use client';

import Map, {
  FullscreenControl,
  GeolocateControl,
  NavigationControl,
  ScaleControl
} from 'react-map-gl/mapbox';
import 'mapbox-gl/dist/mapbox-gl.css';
import DrawControl from '@/components/maps/DrawControl';
import { memo, useCallback, useEffect, useMemo, useState } from 'react';
import { Feature as GeoJSONFeature } from 'geojson';

interface Props {
  scaleControl?: boolean;
  geoLocateControl?: boolean;
  fullscreenControl?: boolean;
  navigationControl?: boolean;
  className?: string;
  onFeaturesChange?: (features: Record<string, GeoJSONFeature>) => void;
  initialFeatures?: Record<string, GeoJSONFeature>;
}

export default memo(function MapboxMap({
  scaleControl = false,
  geoLocateControl = false,
  fullscreenControl = false,
  navigationControl = false,
  className,
  onFeaturesChange,
  initialFeatures = {}
}: Props) {
  const [features, setFeatures] =
    useState<Record<string, GeoJSONFeature>>(initialFeatures);

  // synchronise initial features with state
  useEffect(() => {
    setFeatures(initialFeatures);
  }, [initialFeatures]);

  const onUpdate = useCallback(
    (e: { features: GeoJSONFeature[] }) => {
      setFeatures((prevFeatures) => {
        const newFeatures = { ...prevFeatures };

        for (const f of e.features) {
          if (f.id) newFeatures[f.id] = f;
        }

        if (onFeaturesChange) setTimeout(() => onFeaturesChange(newFeatures));
        return newFeatures;
      });
    },
    [onFeaturesChange]
  );

  const onDelete = useCallback(
    (e: { features: GeoJSONFeature[] }) => {
      setFeatures((prevFeatures) => {
        const newFeatures = { ...prevFeatures };

        for (const f of e.features) {
          if (f.id) delete newFeatures[f.id];
        }

        if (onFeaturesChange) setTimeout(() => onFeaturesChange(newFeatures));
        return newFeatures;
      });
    },
    [onFeaturesChange]
  );

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
        // TODO look at whether secure
        mapboxAccessToken='pk.eyJ1Ijoic3RhbmxleTg4OCIsImEiOiJjbWM5YXhzbDMxNmxzMmlzM2Q5YWxyeGV1In0.9v3vYrXvdRLkdszC5Jwodw'
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
});
