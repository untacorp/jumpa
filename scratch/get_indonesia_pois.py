import urllib.request
import urllib.parse
import json
import sys
import os
import time

def main():
    print("=== Querying Overpass API for Indonesia POIs (Province-by-Province) ===")
    
    # Official ISO 3166-2 province codes for Indonesia to avoid timeout errors
    provinces = [
        {"name": "Bali", "code": "ID-BA"},
        {"name": "Jakarta", "code": "ID-JK"},
        {"name": "Jawa Barat", "code": "ID-JB"},
        {"name": "Jawa Tengah", "code": "ID-JT"},
        {"name": "Jawa Timur", "code": "ID-JI"},
        {"name": "Yogyakarta", "code": "ID-YO"},
        {"name": "Banten", "code": "ID-BT"},
        {"name": "Aceh", "code": "ID-AC"},
        {"name": "Sumatera Utara", "code": "ID-SU"},
        {"name": "Sumatera Barat", "code": "ID-SB"},
        {"name": "Riau", "code": "ID-RI"},
        {"name": "Jambi", "code": "ID-JA"},
        {"name": "Sumatera Selatan", "code": "ID-SS"},
        {"name": "Bengkulu", "code": "ID-BE"},
        {"name": "Lampung", "code": "ID-LA"},
        {"name": "Bangka Belitung", "code": "ID-BB"},
        {"name": "Kepulauan Riau", "code": "ID-KR"},
        {"name": "Kalimantan Barat", "code": "ID-KB"},
        {"name": "Kalimantan Tengah", "code": "ID-KT"},
        {"name": "Kalimantan Selatan", "code": "ID-KS"},
        {"name": "Kalimantan Timur", "code": "ID-KI"},
        {"name": "Kalimantan Utara", "code": "ID-KU"},
        {"name": "Sulawesi Utara", "code": "ID-SA"},
        {"name": "Gorontalo", "code": "ID-GO"},
        {"name": "Sulawesi Tengah", "code": "ID-ST"},
        {"name": "Sulawesi Barat", "code": "ID-SR"},
        {"name": "Sulawesi Selatan", "code": "ID-SN"},
        {"name": "Sulawesi Tenggara", "code": "ID-SG"},
        {"name": "Nusa Tenggara Barat", "code": "ID-NB"},
        {"name": "Nusa Tenggara Timur", "code": "ID-NT"},
        {"name": "Maluku", "code": "ID-MA"},
        {"name": "Maluku Utara", "code": "ID-MU"},
        {"name": "Papua Barat", "code": "ID-PB"},
        {"name": "Papua", "code": "ID-PA"}
    ]
    
    # Category mapping helper
    def map_category(tags):
        amenity = tags.get('amenity')
        shop = tags.get('shop')
        tourism = tags.get('tourism')
        leisure = tags.get('leisure')
        historic = tags.get('historic')
        religion = tags.get('religion')
        natural = tags.get('natural')
        
        # Food & Drink
        if amenity == 'cafe': return 'cafe'
        if amenity == 'restaurant': return 'restaurant'
        if amenity == 'fast_food': return 'fast_food_restaurant'
        if amenity == 'food_court': return 'food_court'
        if shop == 'bakery': return 'bakery'
        if amenity in ('bar', 'pub', 'biergarten'): return 'bar'
        if amenity == 'nightclub': return 'nightclub'
        if amenity == 'ice_cream': return 'ice_cream_parlor'
        
        # Lodging
        if tourism == 'hotel': return 'hotel'
        if tourism == 'hostel': return 'hostel'
        if tourism == 'resort': return 'resort'
        if tourism == 'motel': return 'hotel'
        if tourism == 'guest_house': return 'hostel'
        
        # Transportation
        if amenity == 'bus_station': return 'bus_station'
        if tags.get('highway') == 'bus_stop': return 'bus_stop'
        if amenity == 'fuel': return 'gas_station'
        
        # Financial
        if amenity == 'bank': return 'bank'
        if amenity == 'atm': return 'atm'
        
        # Shops & Retail
        if shop == 'mall': return 'shopping_mall'
        if shop == 'department_store': return 'department_store'
        if shop == 'supermarket': return 'supermarket'
        if shop == 'convenience': return 'convenience_store'
        if shop == 'pharmacy' or amenity == 'pharmacy': return 'pharmacy'
        
        # Nature & Outdoors
        if leisure == 'park': return 'park'
        if tourism == 'attraction': return 'tourist_attraction'
        if historic in ('monument', 'memorial'): return 'landmark_and_historical_building'
        if natural == 'beach' or tourism == 'beach' or leisure == 'beach_resort': return 'beach'
        
        # Entertainment & Arts
        if tourism == 'museum': return 'museum'
        if amenity == 'cinema': return 'cinema'
        if amenity == 'theatre': return 'theater'
        
        # Places of Worship
        if amenity == 'place_of_worship':
            if religion == 'muslim': return 'mosque'
            if religion in ('christian', 'catholic'): return 'church_cathedral'
            if religion == 'hindu': return 'temple'
            if religion == 'buddhist': return 'temple'
            
        # Education & Community
        if amenity == 'school': return 'school'
        if amenity in ('university', 'college'): return 'college_university'
        if amenity == 'library': return 'library'
        if leisure == 'playground': return 'playground'
        if leisure == 'sports_centre': return 'sports_complex'
        
        # Health & Medical
        if amenity == 'hospital': return 'hospital'
        if amenity == 'clinic' or amenity == 'doctors' or amenity == 'dentist': return 'clinic'
        
        # Government & Services
        if amenity == 'police': return 'police_station'
        if amenity == 'post_office': return 'post_office'
        if amenity == 'townhall' or tags.get('office') == 'government': return 'government_office'
        
        return None

    sql_statements = []
    total_elements_fetched = 0
    total_mapped_pois = 0
    
    url = "https://overpass-api.de/api/interpreter"
    
    for idx, prov in enumerate(provinces):
        print(f"\n[{idx+1}/{len(provinces)}] Fetching POIs for {prov['name']} (ISO: {prov['code']})...")
        
        # Overpass QL query targeting the specific province area
        query = f"""
        [out:json][timeout:180];
        area["ISO3166-2"="{prov['code']}"]->.a;
        (
          node["amenity"](area.a);
          node["shop"](area.a);
          node["tourism"](area.a);
          node["historic"](area.a);
          node["leisure"](area.a);
          node["natural"="beach"](area.a);
          
          way["amenity"](area.a);
          way["shop"](area.a);
          way["tourism"](area.a);
          way["historic"](area.a);
          way["leisure"](area.a);
          way["natural"="beach"](area.a);
        );
        out center;
        """
        
        data = urllib.parse.urlencode({'data': query}).encode('utf-8')
        
        try:
            req = urllib.request.Request(url, data=data, headers={'User-Agent': 'JumpaPOIExtractor/1.0'})
            with urllib.request.urlopen(req) as response:
                result = json.loads(response.read().decode('utf-8'))
        except Exception as e:
            print(f"Error fetching data for {prov['name']}: {e}", file=sys.stderr)
            print("Skipping to next province in 5 seconds...")
            time.sleep(5)
            continue
            
        elements = result.get('elements', [])
        print(f"  Retrieved {len(elements)} raw elements.")
        total_elements_fetched += len(elements)
        
        prov_mapped_count = 0
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
                address = f"{prov['name']}, Indonesia"
                
            city = tags.get('addr:city', prov['name'])
            city = city.replace("'", "''")
            
            # Map category to category_group
            category_group = 'community'
            if category in ('coffee_shop', 'cafe', 'restaurant', 'indonesian_restaurant', 'asian_restaurant', 'chinese_restaurant', 'noodles_restaurant', 'fast_food_restaurant', 'chicken_restaurant', 'japanese_restaurant', 'bakery', 'food_court', 'dessert_shop', 'ice_cream_parlor', 'tea_room', 'juice_bar', 'food_truck', 'bar', 'pub', 'nightclub'):
                category_group = 'food'
            elif category in ('hotel', 'accommodation', 'hostel', 'resort', 'motel', 'guest_house', 'airport', 'train_station', 'metro_station', 'bus_station', 'bus_stop', 'shopping_center', 'shopping_mall', 'department_store', 'landmark_and_historical_building', 'gas_station', 'bank', 'atm', 'supermarket', 'convenience_store'):
                category_group = 'transit_shopping'
            elif category in ('park', 'tourist_attraction', 'plaza', 'scenic_lookout', 'beach'):
                category_group = 'nature'
            elif category in ('art_gallery', 'museum', 'theater', 'cinema', 'music_venue', 'cultural_center', 'arts_and_entertainment', 'sports_club', 'stadium', 'sports_complex', 'playground', 'gym_fitness_center', 'recreation_center'):
                category_group = 'arts_sports'
            
            sql = f"INSERT INTO places (id, name, latitude, longitude, geom, category, category_group, address, city, country, confidence) VALUES ('{osm_id}', '{name}', {lat}, {lon}, ST_SetSRID(ST_Point({lon}, {lat}), 4326), '{category}', '{category_group}', '{address}', '{city}', 'ID', 1.0) ON CONFLICT (id) DO NOTHING;"
            sql_statements.append(sql)
            prov_mapped_count += 1
            
        print(f"  Mapped {prov_mapped_count} POIs to valid system categories.")
        total_mapped_pois += prov_mapped_count
        
        # Be nice to Overpass API and sleep between queries
        if idx < len(provinces) - 1:
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
