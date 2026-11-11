from pydantic import BaseModel, EmailStr
from typing import List, Optional
from datetime import datetime
from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from database import Base  # Импортируем Base из database.py

# Pydantic модели (для API)
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
    created_at: datetime
    # Новые поля
    start_time: Optional[datetime] = None
    end_time: Optional[datetime] = None
    comment: Optional[str] = None  # Markdown текст

    class Config:
        from_attributes = True

class TaskCreate(BaseModel):
    title: str
    description: str
    # Новые поля (опциональные)
    start_time: Optional[datetime] = None
    end_time: Optional[datetime] = None
    comment: Optional[str] = None

# SQLAlchemy модели (для БД)
class UserDB(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    tasks = relationship("TaskDB", back_populates="owner")

class TaskDB(Base):
    __tablename__ = "tasks"
    
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    description = Column(Text)
    owner_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    # Новые колонки
    start_time = Column(DateTime, nullable=True)
    end_time = Column(DateTime, nullable=True)
    comment = Column(Text, nullable=True)  # Для хранения Markdown
    
    owner = relationship("UserDB", back_populates="tasks")
