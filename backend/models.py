from pydantic import BaseModel, EmailStr
from typing import List, Optional

class User(BaseModel):
    email: EmailStr
    username: Optional[str] = None

class UserCreate(BaseModel):
    email: EmailStr
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: Optional[str] = None

class Task(BaseModel):
    id: int
    title: str
    description: str
    owner: str

class TaskCreate(BaseModel):
    title: str
    description: str
