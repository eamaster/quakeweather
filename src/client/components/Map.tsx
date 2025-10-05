import { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import { useQuery } from '@tanstack/react-query';
import { QuakeCollection, QuakeFeature, FeedType } from '../types';
import PopupCard from './PopupCard';

// Mapbox token - will be injected at build time
const MAPBOX_TOKEN = 'REMOVED_MAPBOX_TOKEN';

mapboxgl.accessToken = MAPBOX_TOKEN;

interface MapProps {
  selectedFeed: FeedType;
  magnitudeRange: [number, number];
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

export default function Map({ selectedFeed, magnitudeRange }: MapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  // const popup = useRef<mapboxgl.Popup | null>(null);
  const [selectedQuake, setSelectedQuake] = useState<QuakeFeature | null>(null);
  const [originalQuakeData, setOriginalQuakeData] = useState<QuakeFeature[]>([]);

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
      console.log('Storing original quake data:', filteredFeatures.length, 'earthquakes');
      console.log('Sample earthquake data:', filteredFeatures[0]);
      setOriginalQuakeData(filteredFeatures);

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
        
        console.log('Feature ID:', feature.id);
        console.log('Feature properties:', feature.properties);
        console.log('Available original data IDs:', originalQuakeData.map(q => q.id));
        
        // Find the original earthquake data by ID to preserve depth information
        const originalQuake = originalQuakeData.find(q => q.id === feature.id);
        
        console.log('Found original quake:', originalQuake);
        
        const quake: QuakeFeature = originalQuake || {
          type: 'Feature',
          id: feature.id,
          properties: feature.properties,
          geometry: feature.geometry,
        };
        
        console.log('Individual earthquake clicked:', quake.properties.place, quake.properties.mag);
        console.log('Original coordinates:', originalQuake?.geometry.coordinates);
        console.log('Mapbox coordinates:', feature.geometry.coordinates);
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

  return (
    <div className="relative w-full h-full">
      <div ref={mapContainer} className="absolute inset-0" />
      
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

