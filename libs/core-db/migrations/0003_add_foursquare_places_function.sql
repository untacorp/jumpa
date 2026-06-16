-- Migration: 0003_add_foursquare_places_function.sql
-- Create custom MVT function source for adaptive POI density rendering with grid-based spatial partition thinning

-- Dropping it first to clean up sign changes if any
DROP FUNCTION IF EXISTS public.get_foursquare_places(integer, integer, integer);

CREATE OR REPLACE FUNCTION public.get_foursquare_places(z integer, x integer, y integer)
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
  -- We split the tile into an N x N grid and thin features per cell.
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
  SELECT INTO mvt ST_AsMVT(tile, 'foursquare_places', 4096, 'mvt_geom')
  FROM (
    SELECT 
      id,
      name,
      category,
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
        category,
        address,
        geom,
        -- Combined global rank for sorting on client
        ROW_NUMBER() OVER (
          ORDER BY 
            CASE 
              -- Tier 1: Dining, Drinking & Public Parks/Outdoors (Core hangout/social points)
              WHEN category IN (
                'coffee_shop', 'cafe', 'restaurant', 'indonesian_restaurant', 'asian_restaurant', 
                'chinese_restaurant', 'noodles_restaurant', 'fast_food_restaurant', 'chicken_restaurant', 
                'japanese_restaurant', 'bakery', 'food_court', 'dessert_shop', 'ice_cream_parlor', 
                'tea_room', 'juice_bar', 'food_truck', 'park', 'tourist_attraction', 'plaza', 'scenic_lookout'
              ) THEN 1
              
              -- Tier 2: Transit Hubs, Hotels & Major Malls (Crucial start/end points & landmarks)
              WHEN category IN (
                'hotel', 'accommodation', 'hostel', 'resort', 'airport', 
                'train_station', 'metro_station', 'bus_station', 'bus_stop', 
                'shopping_center', 'shopping_mall', 'department_store', 'landmark_and_historical_building'
              ) THEN 2
              
              -- Tier 3: Arts, Culture, Entertainment & Sports (Social events & recreation)
              WHEN category IN (
                'art_gallery', 'museum', 'theater', 'cinema', 'music_venue', 
                'cultural_center', 'arts_and_entertainment', 'sports_club', 'stadium', 
                'sports_complex', 'playground', 'gym_fitness_center', 'recreation_center'
              ) THEN 3
              
              -- Tier 4: Community, Religion & Education (Local hubs/reference points)
              WHEN category IN (
                'mosque', 'church_cathedral', 'temple', 'community_center', 'library', 
                'school', 'education', 'college_university', 'elementary_school', 'high_school'
              ) THEN 4
              
              ELSE 5
            END ASC,
            abs(hashtext(foursquare_id)) ASC
        ) AS density_rank,
        -- Rank within grid cell to apply spatial thinning
        ROW_NUMBER() OVER (
          PARTITION BY 
            floor(((ST_X(ST_Transform(geom, 3857)) - t_xmin) / NULLIF(t_xmax - t_xmin, 0)) * grid_size),
            floor(((ST_Y(ST_Transform(geom, 3857)) - t_ymin) / NULLIF(t_ymax - t_ymin, 0)) * grid_size)
          ORDER BY 
            CASE 
              WHEN category IN (
                'coffee_shop', 'cafe', 'restaurant', 'indonesian_restaurant', 'asian_restaurant', 
                'chinese_restaurant', 'noodles_restaurant', 'fast_food_restaurant', 'chicken_restaurant', 
                'japanese_restaurant', 'bakery', 'food_court', 'dessert_shop', 'ice_cream_parlor', 
                'tea_room', 'juice_bar', 'food_truck', 'park', 'tourist_attraction', 'plaza', 'scenic_lookout'
              ) THEN 1
              WHEN category IN (
                'hotel', 'accommodation', 'hostel', 'resort', 'airport', 
                'train_station', 'metro_station', 'bus_station', 'bus_stop', 
                'shopping_center', 'shopping_mall', 'department_store', 'landmark_and_historical_building'
              ) THEN 2
              WHEN category IN (
                'art_gallery', 'museum', 'theater', 'cinema', 'music_venue', 
                'cultural_center', 'arts_and_entertainment', 'sports_club', 'stadium', 
                'sports_complex', 'playground', 'gym_fitness_center', 'recreation_center'
              ) THEN 3
              WHEN category IN (
                'mosque', 'church_cathedral', 'temple', 'community_center', 'library', 
                'school', 'education', 'college_university', 'elementary_school', 'high_school'
              ) THEN 4
              ELSE 5
            END ASC,
            abs(hashtext(foursquare_id)) ASC
        ) AS rank_in_cell
      FROM foursquare_places
      WHERE geom && ST_Transform(tile_bbox, 4326)
        AND category IN (
          'coffee_shop', 'cafe', 'restaurant', 'indonesian_restaurant', 'asian_restaurant', 
          'chinese_restaurant', 'noodles_restaurant', 'fast_food_restaurant', 'chicken_restaurant', 
          'japanese_restaurant', 'bakery', 'food_court', 'dessert_shop', 'ice_cream_parlor', 
          'tea_room', 'juice_bar', 'food_truck', 'park', 'tourist_attraction', 'plaza', 'scenic_lookout',
          'hotel', 'accommodation', 'hostel', 'resort', 'airport', 
          'train_station', 'metro_station', 'bus_station', 'bus_stop', 
          'shopping_center', 'shopping_mall', 'department_store', 'landmark_and_historical_building',
          'art_gallery', 'museum', 'theater', 'cinema', 'music_venue', 'cultural_center', 'arts_and_entertainment',
          'sports_club', 'stadium', 'sports_complex', 'playground', 'gym_fitness_center', 'recreation_center',
          'mosque', 'church_cathedral', 'temple', 'community_center', 'library', 'school', 'education', 
          'college_university', 'elementary_school', 'high_school'
        )
    ) cell_ranked
    WHERE rank_in_cell <= max_per_cell
  ) AS tile;

  RETURN mvt;
END;
$$ LANGUAGE plpgsql IMMUTABLE STRICT PARALLEL SAFE;
