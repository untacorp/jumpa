import json
import sys
import os

def map_category_group(category):
    c = category.lower().strip() if category else ''
    if not c or c == 'none':
        return None
        
    # Food & Drink
    food_cats = {
        'restaurant', 'coffee_shop', 'cafe', 'indonesian_restaurant', 'fast_food_restaurant', 
        'chicken_restaurant', 'asian_restaurant', 'seafood_restaurant', 'diner', 
        'japanese_restaurant', 'bar', 'chinese_restaurant', 'noodles_restaurant', 
        'pizza_restaurant', 'bakery', 'steakhouse', 'food_stand', 'food_court', 
        'ice_cream_parlor', 'tea_room', 'juice_bar', 'food_truck', 'pub', 'nightclub', 
        'karaoke', 'eat_and_drink'
    }
    if c in food_cats:
        return 'food'
        
    # Lodging, Transit, Financial & Shopping
    transit_shopping_cats = {
        # Lodging
        'hotel', 'accommodation', 'resort', 'hostel', 'motel', 'guest_house', 'lodge', 
        'cottage', 'holiday_rental_home',
        # Transit
        'airport', 'train_station', 'metro_station', 'bus_station', 'bus_stop', 'gas_station', 
        'transportation',
        # Shopping malls & landmarks
        'shopping_center', 'shopping_mall', 'department_store', 'landmark_and_historical_building',
        # Supermarkets & pharmacies
        'supermarket', 'convenience_store', 'grocery_store', 'pharmacy',
        # Financial
        'bank_credit_union', 'banks', 'atm', 'financial_service',
        # Other Retail / Shopping
        'clothing_store', 'mobile_phone_store', 'electronics', 'furniture_store', 'bookstore', 
        'shoe_store', 'jewelry_store', 'pet_store', 'hardware_store', 'building_supply_store', 
        'computer_store', 'cosmetic_and_beauty_supplies', 'flowers_and_gifts_shop', 'retail', 
        'shopping', 'beauty_salon', 'barber', 'spas', 'beauty_and_spa', 'hair_salon', 'skin_care'
    }
    if c in transit_shopping_cats:
        return 'transit_shopping'
        
    # Nature & Outdoors
    nature_cats = {
        'park', 'tourist_attraction', 'plaza', 'scenic_lookout', 'beach', 
        'attractions_and_activities', 'active_life'
    }
    if c in nature_cats:
        return 'nature'
        
    # Entertainment & Arts & Sports
    arts_sports_cats = {
        'art_gallery', 'museum', 'theater', 'cinema', 'music_venue', 'cultural_center', 
        'arts_and_entertainment', 'topic_concert_venue', 'sports_club', 'stadium', 
        'sports_complex', 'playground', 'gym', 'gym_fitness_center', 'recreation_center', 
        'swimming_pool', 'sports_and_recreation_venue', 'sports_club_and_league', 
        'stadium_arena'
    }
    if c in arts_sports_cats:
        return 'arts_sports'
        
    # Community & Public Services
    community_cats = {
        # Places of worship
        'mosque', 'church_cathedral', 'church', 'temple', 'hindu_temple', 'buddhist_temple', 
        'catholic_church', 'place_of_worship', 'religious_organization',
        # Education
        'school', 'college_university', 'elementary_school', 'high_school', 'middle_school', 
        'preschool', 'university', 'college', 'library', 'religious_school', 'language_school', 
        'vocational_and_technical_school', 'public_school', 'private_school', 'education', 
        'campus_building',
        # Medical
        'hospital', 'clinic', 'medical_center', 'doctor', 'dentist', 'health_and_medical',
        # Government
        'police_department', 'police_station', 'post_office', 'government_office', 
        'central_government_office', 'public_service_and_government', 'town_hall', 
        'city_hall', 'courthouse', 'public_and_government_association', 'community_services_non_profits', 
        'social_service_organizations', 'social_service_organization'
    }
    if c in community_cats:
        return 'community'
        
    return None

