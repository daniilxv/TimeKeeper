import json
import os
from datetime import datetime, timezone, timedelta
from google.oauth2.credentials import Credentials
from googleapiclient.discovery import build
from google.auth.transport.requests import Request
from sqlalchemy.ext.asyncio import AsyncSession
from models import UserDB


if os.path.exists("config.json"):
    try:
        with open("config.json", "r", encoding="utf-8") as f:
            config = json.load(f)
    except json.JSONDecodeError:
        print("ПРЕДУПРЕЖДЕНИЕ: Файл config.json поврежден или содержит невалидный JSON. Используются дефолтные значения.")
    except Exception as e:
        print(f"ПРЕДУПРЕЖДЕНИЕ: Не удалось прочитать config.json: {e}")

GOOGLE_CLIENT_ID = config.get("GOOGLE_CLIENT_ID")
GOOGLE_CLIENT_SECRET = config.get("GOOGLE_CLIENT_SECRET")
SCOPES = ['https://www.googleapis.com/auth/calendar.readonly']


async def update_user_tokens(db: AsyncSession, user: UserDB, credentials: Credentials):
    """Обновляет токены пользователя в БД и сохраняет изменения"""
    user.google_access_token = credentials.token
    if credentials.refresh_token:
        user.google_refresh_token = credentials.refresh_token
    db.add(user)
    await db.commit()
    await db.refresh(user)


def _build_credentials(user: UserDB) -> Credentials:
    return Credentials(
        token=user.google_access_token,
        refresh_token=user.google_refresh_token,
        token_uri="https://oauth2.googleapis.com/token",
        client_id=GOOGLE_CLIENT_ID,
        client_secret=GOOGLE_CLIENT_SECRET,
        scopes=SCOPES
    )


async def get_calendar_service(db: AsyncSession, user: UserDB):
    if not user.google_refresh_token:
        return None

    creds = _build_credentials(user)

    if not creds.valid:
        if creds.expired and creds.refresh_token:
            try:
                creds.refresh(Request())
                await update_user_tokens(db, user, creds)
            except Exception as e:
                print(f"Failed to refresh Google token: {e}")
                return None

    return build('calendar', 'v3', credentials=creds)


async def fetch_google_events(db: AsyncSession, user: UserDB, time_min: str = None):
    """
    Получает события из Google Calendar.
    time_min — RFC3339 строка (например, начало недели). Если None — берём последние 30 дней.
    """
    service = await get_calendar_service(db, user)
    if not service:
        return []

    # Если time_min не передан, берём события за последние 30 дней + будущие
    if time_min is None:
        time_min = (datetime.now(timezone.utc) - timedelta(days=30)).isoformat()

    try:
        events_result = service.events().list(
            calendarId='primary',
            timeMin=time_min,
            singleEvents=True,
            orderBy='startTime'
        ).execute()
    except Exception as e:
        if "401" in str(e) or "invalid_grant" in str(e):
            creds = _build_credentials(user)
            try:
                creds.refresh(Request())
                await update_user_tokens(db, user, creds)
                service = build('calendar', 'v3', credentials=creds)
                events_result = service.events().list(
                    calendarId='primary',
                    timeMin=time_min,
                    singleEvents=True,
                    orderBy='startTime'
                ).execute()
            except Exception as refresh_error:
                print(f"Failed to refresh token and fetch events: {refresh_error}")
                return []
        else:
            print(f"Google Calendar API error: {e}")
            return []

    events = events_result.get('items', [])
    tasks = []
    for event in events:
        start = event['start'].get('dateTime', event['start'].get('date'))
        end = event['end'].get('dateTime', event['end'].get('date'))

        tasks.append({
            "id": f"google_{event['id']}",
            "title": event.get('summary', '(Без названия)'),
            "owner": user.email,
            "created_at": datetime.now(timezone.utc),
            "start_time": start,
            "end_time": end,
            "comment": event.get('description', '')
        })

    return tasks
