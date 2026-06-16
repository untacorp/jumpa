/** @jsxImportSource react */
import React, { useEffect, useRef, useState } from 'react';
import maplibregl from 'maplibre-gl';
import { MaplibreStarfieldLayer } from '@geoql/maplibre-gl-starfield';
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
const registerMapIcons = (map: maplibregl.Map, callback: () => void) => {
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

  const entries = Object.entries(iconSVGs);
  const total = entries.length;
  let loadedCount = 0;

  entries.forEach(([id, { color, path }]) => {
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
      loadedCount++;
      if (loadedCount === total) {
        callback();
      }
    };
    img.onerror = () => {
      loadedCount++;
      if (loadedCount === total) {
        callback();
      }
    };
  });
};

// Helper to get category glow colors
function getCategoryColor(category: string): string {
  const c = category.toLowerCase();
  if (['coffee_shop', 'cafe', 'restaurant', 'indonesian_restaurant', 'asian_restaurant', 
       'chinese_restaurant', 'noodles_restaurant', 'fast_food_restaurant', 'chicken_restaurant', 
       'japanese_restaurant', 'bakery', 'food_court', 'dessert_shop', 'ice_cream_parlor', 
       'tea_room', 'juice_bar', 'food_truck'].includes(c)) {
    return '#f59e0b'; // Amber for Food
  }
  if (['hotel', 'accommodation', 'hostel', 'resort', 'airport', 'train_station', 
       'metro_station', 'bus_station', 'bus_stop', 'shopping_center', 'shopping_mall', 
       'department_store', 'landmark_and_historical_building'].includes(c)) {
    return '#3b82f6'; // Blue for Transit/Shopping
  }
  if (['park', 'tourist_attraction', 'plaza', 'scenic_lookout'].includes(c)) {
    return '#10b981'; // Green for Nature
  }
  if (['art_gallery', 'museum', 'theater', 'cinema', 'music_venue', 'cultural_center', 
       'arts_and_entertainment', 'sports_club', 'stadium', 'sports_complex', 'playground', 
       'gym_fitness_center', 'recreation_center'].includes(c)) {
    return '#06b6d4'; // Cyan for Arts/Sports
  }
  if (['mosque', 'church_cathedral', 'temple', 'community_center', 'library', 'school', 
       'education', 'college_university', 'elementary_school', 'high_school'].includes(c)) {
    return '#a855f7'; // Purple for Community/Education
  }
  return '#64748b'; // Slate default
}

/// Helper functions for color interpolation supporting alpha transparency
function hexToRgb(hex: string) {
  const cleanHex = hex.replace('#', '');
  const isAlpha = cleanHex.length === 8;
  const bigint = parseInt(cleanHex, 16);
  if (isAlpha) {
    const r = (bigint >> 24) & 255;
    const g = (bigint >> 16) & 255;
    const b = (bigint >> 8) & 255;
    const a = (bigint & 255) / 255;
    return { r, g, b, a };
  } else {
    const r = (bigint >> 16) & 255;
    const g = (bigint >> 8) & 255;
    const b = bigint & 255;
    return { r, g, b, a: 1.0 };
  }
}

function rgbToHex(r: number, g: number, b: number, a: number = 1.0) {
  const clamp = (val: number) => Math.max(0, Math.min(255, Math.round(val)));
  if (a < 1.0) {
    return `rgba(${clamp(r)}, ${clamp(g)}, ${clamp(b)}, ${a.toFixed(3)})`;
  }
  return '#' + ((1 << 24) + (clamp(r) << 16) + (clamp(g) << 8) + clamp(b)).toString(16).slice(1);
}

function interpolateColor(color1: string, color2: string, factor: number): string {
  try {
    const c1 = hexToRgb(color1);
    const c2 = hexToRgb(color2);
    const r = c1.r + factor * (c2.r - c1.r);
    const g = c1.g + factor * (c2.g - c1.g);
    const b = c1.b + factor * (c2.b - c1.b);
    const a = c1.a + factor * (c2.a - c1.a);
    return rgbToHex(r, g, b, a);
  } catch (e) {
    return color1;
  }
}

