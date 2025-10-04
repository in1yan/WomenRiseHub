from database import Base
from sqlalchemy import Column, String, JSON

class Users(Base):
    __tablename__ = "users"

    id = Column(String(3), primary_key=True, index=True)
    name = Column(String, index=True)
    email = Column(String, unique=True, index=True)
    phonenumber = Column(String(15), unique=True, index=True)
    hashed_password = Column(String)
    city = Column(String, nullable=True)
    country = Column(String, nullable=True)
    skills = Column(JSON, nullable=True) 
    interests = Column(JSON, nullable=True) 
    story = Column(String, nullable=True)