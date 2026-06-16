-- Migration: 0004_generalize_to_universal_places.sql
-- Drop old get_foursquare_places function
DROP FUNCTION IF EXISTS public.get_foursquare_places(integer, integer, integer);

-- Create new universal places table
CREATE TABLE IF NOT EXISTS public.places (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    category VARCHAR(128),               -- Made nullable to accommodate legacy null values
    category_group VARCHAR(64) NOT NULL, -- 'food', 'transit_shopping', 'nature', 'arts_sports', 'community'
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    geom GEOMETRY(Point, 4326) NOT NULL,
    address TEXT,
    city VARCHAR(100),
    region VARCHAR(100),
    postcode VARCHAR(20),
    country VARCHAR(10) DEFAULT 'ID',
    website VARCHAR(512),
    phone VARCHAR(64),
    operating_status VARCHAR(64) DEFAULT 'operating',
    confidence DOUBLE PRECISION NOT NULL DEFAULT 1.0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Spatial and Filtering Indexes
CREATE INDEX IF NOT EXISTS idx_places_geom ON public.places USING GIST (geom);
CREATE INDEX IF NOT EXISTS idx_places_category ON public.places (category);
CREATE INDEX IF NOT EXISTS idx_places_category_group ON public.places (category_group);

-- Migrate existing data from foursquare_places to places if it exists
DO $$
BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'foursquare_places') THEN
    INSERT INTO public.places (id, name, category, category_group, latitude, longitude, geom, address, city, country, confidence)
    SELECT 
      foursquare_id AS id,
      name,
      COALESCE(category, 'uncategorized') AS category,
      CASE 
        WHEN category IN ('coffee_shop', 'cafe', 'restaurant', 'indonesian_restaurant', 'asian_restaurant', 'chinese_restaurant', 'noodles_restaurant', 'fast_food_restaurant', 'chicken_restaurant', 'japanese_restaurant', 'bakery', 'food_court', 'dessert_shop', 'ice_cream_parlor', 'tea_room', 'juice_bar', 'food_truck') THEN 'food'
        WHEN category IN ('hotel', 'accommodation', 'hostel', 'resort', 'airport', 'train_station', 'metro_station', 'bus_station', 'bus_stop', 'shopping_center', 'shopping_mall', 'department_store', 'landmark_and_historical_building') THEN 'transit_shopping'
        WHEN category IN ('park', 'tourist_attraction', 'plaza', 'scenic_lookout') THEN 'nature'
        WHEN category IN ('art_gallery', 'museum', 'theater', 'cinema', 'music_venue', 'cultural_center', 'arts_and_entertainment', 'sports_club', 'stadium', 'sports_complex', 'playground', 'gym_fitness_center', 'recreation_center') THEN 'arts_sports'
        ELSE 'community'
      END AS category_group,
      latitude,
      longitude,
      geom,
      address,
      city,
      country,
      1.0 AS confidence
    FROM public.foursquare_places
    ON CONFLICT (id) DO NOTHING;
    
    -- Drop old table to clean up database size
    DROP TABLE public.foursquare_places;
  END IF;
END $$;

-- Create get_places MVT function
CREATE OR REPLACE FUNCTION public.get_places(z integer, x integer, y integer)
RETURNS bytea AS $$
DECLARE
  mvt bytea;
  tile_bbox geometry;
  t_xmin double precision;
  t_xmax double precision;
  t_ymin double precision;
  t_ymax double precision;
  grid_size integer;
  max_per_cell integer;
BEGIN
  -- 1. Compute tile bounding box in Web Mercator (SRID 3857)
  tile_bbox := ST_TileEnvelope(z, x, y);
  t_xmin := ST_XMin(tile_bbox);
  t_xmax := ST_XMax(tile_bbox);
  t_ymin := ST_YMin(tile_bbox);
  t_ymax := ST_YMax(tile_bbox);

  -- 2. Define grid density based on zoom level
  IF z <= 12 THEN
    grid_size := 4;      -- 16 cells per tile
    max_per_cell := 1;
  ELSIF z = 13 THEN
    grid_size := 6;      -- 36 cells per tile
    max_per_cell := 1;
  ELSIF z = 14 THEN
    grid_size := 8;      -- 64 cells per tile
    max_per_cell := 1;
  ELSIF z = 15 THEN
    grid_size := 10;     -- 100 cells per tile
    max_per_cell := 2;
  ELSIF z = 16 THEN
    grid_size := 12;     -- 144 cells per tile
    max_per_cell := 3;
  ELSE
    grid_size := 16;     -- 256 cells per tile
    max_per_cell := 5;
  END IF;

  -- 3. Generate MVT bytea directly
  SELECT INTO mvt ST_AsMVT(tile, 'places', 4096, 'mvt_geom')
  FROM (
    SELECT 
      id,
      name,
      category,
      category_group,
      address,
      density_rank,
      ST_AsMVTGeom(
        ST_Transform(geom, 3857), 
        tile_bbox, 
        4096, 64, true
      ) AS mvt_geom
    FROM (
      SELECT 
        id,
        name,
        COALESCE(category, 'uncategorized') AS category,
        category_group,
        address,
        geom,
        -- Combined global rank for sorting on client
        ROW_NUMBER() OVER (
          ORDER BY 
            CASE 
              WHEN category_group = 'food' THEN 1
              WHEN category_group = 'transit_shopping' THEN 2
              WHEN category_group = 'nature' THEN 3
              WHEN category_group = 'arts_sports' THEN 4
              ELSE 5
            END ASC,
            confidence DESC,
            abs(hashtext(id)) ASC
        ) AS density_rank,
        -- Rank within grid cell to apply spatial thinning
        ROW_NUMBER() OVER (
          PARTITION BY 
            floor(((ST_X(ST_Transform(geom, 3857)) - t_xmin) / NULLIF(t_xmax - t_xmin, 0)) * grid_size),
            floor(((ST_Y(ST_Transform(geom, 3857)) - t_ymin) / NULLIF(t_ymax - t_ymin, 0)) * grid_size)
          ORDER BY 
            CASE 
              WHEN category_group = 'food' THEN 1
              WHEN category_group = 'transit_shopping' THEN 2
              WHEN category_group = 'nature' THEN 3
              WHEN category_group = 'arts_sports' THEN 4
              ELSE 5
            END ASC,
            confidence DESC,
            abs(hashtext(id)) ASC
        ) AS rank_in_cell
      FROM public.places
      WHERE geom && ST_Transform(tile_bbox, 4326)
    ) cell_ranked
    WHERE rank_in_cell <= max_per_cell
  ) AS tile;

  RETURN mvt;
END;
$$ LANGUAGE plpgsql IMMUTABLE STRICT PARALLEL SAFE;