interface ThemeKeyframe {
  hour: number;
  skyColor: string;
  horizonColor: string;
  fogColor: string;
  lightColor: string;
  lightIntensity: number;
  lightPosition: [number, number, number];
  earthColor: string;
  waterColor: string;
  parkColor: string;
  landuseColor: string;
  buildingColor: string;
  labelTextColor: string;
  labelTextHaloColor: string;
  motorwayColor: string;
  motorwayCasing: string;
  midRoadColor: string;
  midRoadCasing: string;
  localRoadColor: string;
  localRoadCasing: string;
}

// Apply theme dynamically to map style properties and layers (runs at 60fps directly on the GPU without style reload)
function applyThemeForHour(map: maplibregl.Map, hour: number) {
  const isNight = hour >= 20 || hour < 5;

  const keyframes: ThemeKeyframe[] = [
    {
      hour: 0,
      skyColor: '#0a0015',
      horizonColor: '#1a0633',
      fogColor: '#05010d',
      lightColor: '#a5f3fc',
      lightIntensity: 0.35,
      lightPosition: [1.15, 210, 30],
      earthColor: '#0b0f19',
      waterColor: '#1e293b',
      parkColor: '#0e1b18',
      landuseColor: '#131a2c',
      buildingColor: '#0f1422',
      labelTextColor: '#cbd5e1',
      labelTextHaloColor: '#0b0f19',
      motorwayColor: '#475569',
      motorwayCasing: '#1e293b',
      midRoadColor: '#1e293b',
      midRoadCasing: '#0f172a',
      localRoadColor: '#0f172a',
      localRoadCasing: '#020617',
    },
    {
      hour: 6,
      skyColor: '#fca5a5',
      horizonColor: '#fef08a',
      fogColor: '#fed7aa',
      lightColor: '#ffedd5',
      lightIntensity: 0.75,
      lightPosition: [1.5, 75, 70],
      earthColor: '#fdf8f5',
      waterColor: '#9ec5db',
      parkColor: '#e5ebd8',
      landuseColor: '#f5efe9',
      buildingColor: '#f3eae5',
      labelTextColor: '#1e293b',
      labelTextHaloColor: '#ffffff',
      motorwayColor: '#cbd5e1',
      motorwayCasing: '#94a3b8',
      midRoadColor: '#f1f3f5',
      midRoadCasing: '#cbd5e1',
      localRoadColor: '#f5f5f7',
      localRoadCasing: '#cbd5e1',
    },
    {
      hour: 12,
      skyColor: '#a2c2e8',
      horizonColor: '#fdfbf7',
      fogColor: '#cbd5e1',
      lightColor: '#ffead4',
      lightIntensity: 0.65,
      lightPosition: [1.35, 220, 55],
      earthColor: '#f5f3ef',
      waterColor: '#b4ccd9',
      parkColor: '#dbe2d2',
      landuseColor: '#eceae4',
      buildingColor: '#eae6e0',
      labelTextColor: '#1e293b',
      labelTextHaloColor: '#ffffff',
      motorwayColor: '#a2b0b3',
      motorwayCasing: '#78909c',
      midRoadColor: '#cbd5e1',
      midRoadCasing: '#94a3b8',
      localRoadColor: '#f1f3f5',
      localRoadCasing: '#cbd5e1',
    },
    {
      hour: 18,
      skyColor: '#7c3aed',
      horizonColor: '#f97316',
      fogColor: '#fca5a5',
      lightColor: '#ff8c42',
      lightIntensity: 0.7,
      lightPosition: [1.5, 255, 65],
      earthColor: '#f1eae2',
      waterColor: '#99b8cc',
      parkColor: '#d8d5c5',
      landuseColor: '#e6dcd0',
      buildingColor: '#e5dbcf',
      labelTextColor: '#1e293b',
      labelTextHaloColor: '#ffffff',
      motorwayColor: '#cbd5e1',
      motorwayCasing: '#94a3b8',
      midRoadColor: '#e2e8f0',
      midRoadCasing: '#cbd5e1',
      localRoadColor: '#f5f5f7',
      localRoadCasing: '#e2e8f0',
    },
    {
      hour: 24, // Wrap around to midnight
      skyColor: '#0a0015',
      horizonColor: '#1a0633',
      fogColor: '#05010d',
      lightColor: '#a5f3fc',
      lightIntensity: 0.35,
      lightPosition: [1.15, 210, 30],
      earthColor: '#0b0f19',
      waterColor: '#1e293b',
      parkColor: '#0e1b18',
      landuseColor: '#131a2c',
      buildingColor: '#0f1422',
      labelTextColor: '#cbd5e1',
      labelTextHaloColor: '#0b0f19',
      motorwayColor: '#475569',
      motorwayCasing: '#1e293b',
      midRoadColor: '#1e293b',
      midRoadCasing: '#0f172a',
      localRoadColor: '#0f172a',
      localRoadCasing: '#020617',
    }
  ];

  // Find the two keyframes to interpolate between
  let k1 = keyframes[0];
  let k2 = keyframes[1];
  for (let i = 0; i < keyframes.length - 1; i++) {
    if (hour >= keyframes[i].hour && hour <= keyframes[i + 1].hour) {
      k1 = keyframes[i];
      k2 = keyframes[i + 1];
      break;
    }
  }

  const factor = (hour - k1.hour) / (k2.hour - k1.hour);

  // Helper to interpolate numeric properties
  const interpNum = (n1: number, n2: number) => n1 + factor * (n2 - n1);
  
  // Helper to interpolate position arrays
  const interpPos = (p1: [number, number, number], p2: [number, number, number]): [number, number, number] => [
    p1[0] + factor * (p2[0] - p1[0]),
    p1[1] + factor * (p2[1] - p1[1]),
    p1[2] + factor * (p2[2] - p1[2]),
  ];

  const skyColor = interpolateColor(k1.skyColor, k2.skyColor, factor);
  const horizonColor = interpolateColor(k1.horizonColor, k2.horizonColor, factor);
  const fogColor = interpolateColor(k1.fogColor, k2.fogColor, factor);
  const lightColor = interpolateColor(k1.lightColor, k2.lightColor, factor);
  const lightIntensity = interpNum(k1.lightIntensity, k2.lightIntensity);
  const lightPosition = interpPos(k1.lightPosition, k2.lightPosition);

  const earthColor = interpolateColor(k1.earthColor, k2.earthColor, factor);
  const waterColor = interpolateColor(k1.waterColor, k2.waterColor, factor);
  const parkColor = interpolateColor(k1.parkColor, k2.parkColor, factor);
  const landuseColor = interpolateColor(k1.landuseColor, k2.landuseColor, factor);
  const buildingColor = interpolateColor(k1.buildingColor, k2.buildingColor, factor);
  const labelTextColor = interpolateColor(k1.labelTextColor, k2.labelTextColor, factor);
  const labelTextHaloColor = interpolateColor(k1.labelTextHaloColor, k2.labelTextHaloColor, factor);

  const motorwayColor = interpolateColor(k1.motorwayColor, k2.motorwayColor, factor);
  const motorwayCasing = interpolateColor(k1.motorwayCasing, k2.motorwayCasing, factor);
  const midRoadColor = interpolateColor(k1.midRoadColor, k2.midRoadColor, factor);
  const midRoadCasing = interpolateColor(k1.midRoadCasing, k2.midRoadCasing, factor);
  const localRoadColor = interpolateColor(k1.localRoadColor, k2.localRoadColor, factor);
  const localRoadCasing = interpolateColor(k1.localRoadCasing, k2.localRoadCasing, factor);

  // Apply sky shader settings dynamically with atmosphere halo for globe
  try {
    if (typeof map.setSky === 'function') {
      map.setSky({
        'sky-color': skyColor,
        'sky-horizon-blend': isNight ? 0.35 : 0.55,
        'horizon-color': horizonColor,
        'horizon-fog-blend': isNight ? 0.3 : 0.5,
        'fog-color': fogColor,
        'fog-ground-blend': isNight ? 0.4 : 0.6,
        'atmosphere-blend': isNight ? 0.95 : 0.75
      });
    }
  } catch (e) {
    console.warn('setSky is not supported or failed:', e);
  }

  // Apply dynamic viewport light positions and colors for photorealistic shading
  try {
    if (typeof map.setLight === 'function') {
      map.setLight({
        'anchor': 'viewport',
        'color': lightColor,
        'intensity': lightIntensity,
        'position': lightPosition
      });
    }
  } catch (e) {
    console.warn('setLight is not supported or failed:', e);
  }

  // Apply fog settings dynamically
  try {
    if (typeof map.setFog === 'function') {
      map.setFog({
        'range': [0.5, 12],
        'color': fogColor,
        'horizon-blend': 0.3,
        'star-intensity': isNight ? 0.85 : 0.0
      });
    }
  } catch (e) {
    console.warn('setFog is not supported or failed:', e);
  }

  // Loop through and update individual style layers via hardware-accelerated paint properties
  try {
    const style = map.getStyle();
    if (style && style.layers) {
      style.layers.forEach((layer: any) => {
        if (layer.id === 'background') {
          map.setPaintProperty(layer.id, 'background-color', [
            'interpolate', ['linear'], ['zoom'],
            3, '#02040a',
            5, earthColor
          ]);
        } else if (layer.id === 'earth') {
          map.setPaintProperty(layer.id, 'fill-color', earthColor);
        }
        if (layer.id.includes('water')) {
          if (layer.type === 'fill') {
            map.setPaintProperty(layer.id, 'fill-color', waterColor);
          } else if (layer.type === 'line') {
            map.setPaintProperty(layer.id, 'line-color', waterColor);
          }
        }

        // Customize green landcover / park areas
        const isGreenArea = layer.id === 'park' || 
                            layer.id.includes('landcover_grass') || 
                            layer.id.includes('landcover_wood') ||
                            layer.id === 'landuse_pitch' ||
                            layer.id === 'landuse_track' ||
                            layer.id === 'landuse_cemetery';
        if (isGreenArea && layer.type === 'fill') {
          map.setPaintProperty(layer.id, 'fill-color', parkColor);
        }

        // Customize school, hospital, residential, airport and cemetery fill areas
        const isMutedArea = layer.id === 'landuse_residential' ||
                            layer.id === 'landuse_hospital' ||
                            layer.id === 'landuse_school' ||
                            layer.id === 'aeroway_fill';
        if (isMutedArea && layer.type === 'fill') {
          map.setPaintProperty(layer.id, 'fill-color', landuseColor);
        }

        // Customize roads
        const isRoad = layer.id.includes('road') || 
                       layer.id.includes('highway') || 
                       layer.id.includes('street') || 
                       layer.id.includes('path') || 
                       layer.id.includes('link') ||
                       layer.id.includes('motorway') ||
                       layer.id.includes('trunk') ||
                       layer.id.includes('primary') ||
                       layer.id.includes('secondary') ||
                       layer.id.includes('tertiary') ||
                       layer.id.includes('minor') ||
                       layer.id.includes('service') ||
                       (layer['source-layer'] === 'transportation') ||
                       (layer.sourceLayer === 'transportation');
        if (isRoad && layer.type === 'line') {
          if (layer.id.includes('casing')) {
            if (layer.id.includes('motorway') || layer.id.includes('trunk')) {
              map.setPaintProperty(layer.id, 'line-color', motorwayCasing);
            } else if (layer.id.includes('primary') || layer.id.includes('secondary') || layer.id.includes('tertiary')) {
              map.setPaintProperty(layer.id, 'line-color', midRoadCasing);
            } else {
              map.setPaintProperty(layer.id, 'line-color', localRoadCasing);
            }
          } else {
            if (layer.id.includes('motorway') || layer.id.includes('trunk')) {
              map.setPaintProperty(layer.id, 'line-color', motorwayColor);
            } else if (layer.id.includes('primary') || layer.id.includes('secondary') || layer.id.includes('tertiary')) {
              map.setPaintProperty(layer.id, 'line-color', midRoadColor);
            } else {
              map.setPaintProperty(layer.id, 'line-color', localRoadColor);
            }
          }
        }

        // Customize 2D & 3D buildings color to make them translucent, soft glass footprints
        if (layer.id === 'building-3d' || layer.id === 'building') {
          if (layer.type === 'fill-extrusion') {
            map.setPaintProperty(layer.id, 'fill-extrusion-color', buildingColor);
            map.setPaintProperty(layer.id, 'fill-extrusion-opacity', isNight ? 0.45 : 0.55);
          } else if (layer.type === 'fill') {
            map.setPaintProperty(layer.id, 'fill-color', buildingColor);
            try {
              map.setPaintProperty(layer.id, 'fill-opacity', isNight ? 0.35 : 0.45);
            } catch (e) {}
          }
        }

        // Customize text labels (countries, cities, districts, streets) for high dark-mode readability
        if (layer.type === 'symbol') {
          const isBasemapLabel = layer.id !== 'places-layer';
          if (isBasemapLabel) {
            try {
              map.setPaintProperty(layer.id, 'text-color', labelTextColor);
              map.setPaintProperty(layer.id, 'text-halo-color', labelTextHaloColor);
              map.setPaintProperty(layer.id, 'text-halo-width', 1.5);
            } catch (e) {}
          }
        }
      });
    }

    // Dynamic places labels halo color to match theme backdrops
    if (map.getLayer('places-layer')) {
      map.setPaintProperty('places-layer', 'text-halo-color', labelTextHaloColor);
    }
  } catch (err) {
    console.error('Error applying dynamic style paint properties:', err);
  }
}

