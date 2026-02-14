import json

from datetime import timedelta
from typing import Annotated, Optional
from fastapi import Depends, FastAPI, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from uuid import UUID
from tortoise.contrib.fastapi import register_tortoise

from helper.models import Road, User
from helper.helper import Coords, Token
from helper.createModels import UserCreate
from auth import get_current_user, authenticate_user, create_access_token, get_password_hash, ACCESS_TOKEN_EXPIRE_MINUTES
from setup.setup import populate_db
    
@asynccontextmanager
async def lifespan(app: FastAPI):
  if await Road.all().count() == 0:
    await populate_db()
  
  yield

# Initial setup
app = FastAPI(lifespan=lifespan)

register_tortoise(
  app,
  db_url="sqlite://db.sqlite3",
  modules={"models": ["models"]},
  generate_schemas=True,
)
  
# Middle ware
app.add_middleware(
  CORSMiddleware,
  allow_origins=["*"],
  allow_credentials=True,
  allow_methods=["*"],
  allow_headers=["*"],
)

# Endpoints
# Tokens
@app.post("/token")
async def login_for_access_token(form_data: Annotated[OAuth2PasswordRequestForm, Depends()]) -> Token:
  user = await authenticate_user(form_data.username, form_data.password)
  print(user)
  if not user:
    raise HTTPException(
      status_code=status.HTTP_401_UNAUTHORIZED,
      detail="Incorrect username or password",
      headers={"WWW-Authenticate": "Bearer"},
    )
  access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
  access_token = create_access_token(
      data={"sub": user.username, "id": str(user.id)}, expires_delta=access_token_expires
  )
  return Token(access_token=access_token, token_type="bearer")

@app.get("/token/validate")
async def validate_token(current_user: User = Depends(get_current_user)):  
  return {
    "id" :current_user.id
  }

# User
@app.get("/user/${uuid}")
async def get_user(uuid: UUID):
  user = await User.filter(id=uuid).get() 
  return user

@app.post("/user/")
async def create_user(user: UserCreate):
  new_user = await User.create(username=user.username, hashed_password=get_password_hash(user.password))

  return {
    "id": str(new_user.id),
    "name": new_user.username
  }
  
# Roads
@app.post("/roads/")
async def roads(coords: Optional[Coords] = None):
  roads = await Road.all()

  features = []
  for road in roads:
    feature = json.loads(road.details)
    feature["id"] = str(road.id)
    features.append(feature)

  return {
    "type": "FeatureCollection",
    "name": "roads",
    "crs": {
      "type": "name",
      "properties": {
        "name": "urn:ogc:def:crs:OGC:1.3:CRS84"
      }
    },
    "features": features,
  }


@app.get("/roads/{uuid}")
async def roads(uuid: UUID):
  # Get the roads for an area, this will be a database req with coords maybe  
  road = await Road.filter(id=uuid).prefetch_related("users").get()  # we need to wrap this appropriately
  users = await road.users.all().values("id", "username")

  return {
    "details": json.loads(road.details),
    "users": users
  }

# Volunteer for the road
@app.post("/roads/{uuid}")
async def sign_up_for_road(uuid: UUID, current_user: Annotated[User, Depends(get_current_user)],):
  
  
  return {
    "road_id": uuid,
    "users": [current_user],
  }