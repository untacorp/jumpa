import subprocess
import os
import sys
import time

def run_download_with_retry(bbox, output_temp, max_retries=3):
    cmd = [
        "uv", "run", "--with", "overturemaps", "overturemaps", "download",
        f"--bbox={bbox}", "-f", "geojsonseq", "--type=place", "-o", output_temp
    ]
    
    for attempt in range(1, max_retries + 1):
        print(f"  Attempt {attempt}/{max_retries}...")
        try:
            # Run the download command
            result = subprocess.run(cmd, check=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
            print(f"  Successfully downloaded to {output_temp}.")
            return True
        except subprocess.CalledProcessError as e:
            print(f"  Warning: Attempt {attempt} failed: {e.stderr.strip() or e}")
            if attempt < max_retries:
                print("  Waiting 5 seconds before retrying...")
                time.sleep(5)
            else:
                print("  Error: Maximum retries reached for this bounding box.")
                return False

def main():
    print("=== Robust Overture Indonesia POI Downloader ===")
    
    # 8 regional bounding boxes covering the land mass of Indonesia
    regions = [
        {"name": "Sumatra West", "bbox": "95.0,-6.0,102.0,6.0"},
        {"name": "Sumatra East", "bbox": "102.0,-6.0,109.0,6.0"},
        {"name": "Java", "bbox": "105.0,-9.0,116.0,-5.0"},
        {"name": "Bali & Nusa Tenggara", "bbox": "114.0,-11.0,128.0,-8.0"},
        {"name": "Kalimantan", "bbox": "108.0,-4.5,120.0,4.5"},
        {"name": "Sulawesi", "bbox": "118.0,-6.0,126.0,2.0"},
        {"name": "Maluku", "bbox": "124.0,-9.0,135.0,1.0"},
        {"name": "Papua", "bbox": "135.0,-9.0,141.0,1.0"}
    ]
    
    output_main = "scratch/overture_places.geojson"
    
    # Clean/Reset the main output file
    if os.path.exists(output_main):
        os.remove(output_main)
        
    print(f"Main output file initialized: {output_main}")
    
    total_successful = 0
    
    for idx, reg in enumerate(regions):
        print(f"\n[{idx+1}/{len(regions)}] Downloading {reg['name']} (BBOX: {reg['bbox']})...")
        temp_file = f"scratch/temp_{idx}.geojson"
        
        # Download this sub-region
        success = run_download_with_retry(reg['bbox'], temp_file)
        
        if success and os.path.exists(temp_file):
            # Append temp file content to main file
            print(f"  Appending {reg['name']} data to {output_main}...")
            with open(temp_file, 'r', encoding='utf-8') as infile:
                with open(output_main, 'a', encoding='utf-8') as outfile:
                    for line in infile:
                        outfile.write(line)
            
            # Clean up temp file
            os.remove(temp_file)
            total_successful += 1
        else:
            print(f"  Skipping {reg['name']} due to download failure.")
            
    print(f"\n=== Download Process Finished ===")
    print(f"Successfully downloaded {total_successful}/{len(regions)} regions.")
    print(f"Combined data saved to: {output_main}")
    print("You can now run: python3 scratch/process_overture_geojson.py to process the data.")

if __name__ == "__main__":
    main()
