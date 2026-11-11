from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from fastapi.middleware.cors import CORSMiddleware
from typing import List
from pydantic import EmailStr

from models import User, UserCreate, Token, Task, TaskCreate, TokenData
from auth import (
    get_password_hash, 
    verify_password, 
    create_access_token, 
    get_current_user
)

app = FastAPI()

# Настройка CORS для работы с фронтендом
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # В продакшене замените на конкретные домены
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Имитация базы данных
users_db = {}
tasks_db = []
task_id_counter = 1

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
async def register(user_in: UserCreate):
    if user_in.email in users_db:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # Валидация пароля
    password_errors = validate_password(user_in.password)
    if password_errors:
        raise HTTPException(status_code=400, detail=password_errors)
    
    hashed_password = get_password_hash(user_in.password)
    users_db[user_in.email] = {"email": user_in.email, "password": hashed_password}
    return User(email=user_in.email)

@app.post("/token", response_model=Token)
async def login(form_data: OAuth2PasswordRequestForm = Depends()):
    # form_data.username содержит email (так как мы отправляем email в поле username)
    user = users_db.get(form_data.username)
    if not user or not verify_password(form_data.password, user["password"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token = create_access_token(data={"sub": user["email"]})
    return Token(access_token=access_token, token_type="bearer")

@app.post("/tasks", response_model=Task)
async def create_task(task_in: TaskCreate, current_user: TokenData = Depends(get_current_user)):
    global task_id_counter
    new_task = Task(
        id=task_id_counter,
        title=task_in.title,
        description=task_in.description,
        owner=current_user.email
    )
    tasks_db.append(new_task)
    task_id_counter += 1
    return new_task

@app.get("/tasks", response_model=List[Task])
async def get_tasks(current_user: TokenData = Depends(get_current_user)):
    # Возвращаем только задачи текущего пользователя
    return [task for task in tasks_db if task.owner == current_user.email]

# Эндпоинты для тестирования
@app.get("/health")
async def health_check():
    return {"status": "ok", "message": "Backend is running"}

@app.get("/test-auth")
async def test_auth(current_user: TokenData = Depends(get_current_user)):
    return {
        "message": "Authentication successful",
        "email": current_user.email
    }

@app.get("/test-public")
async def test_public():
    return {"message": "Public endpoint accessible without authentication"}
