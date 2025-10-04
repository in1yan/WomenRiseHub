from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from database import Base, engine, SessionLocal
from sqlalchemy.orm import Session
from typing import List
from schemas import User, UserCreate, UserLogin, Token, UserUpdate
from models import Users
from utils import hash_pwd
from auth import authenticate_user, create_access_token, get_current_user
from datetime import timedelta
import os
import random

TOKEN_EXPIRATION = int(os.getenv("TOKEN_EXPIRATION"))

app = FastAPI() 

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
async def startup():
    Base.metadata.create_all(bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db 
    finally:
        db.close()


def generate_user_id(db: Session) -> str:
    for _ in range(1000):
        candidate = f"{random.randint(0, 999):03}"
        if not db.query(Users).filter(Users.id == candidate).first():
            return candidate
    raise HTTPException(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        detail="Unable to generate a unique user ID"
    )

@app.get('/')
async def root():
    return {"message": "Hello World"}

@app.post('/login', response_model=Token)
async def login(user_credentials: UserLogin, db: Session = Depends(get_db)):
    user = authenticate_user(db, user_credentials.email, user_credentials.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token_expires = timedelta(weeks=TOKEN_EXPIRATION)
    access_token = create_access_token(
        data={"sub": user.email}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}

@app.get('/users/')
async def get_users(db: Session = Depends(get_db), current_user: Users = Depends(get_current_user)) -> List[User]:
    users = db.query(Users).all()
    return users 

@app.get('/me', response_model=User)
async def get_current_user_info(current_user: Users = Depends(get_current_user)):
    return current_user

@app.post('/create/user')
async def create_user(user: UserCreate, db: Session = Depends(get_db)):
    existing_user = db.query(Users).filter(Users.email == user.email).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    hashed_pwd = hash_pwd(user.password)
    new_user = Users(
        id=generate_user_id(db),
        name=user.name,
        email=user.email,
        hashed_password = hashed_pwd,
        phonenumber = user.phonenumber
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user

@app.put('/update/user', response_model=User)
def update_user(updated_user: UserUpdate, db: Session = Depends(get_db), current_user: Users = Depends(get_current_user)):
    user = db.query(Users).filter(Users.id == current_user.id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    if updated_user.name is not None:
        user.name = updated_user.name
    if updated_user.email is not None:
        user.email = updated_user.email
    if updated_user.phonenumber is not None:
        user.phonenumber = updated_user.phonenumber
    if updated_user.city is not None:
        user.city = updated_user.city
    if updated_user.country is not None:
        user.country = updated_user.country
    if updated_user.skills is not None:
        user.skills = updated_user.skills
    if updated_user.interests is not None:
        user.interests = updated_user.interests
    if updated_user.story is not None:
        user.story = updated_user.story 
    db.commit()
    db.refresh(user)
    return user