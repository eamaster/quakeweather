import { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import { useQuery } from '@tanstack/react-query';
import { QuakeCollection, QuakeFeature, FeedType, PredictResponse, AftershockResponse } from '../types';
import PopupCard from './PopupCard';
import { addNowcastHeatmap, addAftershockRing, removePredictionLayers } from '../utils/predictionLayers';

// Mapbox token - set via environment variable
// IMPORTANT: Never commit actual tokens to Git. Use environment variables.
// For Vite: Create .env file with VITE_MAPBOX_TOKEN=your_token_here
// For Cloudflare Pages: Set VITE_MAPBOX_TOKEN in Environment Variables
const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN || '';

// Only set access token if it exists
if (MAPBOX_TOKEN) {
  mapboxgl.accessToken = MAPBOX_TOKEN;
} else {
  console.error('VITE_MAPBOX_TOKEN environment variable is not set. Map will not load.');
}

interface MapProps {
  selectedFeed: FeedType;
  magnitudeRange: [number, number];
  predictionData?: PredictResponse | null;
  aftershockData?: AftershockResponse | null;
}

// Helper functions for magnitude styling (used in map paint properties)
// const getMagnitudeColor = (mag: number): string => {
//   if (mag >= 6) return '#9333ea'; // purple-600
//   if (mag >= 5) return '#dc2626'; // red-600
//   if (mag >= 4) return '#ea580c'; // orange-600
//   if (mag >= 3) return '#eab308'; // yellow-500
//   return '#22c55e'; // green-500
// }

// const getMagnitudeRadius = (mag: number): number => {
//   return 4 + mag * 3;
// }

export default function Map({ selectedFeed, magnitudeRange, predictionData, aftershockData }: MapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  // const popup = useRef<mapboxgl.Popup | null>(null);
  const [selectedQuake, setSelectedQuake] = useState<QuakeFeature | null>(null);
  const originalQuakeDataRef = useRef<QuakeFeature[]>([]);

  // Fetch earthquake data
  const { data: quakeData, isLoading, error } = useQuery<QuakeCollection>({
    queryKey: ['quakes', selectedFeed],
    queryFn: async () => {
      // Use deployed backend URL for GitHub Pages, fallback to local for development
      const apiBase = window.location.hostname === 'hesam.me' 
        ? 'https://quakeweather-api.smah0085.workers.dev'
        : '';
      const response = await fetch(`${apiBase}/api/quakes?feed=${selectedFeed}`);
      if (!response.ok) {
        throw new Error('Failed to fetch earthquake data');
      }
      return response.json();
    },
    refetchInterval: 60000, // Refetch every minute
  });

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current || map.current) return;
    
    // Don't initialize map if token is missing
    if (!MAPBOX_TOKEN) {
      console.error('Cannot initialize map: VITE_MAPBOX_TOKEN is not set');
      return;
    }

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: [-98.5795, 39.8283], // Center of US
      zoom: 3,
    });

    map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');
    map.current.addControl(
      new mapboxgl.GeolocateControl({
        positionOptions: {
          enableHighAccuracy: true,
        },
        trackUserLocation: true,
      }),
      'top-right'
    );

    // Clean up on unmount
    return () => {
      map.current?.remove();
      map.current = null;
    };
  }, []);

  // Update map data when quakes change
  useEffect(() => {
    if (!map.current || !quakeData) return;

    // Wait for map to load
    if (!map.current.loaded()) {
      map.current.on('load', () => updateMapData());
      return;
    }

    updateMapData();

    function updateMapData() {
      if (!map.current || !quakeData) return;

      // Filter by magnitude
      const filteredFeatures = quakeData.features.filter(
        (f) =>
          f.properties.mag >= magnitudeRange[0] && f.properties.mag <= magnitudeRange[1]
      );

      // Store original data for popup access
      originalQuakeDataRef.current = filteredFeatures;

      const geojson = {
        type: 'FeatureCollection' as const,
        features: filteredFeatures,
      };

      // Remove existing layers and source
      if (map.current.getLayer('earthquakes')) {
        map.current.removeLayer('earthquakes');
      }
      if (map.current.getLayer('earthquake-clusters')) {
        map.current.removeLayer('earthquake-clusters');
      }
      if (map.current.getLayer('cluster-count')) {
        map.current.removeLayer('cluster-count');
      }
      if (map.current.getSource('earthquakes')) {
        map.current.removeSource('earthquakes');
      }

      // Add source
      map.current.addSource('earthquakes', {
        type: 'geojson',
        data: geojson,
        cluster: true,
        clusterMaxZoom: 14,
        clusterRadius: 50,
      });

      // Add cluster layer
      map.current.addLayer({
        id: 'earthquake-clusters',
        type: 'circle',
        source: 'earthquakes',
        filter: ['has', 'point_count'],
        paint: {
          'circle-color': [
            'step',
            ['get', 'point_count'],
            '#22c55e',
            10,
            '#eab308',
            30,
            '#ea580c',
            50,
            '#dc2626',
          ],
          'circle-radius': ['step', ['get', 'point_count'], 20, 10, 30, 30, 40, 50, 50],
          'circle-opacity': 0.8,
          'circle-stroke-width': 2,
          'circle-stroke-color': '#fff',
        },
      });

      // Add cluster count
      map.current.addLayer({
        id: 'cluster-count',
        type: 'symbol',
        source: 'earthquakes',
        filter: ['has', 'point_count'],
        layout: {
          'text-field': '{point_count_abbreviated}',
          'text-font': ['DIN Offc Pro Medium', 'Arial Unicode MS Bold'],
          'text-size': 12,
        },
        paint: {
          'text-color': '#ffffff',
        },
      });

      // Add unclustered points
      map.current.addLayer({
        id: 'earthquakes',
        type: 'circle',
        source: 'earthquakes',
        filter: ['!', ['has', 'point_count']],
        paint: {
          'circle-color': [
            'case',
            ['>=', ['get', 'mag'], 6],
            '#9333ea',
            ['>=', ['get', 'mag'], 5],
            '#dc2626',
            ['>=', ['get', 'mag'], 4],
            '#ea580c',
            ['>=', ['get', 'mag'], 3],
            '#eab308',
            '#22c55e',
          ],
          'circle-radius': ['interpolate', ['linear'], ['get', 'mag'], 0, 4, 10, 34],
          'circle-opacity': 0.8,
          'circle-stroke-width': 2,
          'circle-stroke-color': '#fff',
        },
      });

      // Add click handler for clusters
      map.current.on('click', 'earthquake-clusters', (e) => {
        if (!map.current) return;
        const features = map.current.queryRenderedFeatures(e.point, {
          layers: ['earthquake-clusters'],
        });
        const clusterId = features[0].properties?.cluster_id;
        const source = map.current.getSource('earthquakes') as mapboxgl.GeoJSONSource;
        
        console.log('Cluster clicked, expanding...', clusterId);
        
        source.getClusterExpansionZoom(clusterId, (err, zoom) => {
          if (err || !map.current || zoom === undefined || zoom === null) return;
          map.current.easeTo({
            center: (features[0].geometry as any).coordinates,
            zoom: zoom,
          });
        });
      });

      // Add click handler for individual points
      map.current.on('click', 'earthquakes', (e) => {
        if (!e.features || !e.features[0]) return;
        const feature = e.features[0] as any;
        
        // Find the original earthquake data by matching coordinates and magnitude
        const featureCoords = feature.geometry.coordinates;
        const featureMag = feature.properties.mag;
        
        const originalQuake = originalQuakeDataRef.current.find(q => {
          const qCoords = q.geometry.coordinates;
          const qMag = q.properties.mag;
          
          // Match by coordinates (with larger tolerance for precision issues) and magnitude
          const coordMatch = Math.abs(qCoords[0] - featureCoords[0]) < 0.01 && 
                            Math.abs(qCoords[1] - featureCoords[1]) < 0.01;
          const magMatch = Math.abs(qMag - featureMag) < 0.2;
          
          return coordMatch && magMatch;
        });
        
        // Use original earthquake data if found, otherwise use Mapbox feature data
        const quake: QuakeFeature = originalQuake || {
          type: 'Feature',
          id: feature.id,
          properties: feature.properties,
          geometry: feature.geometry,
        };
        
        console.log('Individual earthquake clicked:', quake.properties.place, quake.properties.mag);
        console.log('Found original quake:', !!originalQuake);
        console.log('Original quake coordinates:', originalQuake?.geometry.coordinates);
        console.log('Feature coordinates:', feature.geometry.coordinates);
        console.log('Final coordinates:', quake.geometry.coordinates);
        console.log('Original quake data length:', originalQuakeDataRef.current.length);
        setSelectedQuake(quake);
      });

      // Change cursor on hover
      map.current.on('mouseenter', 'earthquakes', () => {
        if (map.current) map.current.getCanvas().style.cursor = 'pointer';
      });
      map.current.on('mouseleave', 'earthquakes', () => {
        if (map.current) map.current.getCanvas().style.cursor = '';
      });
      map.current.on('mouseenter', 'earthquake-clusters', () => {
        if (map.current) map.current.getCanvas().style.cursor = 'pointer';
      });
      map.current.on('mouseleave', 'earthquake-clusters', () => {
        if (map.current) map.current.getCanvas().style.cursor = '';
      });
    }
  }, [quakeData, magnitudeRange]);

  // Handle prediction layers
  useEffect(() => {
    if (!map.current) return;

    console.log('Map prediction data:', { predictionData, aftershockData });

    // Remove existing prediction layers
    removePredictionLayers(map.current);

    // Add new prediction layers
    if (predictionData) {
      console.log('Adding nowcast heatmap with', predictionData.cells?.length || 0, 'cells');
      addNowcastHeatmap(map.current, predictionData);
    }
    
    if (aftershockData) {
      console.log('Adding aftershock ring');
      addAftershockRing(map.current, aftershockData);
    }
  }, [predictionData, aftershockData]);

  // Show error if Mapbox token is missing
  if (!MAPBOX_TOKEN) {
    return (
      <div className="relative w-full h-full flex items-center justify-center bg-gray-100 dark:bg-gray-900">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 max-w-md mx-4">
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0">
              <svg className="h-6 w-6 text-red-600 dark:text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Mapbox Token Not Configured
              </h3>
              <p className="text-sm text-gray-700 dark:text-gray-300 mb-4">
                The map cannot load because the <code className="bg-gray-100 dark:bg-gray-700 px-1 rounded">VITE_MAPBOX_TOKEN</code> environment variable is not set.
              </p>
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded p-3 mb-4">
                <p className="text-xs text-blue-800 dark:text-blue-200 font-medium mb-2">To fix this:</p>
                <ol className="text-xs text-blue-700 dark:text-blue-300 space-y-1 list-decimal list-inside">
                  <li>Go to Cloudflare Pages dashboard</li>
                  <li>Navigate to Settings → Environment Variables</li>
                  <li>Add <code className="bg-blue-100 dark:bg-blue-800 px-1 rounded">VITE_MAPBOX_TOKEN</code> with your Mapbox token</li>
                  <li>Redeploy the Pages project</li>
                </ol>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Get your Mapbox token at: <a href="https://account.mapbox.com/access-tokens/" target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 hover:underline">account.mapbox.com</a>
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full">
      <div ref={mapContainer} className="absolute inset-0" data-quake-data={JSON.stringify(quakeData || [])} />
      
      {/* Loading indicator */}
      {isLoading && (
        <div className="absolute top-4 left-4 bg-white dark:bg-gray-800 rounded-lg shadow-lg px-4 py-2">
          <div className="flex items-center space-x-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-600"></div>
            <span className="text-sm text-gray-700 dark:text-gray-300">Loading earthquakes...</span>
          </div>
        </div>
      )}

      {/* Error indicator */}
      {error && (
        <div className="absolute top-4 left-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg shadow-lg px-4 py-2">
          <p className="text-sm text-red-700 dark:text-red-300">
            Failed to load earthquake data. Please try again.
          </p>
        </div>
      )}

      {/* Stats */}
      {quakeData && (
        <div className="absolute bottom-4 left-4 bg-white dark:bg-gray-800 rounded-lg shadow-lg px-4 py-2">
          <p className="text-sm text-gray-700 dark:text-gray-300">
            <span className="font-semibold">{quakeData.features.length}</span> earthquakes
          </p>
        </div>
      )}

      {/* Popup card */}
      {selectedQuake && (
        <PopupCard quake={selectedQuake} onClose={() => setSelectedQuake(null)} />
      )}
    </div>
  );
}

