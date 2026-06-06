import sys
import requests
import geopandas as gpd
from shapely.geometry import LineString


def generateRoadJson(coords, output='roads.geojson'):
    query = """
    [out:json][timeout:25];
    (
    way["highway"]
        ["highway"!~"service|track|path|footway|cycleway|bridleway|steps"]
        ["access"!="private"]

        {coordinates};
    );
    out body geom;
    """.format(coordinates=coords)

    r = requests.post(
        "https://overpass-api.de/api/interpreter",
        data=query,
        headers={
            "User-Agent": "road-buffer-script/1.0 (contact@example.com)"
        }
    )

    if r.status_code != 200:
        raise RuntimeError(f"HTTP {r.status_code}: {r.text}")

    if not r.text.strip():
        raise RuntimeError("Empty response from Overpass")

    data = r.json()

    lines = []
    highways = []
    names = []

    for el in data["elements"]:
        coords_pts = [(p["lon"], p["lat"]) for p in el["geometry"]]
        lines.append(LineString(coords_pts))
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

    gdf = gdf.to_crs(epsg=4326)
    gdf.to_file(output, driver="GeoJSON")
    print(f"Saved {len(gdf)} roads to {output}")


if __name__ == "__main__":
    if len(sys.argv) < 5:
        print("Usage: python generateRoads.py <south> <west> <north> <east> [output.geojson]")
        sys.exit(1)

    s, w, n, e = sys.argv[1], sys.argv[2], sys.argv[3], sys.argv[4]
    output = sys.argv[5] if len(sys.argv) > 5 else "roads.geojson"

    coords = f"({s},{w},{n},{e})"
    generateRoadJson(coords, output)
