import json
from collections import Counter

def main():
    input_file = "scratch/overture_places.geojson"
    print("Counting categories in Overture dataset...")
    
    counter = Counter()
    total = 0
    
    with open(input_file, 'r', encoding='utf-8') as f:
        for idx, line in enumerate(f):
            feature = json.loads(line)
            total += 1
            
            props = feature.get('properties', {})
            confidence = props.get('confidence', 1.0)
            if confidence is not None and confidence < 0.75:
                continue
                
            # Filter country
            addrs = props.get('addresses', [])
            if addrs and len(addrs) > 0:
                country = addrs[0].get('country')
                if country and str(country).strip().upper() != 'ID':
                    continue
                    
            cats = props.get('categories', {})
            primary = cats.get('primary') if cats else None
            if primary:
                counter[primary] += 1
            else:
                counter['None'] += 1
                
    print(f"Total features read: {total}")
    print("Top 150 categories:")
    for cat, count in counter.most_common(150):
        print(f"  {cat}: {count}")

if __name__ == "__main__":
    main()
