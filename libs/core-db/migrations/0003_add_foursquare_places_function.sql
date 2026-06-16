-- Migration: 0003_add_foursquare_places_function.sql
-- Create custom MVT function source for adaptive POI density rendering

-- Dropping it first to clean up sign changes if any
DROP FUNCTION IF EXISTS public.get_foursquare_places(integer, integer, integer);

CREATE OR REPLACE FUNCTION public.get_foursquare_places(z integer, x integer, y integer)
RETURNS bytea AS $$
DECLARE
  mvt bytea;
  tile_bbox geometry;
BEGIN
  -- 1. Compute tile bounding box in Web Mercator (SRID 3857)
  tile_bbox := ST_TileEnvelope(z, x, y);

  -- 2. Generate MVT bytea directly
  SELECT INTO mvt ST_AsMVT(tile, 'foursquare_places', 4096, 'mvt_geom')
  FROM (
    SELECT 
      id,
      name,
      category,
      address,
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
        ROW_NUMBER() OVER (
          ORDER BY 
            -- Re-architected priority tiers for Jumpa (smaller number = higher priority)
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
        ) AS rank
      FROM foursquare_places
      WHERE geom && ST_Transform(tile_bbox, 4326)
        AND category IN (
          -- Whitelist of whitelisted categories (matching case statements above)
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
    ) ranked
    WHERE 
      (z >= 16)
      -- Show higher tiers progressively at zoom levels 12-15
      OR (z = 15 AND rank <= 65)
      OR (z = 14 AND rank <= 30)
      OR (z = 13 AND rank <= 12)
      -- At zoom 12, show only Tier 1 & 2 items that are highly ranked
      OR (z = 12 AND rank <= 5 AND category IN (
        'coffee_shop', 'cafe', 'restaurant', 'indonesian_restaurant', 'park', 'tourist_attraction', 'plaza',
        'hotel', 'airport', 'train_station', 'metro_station', 'shopping_center', 'shopping_mall', 'landmark_and_historical_building'
      ))
      -- At zoom < 12, show only absolute top landmark/transit points
      OR (z < 12 AND rank <= 2 AND category IN (
        'airport', 'train_station', 'metro_station', 'shopping_center', 'shopping_mall', 'landmark_and_historical_building'
      ))
  ) AS tile;

  RETURN mvt;
END;
$$ LANGUAGE plpgsql IMMUTABLE STRICT PARALLEL SAFE;
