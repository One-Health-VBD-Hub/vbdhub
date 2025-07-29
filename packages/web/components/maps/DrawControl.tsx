import MapboxDraw from '@mapbox/mapbox-gl-draw';
import { useControl } from 'react-map-gl/mapbox';
import '@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css';

import type { ControlPosition } from 'react-map-gl/mapbox';
import { Feature as GeoJSONFeature } from 'geojson';
import { memo, useEffect } from 'react';

type DrawControlProps = ConstructorParameters<typeof MapboxDraw>[0] & {
  position?: ControlPosition;
  features?: Record<string, GeoJSONFeature>;

  onCreate: (evt: { features: GeoJSONFeature[] }) => void;
  onUpdate: (evt: { features: GeoJSONFeature[]; action: string }) => void;
  onDelete: (evt: { features: GeoJSONFeature[] }) => void;
};

export default memo(function DrawControl(props: DrawControlProps) {
  const draw = useControl<MapboxDraw>(
    () => new MapboxDraw(props),
    ({ map }) => {
      map.on('draw.create', props.onCreate);
      map.on('draw.update', props.onUpdate);
      map.on('draw.delete', props.onDelete);
    },
    ({ map }) => {
      map.off('draw.create', props.onCreate);
      map.off('draw.update', props.onUpdate);
      map.off('draw.delete', props.onDelete);
    },
    {
      position: props.position
    }
  );

  // watch for `features` changes and update the draw state
  useEffect(() => {
    if (!draw || !props.features) return;
    draw.set({
      type: 'FeatureCollection',
      features: Object.values(props.features)
    });
  }, [draw, props.features]);

  return null;
});
