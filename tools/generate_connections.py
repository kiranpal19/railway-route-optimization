import csv
import math
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DATA = ROOT / 'data'
STATIONS_CSV = DATA / 'stations_bulk.csv'
OUT_CSV = DATA / 'connections_bulk.csv'

# Haversine distance in km
def haversine(lat1, lon1, lat2, lon2):
    R = 6371.0
    phi1 = math.radians(lat1)
    phi2 = math.radians(lat2)
    dphi = math.radians(lat2 - lat1)
    dlambda = math.radians(lon2 - lon1)
    a = math.sin(dphi/2)**2 + math.cos(phi1)*math.cos(phi2)*math.sin(dlambda/2)**2
    c = 2*math.atan2(math.sqrt(a), math.sqrt(1-a))
    return R * c

# Load stations
def load_stations(path):
    rows = []
    with open(path, newline='', encoding='utf-8') as f:
        r = csv.DictReader(f)
        for row in r:
            try:
                row['lat'] = float(row['lat']) if row['lat'] != '' else None
                row['lon'] = float(row['lon']) if row['lon'] != '' else None
            except Exception:
                row['lat'] = None
                row['lon'] = None
            rows.append(row)
    return rows

# Build edges: neighbor links and periodic long links
def build_edges(stations):
    edges = []
    n = len(stations)
    def add(a, b, d):
        # speed ~ clamp between 70..100 based on distance
        speed = 70 if d < 120 else 80 if d < 300 else 90
        cost = max(10, round(d * 1.0))
        edges.append({
            'source_id': a['id'],
            'dest_id': b['id'],
            'distance_km': round(d, 1),
            'speed_kmh': speed,
            'cost': cost,
        })
    
    for i in range(n-1):
        a = stations[i]
        b = stations[i+1]
        if a['lat'] is not None and b['lat'] is not None:
            d = haversine(a['lat'], a['lon'], b['lat'], b['lon'])
        else:
            d = 150.0
        add(a, b, d)
        add(b, a, d)
    
    # periodic hub links every 10th
    for i in range(0, n-10, 10):
        a = stations[i]
        b = stations[i+10]
        if a['lat'] is not None and b['lat'] is not None:
            d = haversine(a['lat'], a['lon'], b['lat'], b['lon'])
        else:
            d = 600.0
        add(a, b, d)
        add(b, a, d)
    return edges


def main():
    stations = load_stations(STATIONS_CSV)
    if not stations:
        raise SystemExit(f"No stations found in {STATIONS_CSV}")
    edges = build_edges(stations)
    OUT_CSV.parent.mkdir(parents=True, exist_ok=True)
    with open(OUT_CSV, 'w', newline='', encoding='utf-8') as f:
        w = csv.DictWriter(f, fieldnames=['source_id','dest_id','distance_km','speed_kmh','cost'])
        w.writeheader()
        for e in edges:
            w.writerow(e)
    print(f"Wrote {len(edges)} edges -> {OUT_CSV}")

if __name__ == '__main__':
    main()
