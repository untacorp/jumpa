import json

def main():
    input_file = "scratch/overture_places.geojson"
    print("Analyzing sample of Overture data...")
    
    ids_at_root = 0
    ids_in_props = 0
    categories_keys = set()
    address_countries = {}
    total = 0
    
    with open(input_file, 'r', encoding='utf-8') as f:
        for idx, line in enumerate(f):
            if idx >= 10000:
                break
            feature = json.loads(line)
            total += 1
            
            # Check ID location
            if 'id' in feature:
                ids_at_root += 1
            if 'id' in feature.get('properties', {}):
                ids_in_props += 1
                
            # Check categories structure
            props = feature.get('properties', {})
            cats = props.get('categories', {})
            if cats:
                categories_keys.update(cats.keys())
                
            # Check countries
            addrs = props.get('addresses', [])
            if addrs and len(addrs) > 0:
                country = addrs[0].get('country')
                address_countries[country] = address_countries.get(country, 0) + 1
            else:
                address_countries['None'] = address_countries.get('None', 0) + 1
                
    print(f"Total analyzed: {total}")
    print(f"IDs at root: {ids_at_root}")
    print(f"IDs in properties: {ids_in_props}")
    print(f"Category keys seen: {categories_keys}")
    print(f"Address countries: {address_countries}")

if __name__ == "__main__":
    main()
