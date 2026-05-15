'use client';

import { InlineNotification } from '@carbon/react';
import mapboxgl from 'mapbox-gl';
import Map, {
  FullscreenControl,
  GeolocateControl,
  NavigationControl,
  ScaleControl
} from 'react-map-gl/mapbox';
import 'mapbox-gl/dist/mapbox-gl.css';
import DrawControl from '@/components/maps/DrawControl';
import { Feature, Feature as GeoJSONFeature } from 'geojson';
import { useIsClient } from 'usehooks-ts';

type FeatureMap = Record<string, Feature>;
type SetFeaturesAction = FeatureMap | null | ((prevFeatures: FeatureMap) => FeatureMap);
type SetFeatures = (value: SetFeaturesAction) => void | Promise<unknown>;

interface Props {
  features?: FeatureMap;
  setFeatures?: SetFeatures;
  drawControl?: boolean;
  scaleControl?: boolean;
  geoLocateControl?: boolean;
  fullscreenControl?: boolean;
  navigationControl?: boolean;
  className?: string;
}

export default function MapboxMap({
  features,
  setFeatures,
  drawControl = false,
  scaleControl = false,
  geoLocateControl = false,
  fullscreenControl = false,
  navigationControl = false,
  className
}: Props) {
  const isClient = useIsClient();
  const onUpdate = (e: { features: GeoJSONFeature[] }) => {
    if (!setFeatures) return;

    void setFeatures((prevFeatures) => {
      const newFeatures = { ...prevFeatures };

      for (const f of e.features)
        if (f.id) newFeatures[f.id] = f;

      return newFeatures;
    });
  };

  const onDelete = (e: { features: GeoJSONFeature[] }) => {
    if (!setFeatures) return;

    void setFeatures((prevFeatures) => {
      const newFeatures = { ...prevFeatures };

      for (const f of e.features)
        if (f.id) delete newFeatures[f.id];

      return newFeatures;
    });
  };

  if (!isClient) {
    return (
      <div className={className}>
        <div className='h-full border border-black/10' />
      </div>
    );
  }

  if (!mapboxgl.supported()) {
    return (
      <div className={className}>
        <InlineNotification
          lowContrast
          hideCloseButton
          kind='warning'
          title='Map unavailable'
          subtitle='This browser does not support WebGL.'
        />
      </div>
    );
  }

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
        mapStyle='mapbox://styles/mapbox/light-v10'
        mapboxAccessToken={process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN}
      >
        {geoLocateControl && <GeolocateControl />}
        {fullscreenControl && <FullscreenControl />}
        {navigationControl && <NavigationControl />}
        {scaleControl && <ScaleControl />}
        {drawControl && (
          <DrawControl
            features={features}
            position='top-left'
            displayControlsDefault={false}
            controls={{
              polygon: true,
              trash: true
            }}
            onCreate={onUpdate}
            onUpdate={onUpdate}
            onDelete={onDelete}
          />
        )}
      </Map>
    </div>
  );
}
