import json
import asyncio
from helper.models import Road
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent
file_path = BASE_DIR / "roads.geojson"
  
# When we first make geojson we need to process it for out sqlite db
async def populate_db():
  with open(file_path, "r", encoding="utf-8") as f:
    roadsJSON = json.load(f)

  batch_size = 50

  for i in range(0, len(roadsJSON["features"]), batch_size):
    batch = roadsJSON["features"][i:i+batch_size]

    tasks = [Road.create(details=json.dumps(feature)) for feature in batch]
    await asyncio.gather(*tasks)
    
  print("Database populated.")