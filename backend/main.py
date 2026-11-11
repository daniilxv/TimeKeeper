from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from fastapi.middleware.cors import CORSMiddleware
from typing import List
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from contextlib import asynccontextmanager

# Убираем declarative_base отсюда
# from sqlalchemy.orm import declarative_base

from models import User, UserCreate, Token, Task, TaskCreate, TaskDB, UserDB
from auth import (
    get_password_hash, 
    verify_password, 
    create_access_token, 
    get_current_user,
    get_user_by_email
)
from database import init_db, get_db

@asynccontextmanager
async def lifespan(app: FastAPI):
    await init_db()
    yield

app = FastAPI(lifespan=lifespan)
# Base = declarative_base()  # УДАЛЕНО — теперь в database.py

# Настройка CORS для работы с фронтендом
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # В продакшене замените на конкретные домены
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def validate_password(password: str) -> List[str]:
    """Валидация пароля, возвращает список ошибок"""
    errors = []
    if len(password) < 8:
        errors.append("Пароль должен содержать минимум 8 символов")
    if not any(c.isupper() for c in password):
        errors.append("Пароль должен содержать хотя бы одну заглавную букву")
    if not any(c.islower() for c in password):
        errors.append("Пароль должен содержать хотя бы одну строчную букву")
    if not any(c.isdigit() for c in password):
        errors.append("Пароль должен содержать хотя бы одну цифру")
    return errors

@app.post("/register", response_model=User)
async def register(user_in: UserCreate, db: AsyncSession = Depends(get_db)):
    existing_user = await get_user_by_email(db, user_in.email)
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # Валидация пароля
    password_errors = validate_password(user_in.password)
    if password_errors:
        raise HTTPException(status_code=400, detail=password_errors)
    
    hashed_password = get_password_hash(user_in.password)
    new_user = UserDB(email=user_in.email, hashed_password=hashed_password)
    db.add(new_user)
    await db.commit()
    await db.refresh(new_user)
    return User(email=new_user.email)

@app.post("/token", response_model=Token)
async def login(form_data: OAuth2PasswordRequestForm = Depends(), db: AsyncSession = Depends(get_db)):
    # form_data.username содержит email (так как мы отправляем email в поле username)
    user = await get_user_by_email(db, form_data.username)
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token = create_access_token(data={"sub": user.email})
    return Token(access_token=access_token, token_type="bearer")

@app.post("/tasks", response_model=Task)
async def create_task(task_in: TaskCreate, current_user: UserDB = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    new_task = TaskDB(
        title=task_in.title,
        description=task_in.description,
        owner_id=current_user.id,
        # Новые поля
        start_time=task_in.start_time,
        end_time=task_in.end_time,
        comment=task_in.comment
    )
    db.add(new_task)
    await db.commit()
    await db.refresh(new_task)
    return Task(
        id=new_task.id,
        title=new_task.title,
        description=new_task.description,
        owner=current_user.email,
        created_at=new_task.created_at,
        # Новые поля в ответе
        start_time=new_task.start_time,
        end_time=new_task.end_time,
        comment=new_task.comment
    )

@app.get("/tasks", response_model=List[Task])
async def get_tasks(current_user: UserDB = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(TaskDB).where(TaskDB.owner_id == current_user.id))
    tasks = result.scalars().all()
    return [
        Task(
            id=task.id,
            title=task.title,
            description=task.description,
            owner=current_user.email,
            created_at=task.created_at,
            # Новые поля в ответе
            start_time=task.start_time,
            end_time=task.end_time,
            comment=task.comment
        )
        for task in tasks
    ]

# Эндпоинты для тестирования
@app.get("/health")
async def health_check():
    return {"status": "ok", "message": "Backend is running"}

@app.get("/test-auth")
async def test_auth(current_user: UserDB = Depends(get_current_user)):
    return {
        "message": "Authentication successful",
        "email": current_user.email
    }

@app.get("/test-public")
async def test_public():
    return {"message": "Public endpoint accessible without authentication"}
