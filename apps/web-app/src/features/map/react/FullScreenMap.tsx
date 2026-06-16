/** @jsxImportSource react */
import React, { useEffect, useRef } from 'react';
import maplibregl from 'maplibre-gl';
import { useStore } from '@nanostores/react';
import type { Feature, LineString } from 'geojson';
import 'maplibre-gl/dist/maplibre-gl.css';

import {
  mapCenter,
  mapZoom,
  venues,
  selectedVenue,
  activeSession,
  selectVenue,
  userLocation,
} from '@/store/mapStore';
import type { Venue } from '@/types';

// Helper to register custom beautiful Phosphor SVG icons to Maplibre
const registerMapIcons = (map: maplibregl.Map) => {
  const colors = {
    colorFood: '#f59e0b',
    colorTransit: '#3b82f6',
    colorNature: '#10b981',
    colorArts: '#06b6d4',
    colorCommunity: '#a855f7',
    colorDefault: '#64748b',
    strokeColor: '#ffffff'
  };

  const iconSVGs = {
    'icon-coffee': {
      color: colors.colorFood,
      path: `<path d="M80,56V24a8,8,0,0,1,16,0V56a8,8,0,0,1-16,0Zm40,8a8,8,0,0,0,8-8V24a8,8,0,0,0-16,0V56A8,8,0,0,0,120,64Zm32,0a8,8,0,0,0,8-8V24a8,8,0,0,0-16,0V56A8,8,0,0,0,152,64Zm96,56v8a40,40,0,0,1-37.51,39.91,96.59,96.59,0,0,1-27,40.09H208a8,8,0,0,1,0,16H32a8,8,0,0,1,0-16H56.54A96.3,96.3,0,0,1,24,136V88a8,8,0,0,1,8-8H208A40,40,0,0,1,248,120ZM200,96H40v40a80.27,80.27,0,0,0,45.12,72h69.76A80.27,80.27,0,0,0,200,136Zm32,24a24,24,0,0,0-16-22.62V136a95.78,95.78,0,0,1-1.2,15A24,24,0,0,0,232,128Z"/>`
    },
    'icon-bed': {
      color: colors.colorTransit,
      path: `<path d="M216,72H32V48a8,8,0,0,0-16,0V208a8,8,0,0,0,16,0V176H240v32a8,8,0,0,0,16,0V112A40,40,0,0,0,216,72ZM32,88h72v72H32Zm88,72V88h96a24,24,0,0,1,24,24v48Z"/>`
    },
    'icon-shopping': {
      color: colors.colorTransit,
      path: `<path d="M216,40H40A16,16,0,0,0,24,56V200a16,16,0,0,0,16,16H216a16,16,0,0,0,16-16V56A16,16,0,0,0,216,40Zm0,160H40V56H216V200ZM176,88a48,48,0,0,1-96,0,8,8,0,0,1,16,0,32,32,0,0,0,64,0,8,8,0,0,1,16,0Z"/>`
    },
    'icon-transit': {
      color: colors.colorTransit,
      path: `<path d="M184,32H72A24,24,0,0,0,48,56V184a24,24,0,0,0,24,24v16a8,8,0,0,0,16,0V208H168v16a8,8,0,0,0,16,0V208a24,24,0,0,0,24-24V56A24,24,0,0,0,184,32ZM72,48H184a8,8,0,0,1,8,8v48H64V56A8,8,0,0,1,72,48Zm112,136H72a8,8,0,0,1-8-8V120H192v56A8,8,0,0,1,184,184ZM96,160a16,16,0,1,1,16-16A16,16,0,0,1,96,160Zm64,0a16,16,0,1,1,16-16A16,16,0,0,1,160,160Z"/>`
    },
    'icon-tree': {
      color: colors.colorNature,
      path: `<path d="M207.69,134.19A39.9,39.9,0,0,0,192,104a39.4,39.4,0,0,0-4-.2A56,56,0,0,0,80,120a8,8,0,0,0,.69,3.19A39.9,39.9,0,0,0,48,160a40,40,0,0,0,72,24h16v32a8,8,0,0,0,16,0V184h16a40,40,0,0,0,39.69-49.81ZM88,168a24,24,0,0,1-7.14-46.92,8,8,0,0,0,5.56-9.15,40,40,0,0,1,77.72-8.31,8,8,0,0,0,7.18,5.43c.12,0,.24,0,.36,0a23.94,23.94,0,0,1,16.74,41.1,8,8,0,0,0-2.42,5.86V168Zm80,0V152a8,8,0,0,0-16,0v16H136V144a8,8,0,0,0-16,0v24H104a24,24,0,0,1,0-48h6.21a8,8,0,0,0,7.56-5.38A40.06,40.06,0,0,1,192,120a24,24,0,0,1,0,48Z"/>`
    },
    'icon-ticket': {
      color: colors.colorArts,
      path: `<path d="M224,96a8,8,0,0,1-8,8H176a8,8,0,0,1,0-16h40A8,8,0,0,1,224,96Zm-8,24H176a8,8,0,0,0,0,16h40a8,8,0,0,0,0-16Zm24-72H16A16,16,0,0,0,0,64v40a24,24,0,0,1,24,24,24,24,0,0,1-24,24v40a16,16,0,0,0,16,16H240a16,16,0,0,0,16-16V152a24,24,0,0,1-24-24,24,24,0,0,1,24-24V64A16,16,0,0,0,240,48Zm0,50a40,40,0,0,0-24,30,40,40,0,0,0,24,30v42H16V158a40,40,0,0,0,24-30,40,40,0,0,0-24-30V64H240Z"/>`
    },
    'icon-trophy': {
      color: colors.colorArts,
      path: `<path d="M128,16a80.09,80.09,0,0,0-80,80c0,34.42,21.83,63.19,52.22,73.86a48.06,48.06,0,0,0,39.78,21.8v16.7A48,48,0,0,0,104,228a8,8,0,0,0,0,16h48a8,8,0,0,0,0-16,48,48,0,0,0-36-21.64V208.36a48.06,48.06,0,0,0,39.78-21.8c30.39-10.67,52.22-39.44,52.22-73.86A80.09,80.09,0,0,0,128,16Zm64,80c0,27.17-18.79,49.88-44.57,55.1A8,8,0,0,0,142,159v-95H192ZM64,64h50v95a8,8,0,0,0-5.46.06c-25.78-5.22-44.57-27.93-44.57-55.1ZM248,64a32,32,0,0,0-32,32,80.12,80.12,0,0,1-3.69,23.77,8,8,0,0,0,15,5.43C234,111.45,237.91,104,240,96h8a8,8,0,0,0,0-16h-8A32,32,0,0,0,248,64Zm-192,32c0,8-3.91,15.45-12.72,19.2a8,8,0,0,0,3,15.42A80.12,80.12,0,0,1,40,96h-8a8,8,0,0,0,0,16h8A32,32,0,0,0,56,96Z"/>`
    },
    'icon-community': {
      color: colors.colorCommunity,
      path: `<path d="M251.76,88.94l-120-64a8,8,0,0,0-7.52,0l-120,64a8,8,0,0,0,0,14.12L32,117.87v48.42a15.91,15.91,0,0,0,4.06,10.65C49.16,191.53,78.51,216,128,216a130,130,0,0,0,48-8.76V240a8,8,0,0,0,16,0V199.51a115.63,115.63,0,0,0,27.94-22.57A15.91,15.91,0,0,0,224,166.29V117.87l27.76-14.81a8,8,0,0,0,0-14.12ZM128,200c-43.27,0-68.72-21.14-80-33.71V126.4l76.24,40.66a8,8,0,0,0,7.52,0L176,143.47v46.34C163.4,195.69,147.52,200,128,200Zm80-33.75a97.83,97.83,0,0,1-16,14.25V134.93l16-8.53ZM188,118.94l-.22-.13-56-29.87a8,8,0,0,0-7.52,14.12L171,128l-43,22.93L25,96,128,41.07,231,96Z"/>`
    },
    'icon-default': {
      color: colors.colorDefault,
      path: `<path d="M128,64a40,40,0,1,0,40,40A40,40,0,0,0,128,64Zm0,64a24,24,0,1,1,24-24A24,24,0,0,1,128,128Zm0-112a88.1,88.1,0,0,0-88,88c0,31.4,14.51,64.68,42,96.25a254.19,254.19,0,0,0,41.45,38.3,8,8,0,0,0,9.18,0A254.19,254.19,0,0,0,174,200.25c27.45-31.57,42-64.85,42-96.25A88.1,88.1,0,0,0,128,16Zm0,206c-16.53-13-72-60.75-72-118a72,72,0,0,1,144,0C200,161.23,144.53,209,128,222Z"/>`
    }
  };

  Object.entries(iconSVGs).forEach(([id, { color, path }]) => {
    const svgString = `
      <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 36 36">
        <circle cx="18" cy="18" r="16" fill="rgba(255, 255, 255, 0.4)" stroke="${colors.strokeColor}" stroke-width="1.5" />
        <circle cx="18" cy="18" r="13" fill="${color}" />
        <g transform="translate(10, 10) scale(0.0625)" fill="#ffffff">
          ${path}
        </g>
      </svg>
    `.trim();

    const img = new Image();
    img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svgString);
    img.onload = () => {
      if (map.hasImage(id)) {
        map.removeImage(id);
      }
      map.addImage(id, img);
    };
  });
};

