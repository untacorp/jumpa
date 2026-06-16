-- Migration: 0002_add_foursquare_places_schema.sql
-- Create table for Foursquare POI dataset with PostGIS spatial column

CREATE TABLE IF NOT EXISTS foursquare_places (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    foursquare_id VARCHAR(64) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    geom GEOMETRY(Point, 4326) NOT NULL,
    category VARCHAR(128),
    address TEXT,
    city VARCHAR(100),
    country VARCHAR(10),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Spatial index for efficient bounding-box query operations
CREATE INDEX IF NOT EXISTS idx_foursquare_places_geom ON foursquare_places USING GIST (geom);

-- standard B-Tree index for filtering by venue category
CREATE INDEX IF NOT EXISTS idx_foursquare_places_category ON foursquare_places (category);
