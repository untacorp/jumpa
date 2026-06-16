import urllib.request
import urllib.parse
import json
import sys
import os
import time

def main():
    print("=== Querying Overpass API for Indonesia POIs ===")
    
    # Partitioning Indonesia into sub-regions to prevent timeouts and out-of-memory errors on Overpass servers
    sub_regions = [
        {"name": "Sumatra West", "bbox": "-6.0,95.0,6.0,102.0"},
        {"name": "Sumatra East", "bbox": "-6.0,102.0,6.0,109.0"},
        {"name": "Java West", "bbox": "-9.0,105.0,-5.5,109.0"},
        {"name": "Java Central", "bbox": "-9.0,109.0,-6.0,112.5"},
        {"name": "Java East", "bbox": "-9.0,112.5,-6.0,116.0"},
        {"name": "Bali", "bbox": "-8.9,114.4,-8.0,115.8"},
        {"name": "Nusa Tenggara", "bbox": "-11.0,115.8,-8.0,128.0"},
        {"name": "Kalimantan West", "bbox": "-4.5,108.0,4.5,114.0"},
        {"name": "Kalimantan East", "bbox": "-4.5,114.0,4.5,120.0"},
        {"name": "Sulawesi South", "bbox": "-6.0,118.0,-2.0,126.0"},
        {"name": "Sulawesi North", "bbox": "-2.0,118.0,2.0,126.0"},
        {"name": "Maluku", "bbox": "-9.0,124.0,1.0,135.0"},
        {"name": "Papua", "bbox": "-9.0,135.0,1.0,141.0"}
    ]
    
    # Category mapping helper
    def map_category(tags):
        amenity = tags.get('amenity')
        shop = tags.get('shop')
        tourism = tags.get('tourism')
        leisure = tags.get('leisure')
        historic = tags.get('historic')
        religion = tags.get('religion')
        
        if amenity == 'cafe': return 'cafe'
        if amenity == 'restaurant': return 'restaurant'
        if amenity == 'fast_food': return 'fast_food_restaurant'
        if amenity == 'food_court': return 'food_court'
        if shop == 'bakery': return 'bakery'
        
        if tourism == 'hotel': return 'hotel'
        if tourism == 'hostel': return 'hostel'
        if tourism == 'resort': return 'resort'
        
        if amenity == 'bus_station': return 'bus_station'
        if tags.get('highway') == 'bus_stop': return 'bus_stop'
        
        if shop == 'mall': return 'shopping_mall'
        if shop == 'department_store': return 'department_store'
        
        if leisure == 'park': return 'park'
        if tourism == 'attraction': return 'tourist_attraction'
        if historic in ('monument', 'memorial'): return 'landmark_and_historical_building'
        
        if tourism == 'museum': return 'museum'
        if amenity == 'cinema': return 'cinema'
        if amenity == 'theatre': return 'theater'
        
        if amenity == 'place_of_worship':
            if religion == 'muslim': return 'mosque'
            if religion in ('christian', 'catholic'): return 'church_cathedral'
            if religion == 'hindu': return 'temple'
            
        if amenity == 'school': return 'school'
        if amenity in ('university', 'college'): return 'college_university'
        if amenity == 'library': return 'library'
        if leisure == 'playground': return 'playground'
        if leisure == 'sports_centre': return 'sports_complex'
        
        if amenity in ('bar', 'pub', 'biergarten'): return 'restaurant'
        if amenity == 'clinic': return 'hospital'
        
        return None

    sql_statements = []
    total_elements_fetched = 0
    total_mapped_pois = 0
    
    url = "https://overpass-api.de/api/interpreter"
    
    for idx, region in enumerate(sub_regions):
        print(f"\n[{idx+1}/{len(sub_regions)}] Fetching POIs for {region['name']} (BBOX: {region['bbox']})...")
        
        # Overpass QL query for this bbox
        query = f"""
        [out:json][timeout:180];
        (
          node["amenity"]({region['bbox']});
          node["shop"]({region['bbox']});
          node["tourism"]({region['bbox']});
          node["historic"]({region['bbox']});
          node["leisure"]({region['bbox']});
          
          way["amenity"]({region['bbox']});
          way["shop"]({region['bbox']});
          way["tourism"]({region['bbox']});
          way["historic"]({region['bbox']});
          way["leisure"]({region['bbox']});
        );
        out center;
        """
        
        data = urllib.parse.urlencode({'data': query}).encode('utf-8')
        
        try:
            req = urllib.request.Request(url, data=data, headers={'User-Agent': 'JumpaPOIExtractor/1.0'})
            with urllib.request.urlopen(req) as response:
                result = json.loads(response.read().decode('utf-8'))
        except Exception as e:
            print(f"Error fetching data for {region['name']}: {e}", file=sys.stderr)
            print("Skipping to next region in 5 seconds...")
            time.sleep(5)
            continue
            
        elements = result.get('elements', [])
        print(f"  Retrieved {len(elements)} raw elements.")
        total_elements_fetched += len(elements)
        
        region_mapped_count = 0
        for el in elements:
            tags = el.get('tags', {})
            name = tags.get('name')
            if not name:
                continue
                
            # Filter out generic/useless names and very short placeholders
            name_lower = name.strip().lower()
            if name_lower in ('hotel', 'pura', 'sd', 'villa', 'vila', 'warung', 'resto', 'rumah', 'masjid', 'gereja', 'apotek', 'toko', 'sekolah', 'puskesmas'):
                continue
            if len(name.strip()) <= 2 and name_lower not in ('kfc', 'jfc', 'ack', 'xxi', 'bca', 'bri', 'bni', 'tix', 'uno'):
                continue
                
            name = name.replace("'", "''")
            
            lat = el.get('lat')
            lon = el.get('lon')
            if lat is None or lon is None:
                center = el.get('center', {})
                lat = center.get('lat')
                lon = center.get('lon')
                
            if lat is None or lon is None:
                continue
                
            category = map_category(tags)
            if not category:
                continue
                
            osm_id = f"osm/{el.get('type')}/{el.get('id')}"
            address = tags.get('addr:street', '')
            if address:
                address = address.replace("'", "''")
            else:
                address = f"{region['name']}, Indonesia"
                
            city = tags.get('addr:city', region['name'])
            city = city.replace("'", "''")
            
            # Map category to category_group
            category_group = 'community'
            if category in ('coffee_shop', 'cafe', 'restaurant', 'indonesian_restaurant', 'asian_restaurant', 'chinese_restaurant', 'noodles_restaurant', 'fast_food_restaurant', 'chicken_restaurant', 'japanese_restaurant', 'bakery', 'food_court', 'dessert_shop', 'ice_cream_parlor', 'tea_room', 'juice_bar', 'food_truck'):
                category_group = 'food'
            elif category in ('hotel', 'accommodation', 'hostel', 'resort', 'airport', 'train_station', 'metro_station', 'bus_station', 'bus_stop', 'shopping_center', 'shopping_mall', 'department_store', 'landmark_and_historical_building'):
                category_group = 'transit_shopping'
            elif category in ('park', 'tourist_attraction', 'plaza', 'scenic_lookout'):
                category_group = 'nature'
            elif category in ('art_gallery', 'museum', 'theater', 'cinema', 'music_venue', 'cultural_center', 'arts_and_entertainment', 'sports_club', 'stadium', 'sports_complex', 'playground', 'gym_fitness_center', 'recreation_center'):
                category_group = 'arts_sports'
            
            sql = f"INSERT INTO places (id, name, latitude, longitude, geom, category, category_group, address, city, country, confidence) VALUES ('{osm_id}', '{name}', {lat}, {lon}, ST_SetSRID(ST_Point({lon}, {lat}), 4326), '{category}', '{category_group}', '{address}', '{city}', 'ID', 1.0) ON CONFLICT (id) DO NOTHING;"
            sql_statements.append(sql)
            region_mapped_count += 1
            
        print(f"  Mapped {region_mapped_count} POIs to valid system categories.")
        total_mapped_pois += region_mapped_count
        
        # Be nice to Overpass API and sleep between region queries
        if idx < len(sub_regions) - 1:
            print("Sleeping for 5 seconds to prevent rate limits...")
            time.sleep(5)
            
    print("\n=== Fetching Completed ===")
    print(f"Total elements fetched: {total_elements_fetched}")
    print(f"Total mapped POIs: {total_mapped_pois}")
    
    # Write to SQL script
    output_path = "scratch/seed_indonesia.sql"
    with open(output_path, 'w') as f:
        f.write("BEGIN;\n")
        f.write("\n".join(sql_statements))
        f.write("\nCOMMIT;\n")
        
    print(f"SQL seed script written to {output_path}")
    print(f"Run the following command to load it into your database:")
    print(f"docker exec -i jumpa-postgres-1 psql -U postgres -d jumpa < scratch/seed_indonesia.sql")

if __name__ == "__main__":
    main()