// Custom DOM Marker creator helper for Venues
function createMarkerElement(venue: Venue, isSelected: boolean, onClick: () => void) {
  const el = document.createElement('div');
  el.className = `custom-marker ${isSelected ? 'selected' : ''}`;

  el.innerHTML = `
    <div class="custom-marker-ring"></div>
    <div class="custom-marker-icon">
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" style="width: 16px; height: 16px;">
        <path stroke-linecap="round" stroke-linejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
        <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
      </svg>
    </div>
    <div class="custom-marker-tooltip">
      <div class="tooltip-content">
        <p class="tooltip-title">${venue.name}</p>
        <p class="tooltip-subtitle">${venue.category} • ★ ${venue.weight}</p>
      </div>
      <div class="tooltip-arrow"></div>
    </div>
  `;

  el.addEventListener('click', (e) => {
    e.stopPropagation();
    onClick();
  });

  return el;
}

export default function FullScreenMap() {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const markersRef = useRef<{ [key: string]: maplibregl.Marker }>({});
  const userMarkerRef = useRef<maplibregl.Marker | null>(null);

  const center = useStore(mapCenter);
  const zoom = useStore(mapZoom);
  const venueList = useStore(venues);
  const currentSelectedVenue = useStore(selectedVenue);
  const currentActiveSession = useStore(activeSession);
  const currentUserLocation = useStore(userLocation);

  // 1. Initialize Map instance
  useEffect(() => {
    if (!mapContainerRef.current) return;

    const map = new maplibregl.Map({
      container: mapContainerRef.current,
      style: 'https://tiles.openfreemap.org/styles/liberty',
      center: [...center],
      zoom: zoom,
      pitch: 45,
      bearing: -10,
      maxPitch: 75,
      pitchWithRotate: true,
      dragRotate: true,
      touchZoomRotate: true,
    });

    mapRef.current = map;

    // Force Globe projection once the style is loaded for Mapbox GL feel
    map.on('style.load', () => {
      // Register custom phosphor icons to map
      registerMapIcons(map);

      try {
        if (typeof map.setProjection === 'function') {
          map.setProjection({ type: 'globe' });
        }
      } catch (err) {
        console.warn('Globe projection not supported on this maplibre version/environment:', err);
      }

      // Add foursquare-places source
      map.addSource('foursquare-places', {
        type: 'vector',
        url: `${window.location.origin}/tiles/get_foursquare_places`
      });

      // Add foursquare layers
      map.addLayer({
        id: 'foursquare-places-layer',
        type: 'symbol',
        source: 'foursquare-places',
        'source-layer': 'foursquare_places',
        layout: {
          'icon-image': [
            'match',
            ['get', 'category'],
            [
              'coffee_shop', 'cafe', 'restaurant', 'indonesian_restaurant', 'asian_restaurant', 
              'chinese_restaurant', 'noodles_restaurant', 'fast_food_restaurant', 'chicken_restaurant', 
              'japanese_restaurant', 'bakery', 'food_court', 'dessert_shop', 'ice_cream_parlor', 
              'tea_room', 'juice_bar', 'food_truck'
            ], 'icon-coffee',
            [
              'hotel', 'accommodation', 'hostel', 'resort'
            ], 'icon-bed',
            [
              'airport', 'train_station', 'metro_station', 'bus_station', 'bus_stop'
            ], 'icon-transit',
            [
              'shopping_center', 'shopping_mall', 'department_store', 'landmark_and_historical_building'
            ], 'icon-shopping',
            [
              'park', 'tourist_attraction', 'plaza', 'scenic_lookout'
            ], 'icon-tree',
            [
              'art_gallery', 'museum', 'theater', 'cinema', 'music_venue', 'cultural_center', 'arts_and_entertainment'
            ], 'icon-ticket',
            [
              'sports_club', 'stadium', 'sports_complex', 'playground', 'gym_fitness_center', 'recreation_center'
            ], 'icon-trophy',
            [
              'mosque', 'church_cathedral', 'temple', 'community_center', 'library', 'school', 'education', 
              'college_university', 'elementary_school', 'high_school'
            ], 'icon-community',
            'icon-default'
          ],
          'icon-size': [
            'interpolate',
            ['exponential', 1.5],
            ['zoom'],
            12, 0.5,
            16, 0.8,
            18, 1.0
          ],
          'icon-allow-overlap': true,
          'icon-ignore-placement': true
        }
      });

      // Add foursquare labels layer
      const colors = {
        colorFood: '#f59e0b',
        colorTransit: '#3b82f6',
        colorNature: '#10b981',
        colorArts: '#06b6d4',
        colorCommunity: '#a855f7',
        colorDefault: '#64748b'
      };

      map.addLayer({
        id: 'foursquare-places-labels',
        type: 'symbol',
        source: 'foursquare-places',
        'source-layer': 'foursquare_places',
        minzoom: 14.5,
        layout: {
          'text-field': '{name}',
          'text-font': ['Noto Sans Regular'],
          'text-size': [
            'interpolate',
            ['linear'],
            ['zoom'],
            14.5, 9,
            18, 12
          ],
          'text-variable-anchor': ['left', 'right', 'top', 'bottom'],
          'text-radial-offset': 1.2,
          'text-justify': 'auto',
          'text-padding': 4,
          'text-max-width': 7,
          'text-allow-overlap': false,
          'text-ignore-placement': false,
          'text-optional': true
        },
        paint: {
          'text-color': [
            'match',
            ['get', 'category'],
            [
              'coffee_shop', 'cafe', 'restaurant', 'indonesian_restaurant', 'asian_restaurant', 
              'chinese_restaurant', 'noodles_restaurant', 'fast_food_restaurant', 'chicken_restaurant', 
              'japanese_restaurant', 'bakery', 'food_court', 'dessert_shop', 'ice_cream_parlor', 
              'tea_room', 'juice_bar', 'food_truck'
            ], colors.colorFood,
            [
              'hotel', 'accommodation', 'hostel', 'resort',
              'airport', 'train_station', 'metro_station', 'bus_station', 'bus_stop',
              'shopping_center', 'shopping_mall', 'department_store', 'landmark_and_historical_building'
            ], colors.colorTransit,
            [
              'park', 'tourist_attraction', 'plaza', 'scenic_lookout'
            ], colors.colorNature,
            [
              'art_gallery', 'museum', 'theater', 'cinema', 'music_venue', 'cultural_center', 'arts_and_entertainment',
              'sports_club', 'stadium', 'sports_complex', 'playground', 'gym_fitness_center', 'recreation_center'
            ], colors.colorArts,
            [
              'mosque', 'church_cathedral', 'temple', 'community_center', 'library', 'school', 'education', 
              'college_university', 'elementary_school', 'high_school'
            ], colors.colorCommunity,
            colors.colorDefault
          ],
          'text-halo-color': '#ffffff',
          'text-halo-width': 1.5
        }
      });

      // Show info popup when a venue is clicked
      map.on('click', 'foursquare-places-layer', (e) => {
        const features = map.queryRenderedFeatures(e.point, {
          layers: ['foursquare-places-layer']
        });
        if (!features.length) return;

        const feature = features[0];
        const coordinates = (feature.geometry as any).coordinates.slice();
        const { name, category, address } = feature.properties || {};

        while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
          coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
        }

        new maplibregl.Popup({ 
          className: 'custom-popup',
          closeButton: false,
          anchor: 'bottom'
        })
          .setLngLat(coordinates)
          .setHTML(`
            <div style="font-family: system-ui, -apple-system, sans-serif; padding: 6px 10px; min-width: 140px;">
              <h3 style="margin: 0 0 4px 0; font-size: 13px; font-weight: 600; color: #0f172a;">${name || 'Venue'}</h3>
              <span style="display: inline-block; padding: 2px 6px; background-color: #f0fdf4; color: #16a34a; font-size: 10px; font-weight: 500; border-radius: 4px; margin-bottom: 6px;">${category || 'Uncategorized'}</span>
              ${address ? `<p style="margin: 0; font-size: 11px; color: #64748b; line-height: 1.3;">${address}</p>` : ''}
            </div>
          `)
          .addTo(map);
      });

      // Hover effect for markers
      map.on('mouseenter', 'foursquare-places-layer', () => {
        map.getCanvas().style.cursor = 'pointer';
      });
      map.on('mouseleave', 'foursquare-places-layer', () => {
        map.getCanvas().style.cursor = '';
      });
    });

    map.addControl(
      new maplibregl.NavigationControl({
        showCompass: true,
        visualizePitch: true,
      }),
      'bottom-right'
    );

    map.on('moveend', () => {
      const newCenter = map.getCenter();
      const newZoom = map.getZoom();
      mapCenter.set([newCenter.lng, newCenter.lat]);
      mapZoom.set(newZoom);
    });

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // 2. Synchronize view center & zoom when updated from stores
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    // Ignore sync animations if the camera is already undergoing manual manipulation
    if (map.isMoving() || map.isZooming()) return;

    const currentCenter = map.getCenter();
    const hasCenterChanged = 
      Math.abs(currentCenter.lng - center[0]) > 0.0001 || 
      Math.abs(currentCenter.lat - center[1]) > 0.0001;

    if (hasCenterChanged || Math.abs(map.getZoom() - zoom) > 0.1) {
      map.flyTo({
        center: [...center],
        zoom: zoom,
        essential: true,
        duration: 1500,
      });
    }
  }, [center, zoom]);

  // 3. Clean up markers
  useEffect(() => {
    Object.keys(markersRef.current).forEach((id) => {
      markersRef.current[id].remove();
    });
    markersRef.current = {};
  }, [selectedVenue]);

  // 4. Synchronize Venue markers with selection state and cinematic camera angles
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    // Clean up old markers
    Object.keys(markersRef.current).forEach((id) => {
      markersRef.current[id].remove();
    });
    markersRef.current = {};

    // Re-add markers with selection state
    venueList.forEach((venue) => {
      const isSelected = currentSelectedVenue?.id === venue.id;
      
      const el = createMarkerElement(venue, isSelected, () => {
        selectVenue(venue);
        
        // Satisfying Cinematic Camera Fly-in on click
        map.flyTo({
          center: [...venue.coordinates],
          zoom: 14.5,
          pitch: 55,       // Cinematic 3D buildings tilt
          bearing: -15,     // Cyberpunk angle rotation
          duration: 1800,
          essential: true,
          // Shift center down to ensure the tooltip above marker has plenty of space and doesn't cut off
          offset: [0, window.innerHeight * 0.12] 
        });
      });

      const marker = new maplibregl.Marker({ element: el })
        .setLngLat([...venue.coordinates])
        .addTo(map);

      markersRef.current[venue.id] = marker;
    });
  }, [venueList, currentSelectedVenue]);

  // 5. Camera control (fit bounds) when route is active
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    const hasRoute = currentActiveSession?.status === 'EN_ROUTE' && currentActiveSession.destination;
    if (hasRoute && currentActiveSession.destination) {
      const startPt = center;
      const endPt = currentActiveSession.destination;

      const bounds = new maplibregl.LngLatBounds()
        .extend([...startPt])
        .extend([...endPt]);

      map.fitBounds(bounds, {
        padding: 80,
        maxZoom: 14,
        duration: 1500
      });
    }
  }, [currentActiveSession?.status, currentActiveSession?.destination]);

  // 5b. Isolated route line path updater using GPU-fast setData updates
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    const hasRoute = currentActiveSession?.status === 'EN_ROUTE' && currentActiveSession.destination;
    if (!hasRoute || !currentActiveSession.destination) {
      // Remove layers and source if inactive
      if (map.getLayer('active-route-layer')) map.removeLayer('active-route-layer');
      if (map.getLayer('active-route-layer-glow')) map.removeLayer('active-route-layer-glow');
      if (map.getSource('active-route-source')) map.removeSource('active-route-source');
      return;
    }

    const startPt = center;
    const endPt = currentActiveSession.destination;
    const midPt: [number, number] = [
      (startPt[0] + endPt[0]) / 2 + 0.005,
      (startPt[1] + endPt[1]) / 2 + 0.003
    ];

    const routeGeoJSON = {
      type: 'Feature' as const,
      properties: {},
      geometry: {
        type: 'LineString' as const,
        coordinates: [[...startPt], midPt, [...endPt]]
      }
    };

    const source = map.getSource('active-route-source') as maplibregl.GeoJSONSource | undefined;
    if (source) {
      source.setData(routeGeoJSON);
    } else {
      map.addSource('active-route-source', {
        type: 'geojson',
        data: routeGeoJSON
      });

      const primary500 = typeof window !== 'undefined' ? window.getComputedStyle(document.documentElement).getPropertyValue('--primary-500').trim() || '#22c55e' : '#22c55e';
      const primary400 = typeof window !== 'undefined' ? window.getComputedStyle(document.documentElement).getPropertyValue('--primary-400').trim() || '#4ade80' : '#4ade80';

      // Outer glow layer
      map.addLayer({
        id: 'active-route-layer-glow',
        type: 'line',
        source: 'active-route-source',
        layout: { 'line-join': 'round', 'line-cap': 'round' },
        paint: {
          'line-color': primary400,
          'line-width': 8,
          'line-opacity': 0.3
        }
      });

      // Main neon line layer
      map.addLayer({
        id: 'active-route-layer',
        type: 'line',
        source: 'active-route-source',
        layout: { 'line-join': 'round', 'line-cap': 'round' },
        paint: {
          'line-color': primary500,
          'line-width': 4,
          'line-opacity': 0.95
        }
      });
    }
  }, [center, currentActiveSession?.destination, currentActiveSession?.status]);

  // 6. Synchronize user GPS location marker on map with unmount cleanup
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    if (!currentUserLocation) {
      if (userMarkerRef.current) {
        userMarkerRef.current.remove();
        userMarkerRef.current = null;
      }
      return;
    }

    if (!userMarkerRef.current) {
      const el = document.createElement('div');
      el.className = 'user-location-marker';
      el.innerHTML = `
        <div class="user-location-pulse"></div>
        <div class="user-location-dot">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" width="12" height="12" fill="#ffffff">
            <path d="M240,120H215.63A88.13,88.13,0,0,0,136,40.37V16a8,8,0,0,0-16,0V40.37A88.13,88.13,0,0,0,40.37,120H16a8,8,0,0,0,0,16H40.37A88.13,88.13,0,0,0,120,215.63V240a8,8,0,0,0,16,0V215.63A88.13,88.13,0,0,0,215.63,136H240a8,8,0,0,0,0-16ZM128,200a72,72,0,1,1,72-72A72.08,72.08,0,0,1,128,200Z"/>
          </svg>
        </div>
      `;
      userMarkerRef.current = new maplibregl.Marker({
        element: el,
        anchor: 'center'
      })
        .setLngLat([...currentUserLocation])
        .addTo(map);
    } else {
      userMarkerRef.current.setLngLat([...currentUserLocation]);
    }

    return () => {
      if (userMarkerRef.current) {
        userMarkerRef.current.remove();
        userMarkerRef.current = null;
      }
    };
  }, [currentUserLocation]);

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', backgroundColor: 'var(--bg-space)', overflow: 'hidden' }}>
      <div ref={mapContainerRef} style={{ width: '100%', height: '100%' }} />
    </div>
  );
}
