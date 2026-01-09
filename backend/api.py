from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
import json

app = FastAPI()

class Coords(BaseModel):
  n: float
  e: float
  s: float
  w: float

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# POST endpoint
@app.post("/roads/")
async def roads(coords: Optional[Coords] = None):#
  # Get the roads for an area, this will be a database req with coords maybe
  
  with open("roads.geojson", "r", encoding="utf-8") as f:
    roadsJSON = json.load(f)
  return roadsJSON
