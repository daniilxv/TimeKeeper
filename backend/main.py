from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from fastapi.middleware.cors import CORSMiddleware
from typing import List
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from contextlib import asynccontextmanager
from datetime import datetime, timezone

# Убираем declarative_base отсюда
# from sqlalchemy.orm import declarative_base

from models import User, UserCreate, Token, Task, TaskCreate, TaskDB, UserDB, TaskUpdate, Category, CategoryUpdate, \
    CategoryDB
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
    # Приводим к UTC если есть таймзона, иначе считаем UTC
    start_time = task_in.start_time
    end_time = task_in.end_time
    
    if start_time and start_time.tzinfo is not None:
        start_time = start_time.astimezone(timezone.utc)
    if end_time and end_time.tzinfo is not None:
        end_time = end_time.astimezone(timezone.utc)
    
    new_task = TaskDB(
        title=task_in.title,
        owner_id=current_user.id,
        # Новые поля - сохраняем в UTC
        start_time=start_time,
        end_time=end_time,
        comment=task_in.comment
    )
    db.add(new_task)
    await db.commit()
    await db.refresh(new_task)
    return Task(
        id=new_task.id,
        title=new_task.title,
        owner=current_user.email,
        created_at=new_task.created_at,
        # Новые поля в ответе - возвращаем в UTC
        start_time=new_task.start_time,
        end_time=new_task.end_time,
        comment=new_task.comment
    )

@app.put("/tasks/{task_id}", response_model=Task)
async def update_task(
    task_id: int,
    task_in: TaskUpdate,
    current_user: UserDB = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    # Ищем задачу по ID и проверяем, что она принадлежит текущему пользователю
    result = await db.execute(
        select(TaskDB).where(TaskDB.id == task_id, TaskDB.owner_id == current_user.id)
    )
    task = result.scalars().first()

    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Задача не найдена"
        )

    # Обновляем только те поля, которые реально передали в запросе
    update_data = task_in.model_dump(exclude_unset=True)
    
    # Обрабатываем даты - приводим к UTC
    if 'start_time' in update_data and update_data['start_time'] is not None:
        dt = update_data['start_time']
        if dt.tzinfo is not None:
            update_data['start_time'] = dt.astimezone(timezone.utc)
    if 'end_time' in update_data and update_data['end_time'] is not None:
        dt = update_data['end_time']
        if dt.tzinfo is not None:
            update_data['end_time'] = dt.astimezone(timezone.utc)
    
    for key, value in update_data.items():
        setattr(task, key, value)

    await db.commit()
    await db.refresh(task)

    # Возвращаем обновленную задачу
    return Task(
        id=task.id,
        title=task.title,
        owner=current_user.email,
        created_at=task.created_at,
        start_time=task.start_time,
        end_time=task.end_time,
        comment=task.comment
    )

@app.delete("/tasks/{task_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_task(
        task_id: int,
        current_user: UserDB = Depends(get_current_user),
        db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(TaskDB).where(TaskDB.id == task_id, TaskDB.owner_id == current_user.id)
    )
    task = result.scalars().first()

    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Задача не найдена"
        )

    await db.delete(task)
    await db.commit()

@app.get("/tasks", response_model=List[Task])
async def get_tasks(current_user: UserDB = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(TaskDB).where(TaskDB.owner_id == current_user.id))
    tasks = result.scalars().all()
    return [
        Task(
            id=task.id,
            title=task.title,
            owner=current_user.email,
            created_at=task.created_at,
            # Новые поля в ответе - возвращаем в UTC
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


@app.put("/categories/{category_id}", response_model=Category)
async def update_category(category_id: int, cat_in: CategoryUpdate, current_user: UserDB = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(CategoryDB).where(CategoryDB.id == category_id, CategoryDB.user_id == current_user.id)
    )
    category = result.scalar_one_or_none()
    if not category:
        raise HTTPException(status_code=404, detail="Категория не найдена")
    update_data = cat_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(category, field, value)
    await db.commit()
    await db.refresh(category)
    return category

@app.delete("/categories/{category_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_category(category_id: int, current_user: UserDB = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(CategoryDB).where(CategoryDB.id == category_id, CategoryDB.user_id == current_user.id)
    )
    category = result.scalar_one_or_none()
    if not category:
        raise HTTPException(status_code=404, detail="Категория не найдена")
    await db.delete(category)
    await db.commit()

@app.get("/categories", response_model=List[Category])
async def get_categories(
    current_user: UserDB = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Получение списка всех категорий текущего пользователя"""
    result = await db.execute(
        select(CategoryDB).where(CategoryDB.user_id == current_user.id)
    )
    categories = result.scalars().all()
    return categories