import type { Map } from 'mapbox-gl';
import { PredictResponse, AftershockResponse } from '../types';

/**
 * Add or update nowcast heatmap layer on the map
 */
export function addNowcastHeatmap(
  map: Map,
  data: PredictResponse | null
) {
  const sourceId = 'nowcast-heatmap';
  const layerId = 'nowcast-heatmap-layer';
  
  // Remove existing layer and source
  if (map.getLayer(layerId)) {
    map.removeLayer(layerId);
  }
  if (map.getSource(sourceId)) {
    map.removeSource(sourceId);
  }
  
  // If no data, just return (layer removed)
  if (!data || !data.cells || data.cells.length === 0) {
    return;
  }
  
  // Convert cells to GeoJSON features
  const features = data.cells.map(cell => ({
    type: 'Feature' as const,
    geometry: {
      type: 'Point' as const,
      coordinates: [cell.lon, cell.lat],
    },
    properties: {
      probability: cell.probability,
      lambda: cell.lambda,
    },
  }));
  
  const geojson = {
    type: 'FeatureCollection' as const,
    features,
  };
  
  // Add source
  map.addSource(sourceId, {
    type: 'geojson',
    data: geojson,
  });
  
  // Add heatmap layer
  map.addLayer({
    id: layerId,
    type: 'heatmap',
    source: sourceId,
    paint: {
      // Increase weight based on probability
      'heatmap-weight': [
        'interpolate',
        ['linear'],
        ['get', 'probability'],
        0, 0,
        0.1, 1
      ],
      // Increase intensity as zoom increases
      'heatmap-intensity': [
        'interpolate',
        ['linear'],
        ['zoom'],
        0, 1,
        9, 3
      ],
      // Color ramp: blue (low) → yellow → red (high)
      'heatmap-color': [
        'interpolate',
        ['linear'],
        ['heatmap-density'],
        0, 'rgba(33,102,172,0)',
        0.2, 'rgb(103,169,207)',
        0.4, 'rgb(209,229,240)',
        0.6, 'rgb(253,219,199)',
        0.8, 'rgb(239,138,98)',
        1, 'rgb(178,24,43)'
      ],
      // Adjust radius by zoom level
      'heatmap-radius': [
        'interpolate',
        ['linear'],
        ['zoom'],
        0, 2,
        9, 20
      ],
      // Transition from heatmap to circle at zoom 9
      'heatmap-opacity': [
        'interpolate',
        ['linear'],
        ['zoom'],
        7, 0.7,
        9, 0.5
      ],
    },
  }, 'earthquake-clusters');  // Add below earthquake layers
  
  // Add circle layer for high zoom levels
  map.addLayer({
    id: `${layerId}-circles`,
    type: 'circle',
    source: sourceId,
    minzoom: 7,
    paint: {
      'circle-radius': [
        'interpolate',
        ['linear'],
        ['get', 'probability'],
        0, 5,
        0.1, 15
      ],
      'circle-color': [
        'interpolate',
        ['linear'],
        ['get', 'probability'],
        0, '#3b82f6',      // blue-500
        0.02, '#eab308',   // yellow-500
        0.05, '#f97316',   // orange-500
        0.1, '#ef4444'     // red-500
      ],
      'circle-opacity': 0.6,
      'circle-stroke-width': 1,
      'circle-stroke-color': '#ffffff',
    },
  });
}

/**
 * Add or update aftershock probability ring on the map
 */
