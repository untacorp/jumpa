export interface MapTheme {
  background: string;
  earth: string;
  water: string;
  landuse: string;
  roadsCasing: string;
  roads: string;
  buildings: string;
  buildingsOpacity: number;
}

// 4 time-based adaptive themes
export const getThemeForHour = (hour: number): MapTheme => {
  // Night: 20:00 - 05:00 (Cyberpunk Neon)
  if (hour >= 20 || hour < 5) {
    return {
      background: '#02040a',
      earth: '#0b0f19',
      water: '#082f49',
      landuse: '#111827',
      roadsCasing: '#1f2937',
      roads: '#0891b2', // glowing cyan
      buildings: '#1e293b',
      buildingsOpacity: 0.8
    };
  }
  // Sunrise/Morning: 05:00 - 08:00 (Deep Purple/Violet Sunrise)
  if (hour >= 5 && hour < 8) {
    return {
      background: '#0c0a1c',
      earth: '#131024',
      water: '#4c0519', // deep wine
      landuse: '#1c0d24',
      roadsCasing: '#2e1065',
      roads: '#a855f7', // violet
      buildings: '#3b0764',
      buildingsOpacity: 0.75
    };
  }
  // Day: 08:00 - 17:00 (Sleek Clean Light)
  if (hour >= 8 && hour < 17) {
    return {
      background: '#f8fafc',
      earth: '#f1f5f9',
      water: '#bae6fd', // light blue
      landuse: '#e2e8f0',
      roadsCasing: '#cbd5e1',
      roads: '#ffffff',
      buildings: '#cbd5e1',
      buildingsOpacity: 0.65
    };
  }
  // Sunset/Dusk: 17:00 - 20:00 (Warm Amber Sunset)
  return {
    background: '#1c0c14',
    earth: '#23101b',
    water: '#581c0c', // dark amber
    landuse: '#2e1223',
    roadsCasing: '#4c0519',
    roads: '#f97316', // orange glow
    buildings: '#450a0a',
    buildingsOpacity: 0.75
  };
};

export const getMapStyle = (origin: string, hour: number) => {
  const theme = getThemeForHour(hour);

  return {
    version: 8,
    sources: {
      protomaps: {
        type: 'vector',
        tiles: [
          `${origin}/tiles/indonesia/{z}/{x}/{y}`
        ],
        minzoom: 0,
        maxzoom: 15
      }
    },
    glyphs: 'https://fonts.openmaptiles.org/{fontstack}/{range}.pbf',
    layers: [
      {
        id: 'background',
        type: 'background',
        paint: {
          'background-color': theme.background
        }
      },
      {
        id: 'earth',
        type: 'fill',
        source: 'protomaps',
        'source-layer': 'earth',
        paint: {
          'fill-color': theme.earth
        }
      },
      {
        id: 'water',
        type: 'fill',
        source: 'protomaps',
        'source-layer': 'water',
        paint: {
          'fill-color': theme.water
        }
      },
      {
        id: 'landuse',
        type: 'fill',
        source: 'protomaps',
        'source-layer': 'landuse',
        paint: {
          'fill-color': theme.landuse
        }
      },
      {
        id: 'roads-casing',
        type: 'line',
        source: 'protomaps',
        'source-layer': 'roads',
        paint: {
          'line-color': theme.roadsCasing,
          'line-width': 1.5
        }
      },
      {
        id: 'roads',
        type: 'line',
        source: 'protomaps',
        'source-layer': 'roads',
        paint: {
          'line-color': theme.roads,
          'line-width': 1
        }
      },
      // 3D Buildings Extrusion using fill-extrusion type
      {
        id: 'buildings-3d',
        type: 'fill-extrusion',
        source: 'protomaps',
        'source-layer': 'buildings',
        paint: {
          'fill-extrusion-color': theme.buildings,
          'fill-extrusion-height': [
            'coalesce',
            ['get', 'height'],
            15 // Default height if not specified in OSM data
          ],
          'fill-extrusion-base': [
            'coalesce',
            ['get', 'min_height'],
            0
          ],
          'fill-extrusion-opacity': theme.buildingsOpacity
        }
      }
    ]
  };
};
