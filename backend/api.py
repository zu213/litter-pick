from datetime import datetime, timedelta, timezone
from typing import Annotated, Optional

import jwt
from fastapi import Depends, FastAPI, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from jwt.exceptions import InvalidTokenError
from pwdlib import PasswordHash
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import Response
import json
from uuid import UUID
from tortoise.contrib.fastapi import register_tortoise
from models import Road, User

# to get a string like this run:
# openssl rand -hex 32
SECRET_KEY = "09d25e094faa6ca2556c818166b7a9563b93f7099f6f0f4caa6cf63b88e8d3e7"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30


fake_users_db = {
    "johndoe": {
        "username": "johndoe",
        "full_name": "John Doe",
        "email": "johndoe@example.com",
        "hashed_password": "$argon2id$v=19$m=65536,t=3,p=4$wagCPXjifgvUFBzq4hqe3w$CYaIb8sB+wtD+Vu/P4uod1+Qof8h+1g7bbDlBID48Rc",
        "disabled": False,
    }
}

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    username: str | None = None

class User(BaseModel):
  username: str
  email: str | None = None
  full_name: str | None = None
  disabled: bool | None = None

class UserInDB(User):
    hashed_password: str
    
class Coords(BaseModel):
  n: float
  e: float
  s: float
  w: float

password_hash = PasswordHash.recommended()
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")
app = FastAPI()

register_tortoise(
  app,
  db_url="sqlite://db.sqlite3",
  modules={"models": ["models"]},
  generate_schemas=True,
)

def verify_password(plain_password, hashed_password):
  return password_hash.verify(plain_password, hashed_password)

def get_password_hash(password):
  return password_hash.hash(password)

def get_user(db, username: str):
  if username in db:
    user_dict = db[username]
    return UserInDB(**user_dict)


def authenticate_user(fake_db, username: str, password: str):
  user = get_user(fake_db, username)
  if not user:
    return False
  if not verify_password(password, user.hashed_password):
    return False
  return user

# Create access token
def create_access_token(data: dict, expires_delta: timedelta | None = None):
  to_encode = data.copy()
  if expires_delta:
    expire = datetime.now(timezone.utc) + expires_delta
  else:
    expire = datetime.now(timezone.utc) + timedelta(minutes=15)
  to_encode.update({"exp": expire})
  encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
  return encoded_jwt

# Check access token
async def get_current_user(token: Annotated[str, Depends(oauth2_scheme)]):
  credentials_exception = HTTPException(
    status_code=status.HTTP_401_UNAUTHORIZED,
    detail="Could not validate credentials",
    headers={"WWW-Authenticate": "Bearer"},
  )
  try:
    payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
    username = payload.get("sub")
    if username is None:
      raise credentials_exception
    token_data = TokenData(username=username)
  except InvalidTokenError:
    raise credentials_exception
  user = get_user(fake_users_db, username=token_data.username)
  if user is None:
    raise credentials_exception
  return user
  
# Middle ware
app.add_middleware(
  CORSMiddleware,
  allow_origins=["*"],
  allow_credentials=True,
  allow_methods=["*"],
  allow_headers=["*"],
)

# Endpoints
@app.post("/token")
async def login_for_access_token(
    form_data: Annotated[OAuth2PasswordRequestForm, Depends()],
) -> Token:
    user = authenticate_user(fake_users_db, form_data.username, form_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.username}, expires_delta=access_token_expires
    )
    return Token(access_token=access_token, token_type="bearer")

@app.get("/token/validate", status_code=status.HTTP_204_NO_CONTENT)
async def validate_token(
    current_user: User = Depends(get_current_user),
):
    # If we get here, the token is valid.
    # No body needed.
    return Response(status_code=status.HTTP_204_NO_CONTENT)
  
@app.get("/user")
async def fetch_user(
    current_user: User = Depends(get_current_user),
):
  return current_user
  
# Get roads
@app.post("/roads/")
async def roads(coords: Optional[Coords] = None):
  # Get the roads for an area, this will be a database req with coords maybe
  
  road = await Road.get(id=road_id)

  await road.users.add(user)
  
  # this will be db get
  with open("roads.geojson", "r", encoding="utf-8") as f:
    roadsJSON = json.load(f)
  return roadsJSON


# Volunteer for the road
@app.post("/roads/{uuid}")
async def sign_up_for_road(
  uuid: UUID,
  current_user: Annotated[User, Depends(get_current_user)],
):
  print(current_user)
  
  #db post
  with open("roads.geojson", "r", encoding="utf-8") as f:
    roadsJSON = json.load(f)
  
  # Edit the db with user is not reached
  
  return {
    "road_id": uuid,
    "users": [current_user],
  }