export function addAftershockRing(
  map: Map,
  data: AftershockResponse | null
) {
  const sourceId = 'aftershock-ring';
  const layerId = 'aftershock-ring-layer';
  const fillLayerId = 'aftershock-ring-fill';
  
  // Remove existing layers and source
  if (map.getLayer(fillLayerId)) {
    map.removeLayer(fillLayerId);
  }
  if (map.getLayer(layerId)) {
    map.removeLayer(layerId);
  }
  if (map.getSource(sourceId)) {
    map.removeSource(sourceId);
  }
  
  // If no data, just return
  if (!data || !data.ring || data.ring.length === 0) {
    return;
  }
  
  // Create polygon from ring points
  const coordinates = [
    ...data.ring.map(p => [p.lon, p.lat]),
    [data.ring[0].lon, data.ring[0].lat],  // Close the ring
  ];
  
  const geojson = {
    type: 'FeatureCollection' as const,
    features: [{
      type: 'Feature' as const,
      geometry: {
        type: 'Polygon' as const,
        coordinates: [coordinates],
      },
      properties: {
        probability: data.center_probability,
        lambda: data.center_lambda,
        mag: data.mainshock.mag,
      },
    }],
  };
  
  // Add source
  map.addSource(sourceId, {
    type: 'geojson',
    data: geojson,
  });
  
  // Add fill layer
  map.addLayer({
    id: fillLayerId,
    type: 'fill',
    source: sourceId,
    paint: {
      'fill-color': [
        'interpolate',
        ['linear'],
        ['get', 'probability'],
        0, '#3b82f6',      // blue-500
        0.1, '#eab308',    // yellow-500
        0.3, '#f97316',    // orange-500
        0.5, '#ef4444'     // red-500
      ],
      'fill-opacity': 0.3,
    },
  });
  
  // Add outline
  map.addLayer({
    id: layerId,
    type: 'line',
    source: sourceId,
    paint: {
      'line-color': '#ef4444',  // red-500
      'line-width': 2,
      'line-dasharray': [2, 2],
    },
  });
  
  // Add center marker for mainshock
  const centerMarkerId = 'aftershock-center';
  if (map.getLayer(centerMarkerId)) {
    map.removeLayer(centerMarkerId);
  }
  
  const centerSourceId = 'aftershock-center-source';
  if (map.getSource(centerSourceId)) {
    map.removeSource(centerSourceId);
  }
  
  map.addSource(centerSourceId, {
    type: 'geojson',
    data: {
      type: 'FeatureCollection',
      features: [{
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: [data.mainshock.lon, data.mainshock.lat],
        },
        properties: {
          mag: data.mainshock.mag,
        },
      }],
    },
  });
  
  map.addLayer({
    id: centerMarkerId,
    type: 'circle',
    source: centerSourceId,
    paint: {
      'circle-radius': 8,
      'circle-color': '#dc2626',  // red-600
      'circle-stroke-width': 2,
      'circle-stroke-color': '#ffffff',
    },
  });
}

/**
 * Remove all prediction layers from the map
 */
export function removePredictionLayers(map: Map) {
  // Nowcast layers
  const nowcastLayers = ['nowcast-heatmap-layer', 'nowcast-heatmap-layer-circles'];
  for (const layerId of nowcastLayers) {
    if (map.getLayer(layerId)) {
      map.removeLayer(layerId);
    }
  }
  if (map.getSource('nowcast-heatmap')) {
    map.removeSource('nowcast-heatmap');
  }
  
  // Aftershock layers
  const aftershockLayers = ['aftershock-ring-fill', 'aftershock-ring-layer', 'aftershock-center'];
  for (const layerId of aftershockLayers) {
    if (map.getLayer(layerId)) {
      map.removeLayer(layerId);
    }
  }
  if (map.getSource('aftershock-ring')) {
    map.removeSource('aftershock-ring');
  }
  if (map.getSource('aftershock-center-source')) {
    map.removeSource('aftershock-center-source');
  }
}

/**
 * Create a legend for the nowcast heatmap
 */
export function createPredictionLegend(container: HTMLElement, maxProb: number) {
  container.innerHTML = '';
  container.className = 'fixed bottom-24 left-4 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-3 z-40 text-xs';
  
  const title = document.createElement('div');
  title.className = 'font-bold text-gray-900 dark:text-white mb-2';
  title.textContent = '🔮 Nowcast Probability';
  container.appendChild(title);
  
  const gradientBar = document.createElement('div');
  gradientBar.className = 'h-4 rounded mb-1';
  gradientBar.style.background = 'linear-gradient(to right, #3b82f6, #eab308, #f97316, #ef4444)';
  container.appendChild(gradientBar);
  
  const labels = document.createElement('div');
  labels.className = 'flex justify-between text-gray-600 dark:text-gray-400';
  labels.innerHTML = `
    <span>0%</span>
    <span>${(maxProb * 100).toFixed(1)}%</span>
  `;
  container.appendChild(labels);
  
  const disclaimer = document.createElement('div');
  disclaimer.className = 'mt-2 text-xs text-red-600 dark:text-red-400 font-semibold';
  disclaimer.textContent = 'Experimental - Education only';
  container.appendChild(disclaimer);
}