// Custom DOM Marker creator helper for Venues
function createMarkerElement(venue: Venue, isSelected: boolean, onClick: () => void) {
  const el = document.createElement('div');
  el.className = `custom-marker ${isSelected ? 'selected' : ''}`;
  
  // Set custom category color for neon glows
  const glowColor = getCategoryColor(venue.category);
  el.style.setProperty('--category-glow-color', glowColor);

  el.innerHTML = `
    <div class="custom-marker-ring"></div>
    <div class="custom-marker-icon" style="color: ${glowColor}; border-color: ${glowColor};">
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" style="width: 16px; height: 16px;">
        <path stroke-linecap="round" stroke-linejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
        <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
      </svg>
    </div>
    <div class="custom-marker-tooltip">
      <div class="tooltip-content">
        <p class="tooltip-title">${venue.name}</p>
        <p class="tooltip-subtitle" style="text-transform: capitalize;">${venue.category.replace(/_/g, ' ')} • ★ ${venue.weight}</p>
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
  const starfieldRef = useRef<MaplibreStarfieldLayer | null>(null);

  const center = useStore(mapCenter);
  const zoom = useStore(mapZoom);
  const venueList = useStore(venues);
  const currentSelectedVenue = useStore(selectedVenue);
  const currentActiveSession = useStore(activeSession);
  const currentUserLocation = useStore(userLocation);

  const [currentHour, setCurrentHour] = useState<number>(new Date().getHours());

  // Sync style with currentHour changes using ultra-fast paint property updates (runs smoothly at 60fps directly on the GPU)
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !map.isStyleLoaded()) return;

    applyThemeForHour(map, currentHour);


    // Also sync the global HTML document theme attribute
    let activeTheme = 'day';
    if (currentHour >= 20 || currentHour < 5) activeTheme = 'night';
    else if (currentHour >= 5 && currentHour < 8) activeTheme = 'sunrise';
    else if (currentHour >= 8 && currentHour < 17) activeTheme = 'day';
    else activeTheme = 'sunset';
    document.documentElement.setAttribute('data-theme', activeTheme);
  }, [currentHour]);

  // 1. Initialize Map instance
  useEffect(() => {
    if (!mapContainerRef.current) return;

    const map = new maplibregl.Map({
      container: mapContainerRef.current,
      style: 'https://tiles.openfreemap.org/styles/liberty',
      validate: false, // Disable strict validation to allow experimental sky/fog properties
      center: [...center],
      zoom: zoom,
      minZoom: 1.5,
      pitch: 45,
      bearing: -10,
      maxPitch: 70,
      pitchWithRotate: true,
      dragRotate: true,
      touchZoomRotate: true,
      attributionControl: false,
    });

    mapRef.current = map;

    const handlePoiClick = (e: any) => {
      const features = map.queryRenderedFeatures(e.point, {
        layers: ['places-layer']
      });
      if (!features.length) return;

      const feature = features[0];
      const lngLat = (feature.geometry as any).coordinates.slice();
      const { name, category, address } = feature.properties || {};

      const venueId = feature.properties?.id || String(Math.random());
      const weight = parseFloat((4.0 + (Math.abs((name || '').split('').reduce((acc: number, char: string) => acc + char.charCodeAt(0), 0)) % 10) / 10).toFixed(1));

      const venue: Venue = {
        id: venueId,
        name: name || 'Venue',
        category: category || 'Uncategorized',
        coordinates: [lngLat[0], lngLat[1]],
        address: address || 'Indonesia',
        weight
      };

      selectVenue(venue);
    };

    const handleMouseEnter = () => {
      map.getCanvas().style.cursor = 'pointer';
    };

    const handleMouseLeave = () => {
      map.getCanvas().style.cursor = '';
    };

    // Force Globe projection once the style is loaded for Mapbox GL feel
    map.on('style.load', () => {
      // Register custom phosphor icons to map, then execute layer setup inside the callback
      registerMapIcons(map, () => {
        try {
          if (typeof map.setProjection === 'function') {
            map.setProjection({ type: 'globe' });
          }
        } catch (err) {
          console.warn('Globe projection not supported on this maplibre version/environment:', err);
        }

        // Add Three.js starfield skybox — pure point stars, no galaxy texture
        try {
          if (!map.getLayer('starfield')) {
            const starfield = new MaplibreStarfieldLayer({
              id: 'starfield',
              starCount: 10000,
              starSize: 2.5,
              starColor: 0xffffff,
            });
            // Insert above background layer so stars render on top of space background but behind features
            const layers = map.getStyle().layers || [];
            const bgIndex = layers.findIndex((l: any) => l.id === 'background');
            const insertBeforeId = bgIndex !== -1 && bgIndex + 1 < layers.length ? layers[bgIndex + 1].id : undefined;
            map.addLayer(starfield as any, insertBeforeId);

            // Enable depth testing so stars are occluded by the globe sphere
            const sfAny = starfield as any;
            if (sfAny.starMaterial) {
              sfAny.starMaterial.depthTest = true;
            }
            if (sfAny.sunMaterial) {
              sfAny.sunMaterial.depthTest = true;
            }

            starfieldRef.current = starfield;
          }
        } catch (err) {
          console.warn('Starfield layer init failed:', err);
        }

        // Configure the 3D building zoom transition
        try {
          const hasExistingLayer = map.getLayer('building-3d');
          if (hasExistingLayer) {
            map.setLayerZoomRange('building-3d', 13, 24);
          }
        } catch (err) {
          console.warn('Error setting building zoom range:', err);
        }

        // Apply initial theme properties for current hour
        applyThemeForHour(map, currentHour);

        // Remove default map POIs to avoid overlap with Foursquare places
        try {
          const layers = map.getStyle().layers;
          if (layers) {
            layers.forEach((layer) => {
              const isPoi = layer.id.includes('poi') || 
                            (layer['source-layer'] && layer['source-layer'].includes('poi')) ||
                            (layer.sourceLayer && layer.sourceLayer.includes('poi'));
              
              // Do NOT remove our own custom places layers
              const isCustomLayer = layer.id.includes('places');
              
              if (isPoi && !isCustomLayer) {
                map.removeLayer(layer.id);
              }
            });
          }
        } catch (err) {
          console.warn('Error removing default POI layers:', err);
        }

        // Add places source if it doesn't exist
        if (!map.getSource('places')) {
          map.addSource('places', {
            type: 'vector',
            url: `${window.location.origin}/tiles/get_places`
          });
        }

        // Add places layers if they don't exist
        if (!map.getLayer('places-layer')) {
          const colors = {
            colorFood: '#f59e0b',
            colorTransit: '#3b82f6',
            colorNature: '#10b981',
            colorArts: '#06b6d4',
            colorCommunity: '#a855f7',
            colorDefault: '#64748b'
          };

          map.addLayer({
            id: 'places-layer',
            type: 'symbol',
            source: 'places',
            'source-layer': 'places',
            layout: {
              // Icon layout properties
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
              'icon-allow-overlap': false,
              'icon-ignore-placement': false,
              'icon-padding': 10,
              'icon-optional': false,

              // Text layout properties
              'text-field': [
                'step',
                ['zoom'],
                '',
                14.5, ['get', 'name']
              ],
              'text-font': ['Noto Sans Regular'],
              'text-size': [
                'interpolate',
                ['linear'],
                ['zoom'],
                14.5, 9,
                18, 12
              ],
              'text-variable-anchor': ['right', 'left', 'top', 'bottom'],
              'text-radial-offset': 1.2,
              'text-justify': 'auto',
              'text-padding': 8,
              'text-max-width': 7,
              'text-allow-overlap': false,
              'text-ignore-placement': false,
              'text-optional': true,

              // Priority sorting key
              'symbol-sort-key': ['get', 'density_rank']
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
        }

        // Safe event registration (off first then on)
        map.off('click', 'places-layer', handlePoiClick);
        map.on('click', 'places-layer', handlePoiClick);

        map.off('mouseenter', 'places-layer', handleMouseEnter);
        map.on('mouseenter', 'places-layer', handleMouseEnter);

        map.off('mouseleave', 'places-layer', handleMouseLeave);
        map.on('mouseleave', 'places-layer', handleMouseLeave);
      });
    });

    map.on('moveend', () => {
      const newCenter = map.getCenter();
      const newZoom = map.getZoom();
      mapCenter.set([newCenter.lng, newCenter.lat]);
      mapZoom.set(newZoom);
    });

    map.on('idle', () => {
      const features = map.queryRenderedFeatures(undefined, {
        layers: ['places-layer']
      });

      const uniqueVenuesMap = new Map<string, Venue>();
      features.forEach((feature) => {
        const name = feature.properties?.name;
        if (!name) return;

        const lngLat = (feature.geometry as any).coordinates;
        if (!lngLat || lngLat.length < 2) return;

        const venueId = feature.properties?.id || name;
        if (uniqueVenuesMap.has(venueId)) return;

        const category = feature.properties?.category || 'Venue';
        const address = feature.properties?.address || 'Indonesia';
        const weight = parseFloat((4.0 + (Math.abs(name.split('').reduce((acc: number, char: string) => acc + char.charCodeAt(0), 0)) % 10) / 10).toFixed(1));

        uniqueVenuesMap.set(venueId, {
          id: venueId,
          name,
          category,
          coordinates: [lngLat[0], lngLat[1]],
          address,
          weight
        });
      });

      const detectedVenues = Array.from(uniqueVenuesMap.values()).slice(0, 30);
      if (detectedVenues.length > 0) {
        import('@/store/mapStore').then(({ venues }) => {
          const currentVenues = venues.get();
          const currentIds = currentVenues.map(v => v.id).join(',');
          const newIds = detectedVenues.map(v => v.id).join(',');
          if (currentIds !== newIds) {
            venues.set(detectedVenues);
          }
        });
      }
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

  // 4. Synchronize selected Venue marker
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    // Clean up old markers
    Object.keys(markersRef.current).forEach((id) => {
      markersRef.current[id].remove();
    });
    markersRef.current = {};

    if (currentSelectedVenue) {
      const el = createMarkerElement(currentSelectedVenue, true, () => {
        map.flyTo({
          center: [...currentSelectedVenue.coordinates],
          zoom: Math.max(map.getZoom(), 15.5),
          pitch: 55,       // Cinematic 3D buildings tilt
          bearing: -15,     // Cyberpunk angle rotation
          duration: 1200,
          essential: true,
          offset: [0, window.innerHeight * 0.12] 
        });
      });

      const marker = new maplibregl.Marker({ element: el })
        .setLngLat([...currentSelectedVenue.coordinates])
        .addTo(map);

      markersRef.current[currentSelectedVenue.id] = marker;
    }
  }, [currentSelectedVenue]);

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
        <div class="user-radar-ring ring-1"></div>
        <div class="user-radar-ring ring-2"></div>
        <div class="user-radar-ring ring-3"></div>
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

  // 7. Update fireflies positions when venues change


  const displayHour = Math.floor(currentHour);
  const displayMinutes = Math.floor((currentHour - displayHour) * 60);
  const clockText = `${String(displayHour).padStart(2, '0')}:${String(displayMinutes).padStart(2, '0')}`;

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', backgroundColor: '#02040a', overflow: 'hidden' }}>
      <div ref={mapContainerRef} style={{ width: '100%', height: '100%' }} />
      
      {/* Floating Time of Day Slider Widget */}
      <div className="time-slider-widget glass-panel">
        <div className="time-slider-header">
          <div className="time-slider-title-group">
            <span className="time-slider-icon">
              {currentHour >= 20 || currentHour < 5 ? '🌙' : 
               currentHour >= 5 && currentHour < 8 ? '🌅' : 
               currentHour >= 8 && currentHour < 17 ? '☀️' : '🌇'}
            </span>
            <div>
              <h4 className="time-slider-title">Waktu Map</h4>
              <p className="time-slider-desc">
                {currentHour >= 20 || currentHour < 5 ? 'Malam (Cosmic Neon)' : 
                 currentHour >= 5 && currentHour < 8 ? 'Pagi (Rose Sunrise)' : 
                 currentHour >= 8 && currentHour < 17 ? 'Siang (Crisp Warm Day)' : 'Sore (Golden Sunset)'}
              </p>
            </div>
          </div>
          <span className="time-slider-clock">
            {clockText}
          </span>
        </div>

        <input 
          type="range" 
          min="0" 
          max="23.95" 
          step="0.05"
          value={currentHour} 
          onChange={(e) => setCurrentHour(parseFloat(e.target.value))}
          className="time-slider-range"
        />

        <div className="time-slider-presets">
          <button 
            type="button"
            className={`time-preset-btn ${currentHour >= 5 && currentHour < 8 ? 'active' : ''}`}
            onClick={() => setCurrentHour(6)}
          >
            🌅 Pagi
          </button>
          <button 
            type="button"
            className={`time-preset-btn ${currentHour >= 8 && currentHour < 17 ? 'active' : ''}`}
            onClick={() => setCurrentHour(12)}
          >
            ☀️ Siang
          </button>
          <button 
            type="button"
            className={`time-preset-btn ${currentHour >= 17 && currentHour < 20 ? 'active' : ''}`}
            onClick={() => setCurrentHour(18)}
          >
            🌇 Sore
          </button>
          <button 
            type="button"
            className={`time-preset-btn ${currentHour >= 20 || currentHour < 5 ? 'active' : ''}`}
            onClick={() => setCurrentHour(21)}
          >
            🌙 Malam
          </button>
        </div>
      </div>
    </div>
  );
}
