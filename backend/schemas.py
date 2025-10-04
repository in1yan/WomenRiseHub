from typing import List, Optional

from pydantic import BaseModel, Field, field_validator

class UserBase(BaseModel):
    name: str
    email: str 
    phonenumber: str = Field(..., max_length=15, description="Phone number (max 15 characters)")
    city: Optional[str] = None
    country: Optional[str] = None
    skills: List[str] = Field(default_factory=list)
    interests: List[str] = Field(default_factory=list)
    story: Optional[str] = None

    @field_validator("skills", "interests", mode="before")
    @classmethod
    def ensure_list(cls, value):
        if value is None:
            return []
        if isinstance(value, list):
            return value
        return []

class UserCreate(UserBase):
    password: str = Field(..., max_length=200, description="Password (max 200 characters)") 

class UserLogin(BaseModel):
    email: str
    password: str

class UserUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[str] = None
    phonenumber: Optional[str] = Field(None, max_length=15, description="Phone number (max 15 characters)")
    city: Optional[str] = None
    country: Optional[str] = None
    skills: Optional[List[str]] = None
    interests: Optional[List[str]] = None
    story: Optional[str] = None


class User(UserBase):
    id: str = Field(..., min_length=3, max_length=3, description="3-digit user identifier")
    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str