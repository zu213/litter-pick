from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

app = FastAPI()

class Coords(BaseModel):
  n: float
  e: float
  s: float
  w: float

app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://zupstn.com", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# POST endpoint
@app.post("/roads/")
async def roads(coords: Coords):#
  # Get the roads for an area, this will be a database req
  print("Request received")

  count += 1
  print("Requested successfully, count since last restart: ", count)
  return {
    "images": []
  }
