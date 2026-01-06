# Generate the empty road json for an area -> store it with no users attached
# Basically just a programmatic way to setup roads initially.

import requests
import geopandas as gpd
from shapely.geometry import LineString

query = """
[out:json][timeout:25];
(
  way["highway"]
     ["highway"!~"service|track|path|footway|cycleway|bridleway|steps"]
     ["access"!="private"]
     (51.75,-0.58,51.77,-0.56);
);
out body geom;
"""

r = requests.post(
    "https://overpass-api.de/api/interpreter",
    data=query,
    headers={
        "User-Agent": "road-buffer-script/1.0 (contact@example.com)"
    }
)

# ---- DEBUG SAFETY CHECK ----
if r.status_code != 200:
    raise RuntimeError(f"HTTP {r.status_code}: {r.text}")

if not r.text.strip():
    raise RuntimeError("Empty response from Overpass")

data = r.json()

lines = []
highways = []
names = []

for el in data["elements"]:
    coords = [(p["lon"], p["lat"]) for p in el["geometry"]]
    lines.append(LineString(coords))
    highways.append(el["tags"].get("highway", "road"))
    names.append(el["tags"].get("name")) 

gdf = gpd.GeoDataFrame(
    {
        "highway": highways,
        "name": names
    },
    geometry=lines,
    crs="EPSG:4326"
)


# Convert to meters
gdf = gdf.to_crs(epsg=3857)

widths = {
    "motorway": 6,
    "trunk": 5,
    "primary": 4,
    "secondary": 3.5,
    "tertiary": 3,
    "residential": 2.5,
    "service": 2
}

gdf["geometry"] = gdf.apply(
    lambda r: r.geometry.buffer(widths.get(r.highway, 2.5)),
    axis=1
)

# Back to lat/lon
gdf = gdf.to_crs(epsg=4326)

gdf.to_file("roads.geojson", driver="GeoJSON")