def main():
    input_file = "scratch/overture_places.geojson"
    output_file = "scratch/seed_places.sql"
    
    if not os.path.exists(input_file):
        print(f"Error: Input file {input_file} not found.", file=sys.stderr)
        sys.exit(1)
        
    print(f"=== Processing Overture places from {input_file} ===")
    
    value_tuples = []
    total_processed = 0
    total_inserted = 0
    
    with open(input_file, 'r', encoding='utf-8') as infile:
        for line in infile:
            line = line.strip()
            if not line:
                continue
                
            try:
                feature = json.loads(line)
            except Exception as e:
                print(f"Warning: Failed to parse line as JSON: {e}")
                continue
                
            total_processed += 1
            
            # Extract geometry and properties
            geometry = feature.get('geometry', {})
            properties = feature.get('properties', {})
            
            if not geometry or geometry.get('type') != 'Point':
                continue
                
            coords = geometry.get('coordinates', [])
            if len(coords) < 2:
                continue
                
            lon, lat = coords[0], coords[1]
            
            # Extract basic info
            place_id = feature.get('id')
            if not place_id:
                continue
            place_id = place_id[:64]
            
            # Extract name
            names = properties.get('names', {})
            name = names.get('primary') if names else None
            if not name:
                continue
                
            # Filter generic names and short names
            name_lower = name.strip().lower()
            if name_lower in ('hotel', 'pura', 'sd', 'villa', 'vila', 'warung', 'resto', 'rumah', 'masjid', 'gereja', 'apotek', 'toko', 'sekolah', 'puskesmas'):
                continue
            if len(name.strip()) <= 2 and name_lower not in ('kfc', 'jfc', 'ack', 'xxi', 'bca', 'bri', 'bni', 'tix', 'uno'):
                continue
                
            name_truncated = name[:255]
            name_sql = name_truncated.replace("'", "''")
            
            # Extract category (Overture maps categories using primary)
            categories = properties.get('categories', {})
            category = categories.get('primary') if (categories and categories.get('primary')) else 'uncategorized'
            category_group = map_category_group(category)
            if not category_group:
                continue
                
            category = category[:128]
            category_group = category_group[:64]
            
            # Filter confidence score (Overture places have confidence rating)
            confidence = properties.get('confidence', 1.0)
            if confidence is not None and confidence < 0.75:
                continue
                
            # Filter operating status
            operating_status = properties.get('operating_status', 'operating')
            if operating_status == 'permanently_closed':
                continue
            operating_status = operating_status[:64]
                
            # Extract address
            addresses = properties.get('addresses', [])
            address_freeform = ''
            locality = ''
            region = ''
            postcode = ''
            
            if addresses and len(addresses) > 0:
                addr = addresses[0]
                
                # Filter out foreign POIs
                addr_country = addr.get('country')
                if addr_country and str(addr_country).strip().upper() != 'ID':
                    continue
                    
                address_freeform = (addr.get('freeform') or '').replace("'", "''")
                locality = (addr.get('locality') or '').replace("'", "''")
                region = (addr.get('region') or '').replace("'", "''")
                postcode = (addr.get('postcode') or '').replace("'", "''")
                
            if not address_freeform:
                address_freeform = f"{locality or region or 'Indonesia'}"
                
            locality = locality[:100]
            region = region[:100]
            postcode = postcode[:100]
                
            # Extract contact info (handling both contact_info and root properties levels)
            contact = properties.get('contact_info', {})
            website = ''
            phone = ''
            if contact:
                websites = contact.get('websites') or []
                if websites and len(websites) > 0 and websites[0]:
                    website = str(websites[0])
                phones = contact.get('phones') or []
                if phones and len(phones) > 0 and phones[0]:
                    phone = str(phones[0])
            
            if not website:
                websites = properties.get('websites') or []
                if websites and len(websites) > 0 and websites[0]:
                    website = str(websites[0])
            if not phone:
                phones = properties.get('phones') or []
                if phones and len(phones) > 0 and phones[0]:
                    phone = str(phones[0])
                    
            website = website[:512].replace("'", "''")
            phone = phone[:64].replace("'", "''")
            
            val = f"('{place_id}', '{name_sql}', '{category}', '{category_group}', {lat}, {lon}, ST_SetSRID(ST_Point({lon}, {lat}), 4326), '{address_freeform}', '{locality}', '{region}', '{postcode}', 'ID', '{website}', '{phone}', '{operating_status}', {confidence})"
            value_tuples.append(val)
            total_inserted += 1
            
    print(f"Processed {total_processed} features.")
    print(f"Generated {total_inserted} value tuples.")
    
    # Chunk value tuples to speed up database insertion (1000 records per statement)
    chunk_size = 1000
    sql_statements = []
    for i in range(0, len(value_tuples), chunk_size):
        chunk = value_tuples[i:i+chunk_size]
        sql = "INSERT INTO places (id, name, category, category_group, latitude, longitude, geom, address, city, region, postcode, country, website, phone, operating_status, confidence) VALUES\n" + ",\n".join(chunk) + "\nON CONFLICT (id) DO NOTHING;"
        sql_statements.append(sql)
        
    print(f"Grouped into {len(sql_statements)} batched INSERT statements.")
    
    with open(output_file, 'w', encoding='utf-8') as outfile:
        outfile.write("BEGIN;\n")
        outfile.write("\n".join(sql_statements))
        outfile.write("\nCOMMIT;\n")
        
    print(f"SQL seed script written to {output_file}")
    print("Execute the following command to import the seed script into the PostgreSQL container:")
    print("docker exec -i jumpa-postgres-1 psql -U postgres -d jumpa < scratch/seed_places.sql")

if __name__ == "__main__":
    main()
